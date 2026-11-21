'use client';

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

export type DataTableStatus = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

const statusClasses: Record<DataTableStatus, string> = {
  success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  warning: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  danger: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
  neutral: 'border-white/10 bg-white/[0.05] text-white/55',
  info: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
};

export function StatusPill({ children, tone = 'neutral' }: { children: ReactNode; tone?: DataTableStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClasses[tone]}`}>
      {children}
    </span>
  );
}

export type DataTableColumn<T extends object> = {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'right';
  render?: (row: T) => ReactNode;
  value?: (row: T) => string | number | null | undefined;
  headerClass?: string;
  cellClass?: string;
};

export type DataTableFilter<T extends object> = {
  value: string;
  label: string;
  predicate: (row: T) => boolean;
};

function readValue<T extends object>(row: T, column: DataTableColumn<T>) {
  if (column.value) return column.value(row);
  const record = row as Record<string, unknown>;
  return record[column.key];
}

export function DataTable<T extends object>({
  rows,
  columns,
  title,
  description,
  searchPlaceholder = 'Search records…',
  filters = [],
  pageSize = 6,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
  getRowId,
  getRowSearchText,
  renderRowActions,
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
  title: string;
  description?: string;
  searchPlaceholder?: string;
  filters?: DataTableFilter<T>[];
  pageSize?: number;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  getRowId: (row: T, index: number) => string | number;
  getRowSearchText?: (row: T) => string;
  renderRowActions?: (row: T) => ReactNode;
}) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(1);

  const visibleRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    let result = rows.filter((row) => {
      const matchesFilter =
        activeFilter === 'all' || filters.find((filter) => filter.value === activeFilter)?.predicate(row) !== false;
      if (!matchesFilter) return false;
      if (!needle) return true;
      const text = getRowSearchText
        ? getRowSearchText(row)
        : columns.map((column) => String(readValue(row, column) ?? '')).join(' ');
      return text.toLowerCase().includes(needle);
    });

    if (sort) {
      const column = columns.find((item) => item.key === sort.key);
      if (column) {
        result = [...result].sort((a, b) => {
          const aValue = readValue(a, column);
          const bValue = readValue(b, column);
          const aNumber = typeof aValue === 'number' ? aValue : Number(aValue);
          const bNumber = typeof bValue === 'number' ? bValue : Number(bValue);
          const factor = sort.direction === 'asc' ? 1 : -1;

          if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) return (aNumber - bNumber) * factor;
          return String(aValue ?? '').localeCompare(String(bValue ?? '')) * factor;
        });
      }
    }

    return result;
  }, [rows, columns, filters, getRowSearchText, search, activeFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = visibleRows.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, visibleRows.length);
  const pagedRows = visibleRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key: string) => {
    setSort((current) => {
      if (!current || current.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
    setPage(1);
  };

  return (
    <section className="admin-panel overflow-hidden rounded-2xl">
      <div className="flex flex-col gap-3 border-b border-white/[0.07] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-white/90">{title}</h3>
          {description ? <p className="mt-0.5 text-xs text-white/40">{description}</p> : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {filters.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('all');
                  setPage(1);
                }}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                  activeFilter === 'all'
                    ? 'border-gold/30 bg-gold/10 text-gold'
                    : 'border-white/10 text-white/45 hover:border-white/20 hover:text-white/70'
                }`}
              >
                All
              </button>
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter.value);
                    setPage(1);
                  }}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                    activeFilter === filter.value
                      ? 'border-gold/30 bg-gold/10 text-gold'
                      : 'border-white/10 text-white/45 hover:border-white/20 hover:text-white/70'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          ) : null}

          <label className="relative block min-w-0 sm:w-56">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" aria-hidden />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-8 pr-3 text-xs text-white/80 outline-none transition placeholder:text-white/30 focus:border-gold/30"
            />
          </label>
        </div>
      </div>

      <div className="admin-scroll overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#111827]/95 backdrop-blur">
            <tr className="border-b border-white/[0.07]">
              {columns.map((column) => {
                const activeSort = sort?.key === column.key;
                const SortIcon = activeSort ? (sort.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35 ${
                      column.align === 'right' ? 'text-right' : 'text-left'
                    } ${column.headerClass ?? ''}`}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={`inline-flex items-center gap-1.5 transition hover:text-white/70 ${
                          activeSort ? 'text-gold' : ''
                        }`}
                      >
                        {column.header}
                        <SortIcon className="h-3 w-3" aria-hidden />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
              {renderRowActions ? (
                <th scope="col" className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: pageSize }, (_, index) => (
                <tr key={`skeleton-${index}`} className="border-b border-white/[0.05]">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3.5">
                      <span className="block h-3 w-3/4 animate-pulse rounded-full bg-white/[0.07]" />
                    </td>
                  ))}
                  {renderRowActions ? <td className="px-4 py-3.5"><span className="block h-3 w-10 animate-pulse rounded-full bg-white/[0.07]" /></td> : null}
                </tr>
              ))
            ) : pagedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (renderRowActions ? 1 : 0)} className="px-4 py-12 text-center">
                  <p className="text-sm font-medium text-white/70">{emptyTitle}</p>
                  <p className="mt-1 text-xs text-white/35">{emptyDescription}</p>
                </td>
              </tr>
            ) : (
              pagedRows.map((row, index) => (
                <tr key={getRowId(row, index)} className="border-b border-white/[0.05] transition hover:bg-white/[0.035]">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3.5 text-white/65 ${column.align === 'right' ? 'text-right' : ''} ${column.cellClass ?? ''}`}
                    >
                      {column.render ? column.render(row) : String(readValue(row, column) ?? '—')}
                    </td>
                  ))}
                  {renderRowActions ? <td className="px-4 py-3.5 text-right">{renderRowActions(row)}</td> : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] px-4 py-3 text-xs text-white/40">
        <span className="tabular-nums">
          {start}–{end} of {visibleRows.length}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={safePage <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 transition hover:border-gold/25 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-1 tabular-nums">
            {safePage} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            disabled={safePage >= pageCount}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 transition hover:border-gold/25 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
