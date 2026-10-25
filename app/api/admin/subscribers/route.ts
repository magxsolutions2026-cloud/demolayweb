import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  await requireAdmin(request);
  const rows = await query('SELECT * FROM subscribers ORDER BY date_subscribed DESC');
  return NextResponse.json({ subscribers: rows });
}
