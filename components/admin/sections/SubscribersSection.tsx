'use client';

import { Copy, Download, Mail } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAdminData } from '@/components/admin/AdminDataProvider';
import { useAdminToast } from '@/components/admin/ToastContext';
import type { SubscriberItem } from '@/components/admin/types';
import { DataList, type DataColumn } from '@/components/admin/ui/DataList';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { StatusChip } from '@/components/admin/ui/StatusChip';
import { formatRelativeTime } from '@/lib/formatRelativeTime';

const DAY_MS = 24 * 60 * 60 * 1000;
const time = (s: SubscriberItem) => new Date(s.date_subscribed).getTime();

export function SubscribersSection() {
  const { subscribers } = useAdminData();
  const { toast } = useAdminToast();

  const rows = useMemo(() => [...subscribers].sort((a, b) => time(b) - time(a)), [subscribers]);
  const [weekAgo] = useState(() => Date.now() - 7 * DAY_MS);
  const newThisWeek = subscribers.filter((s) => time(s) >= weekAgo).length;

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(rows.map((s) => s.email).join(', '));
      toast('success', `Copied ${rows.length} email addresses.`);
    } catch {
      toast('error', 'Could not copy to the clipboard.');
    }
  };

  const exportCsv = () => {
    const csv = ['email,date_subscribed', ...rows.map((s) => `${s.email},${s.date_subscribed}`)].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: DataColumn<SubscriberItem>[] = [
    {
      key: 'email',
      header: 'Email',
      sortValue: (s) => s.email,
      render: (s) => (
        <span className="flex items-center gap-3">
          <span className="cs-avatar-sm">
            <Mail className="h-4 w-4" />
          </span>
          <a href={`mailto:${s.email}`} className="hover:text-gold" onClick={(e) => e.stopPropagation()}>
            {s.email}
          </a>
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Subscribed',
      sortValue: time,
      render: (s) => (
        <span className="text-xs text-white/55">
          {new Date(s.date_subscribed).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
          <span className="text-white/35"> · {formatRelativeTime(s.date_subscribed)}</span>
        </span>
      ),
    },
    {
      key: 'new',
      header: '',
      render: (s) => (time(s) >= weekAgo ? <StatusChip tone="green">New</StatusChip> : null),
    },
  ];

  return (
    <>
      <PageHeader
        kicker="Audience"
        title="Subscribers"
        lead="People who get the newsletter. Each new published news post is emailed to this list."
        meta={
          <>
            <StatusChip>{subscribers.length} subscribers</StatusChip>
            <StatusChip tone="green">+{newThisWeek} this week</StatusChip>
          </>
        }
        actions={
          <>
            <button type="button" className="cs-btn cs-btn-ghost" onClick={() => void copyAll()} disabled={!rows.length}>
              <Copy /> Copy emails
            </button>
            <button type="button" className="cs-btn cs-btn-primary" onClick={exportCsv} disabled={!rows.length}>
              <Download /> Export CSV
            </button>
          </>
        }
      />
      <DataList
        rows={rows}
        columns={columns}
        getRowId={(s) => s.id}
        searchText={(s) => s.email}
        searchPlaceholder="Search email…"
        emptyTitle="No subscribers yet"
        emptyDescription="Signups from the newsletter form on the public site will appear here."
        pageSize={15}
      />
    </>
  );
}
