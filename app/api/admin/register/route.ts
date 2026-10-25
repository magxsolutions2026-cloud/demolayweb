import { NextResponse } from 'next/server';
import { createAdminAccount, isAdminAccountError } from '@/lib/adminAccounts';
import { cleanEmail, cleanText, isValidEmail } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = cleanText(body.username, 100);
    const name = cleanText(body.name, 160) || username || 'Administrator';
    const setupKey = cleanText(body.setupKey, 255);
    const rawEmail = cleanText(body.email, 255);
    const email =
      cleanEmail(
        rawEmail ||
          (isValidEmail(username)
            ? username
            : `${(username || 'admin').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'admin'}@admin.local`),
        255,
      );

    if (!username || !body.password || !setupKey) {
      return NextResponse.json({ error: 'username, password, setupKey required' }, { status: 400 });
    }

    if (setupKey !== process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 });
    }

    await createAdminAccount({
      username,
      name,
      email,
      password: body.password,
      role: body.role,
      status: body.status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isAdminAccountError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[api/admin/register] POST failed:', error);
    return NextResponse.json({ error: 'Could not create administrator account.' }, { status: 500 });
  }
}
