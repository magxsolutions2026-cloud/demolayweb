import { getAdminAccountById, type AdminAccountRow } from './adminAccounts';

export async function getAdminIdFromRequest(request: Request): Promise<number | null> {
  const admin = await getAdminFromRequest(request);
  return admin?.id ?? null;
}

export async function getAdminFromRequest(request: Request): Promise<AdminAccountRow | null> {
  const cookie = request.headers.get('cookie') || '';
  const matches = cookie.match(/admin_session=([^;]+)/);
  if (!matches) return null;
  const adminId = Number(matches[1]);
  if (Number.isNaN(adminId)) return null;

  const admin = await getAdminAccountById(adminId);
  if (!admin || admin.status !== 'Active') return null;
  return admin;
}

export async function requireAdmin(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    const res = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    throw res;
  }
  return admin.id;
}

export async function requireAdminSession(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    const res = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    throw res;
  }
  return admin;
}
