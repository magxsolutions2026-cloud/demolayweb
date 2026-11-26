'use client';

import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FilePlus2,
  LogOut,
  Menu,
  Plus,
  Search,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useAdminData } from '@/components/admin/AdminDataProvider';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { CommandPalette } from './CommandPalette';
import { LiveClock, LiveDate } from './LiveClock';
import { ADMIN_BASE, ADMIN_NAV, ALL_NAV_ITEMS, isNavActive, type BadgeKey } from './nav';
import { NotificationBell } from './NotificationBell';
import { roundedPath } from './roundedPath';

const COLLAPSE_KEY = 'demolay-admin-rail';
const COLLAPSE_EVENT = 'demolay-admin-rail-change';

function subscribeCollapsed(onChange: () => void) {
  window.addEventListener(COLLAPSE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(COLLAPSE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeCollapsed(next: boolean) {
  try {
    localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
  } catch {
    // Storage unavailable; the choice lasts until the next reload.
  }
  window.dispatchEvent(new Event(COLLAPSE_EVENT));
}

const QUICK_ADD = [
  { href: `${ADMIN_BASE}/events?new=1`, label: 'Event', icon: CalendarPlus },
  { href: `${ADMIN_BASE}/news?new=1`, label: 'News post', icon: FilePlus2 },
  { href: `${ADMIN_BASE}/officers?new=1`, label: 'Officer', icon: UserPlus },
];

type Shape = { w: number; h: number; nw: number; nh: number; tw: number; th: number };

/** Measures the workspace so its outline can cut a notch for the page title and a tab for the status line. */
function useWorkspaceShape() {
  const ref = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<Shape>({ w: 0, h: 0, nw: 0, nh: 0, tw: 0, th: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const style = getComputedStyle(el);
      const px = (name: string) => parseFloat(style.getPropertyValue(name)) || 0;
      setShape({
        w: el.clientWidth,
        h: el.clientHeight,
        nw: px('--cs-notch-w'),
        nh: px('--cs-notch-h'),
        tw: px('--cs-tab-w') / 2,
        th: px('--cs-tab-h'),
      });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h, nw, nh, tw, th } = shape;
  const cx = w / 2;
  const path = w
    ? roundedPath([
        [0, nh, 20],
        [nw, nh, 20],
        [nw, 0, 20],
        [w, 0, 20],
        [w, h, 20],
        [cx + tw, h, 12],
        [cx + tw - 10, h - th, 12],
        [cx - tw + 10, h - th, 12],
        [cx - tw, h, 12],
        [0, h, 20],
      ])
    : '';

  return { ref, w, h, path };
}

function ShellSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-label="Loading dashboard">
      <div className="h-16 w-1/2 rounded-2xl bg-white/[0.04]" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-[20px] bg-white/[0.04]" />
        ))}
      </div>
      <div className="h-80 rounded-[20px] bg-white/[0.04]" />
    </div>
  );
}

/** Signed-in console: sidebar block plus one notched workspace panel (layout after the CDRRMO admin console). */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const data = useAdminData();
  const collapsed = useSyncExternalStore(subscribeCollapsed, readCollapsed, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const quickRef = useRef<HTMLDivElement>(null);
  const { ref: workRef, w: workW, h: workH, path: workPath } = useWorkspaceShape();

  // Navigating closes the mobile drawer and the quick-add menu.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setQuickOpen(false);
  }

  const toggleCollapsed = useCallback(() => writeCollapsed(!readCollapsed()), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapsed();
      } else if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (e.key === 'Escape') {
        setMobileOpen(false);
        setQuickOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleCollapsed]);

  useEffect(() => {
    if (!quickOpen) return;
    const onClick = (e: MouseEvent) => {
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setQuickOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [quickOpen]);

  const closePalette = useCallback(() => setPaletteOpen(false), []);

  const badges: Record<BadgeKey, number> = {
    petitions: data.notifications.unreadPetitions,
    subscribers: data.notifications.unreadSubscribers,
    orders: data.notifications.unreadOrders,
  };
  const current = ALL_NAV_ITEMS.find((item) => isNavActive(item.href, pathname));
  const chapterName = data.landing.hero?.title?.trim() || 'T. De Leon Chapter No. 47';
  const logo = data.landing.hero?.logo_url?.trim() || '/logo.png';
  const initial = data.username.trim().charAt(0).toUpperCase() || 'A';

  let body: React.ReactNode = children;
  if (data.booting) body = <ShellSkeleton />;
  else if (data.loadError && data.events.length === 0 && data.petitioners.length === 0) {
    body = (
      <div className="grid place-items-center gap-5 py-16">
        <AdminEmptyState title="Could not load the dashboard" description={data.loadError} />
        <button type="button" className="cs-btn cs-btn-primary" onClick={() => void data.fetchAll({ boot: true })}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`cs-app${collapsed ? ' is-collapsed' : ''}${mobileOpen ? ' is-menu-open' : ''}`}>
      {mobileOpen ? (
        <button type="button" className="cs-scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
      ) : null}

      <aside className="cs-sidebar" aria-label="Admin navigation">
        <Link href={ADMIN_BASE} className="cs-brand" data-label="Dashboard">
          <span className="cs-seal">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded logo URL from storage */}
            <img src={logo} alt="" />
          </span>
          <span className="cs-brand-text">
            <strong>
              DeMolay <b>No. 47</b>
            </strong>
            <em>Admin console</em>
          </span>
        </Link>

        <div className="relative" ref={quickRef}>
          <button
            type="button"
            className="cs-cta w-full"
            data-label="Quick add"
            aria-expanded={quickOpen}
            aria-haspopup="menu"
            onClick={() => setQuickOpen((v) => !v)}
          >
            <Plus />
            <span>Quick add</span>
          </button>
          {quickOpen ? (
            <div className="cs-cta-menu" role="menu">
              {QUICK_ADD.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} role="menuitem">
                  <Icon />
                  {label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <nav className="cs-nav">
          {ADMIN_NAV.map((group) => (
            <div key={group.title} className="cs-nav-group">
              <p>{group.title}</p>
              {group.items.map((item) => {
                const active = isNavActive(item.href, pathname);
                const count = item.badge ? badges[item.badge] : 0;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`cs-nav-link${active ? ' is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    data-label={item.label}
                  >
                    <Icon />
                    <span>{item.label}</span>
                    {count > 0 ? <b className="cs-nav-badge">{count > 99 ? '99+' : count}</b> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="cs-sidebar-foot">
          <div className="cs-account">
            <span className="cs-avatar" aria-hidden>
              {initial}
            </span>
            <span className="cs-account-text">
              <strong>{data.username}</strong>
              <em>Administrator</em>
            </span>
            <a href="/" target="_blank" rel="noreferrer" className="cs-icon-btn" data-label="Public site" aria-label="Open public site">
              <ExternalLink />
            </a>
            <form action="/api/admin/logout" method="POST">
              <button type="submit" className="cs-icon-btn" data-label="Log out" aria-label="Log out">
                <LogOut />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <button
        type="button"
        className="cs-rail-toggle"
        onClick={toggleCollapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-pressed={collapsed}
        title={`${collapsed ? 'Expand' : 'Collapse'} sidebar (Ctrl+B)`}
      >
        {collapsed ? <ChevronRight /> : <ChevronLeft />}
      </button>

      <div ref={workRef} className="cs-work">
        {workW ? (
          <svg className="cs-work-shape" viewBox={`0 0 ${workW} ${workH}`} preserveAspectRatio="none" aria-hidden>
            <path className="cs-work-fill" d={workPath} />
            <path className="cs-work-edge" d={workPath} />
            <path className="cs-scan" d={workPath} pathLength={1} />
          </svg>
        ) : null}
        <i className="cs-rail cs-rail-l" aria-hidden />
        <i className="cs-rail cs-rail-r" aria-hidden />

        <div className="cs-notch">
          <span className="cs-notch-kicker">{current?.group ?? 'Admin'} · {chapterName}</span>
          <strong>{current?.label ?? 'Console'}</strong>
        </div>

        <div className="cs-strip">
          <button type="button" className="cs-icon-btn cs-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu />
          </button>
          <button type="button" className="cs-search" onClick={() => setPaletteOpen(true)} aria-label="Search (Ctrl+K)">
            <Search className="h-4 w-4 shrink-0" />
            <span>Search pages, actions, members…</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="cs-strip-right">
            <span className="cs-digital">
              <i className="cs-live-dot" aria-hidden />
              <LiveClock />
            </span>
            <LiveDate />
            <NotificationBell />
          </div>
        </div>

        <main id="main-content" className="cs-work-body">
          {body}
        </main>

        <div className="cs-tab" aria-hidden>
          <i className="cs-live-dot" />
          <span>Signed in · {data.username}</span>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </div>
  );
}
