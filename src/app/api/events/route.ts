import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const rows = await query(
    'SELECT id, title, event_date, event_time, location, description, category FROM events ORDER BY event_date ASC, id ASC'
  );
  return NextResponse.json({ events: rows });
}
