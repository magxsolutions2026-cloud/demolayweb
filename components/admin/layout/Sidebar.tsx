'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  CalendarDays,
  LayoutDashboard,
  Mail,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { LandingSection } from '@/components/admin/types';

export type NavGroupId = 'OVERVIEW' | 'OPERATIONS' | 'MANAGEMENT' | 'SYSTEM';

export type AppNavItem = {
  id: LandingSection;
  label: string;
  group: NavGroupId;
  icon: LucideIcon;
  badge?: number | string;
};

export const navIconFor: Record<LandingSection, LucideIcon> = {
  overview: LayoutDashboard,
  funds: Wallet,
  events: CalendarDays,
  news: Newspaper,
  officers: UsersRound,
  sirKnights: ShieldCheck,
  petitioners: UserRoundCheck,
  subscribers: Mail,
  accounts: Settings2,
  settings: Activity,
};

const GROUP_ORDER: NavGroupId[] = ['OVERVIEW', 'OPERATIONS', 'MANAGEMENT', 'SYSTEM'];

function SidebarBody({
  items,
  active,
  onSelect,
  compact,
  collapsed,
  onToggleCollapsed,
  mobile,
  onCloseMobile,
  chapterName,
  logoUrl,
  username,
}: {
  items: AppNavItem[];
  active: LandingSection;
  onSelect: (id: LandingSection) => void;
  compact: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobile: boolean;
  onCloseMobile?: () => void;
  chapterName?: string | null;
  logoUrl?: string | null;
  username: string;
}) {
  const initial = username.trim().charAt(0).toUpperCase() || 'A';

  const handleSelect = (id: LandingSection) => {
    onSelect(id);
    if (mobile) onCloseMobile?.();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0b0f17]/95 backdrop-blur-xl">
      <div
        className={`relative flex h-16 shrink-0 items-center border-b border-white/[0.07] ${
          compact ? 'justify-center px-2' : 'justify-between px-4'
        }`}
      >
        <button
          type="button"
          onClick={() => handleSelect('overview')}
          className={`flex min-w-0 items-center rounded-xl text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/60 ${
            compact ? 'justify-center' : 'gap-3'
          }`}
          aria-label="Go to overview"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gold/35 bg-gradient-to-br from-gold/25 to-maroon/40 text-gold shadow-[0_0_20px_rgba(212,175,55,0.14)]">
            {logoUrl ? (
              <span
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${logoUrl.replace(/"/g, '%22')}")` }}
                aria-hidden
              />
            ) : (
              <ShieldCheck className="h-5 w-5" aria-hidden />
            )}
          </span>
          {!compact ? (
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-white/90">
                {chapterName || 'DeMolay Chapter'}
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-gold/70">
                Admin workspace
              </span>
            </span>
          ) : null}
        </button>

        {!mobile ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={`${
              compact
                ? 'absolute -bottom-7 left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-lg border border-white/10 bg-[#111827] text-white/55 shadow-lg transition hover:text-gold'
                : 'flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/45 transition hover:border-gold/30 hover:text-gold'
            } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/60`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        ) : null}

        {mobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 transition hover:text-white"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <nav className="admin-scroll min-h-0 flex-1 overflow-y-auto px-2 py-4" aria-label="Primary navigation">
        {GROUP_ORDER.map((group) => {
          const groupItems = items.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;

          return (
            <div key={group} className="mb-5 last:mb-0">
              {!compact ? (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">{group}</p>
              ) : (
                <div className="mx-auto mb-2 h-px w-8 bg-white/10" />
              )}
              <div className="space-y-1">
                {groupItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      title={compact ? item.label : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group relative flex w-full items-center rounded-xl text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/60 ${
                        compact ? 'h-10 justify-center px-0' : 'gap-3 px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-gold/10 text-gold shadow-[inset_0_0_0_1px_rgba(212,175,55,0.2)]'
                          : 'text-white/55 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      {isActive ? (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gold" />
                      ) : null}
                      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                      {!compact ? (
                        <>
                          <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                          {item.badge !== undefined ? (
                            <span className="min-w-[1.5rem] rounded-full border border-gold/20 bg-gold/10 px-1.5 py-0.5 text-center text-[10px] font-bold tabular-nums text-gold">
                              {Number(item.badge) > 99 ? '99+' : item.badge}
                            </span>
                          ) : null}
                        </>
                      ) : null}
                      {compact && item.badge !== undefined && Number(item.badge) > 0 ? (
                        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                      ) : null}
                      {compact ? (
                        <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg border border-white/10 bg-[#141118] px-2.5 py-1.5 text-xs text-white shadow-xl group-hover:block">
                          {item.label}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-white/[0.07] p-3">
        <div
          className={`flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2 ${
            compact ? 'justify-center px-0' : ''
          }`}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          {!compact ? (
            <span className="min-w-0">
              <span className="block truncate text-[11px] font-semibold text-emerald-300">Systems operational</span>
              <span className="block text-[10px] text-white/35">All services online</span>
            </span>
          ) : null}
        </div>

        <div className={`mt-2 flex items-center ${compact ? 'flex-col gap-2' : 'justify-between gap-2'}`}>
          <button
            type="button"
            onClick={() => handleSelect('settings')}
            className={`flex min-w-0 items-center rounded-xl border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-2 text-left transition hover:border-gold/25 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/60 ${
              compact ? 'w-9 justify-center px-0' : 'flex-1 gap-2'
            }`}
            aria-label={`Account menu for ${username}`}
            title={compact ? username : undefined}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-gradient-to-br from-gold/25 to-maroon/40 text-xs font-bold text-gold">
              {initial}
            </span>
            {!compact ? <span className="min-w-0 flex-1 truncate text-xs font-medium text-white/70">{username}</span> : null}
          </button>
        </div>
      </div>
    </div>
  );
}

export type SidebarProps = {
  items: AppNavItem[];
  active: LandingSection;
  onSelect: (id: LandingSection) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  chapterName?: string | null;
  logoUrl?: string | null;
  username: string;
};

export function Sidebar({
  items,
  active,
  onSelect,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileOpenChange,
  chapterName,
  logoUrl,
  username,
}: SidebarProps) {
  return (
    <>
      <aside
        className={`admin-sidebar relative hidden shrink-0 border-r border-white/[0.07] transition-[width] duration-300 ease-out lg:block ${
          collapsed ? 'w-[72px]' : 'w-[252px]'
        }`}
      >
        <SidebarBody
          items={items}
          active={active}
          onSelect={onSelect}
          compact={collapsed}
          collapsed={collapsed}
          onToggleCollapsed={onToggleCollapsed}
          mobile={false}
          chapterName={chapterName}
          logoUrl={logoUrl}
          username={username}
        />
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              key="sidebar-overlay"
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onMobileOpenChange(false)}
            />
            <motion.aside
              key="sidebar-drawer"
              className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-white/10 shadow-2xl lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            >
              <SidebarBody
                items={items}
                active={active}
                onSelect={onSelect}
                compact={false}
                collapsed={false}
                onToggleCollapsed={onToggleCollapsed}
                mobile
                onCloseMobile={() => onMobileOpenChange(false)}
                chapterName={chapterName}
                logoUrl={logoUrl}
                username={username}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
