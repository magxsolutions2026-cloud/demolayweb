import type { Metadata } from 'next';
import { JetBrains_Mono, Orbitron } from 'next/font/google';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminDataProvider } from '@/components/admin/AdminDataProvider';
import { AdminShell } from '@/components/admin/shell/AdminShell';
import { ToastProvider } from '@/components/admin/ToastContext';
import { getAdminAccountById } from '@/lib/adminAccounts';

import '../admin-theme.css';

const display = Orbitron({ subsets: ['latin'], weight: ['500', '700', '800'], variable: '--font-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-mono' });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin console · T. De Leon Chapter No. 47',
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;
  if (!session) redirect('/admin');

  const admin = await getAdminAccountById(Number(session));
  if (!admin || admin.status !== 'Active') redirect('/admin');

  return (
    <div className={`${display.variable} ${mono.variable}`}>
      <ToastProvider>
        <AdminDataProvider username={admin.name || admin.username} currentAdminId={admin.id}>
          <AdminShell>{children}</AdminShell>
        </AdminDataProvider>
      </ToastProvider>
    </div>
  );
}
