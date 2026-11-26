'use client';

import {
  Bell,
  ChevronDown,
  ChevronRight,
  Command,
  HandCoins,
  LogOut,
  Mail,
  Menu,
  Plus,
  RefreshCw,
  Search,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { LandingSection } from '@/components/admin/types';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import type { AppNavItem } from './Sidebar';

export type PetitionerNotifPreview = { id: number; name: string; submittedAt: string; read: boolean };
export type SubscriberNotifPreview = { id: number; email: string; dateSubscribed: string; read: boolean };
export type TShirtOrderNotifPreview = {
  id: number;
  brotherName: string;
  campaignName: string;
  shirtSize: string;
  quantity: number;
  createdAt: string;
  read: boolean;
};

type CommandItem = {
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
  run: () => void;
};

export type TopbarProps = {
  title: string;
  breadcrumbGroup: string;
  username: string;
  navItems: AppNavItem[];
  onNavigate: (id: LandingSection) => void;
  onMenuClick: () => void;
  onRefresh: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  notificationBadgeTotal: number;
  petitionerPreviews: PetitionerNotifPreview[];
  subscriberPreviews: SubscriberNotifPreview[];
  tshirtOrderPreviews: TShirtOrderNotifPreview[];
  onMarkAllRead: () => void;
  onGoToPetitioners: () => void;
  onGoToSubscribers: () => void;
  onGoToTshirtOrders: () => void;
};

export function Topbar({
  title,
  breadcrumbGroup,
  username,
  navItems,
  onNavigate,
  onMenuClick,
  onRefresh,
  primaryActionLabel,
  onPrimaryAction,
  notificationBadgeTotal,
  petitionerPreviews,
  subscriberPreviews,
  tshirtOrderPreviews,
  onMarkAllRead,
  onGoToPetitioners,
  onGoToSubscribers,
  onGoToTshirtOrders,
}: TopbarProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const initial = username.trim().charAt(0).toUpperCase() || 'A';

  const commands = useMemo<CommandItem[]>(() => {
    const navigation: CommandItem[] = navItems.map((item) => ({
      id: `nav-${item.id}`,
      label: `Go to ${item.label}`,
      group: item.group,
      icon: item.icon,
      run: () => onNavigate(item.id),
    }));

    const quick: CommandItem[] = [
      {
        id: 'refresh',
        label: 'Refresh dashboard data',
        group: 'QUICK ACTIONS',
        icon: RefreshCw,
        run: onRefresh,
      },
    ];

    if (primaryActionLabel && onPrimaryAction) {
      quick.unshift({
        id: 'primary',
        label: primaryActionLabel,
        group: 'QUICK ACTIONS',
        icon: Plus,
        run: onPrimaryAction,
      });
    }

    return [...navigation, ...quick];
  }, [navItems, onNavigate, onRefresh, onPrimaryAction, primaryActionLabel]);

  const filteredCommands = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands.slice(0, 10);
    return commands.filter((item) => `${item.label} ${item.group}`.toLowerCase().includes(needle)).slice(0, 12);
  }, [commands, query]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
        setNotifOpen(false);
        setProfileOpen(false);
      }
      if (event.key === 'Escape') {
        setPaletteOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (controlsRef.current && !controlsRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const runCommand = (command: CommandItem) => {
    command.run();
    setPaletteOpen(false);
    setQuery('');
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.08] bg-[#0b0f17]/85 px-4 backdrop-blur-xl md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/60 transition hover:border-gold/30 hover:text-gold lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="hidden text-white/35 sm:inline">Admin</span>
            <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-white/25 sm:inline" />
            <span className="hidden text-white/45 md:inline">{breadcrumbGroup}</span>
            <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-white/25 md:inline" />
            <span className="truncate font-medium text-white/90">{title}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="hidden h-9 w-full max-w-[360px] items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.035] px-3 text-left text-sm text-white/40 transition hover:border-gold/25 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/60 md:flex"
          aria-label="Open command palette"
        >
          <Search className="h-4 w-4" aria-hidden />
          <span className="flex-1">Search modules and actions…</span>
          <span className="flex items-center gap-0.5 rounded-md border border-white/10 bg-black/30 px-1.5 py-0.5 text-[10px] font-semibold text-white/45">
            <Command className="h-3 w-3" /> K
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1.5" ref={controlsRef}>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/55 transition hover:border-gold/30 hover:text-gold md:hidden"
            aria-label="Open command palette"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/55 transition hover:border-gold/30 hover:text-gold sm:flex"
            aria-label="Refresh dashboard data"
            title="Refresh dashboard data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {primaryActionLabel && onPrimaryAction ? (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="admin-btn-primary hidden h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(115,14,27,0.28)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/60 sm:flex"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">{primaryActionLabel}</span>
            </button>
          ) : null}

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen((open) => !open);
                setProfileOpen(false);
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/60 transition hover:border-gold/30 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/60"
              aria-expanded={notifOpen}
              aria-haspopup="true"
              aria-label={`Notifications${notificationBadgeTotal ? `, ${notificationBadgeTotal} items` : ''}`}
            >
              <Bell className="h-[18px] w-[18px]" aria-hidden />
              {notificationBadgeTotal > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-maroon px-1 text-[10px] font-bold tabular-nums text-white shadow-sm">
                  {notificationBadgeTotal > 99 ? '99+' : notificationBadgeTotal}
                </span>
              ) : null}
            </button>

            {notifOpen ? (
              <div className="absolute right-0 z-50 mt-2 flex max-h-[min(70vh,480px)] w-[min(calc(100vw-2rem),390px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111827]/98 shadow-2xl backdrop-blur-xl">
                <div className="flex shrink-0 items-start justify-between gap-2 border-b border-white/[0.08] px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white/90">Notifications</p>
                    <p className="text-[11px] text-white/40">Petitions, subscribers, and campaign orders</p>
                  </div>
                  {notificationBadgeTotal > 0 ? (
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-gold/80 transition hover:bg-white/5 hover:text-gold"
                    >
                      Mark all read
                    </button>
                  ) : null}
                </div>

                <div className="admin-scroll min-h-0 flex-1 overflow-y-auto">
                  <div className="border-b border-white/[0.07] py-1">
                    <p className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gold/70">
                      <User className="h-3.5 w-3.5" /> Petitioners
                    </p>
                    {petitionerPreviews.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-white/40">No pending petitions.</p>
                    ) : (
                      petitionerPreviews.map((item) => (
                        <button
                          key={`p-${item.id}`}
                          type="button"
                          onClick={() => {
                            onGoToPetitioners();
                            setNotifOpen(false);
                          }}
                          className={`flex w-full gap-3 px-4 py-2.5 text-left transition hover:bg-white/[0.05] ${item.read ? 'opacity-60' : ''}`}
                        >
                          <span
                            className={`mt-2 h-2 w-2 shrink-0 rounded-full ${item.read ? 'bg-transparent' : 'bg-gold shadow-[0_0_8px_rgba(234,179,8,0.5)]'}`}
                          />
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-xs font-bold text-gold">
                            {item.name.trim().charAt(0).toUpperCase() || '?'}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-white/85">{item.name}</span>
                            <span className="block text-xs text-white/40">Membership petition submitted</span>
                          </span>
                          <time className="shrink-0 pt-0.5 text-[11px] tabular-nums text-white/35" dateTime={item.submittedAt}>
                            {formatRelativeTime(item.submittedAt)}
                          </time>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="border-b border-white/[0.07] py-1">
                    <p className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gold/70">
                      <Mail className="h-3.5 w-3.5" /> Subscribers
                    </p>
                    {subscriberPreviews.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-white/40">No new subscribers this week.</p>
                    ) : (
                      subscriberPreviews.map((item) => (
                        <button
                          key={`s-${item.id}`}
                          type="button"
                          onClick={() => {
                            onGoToSubscribers();
                            setNotifOpen(false);
                          }}
                          className={`flex w-full gap-3 px-4 py-2.5 text-left transition hover:bg-white/[0.05] ${item.read ? 'opacity-60' : ''}`}
                        >
                          <span
                            className={`mt-2 h-2 w-2 shrink-0 rounded-full ${item.read ? 'bg-transparent' : 'bg-gold shadow-[0_0_8px_rgba(234,179,8,0.5)]'}`}
                          />
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gold/80">
                            <Mail className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-white/85">{item.email}</span>
                            <span className="block text-xs text-white/40">Joined the newsletter</span>
                          </span>
                          <time className="shrink-0 pt-0.5 text-[11px] tabular-nums text-white/35" dateTime={item.dateSubscribed}>
                            {formatRelativeTime(item.dateSubscribed)}
                          </time>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="py-1">
                    <p className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gold/70">
                      <HandCoins className="h-3.5 w-3.5" /> Campaign orders
                    </p>
                    {tshirtOrderPreviews.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-white/40">No recent campaign orders.</p>
                    ) : (
                      tshirtOrderPreviews.map((item) => (
                        <button
                          key={`o-${item.id}`}
                          type="button"
                          onClick={() => {
                            onGoToTshirtOrders();
                            setNotifOpen(false);
                          }}
                          className={`flex w-full gap-3 px-4 py-2.5 text-left transition hover:bg-white/[0.05] ${item.read ? 'opacity-60' : ''}`}
                        >
                          <span
                            className={`mt-2 h-2 w-2 shrink-0 rounded-full ${item.read ? 'bg-transparent' : 'bg-gold shadow-[0_0_8px_rgba(234,179,8,0.5)]'}`}
                          />
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gold/80">
                            <HandCoins className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-white/85">{item.brotherName}</span>
                            <span className="block truncate text-xs text-white/40">
                              {item.campaignName} · Qty {item.quantity} · {item.shirtSize}
                            </span>
                          </span>
                          <time className="shrink-0 pt-0.5 text-[11px] tabular-nums text-white/35" dateTime={item.createdAt}>
                            {formatRelativeTime(item.createdAt)}
                          </time>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((open) => !open);
                setNotifOpen(false);
              }}
              className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-1 pl-1 pr-2 transition hover:border-gold/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/60"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              aria-label={`Account menu for ${username}`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-gold/30 bg-gradient-to-br from-gold/25 to-maroon/40 text-xs font-bold text-gold">
                {initial}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-white/40 transition ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen ? (
              <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#111827]/98 py-1 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2 border-b border-white/[0.07] px-3 py-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold/25 bg-gold/10 text-xs font-bold text-gold">
                    {initial}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white/85">{username}</span>
                    <span className="block text-[10px] uppercase tracking-[0.14em] text-white/35">Administrator</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('settings');
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-gold"
                >
                  <Command className="h-4 w-4" />
                  Preferences
                </button>
                <form action="/api/admin/logout" method="POST" className="border-t border-white/[0.07]">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-gold"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {paletteOpen ? (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm" onClick={() => setPaletteOpen(false)}>
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#111827]/98 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-gold/70" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search modules and actions…"
                className="min-w-0 flex-1 bg-transparent text-sm text-white/90 outline-none placeholder:text-white/35"
              />
              <button
                type="button"
                onClick={() => setPaletteOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-white/40 transition hover:text-white"
                aria-label="Close command palette"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="admin-scroll max-h-[min(60vh,420px)] overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-white/40">No matching commands.</p>
              ) : (
                filteredCommands.map((command) => {
                  const Icon = command.icon;
                  return (
                    <button
                      key={command.id}
                      type="button"
                      onClick={() => runCommand(command)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold/60"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-gold/80">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-white/85">{command.label}</span>
                        <span className="block text-[10px] uppercase tracking-[0.14em] text-white/30">{command.group}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-white/25" />
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-2 text-[10px] text-white/30">
              <span>Type to filter · Esc to close</span>
              <span className="flex items-center gap-1">
                <Command className="h-3 w-3" /> K
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
