import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminAccountById } from '@/lib/adminAccounts';
import AdminDashboardClient from '../AdminDashboardClient';

import '@/admin/admin-theme.css';

export const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;

  if (!session) {
    redirect('/admin');
  }

  const admin = await getAdminAccountById(Number(session));

  if (!admin || admin.status !== 'Active') {
    redirect('/admin');
  }

  return (
    <main className="min-h-screen font-[family-name:var(--font-inter)]">
      <AdminDashboardClient username={admin.name || admin.username} currentAdminId={admin.id} />
    </main>
  );
}
