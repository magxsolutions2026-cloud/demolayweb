'use client';

import { useAdminData } from '@/components/admin/AdminDataProvider';
import { FundsWorkspace, type FundsTabId } from '@/components/admin/funds/FundsWorkspace';
import { useAdminToast } from '@/components/admin/ToastContext';
import { useQueryState } from '@/components/admin/ui/useQueryState';

const TABS: FundsTabId[] = ['dashboard', 'sources', 'disbursements', 'campaigns', 'orders', 'reports'];

/** Funds keeps its own data and tabs; the active tab lives in `?tab=` so links can open it directly. */
export function FundsSection() {
  const { landing, fundsRefreshSignal } = useAdminData();
  const { toast } = useAdminToast();
  const { params, set } = useQueryState();
  const raw = params.get('tab') as FundsTabId | null;
  const tab = raw && TABS.includes(raw) ? raw : 'dashboard';

  return (
    <FundsWorkspace
      toast={toast}
      chapterName={landing.hero?.title || null}
      logoUrl={landing.hero?.logo_url || null}
      activeTab={tab}
      onTabChange={(next) => set({ tab: next === 'dashboard' ? null : next })}
      refreshSignal={fundsRefreshSignal}
    />
  );
}
