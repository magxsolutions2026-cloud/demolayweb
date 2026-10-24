import { NextResponse } from 'next/server';
import { deleteAdminAccount, isAdminAccountError, updateAdminAccount } from '@/lib/adminAccounts';
import { requireAdminSession } from '@/lib/auth';

function sanitizeAdminForClient<T extends { role: unknown }>(admin: T) {
  const { role, ...rest } = admin;
  void role;
  return rest;
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentAdmin = await requireAdminSession(request);

  const { id } = await context.params;
  const recordId = Number(id);
  if (!Number.isFinite(recordId) || recordId <= 0) {
    return NextResponse.json({ error: 'Invalid administrator ID.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const admin = await updateAdminAccount(recordId, body, currentAdmin.id);
    if (!admin) {
      return NextResponse.json({ error: 'Administrator account not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, admin: sanitizeAdminForClient(admin) });
  } catch (error) {
    if (isAdminAccountError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[api/admin/accounts/[id]] PUT failed:', error);
    return NextResponse.json({ error: 'Could not update administrator account.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentAdmin = await requireAdminSession(request);

  const { id } = await context.params;
  const recordId = Number(id);
  if (!Number.isFinite(recordId) || recordId <= 0) {
    return NextResponse.json({ error: 'Invalid administrator ID.' }, { status: 400 });
  }

  try {
    await deleteAdminAccount(recordId, currentAdmin.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isAdminAccountError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[api/admin/accounts/[id]] DELETE failed:', error);
    return NextResponse.json({ error: 'Could not delete administrator account.' }, { status: 500 });
  }
}
