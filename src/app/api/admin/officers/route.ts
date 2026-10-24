import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { cleanText } from '@/lib/validation';
import { clampOfficerFraming } from '@/lib/officerPhoto';
import { listOfficersOrderedByName, migrateOfficersFramingIfNeeded } from '@/lib/officersDb';

export async function GET(request: Request) {
  await requireAdmin(request);
  const officers = await listOfficersOrderedByName();
  return NextResponse.json({ officers });
}

export async function POST(request: Request) {
  await requireAdmin(request);
  await migrateOfficersFramingIfNeeded();
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
    'INSERT INTO officers (name, position, photo_url, photo_pos_x, photo_pos_y, photo_zoom) VALUES (?, ?, ?, ?, ?, ?)',
    [name, position, photo_url || '', photo_pos_x, photo_pos_y, photo_zoom]
  );
  return NextResponse.json({ success: true });
}
