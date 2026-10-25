import { NextResponse } from 'next/server';
import { createAdminAccount, isAdminAccountError, listAdminAccounts } from '@/lib/adminAccounts';
import { requireAdminSession } from '@/lib/auth';

function sanitizeAdminForClient<T extends { role: unknown }>(admin: T) {
  const { role, ...rest } = admin;
  void role;
  return rest;
}

export async function GET(request: Request) {
  await requireAdminSession(request);
  const admins = (await listAdminAccounts()).map(sanitizeAdminForClient);
  return NextResponse.json({ admins });
}

export async function POST(request: Request) {
  await requireAdminSession(request);

  try {
    const body = await request.json();
    const admin = await createAdminAccount(body);
    if (!admin) {
      return NextResponse.json({ error: 'Could not create administrator account.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, admin: sanitizeAdminForClient(admin) }, { status: 201 });
  } catch (error) {
    if (isAdminAccountError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[api/admin/accounts] POST failed:', error);
    return NextResponse.json({ error: 'Could not create administrator account.' }, { status: 500 });
  }
}
