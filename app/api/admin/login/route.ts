import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { cleanText } from '@/lib/validation';
import { findAdminAccountByLogin } from '@/lib/adminAccounts';

function getSafeErrorDetails(error: unknown) {
  if (!(error instanceof Error)) {
    return { message: 'Non-Error value thrown' };
  }

  const details: Record<string, string> = { name: error.name };
  const safeMessage = error.message
    .replace(/postgres(?:ql)?:\/\/[^\s'"<>]+/gi, '[redacted database URL]')
    .replace(/(password\s*[=:]\s*)[^\s,;]+/gi, '$1[redacted]');
  if (safeMessage) details.message = safeMessage;

  // PostgreSQL and network errors expose useful codes without logging request data or credentials.
  const dbError = error as Error & {
    code?: unknown;
    errno?: unknown;
    syscall?: unknown;
    severity?: unknown;
    table?: unknown;
    schema?: unknown;
    constraint?: unknown;
  };
  for (const field of ['code', 'errno', 'syscall', 'severity', 'table', 'schema', 'constraint'] as const) {
    const value = dbError[field];
    if (typeof value === 'string' || typeof value === 'number') details[field] = String(value);
  }

  return details;
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  let stage = 'read_request';
  try {
    let body: { username?: unknown; email?: unknown; identifier?: unknown; password?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const identifier = cleanText(body.identifier ?? body.email ?? body.username, 255);
    const password = cleanText(body.password, 128);

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Email or username and password are required' }, { status: 400 });
    }

    stage = 'database_lookup';
    const admin = await findAdminAccountByLogin(identifier);

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    stage = 'password_verification';
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (admin.status !== 'Active') {
      return NextResponse.json({ error: 'This administrator account is inactive.' }, { status: 403 });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24,
    };

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', String(admin.id), cookieOptions);
    return response;
  } catch (err) {
    console.error('[api/admin/login] POST failed', {
      requestId,
      stage,
      databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
      error: getSafeErrorDetails(err),
    });
    return NextResponse.json(
      { error: 'Database unavailable. Check Vercel runtime logs for the login error details.', requestId },
      { status: 503 },
    );
  }
}
