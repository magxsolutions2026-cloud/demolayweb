import { NextResponse } from 'next/server';
import { publishAdminRealtime } from '@/lib/adminRealtime';
import { execute } from '@/lib/db';
import { cleanEmail, isValidEmail } from '@/lib/validation';

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  let email = '';

  if (contentType.includes('application/json')) {
    const payload = await request.json();
    email = payload.email;
  } else {
    const formData = await request.formData();
    email = String(formData.get('email') || '');
  }

  const safeEmail = cleanEmail(email, 255);

  if (!safeEmail) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  if (!isValidEmail(safeEmail)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
  }

  const { rowCount } = await execute('INSERT INTO subscribers (email) VALUES (?) ON CONFLICT (email) DO NOTHING', [safeEmail]);
  const alreadySubscribed = rowCount === 0;

  if (!alreadySubscribed) {
    publishAdminRealtime('subscribers');
  }

  return NextResponse.json({ success: true, alreadySubscribed });
}
