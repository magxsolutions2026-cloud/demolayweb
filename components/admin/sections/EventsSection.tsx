'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useAdminData } from '@/components/admin/AdminDataProvider';
import { AdminIconButton } from '@/components/admin/AdminIconButton';
import type { EventItem } from '@/components/admin/types';
import { DataList, type DataColumn } from '@/components/admin/ui/DataList';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { StatusChip, toneFor } from '@/components/admin/ui/StatusChip';
import { useQueryState } from '@/components/admin/ui/useQueryState';
import { formatSqlDate } from '@/lib/formatDb';
import { EventFormModal } from './EventFormModal';
import { useRecordEditor } from './useRecordEditor';

const TABS = ['upcoming', 'past', 'all'] as const;
type Tab = (typeof TABS)[number];

function todayYmd() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date());
}

export function EventsSection() {
  const { events } = useAdminData();
  const { params, set } = useQueryState();
  const editor = useRecordEditor('event', events, (e) => e.title);

  const today = todayYmd();
  const raw = params.get('when') as Tab | null;
  const tab: Tab = raw && TABS.includes(raw) ? raw : 'upcoming';

  const { rows, counts } = useMemo(() => {
    const upcoming = events.filter((e) => formatSqlDate(e.event_date) >= today);
    const past = events.filter((e) => formatSqlDate(e.event_date) < today);
    const byDate = (dir: 1 | -1) => (a: EventItem, b: EventItem) =>
      formatSqlDate(a.event_date).localeCompare(formatSqlDate(b.event_date)) * dir;
    const pick = { upcoming: [...upcoming].sort(byDate(1)), past: [...past].sort(byDate(-1)), all: [...events].sort(byDate(-1)) };
    return { rows: pick[tab], counts: { upcoming: upcoming.length, past: past.length, all: events.length } };
  }, [events, tab, today]);

  const columns: DataColumn<EventItem>[] = [
    {
      key: 'date',
      header: 'Date',
      sortValue: (e) => formatSqlDate(e.event_date),
      render: (e) => {
        const d = new Date(`${formatSqlDate(e.event_date)}T00:00:00`);
        return (
          <span className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[image:var(--cs-grad)] text-center leading-none text-[#140a0c]">
              <span>
                <span className="block font-mono text-[9px] uppercase">{d.toLocaleDateString('en-PH', { month: 'short' })}</span>
                <span className="block font-[family-name:var(--font-display)] text-base font-extrabold">{d.getDate()}</span>
              </span>
            </span>
            <span className="text-xs text-white/55">{d.getFullYear()}</span>
          </span>
        );
      },
    },
    {
      key: 'title',
      header: 'Event',
      sortValue: (e) => e.title.toLowerCase(),
      render: (e) => (
        <span className="block min-w-0 max-w-[340px]">
          <span className="block truncate font-medium">{e.title}</span>
          {e.description ? <span className="block truncate text-xs text-white/45">{e.description}</span> : null}
        </span>
      ),
    },
    { key: 'time', header: 'Time', render: (e) => <span className="text-white/70">{e.event_time}</span> },
    { key: 'location', header: 'Location', sortValue: (e) => e.location, render: (e) => <span className="text-white/70">{e.location}</span> },
    {
      key: 'type',
      header: 'Type',
      render: (e) => (e.category ? <StatusChip tone={toneFor(e.category)}>{e.category}</StatusChip> : null),
    },
  ];

  return (
    <>
      <PageHeader
        kicker="Content"
        title="Events"
        lead="Everything on the public calendar. Click a row to edit it."
        meta={
          <>
            <StatusChip>{counts.upcoming} upcoming</StatusChip>
            <StatusChip tone="muted">{counts.past} past</StatusChip>
          </>
        }
        actions={
          <button type="button" className="cs-btn cs-btn-primary" onClick={editor.openNew}>
            <Plus /> New event
          </button>
        }
      />

      <DataList
        rows={rows}
        columns={columns}
        getRowId={(e) => e.id}
        searchText={(e) => `${e.title} ${e.location} ${e.description} ${e.category}`}
        searchPlaceholder="Search events…"
        tabs={TABS.map((t) => ({ value: t, label: t, count: counts[t] }))}
        activeTab={tab}
        onTabChange={(value) => set({ when: value })}
        onRowClick={editor.openEdit}
        activeRowId={editor.editing?.id}
        rowActions={(e) => (
          <>
            <AdminIconButton label="Edit event" onClick={() => editor.openEdit(e)}>
              <Pencil />
            </AdminIconButton>
            <AdminIconButton label="Delete event" destructive onClick={() => editor.askDelete(e)}>
              <Trash2 />
            </AdminIconButton>
          </>
        )}
        emptyTitle={tab === 'upcoming' ? 'Nothing scheduled' : 'No events'}
        emptyDescription="Create an event and it will appear on the public calendar."
      />

      {editor.formOpen ? <EventFormModal key={editor.formKey} event={editor.editing} onClose={editor.closeForm} /> : null}
      {editor.confirmDialog}
    </>
  );
}
