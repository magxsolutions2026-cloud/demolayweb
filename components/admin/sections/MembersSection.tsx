'use client';

import { Check, Undo2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAdminData, type PetitionerStatus } from '@/components/admin/AdminDataProvider';
import type { PetitionerItem } from '@/components/admin/types';
import { DataList, type DataColumn } from '@/components/admin/ui/DataList';
import { DetailsDrawer } from '@/components/admin/ui/DetailsDrawer';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { StatusChip, toneFor } from '@/components/admin/ui/StatusChip';
import { useQueryState } from '@/components/admin/ui/useQueryState';
import { formatRelativeTime } from '@/lib/formatRelativeTime';

const TABS = ['pending', 'approved', 'declined', 'all'] as const;
type Tab = (typeof TABS)[number];
const TAB_LABEL: Record<Tab, string> = { pending: 'Pending', approved: 'Sir Knights', declined: 'Declined', all: 'All' };

const initialOf = (name: string) => name.trim().charAt(0).toUpperCase() || '?';
const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

function StatusActions({
  member,
  onSet,
  size = 'sm',
}: {
  member: PetitionerItem;
  onSet: (status: PetitionerStatus) => void;
  size?: 'sm' | 'md';
}) {
  const sm = size === 'sm' ? ' cs-btn-sm' : '';
  const status = member.status.toLowerCase();
  return (
    <>
      {status !== 'approved' ? (
        <button type="button" className={`cs-btn cs-btn-ok${sm}`} onClick={() => onSet('Approved')}>
          <Check /> Approve
        </button>
      ) : null}
      {status !== 'declined' ? (
        <button type="button" className={`cs-btn cs-btn-danger${sm}`} onClick={() => onSet('Declined')}>
          <X /> Decline
        </button>
      ) : null}
      {status !== 'pending' && size === 'md' ? (
        <button type="button" className="cs-btn cs-btn-ghost" onClick={() => onSet('Pending')}>
          <Undo2 /> Back to pending
        </button>
      ) : null}
    </>
  );
}

/** Petitions and Sir Knights in one list: status tabs, bulk decisions, and a details drawer. */
export function MembersSection() {
  const { petitioners, setPetitionerStatus } = useAdminData();
  const { params, set } = useQueryState();
  const [selected, setSelected] = useState<number[]>([]);

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { pending: 0, approved: 0, declined: 0, all: petitioners.length };
    for (const p of petitioners) {
      const s = p.status.toLowerCase() as Tab;
      if (s in c) c[s] += 1;
    }
    return c;
  }, [petitioners]);

  const rawTab = params.get('status') as Tab | null;
  const tab: Tab = rawTab && TABS.includes(rawTab) ? rawTab : counts.pending > 0 ? 'pending' : 'all';
  const rows = useMemo(
    () =>
      [...(tab === 'all' ? petitioners : petitioners.filter((p) => p.status.toLowerCase() === tab))].sort(
        (a, b) => new Date(b.submitted_at ?? 0).getTime() - new Date(a.submitted_at ?? 0).getTime() || b.id - a.id,
      ),
    [petitioners, tab],
  );

  const openId = Number(params.get('open')) || null;
  const open = openId ? petitioners.find((p) => p.id === openId) ?? null : null;
  const visibleSelection = selected.filter((id) => rows.some((r) => r.id === id));

  const decide = (ids: number[], status: PetitionerStatus) => {
    setSelected([]);
    void setPetitionerStatus(ids, status);
  };

  const columns: DataColumn<PetitionerItem>[] = [
    {
      key: 'name',
      header: 'Member',
      sortValue: (r) => r.name.toLowerCase(),
      render: (r) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="cs-avatar-sm">{initialOf(r.name)}</span>
          <span className="min-w-0">
            <span className="block truncate font-medium">{r.name}</span>
            <span className="block truncate text-xs text-white/45">{r.email}</span>
          </span>
        </div>
      ),
    },
    { key: 'school', header: 'School', sortValue: (r) => r.school ?? '', render: (r) => <span className="text-white/70">{r.school || '—'}</span> },
    { key: 'age', header: 'Age', sortValue: (r) => Number(r.age) || 0, render: (r) => <span className="tabular-nums">{r.age}</span> },
    {
      key: 'submitted',
      header: 'Submitted',
      sortValue: (r) => new Date(r.submitted_at ?? 0).getTime(),
      render: (r) => <span className="text-xs text-white/55" title={formatDate(r.submitted_at)}>{formatRelativeTime(r.submitted_at)}</span>,
    },
    { key: 'status', header: 'Status', render: (r) => <StatusChip tone={toneFor(r.status)}>{r.status}</StatusChip> },
  ];

  return (
    <>
      <PageHeader
        kicker="Members"
        title="Members & petitions"
        lead="Review new petitions and keep the roster of Sir Knights. Click a row to see the full petition."
        meta={
          <>
            <StatusChip tone="amber">{counts.pending} pending</StatusChip>
            <StatusChip>{counts.approved} Sir Knights</StatusChip>
            <StatusChip tone="red">{counts.declined} declined</StatusChip>
          </>
        }
      />

      {visibleSelection.length > 0 ? (
        <div className="cs-tile mb-3 flex flex-wrap items-center gap-3 px-4 py-3 shadow-[inset_0_0_0_1px_var(--cs-edge)]">
          <span className="cs-label !text-gold">{visibleSelection.length} selected</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <button type="button" className="cs-btn cs-btn-ok cs-btn-sm" onClick={() => decide(visibleSelection, 'Approved')}>
              <Check /> Approve all
            </button>
            <button type="button" className="cs-btn cs-btn-danger cs-btn-sm" onClick={() => decide(visibleSelection, 'Declined')}>
              <X /> Decline all
            </button>
            <button type="button" className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setSelected([])}>
              Clear
            </button>
          </div>
        </div>
      ) : null}

      <DataList
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        searchText={(r) => `${r.name} ${r.email} ${r.school} ${r.phone} ${r.address}`}
        searchPlaceholder="Search name, email, school…"
        tabs={TABS.map((t) => ({ value: t, label: TAB_LABEL[t], count: counts[t] }))}
        activeTab={tab}
        onTabChange={(value) => {
          setSelected([]);
          set({ status: value, open: null });
        }}
        onRowClick={(r) => set({ open: String(r.id) })}
        activeRowId={openId}
        selection={tab === 'approved' ? undefined : { ids: visibleSelection, onChange: setSelected }}
        rowActions={(r) => (r.status.toLowerCase() === 'pending' ? <StatusActions member={r} onSet={(s) => decide([r.id], s)} /> : null)}
        emptyTitle={tab === 'pending' ? 'All caught up' : 'No members here'}
        emptyDescription={
          tab === 'pending' ? 'New petitions from the public form will appear here.' : 'Members with this status will appear here.'
        }
      />

      <DetailsDrawer
        open={!!open}
        onClose={() => set({ open: null })}
        title={open?.name ?? ''}
        subtitle={open ? `Petition #${open.id} · submitted ${formatDate(open.submitted_at)}` : ''}
        avatar={open ? <span className="cs-avatar-sm !h-12 !w-12 !text-base">{initialOf(open.name)}</span> : null}
        chip={open ? <StatusChip tone={toneFor(open.status)}>{open.status}</StatusChip> : null}
        footer={open ? <StatusActions member={open} size="md" onSet={(s) => void setPetitionerStatus([open.id], s)} /> : null}
      >
        {open ? (
          <dl className="cs-dl">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${open.email}`} className="text-gold hover:underline">
                  {open.email}
                </a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                {open.phone ? (
                  <a href={`tel:${open.phone}`} className="text-gold hover:underline">
                    {open.phone}
                  </a>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt>Age</dt>
              <dd>{open.age}</dd>
            </div>
            <div>
              <dt>School</dt>
              <dd>{open.school || '—'}</dd>
            </div>
            <div className="is-wide">
              <dt>Address</dt>
              <dd>{open.address || '—'}</dd>
            </div>
            <div className="is-wide">
              <dt>Why they want to join</dt>
              <dd className="rounded-xl bg-black/25 p-3 text-white/80">{open.reason || '—'}</dd>
            </div>
          </dl>
        ) : null}
      </DetailsDrawer>
    </>
  );
}
