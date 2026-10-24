import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { cleanEventCategory, cleanLongText, cleanText } from '@/lib/validation';

export async function GET(request: Request) {
  await requireAdmin(request);
  const events = await query(
    'SELECT id, title, event_date, event_time, location, description, category FROM events ORDER BY event_date DESC'
  );
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  await requireAdmin(request);
  const body = await request.json();
  const title = cleanText(body.title, 255);
  const event_date = cleanText(body.event_date, 30);
  const event_time = cleanText(body.event_time, 64);
  const location = cleanText(body.location, 255);
  const description = cleanLongText(body.description, 2000);
  const category = cleanEventCategory(body.category);

  if (!title || !event_date || !event_time || !location) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await query(
    'INSERT INTO events (title, event_date, event_time, location, description, category) VALUES (?, ?, ?, ?, ?, ?)',
    [title, event_date, event_time, location, description || '', category]
  );

  return NextResponse.json({ success: true });
}
