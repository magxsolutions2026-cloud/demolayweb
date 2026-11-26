'use client';

import {
  CalendarPlus,
  ChevronRight,
  ExternalLink,
  FilePlus2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserPlus,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAdminData } from '@/components/admin/AdminDataProvider';
import { ADMIN_BASE, ALL_NAV_ITEMS } from './nav';

type Command = { id: string; label: string; hint: string; icon: LucideIcon; run: () => void };

/** Ctrl/Cmd+K palette: jump to any page, start a new record, or open a member by name. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { petitioners, refresh } = useAdminData();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => router.push(href);
    return [
      ...ALL_NAV_ITEMS.map((item) => ({
        id: `nav-${item.href}`,
        label: item.label,
        hint: item.group,
        icon: item.icon,
        run: go(item.href),
      })),
      { id: 'new-event', label: 'New event', hint: 'Create', icon: CalendarPlus, run: go(`${ADMIN_BASE}/events?new=1`) },
      { id: 'new-news', label: 'New news post', hint: 'Create', icon: FilePlus2, run: go(`${ADMIN_BASE}/news?new=1`) },
      { id: 'new-officer', label: 'New officer', hint: 'Create', icon: UserPlus, run: go(`${ADMIN_BASE}/officers?new=1`) },
      { id: 'refresh', label: 'Refresh data', hint: 'Action', icon: RefreshCw, run: () => void refresh() },
      { id: 'site', label: 'Open public site', hint: 'Action', icon: ExternalLink, run: () => window.open('/', '_blank') },
      ...petitioners.map((p) => ({
        id: `member-${p.id}`,
        label: p.name,
        hint: `Member · ${p.status}`,
        icon: ShieldCheck,
        run: go(`${ADMIN_BASE}/members?status=all&open=${p.id}`),
      })),
    ];
  }, [petitioners, refresh, router]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    // Members only show up once you type, so the empty palette stays a short list of pages and actions.
    if (!needle) return commands.filter((c) => !c.id.startsWith('member-')).slice(0, 14);
    return commands.filter((c) => `${c.label} ${c.hint}`.toLowerCase().includes(needle)).slice(0, 14);
  }, [commands, query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const run = (command: Command | undefined) => {
    if (!command) return;
    command.run();
    setQuery('');
    setCursor(0);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[95] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="cs-pop w-full max-w-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-gold/70" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setCursor((c) => Math.min(results.length - 1, c + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setCursor((c) => Math.max(0, c - 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                run(results[cursor]);
              }
            }}
            placeholder="Search pages, actions or members…"
            className="min-w-0 flex-1 bg-transparent text-sm text-white/90 outline-none placeholder:text-white/35"
          />
          <button type="button" onClick={onClose} className="cs-icon-btn !h-8 !w-8" aria-label="Close command palette">
            <X />
          </button>
        </div>

        <div className="admin-scroll max-h-[min(60vh,420px)] overflow-y-auto p-2" role="listbox">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-white/40">Nothing matches “{query}”.</p>
          ) : (
            results.map((command, index) => {
              const Icon = command.icon;
              const active = index === cursor;
              return (
                <button
                  key={command.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setCursor(index)}
                  onClick={() => run(command)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${active ? 'bg-gold/10' : ''}`}
                >
                  <span className="cs-avatar-sm !h-8 !w-8">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-medium ${active ? 'text-gold' : 'text-white/85'}`}>
                      {command.label}
                    </span>
                    <span className="cs-label block !text-[9px]">{command.hint}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-white/25" />
                </button>
              );
            })
          )}
        </div>

        <div className="cs-label flex items-center justify-between border-t border-white/[0.07] px-4 py-2.5 !text-[9px]">
          <span>↑ ↓ to move · Enter to open · Esc to close</span>
          <span className="cs-kbd">Ctrl K</span>
        </div>
      </div>
    </div>
  );
}
