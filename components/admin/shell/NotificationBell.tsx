'use client';

import { Bell, HandCoins, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAdminData } from '@/components/admin/AdminDataProvider';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { ADMIN_BASE } from './nav';

function Dot({ read }: { read: boolean }) {
  return (
    <span
      className={`mt-2 h-2 w-2 shrink-0 rounded-full ${read ? 'bg-transparent' : 'bg-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]'}`}
    />
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Bell; title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-white/[0.06] py-1 last:border-0">
      <p className="cs-label flex items-center gap-2 px-4 py-2 !text-gold/70">
        <Icon className="h-3.5 w-3.5" /> {title}
      </p>
      {children}
    </div>
  );
}

const rowClass = 'flex w-full gap-3 px-4 py-2.5 text-left transition hover:bg-white/[0.05]';

/** Bell with an unread badge; the popover lists pending petitions, new subscribers and campaign orders. */
export function NotificationBell() {
  const { notifications: n } = useAdminData();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        className="cs-icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Notifications${n.unreadTotal ? `, ${n.unreadTotal} unread` : ''}`}
      >
        <Bell />
        {n.unreadTotal > 0 ? <span className="cs-dot">{n.unreadTotal > 99 ? '99+' : n.unreadTotal}</span> : null}
      </button>

      {open ? (
        <div className="cs-pop absolute right-0 z-50 mt-2 flex max-h-[min(70vh,480px)] w-[min(calc(100vw-2rem),380px)] flex-col overflow-hidden">
          <div className="flex shrink-0 items-start justify-between gap-2 border-b border-white/[0.07] px-4 py-3">
            <div>
              <p className="cs-tile-title">Notifications</p>
              <p className="cs-tile-sub">Petitions, subscribers and campaign orders</p>
            </div>
            {n.unreadTotal > 0 ? (
              <button type="button" onClick={n.markAllRead} className="cs-btn cs-btn-ghost cs-btn-sm">
                Mark read
              </button>
            ) : null}
          </div>

          <div className="admin-scroll min-h-0 flex-1 overflow-y-auto">
            <Section icon={User} title="Petitions">
              {n.petitionerPreviews.length === 0 ? (
                <p className="px-4 py-3 text-xs text-white/40">No pending petitions.</p>
              ) : (
                n.petitionerPreviews.map((item) => (
                  <Link
                    key={item.id}
                    href={`${ADMIN_BASE}/members?status=pending&open=${item.id}`}
                    onClick={close}
                    className={`${rowClass} ${item.read ? 'opacity-60' : ''}`}
                  >
                    <Dot read={item.read} />
                    <span className="cs-avatar-sm">{item.name.trim().charAt(0).toUpperCase() || '?'}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white/85">{item.name}</span>
                      <span className="block text-xs text-white/40">Membership petition</span>
                    </span>
                    <time className="shrink-0 pt-0.5 text-[11px] tabular-nums text-white/35">
                      {formatRelativeTime(item.submittedAt)}
                    </time>
                  </Link>
                ))
              )}
            </Section>

            <Section icon={Mail} title="Subscribers">
              {n.subscriberPreviews.length === 0 ? (
                <p className="px-4 py-3 text-xs text-white/40">No new subscribers this week.</p>
              ) : (
                n.subscriberPreviews.map((item) => (
                  <Link
                    key={item.id}
                    href={`${ADMIN_BASE}/subscribers`}
                    onClick={close}
                    className={`${rowClass} ${item.read ? 'opacity-60' : ''}`}
                  >
                    <Dot read={item.read} />
                    <span className="cs-avatar-sm">
                      <Mail className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white/85">{item.email}</span>
                      <span className="block text-xs text-white/40">Joined the newsletter</span>
                    </span>
                    <time className="shrink-0 pt-0.5 text-[11px] tabular-nums text-white/35">
                      {formatRelativeTime(item.dateSubscribed)}
                    </time>
                  </Link>
                ))
              )}
            </Section>

            <Section icon={HandCoins} title="Campaign orders">
              {n.orderPreviews.length === 0 ? (
                <p className="px-4 py-3 text-xs text-white/40">No recent campaign orders.</p>
              ) : (
                n.orderPreviews.map((item) => (
                  <Link
                    key={item.id}
                    href={`${ADMIN_BASE}/funds?tab=orders`}
                    onClick={close}
                    className={`${rowClass} ${item.read ? 'opacity-60' : ''}`}
                  >
                    <Dot read={item.read} />
                    <span className="cs-avatar-sm">
                      <HandCoins className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white/85">{item.brotherName}</span>
                      <span className="block truncate text-xs text-white/40">
                        {item.campaignName} · Qty {item.quantity} · {item.shirtSize}
                      </span>
                    </span>
                    <time className="shrink-0 pt-0.5 text-[11px] tabular-nums text-white/35">
                      {formatRelativeTime(item.createdAt)}
                    </time>
                  </Link>
                ))
              )}
            </Section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
