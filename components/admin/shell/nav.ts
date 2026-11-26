import {
  CalendarDays,
  LayoutDashboard,
  Mail,
  Newspaper,
  Settings2,
  ShieldCheck,
  UserRoundCog,
  UsersRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export const ADMIN_BASE = '/admin/dashboard';

export type BadgeKey = 'petitions' | 'subscribers' | 'orders';

export type ConsoleNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: BadgeKey;
};

export type ConsoleNavGroup = { title: string; items: ConsoleNavItem[] };

export const ADMIN_NAV: ConsoleNavGroup[] = [
  { title: 'Overview', items: [{ href: ADMIN_BASE, label: 'Dashboard', icon: LayoutDashboard }] },
  {
    title: 'Members',
    items: [
      { href: `${ADMIN_BASE}/members`, label: 'Members', icon: ShieldCheck, badge: 'petitions' },
      { href: `${ADMIN_BASE}/officers`, label: 'Officers', icon: UsersRound },
    ],
  },
  {
    title: 'Content',
    items: [
      { href: `${ADMIN_BASE}/events`, label: 'Events', icon: CalendarDays },
      { href: `${ADMIN_BASE}/news`, label: 'News', icon: Newspaper },
    ],
  },
  { title: 'Finance', items: [{ href: `${ADMIN_BASE}/funds`, label: 'Chapter funds', icon: Wallet, badge: 'orders' }] },
  { title: 'Audience', items: [{ href: `${ADMIN_BASE}/subscribers`, label: 'Subscribers', icon: Mail, badge: 'subscribers' }] },
  {
    title: 'System',
    items: [
      { href: `${ADMIN_BASE}/accounts`, label: 'Accounts', icon: UserRoundCog },
      { href: `${ADMIN_BASE}/settings`, label: 'Settings', icon: Settings2 },
    ],
  },
];

export const ALL_NAV_ITEMS = ADMIN_NAV.flatMap((group) => group.items.map((item) => ({ ...item, group: group.title })));

export function isNavActive(href: string, pathname: string) {
  return href === ADMIN_BASE ? pathname === ADMIN_BASE : pathname === href || pathname.startsWith(`${href}/`);
}
