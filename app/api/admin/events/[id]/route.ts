import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { cleanEventCategory, cleanLongText, cleanText } from '@/lib/validation';

export async function PUT(request: Request, context: { params: Promise<{ id: string }>; }) {
  await requireAdmin(request);

  const { id } = await context.params;
  const recordId = Number(id);
  if (!recordId) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

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
    'UPDATE events SET title = ?, event_date = ?, event_time = ?, location = ?, description = ?, category = ? WHERE id = ?',
    [title, event_date, event_time, location, description || '', category, recordId]
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }>; }) {
  await requireAdmin(request);

  const { id } = await context.params;
  const recordId = Number(id);
  if (!recordId) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  await query('DELETE FROM events WHERE id = ?', [recordId]);
  return NextResponse.json({ success: true });
}
