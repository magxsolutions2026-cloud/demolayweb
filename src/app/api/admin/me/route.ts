import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ admin: null }, { status: 401 });
  }

  return NextResponse.json({ admin });
}
