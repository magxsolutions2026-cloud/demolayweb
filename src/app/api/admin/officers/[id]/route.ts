import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { cleanText } from '@/lib/validation';
import { clampOfficerFraming } from '@/lib/officerPhoto';
import { migrateOfficersFramingIfNeeded } from '@/lib/officersDb';

export async function PUT(request: Request, context: { params: Promise<{ id: string }>; }) {
  await requireAdmin(request);
  await migrateOfficersFramingIfNeeded();
  const { id } = await context.params;
  const recordId = Number(id);
  if (!recordId) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const body = await request.json();
  const name = cleanText(body.name, 255);
  const position = cleanText(body.position, 255);
  const photo_url = cleanText(body.photo_url, 512);
  const { x: photo_pos_x, y: photo_pos_y, z: photo_zoom } = clampOfficerFraming({
    photo_pos_x: body.photo_pos_x,
    photo_pos_y: body.photo_pos_y,
    photo_zoom: body.photo_zoom,
  });
  if (!name || !position) {
    return NextResponse.json({ error: 'Name and position required' }, { status: 400 });
  }

  await query(
    'UPDATE officers SET name = ?, position = ?, photo_url = ?, photo_pos_x = ?, photo_pos_y = ?, photo_zoom = ? WHERE id = ?',
    [name, position, photo_url || '', photo_pos_x, photo_pos_y, photo_zoom, recordId]
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
  await query('DELETE FROM officers WHERE id = ?', [recordId]);
  return NextResponse.json({ success: true });
}
