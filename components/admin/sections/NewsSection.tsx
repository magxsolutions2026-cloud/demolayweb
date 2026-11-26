'use client';

import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useAdminData } from '@/components/admin/AdminDataProvider';
import { AdminIconButton } from '@/components/admin/AdminIconButton';
import type { NewsItem } from '@/components/admin/types';
import { DataList, type DataColumn } from '@/components/admin/ui/DataList';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { StatusChip } from '@/components/admin/ui/StatusChip';
import { useQueryState } from '@/components/admin/ui/useQueryState';
import { NewsFormModal } from './NewsFormModal';
import { useRecordEditor } from './useRecordEditor';

const TABS = ['all', 'published', 'draft'] as const;
type Tab = (typeof TABS)[number];

const time = (n: NewsItem) => (n.published_at ? new Date(n.published_at).getTime() : 0);

export function NewsSection() {
  const { news } = useAdminData();
  const { params, set } = useQueryState();
  const editor = useRecordEditor('news', news, (n) => n.title);

  const raw = params.get('state') as Tab | null;
  const tab: Tab = raw && TABS.includes(raw) ? raw : 'all';

  const { rows, counts } = useMemo(() => {
    const published = news.filter((n) => n.is_published);
    const drafts = news.filter((n) => !n.is_published);
    const pick = { all: news, published, draft: drafts };
    return {
      rows: [...pick[tab]].sort((a, b) => time(b) - time(a) || b.id - a.id),
      counts: { all: news.length, published: published.length, draft: drafts.length },
    };
  }, [news, tab]);

  const columns: DataColumn<NewsItem>[] = [
    {
      key: 'title',
      header: 'Post',
      sortValue: (n) => n.title.toLowerCase(),
      render: (n) => (
        <span className="flex min-w-0 items-center gap-3">
          <span
            className="cs-avatar-sm !h-12 !w-16 shrink-0 !rounded-lg"
            style={n.image_urls?.[0] ? { backgroundImage: `url(${n.image_urls[0]})` } : undefined}
          >
            {n.image_urls?.[0] ? null : 'N'}
          </span>
          <span className="block min-w-0 max-w-[380px]">
            <span className="block truncate font-medium">{n.title}</span>
            <span className="block truncate text-xs text-white/45">{n.summary || `/${n.slug}`}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'photos',
      header: 'Photos',
      sortValue: (n) => n.image_urls?.length ?? 0,
      render: (n) => <span className="tabular-nums text-white/60">{n.image_urls?.length ?? 0}</span>,
    },
    {
      key: 'date',
      header: 'Published',
      sortValue: time,
      render: (n) => (
        <span className="text-xs text-white/55">
          {n.published_at ? new Date(n.published_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (n) => <StatusChip tone={n.is_published ? 'green' : 'muted'}>{n.is_published ? 'Published' : 'Draft'}</StatusChip>,
    },
  ];

  return (
    <>
      <PageHeader
        kicker="Content"
        title="News"
        lead="Posts for the public news feed. Publishing a new post emails the newsletter to subscribers."
        meta={
          <>
            <StatusChip tone="green">{counts.published} published</StatusChip>
            <StatusChip tone="muted">{counts.draft} drafts</StatusChip>
          </>
        }
        actions={
          <button type="button" className="cs-btn cs-btn-primary" onClick={editor.openNew}>
            <Plus /> New post
          </button>
        }
      />

      <DataList
        rows={rows}
        columns={columns}
        getRowId={(n) => n.id}
        searchText={(n) => `${n.title} ${n.slug} ${n.summary}`}
        searchPlaceholder="Search posts…"
        tabs={TABS.map((t) => ({ value: t, label: t === 'draft' ? 'Drafts' : t, count: counts[t] }))}
        activeTab={tab}
        onTabChange={(value) => set({ state: value })}
        onRowClick={editor.openEdit}
        activeRowId={editor.editing?.id}
        rowActions={(n) => (
          <>
            {n.is_published ? (
              <a
                href="/news"
                target="_blank"
                rel="noreferrer"
                className="cs-icon-btn !h-8 !w-8"
                title="View on site"
                aria-label="View on site"
              >
                <ExternalLink />
              </a>
            ) : null}
            <AdminIconButton label="Edit post" onClick={() => editor.openEdit(n)}>
              <Pencil />
            </AdminIconButton>
            <AdminIconButton label="Delete post" destructive onClick={() => editor.askDelete(n)}>
              <Trash2 />
            </AdminIconButton>
          </>
        )}
        emptyTitle="No posts yet"
        emptyDescription="Write your first update for the chapter."
      />

      {editor.formOpen ? <NewsFormModal key={editor.formKey} item={editor.editing} onClose={editor.closeForm} /> : null}
      {editor.confirmDialog}
    </>
  );
}
