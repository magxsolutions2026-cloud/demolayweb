import { NextResponse } from 'next/server';
import { listOfficersOrderedByName } from '@/lib/officersDb';

export async function GET() {
  const rows = await listOfficersOrderedByName();
  return NextResponse.json({ officers: rows });
}
