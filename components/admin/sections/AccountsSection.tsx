'use client';

import { AdminAccountsWorkspace } from '@/components/admin/AdminAccountsWorkspace';
import { useAdminData } from '@/components/admin/AdminDataProvider';

export function AccountsSection() {
  const { admins, currentAdminId, fetchAll, refreshing } = useAdminData();
  return (
    <AdminAccountsWorkspace
      admins={admins}
      currentAdminId={currentAdminId}
      onRefresh={() => fetchAll({ silent: true })}
      loading={refreshing}
    />
  );
}
