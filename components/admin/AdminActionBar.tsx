'use client';

import { Plus, Search } from 'lucide-react';
import { AdminPrimaryButton } from '@/components/admin/AdminButtons';

export function AdminActionBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  showSearch = true,
  actionLabel,
  onAction,
  showAction = true,
}: {
  searchValue: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
}) {
  const resolvedActionLabel = actionLabel?.replace(/^\s*\+\s*/, '').trim();

  return (
    <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {showSearch ? (
        <div className="group relative w-full md:max-w-md md:min-w-0">
          <Search className="text-foreground/40 group-focus-within:text-gold/70 pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200" aria-hidden />
          <input
            className="input focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.08)] w-full rounded-xl border-white/12 bg-black/25 py-2.5 pl-12 pr-3 text-sm transition-all duration-200 placeholder:text-foreground/40"
            style={{ paddingLeft: '3.25rem' }}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search"
          />
        </div>
      ) : (
        <div className="hidden sm:block" />
      )}
      {showAction && resolvedActionLabel && onAction ? (
        <AdminPrimaryButton type="button" onClick={onAction} className="shrink-0 self-start whitespace-nowrap px-5 py-3 md:self-auto">
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          <span>{resolvedActionLabel}</span>
        </AdminPrimaryButton>
      ) : null}
    </div>
  );
}
