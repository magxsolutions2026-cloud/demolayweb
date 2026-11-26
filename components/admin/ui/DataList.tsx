'use client';

import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';

export type DataColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  /** When set, the header becomes a sort toggle. */
  sortValue?: (row: T) => string | number;
  className?: string;
};

export type DataTab = { value: string; label: string; count?: number };

type Props<T> = {
  rows: T[];
  columns: DataColumn<T>[];
  getRowId: (row: T) => number;
  searchText: (row: T) => string;
  searchPlaceholder?: string;
  tabs?: DataTab[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  onRowClick?: (row: T) => void;
  activeRowId?: number | null;
  rowActions?: (row: T) => React.ReactNode;
  toolbarExtra?: React.ReactNode;
  /** Enables checkboxes; the parent owns the selection and renders any bulk actions. */
  selection?: { ids: number[]; onChange: (ids: number[]) => void };
  emptyTitle: string;
  emptyDescription?: string;
  pageSize?: number;
};

/** Toolbar (tabs, search, extras) over a table of pill rows, with sorting, paging and a "Showing x–y of n" footer. */
export function DataList<T>({
  rows,
  columns,
  getRowId,
  searchText,
  searchPlaceholder = 'Search…',
  tabs,
  activeTab,
  onTabChange,
  onRowClick,
  activeRowId,
  rowActions,
  toolbarExtra,
  selection,
  emptyTitle,
  emptyDescription,
  pageSize = 10,
}: Props<T>) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let out = needle ? rows.filter((row) => searchText(row).toLowerCase().includes(needle)) : rows;
    const col = sort && columns.find((c) => c.key === sort.key);
    if (col?.sortValue && sort) {
      const value = col.sortValue;
      out = [...out].sort((a, b) => {
        const va = value(a);
        const vb = value(b);
        return (typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb))) * sort.dir;
      });
    }
    return out;
  }, [rows, query, sort, columns, searchText]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * pageSize, current * pageSize);
  const from = filtered.length === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, filtered.length);

  const pageIds = paged.map(getRowId);
  const allOnPage = selection && pageIds.length > 0 && pageIds.every((id) => selection.ids.includes(id));

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: 1 } : s.dir === 1 ? { key, dir: -1 } : null));

  return (
    <section className="cs-tile">
      <div className="cs-toolbar">
        {tabs ? (
          <div className="cs-tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={tab.value === activeTab}
                className="cs-tab-btn"
                onClick={() => {
                  onTabChange?.(tab.value);
                  setPage(1);
                }}
              >
                {tab.label}
                {tab.count !== undefined ? <span className="cs-tab-count">{tab.count}</span> : null}
              </button>
            ))}
          </div>
        ) : null}
        <label className="cs-input min-w-[200px] flex-1 sm:max-w-xs">
          <Search />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </label>
        {toolbarExtra ? <div className="ml-auto flex flex-wrap items-center gap-2">{toolbarExtra}</div> : null}
      </div>

      {paged.length === 0 ? (
        <div className="px-3 pb-3">
          <AdminEmptyState
            title={query ? 'No matches' : emptyTitle}
            description={query ? `Nothing matches “${query}”. Try another search.` : emptyDescription}
          />
        </div>
      ) : (
        <div className="cs-table-wrap">
          <table className="cs-table">
            <thead>
              <tr>
                {selection ? (
                  <th className="w-10">
                    <input
                      type="checkbox"
                      className="accent-[#d4af37]"
                      aria-label="Select all on this page"
                      checked={!!allOnPage}
                      onChange={() =>
                        selection.onChange(
                          allOnPage
                            ? selection.ids.filter((id) => !pageIds.includes(id))
                            : Array.from(new Set([...selection.ids, ...pageIds])),
                        )
                      }
                    />
                  </th>
                ) : null}
                {columns.map((col) => (
                  <th key={col.key} className={col.className}>
                    {col.sortValue ? (
                      <button type="button" onClick={() => toggleSort(col.key)}>
                        {col.header}
                        {sort?.key === col.key ? (
                          sort.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : null}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
                {rowActions ? <th className="text-right">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {paged.map((row) => {
                const id = getRowId(row);
                return (
                  <tr
                    key={id}
                    className="cs-row"
                    tabIndex={onRowClick ? 0 : undefined}
                    aria-selected={activeRowId === id}
                    onClick={() => onRowClick?.(row)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target === e.currentTarget) onRowClick?.(row);
                    }}
                  >
                    {selection ? (
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="accent-[#d4af37]"
                          aria-label="Select row"
                          checked={selection.ids.includes(id)}
                          onChange={() =>
                            selection.onChange(
                              selection.ids.includes(id) ? selection.ids.filter((x) => x !== id) : [...selection.ids, id],
                            )
                          }
                        />
                      </td>
                    ) : null}
                    {columns.map((col) => (
                      <td key={col.key} className={col.className}>
                        {col.render(row)}
                      </td>
                    ))}
                    {rowActions ? (
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">{rowActions(row)}</div>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="cs-list-foot">
        <span>
          Showing {from}–{to} of {filtered.length}
        </span>
        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="cs-icon-btn !h-8 !w-8"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft />
            </button>
            <span>
              Page {current} / {totalPages}
            </span>
            <button
              type="button"
              className="cs-icon-btn !h-8 !w-8"
              disabled={current >= totalPages}
              onClick={() => setPage(current + 1)}
              aria-label="Next page"
            >
              <ChevronRight />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
