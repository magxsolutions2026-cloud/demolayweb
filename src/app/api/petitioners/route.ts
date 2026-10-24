import { NextResponse } from 'next/server';
import { publishAdminRealtime } from '@/lib/adminRealtime';
import { query } from '@/lib/db';
import { cleanEmail, cleanLongText, cleanText, isValidEmail } from '@/lib/validation';

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  let payload: Record<string, FormDataEntryValue | string> = {};

  if (contentType.includes('application/json')) {
    payload = await request.json();
  } else {
    const formData = await request.formData();
    payload = Object.fromEntries(formData.entries());
  }

  const { name, age, email, phone, address, school, reason } = payload;
  const safeName = cleanText(name, 255);
  const safeEmail = cleanEmail(email, 255);
  const safeReason = cleanLongText(reason, 2000);
  const safePhone = cleanText(phone, 80);
  const safeAddress = cleanLongText(address, 500);
  const safeSchool = cleanText(school, 255);
  const safeAge = age ? Number(age) : null;

  if (!safeName || !safeEmail || !safeReason) {
    return NextResponse.json({ error: 'name, email and reason are required' }, { status: 400 });
  }

  if (!isValidEmail(safeEmail)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
  }

  await query('INSERT INTO petitioners (name, age, email, phone, address, school, reason) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [safeName, safeAge, safeEmail, safePhone, safeAddress, safeSchool, safeReason]);
  publishAdminRealtime('petitioners');

  return NextResponse.json({ success: true });
}
