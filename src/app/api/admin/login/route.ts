import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cleanText } from '@/lib/validation';
import { findAdminAccountByLogin } from '@/lib/adminAccounts';

export async function POST(request: Request) {
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

    const admin = await findAdminAccountByLogin(identifier);

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

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
    console.error('[api/admin/login] POST failed:', err);
    return NextResponse.json(
      { error: 'Database unavailable. Check MySQL is running and .env credentials are correct.' },
      { status: 503 },
    );
  }
}
