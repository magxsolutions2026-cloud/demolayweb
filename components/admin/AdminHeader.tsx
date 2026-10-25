'use client';

import { Bell, ChevronDown, HandCoins, LogOut, Mail, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { AdminBrandMark } from '@/components/admin/AdminBrandMark';
import { AdminSidebarMobileTrigger } from './AdminSidebar';

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

export function AdminHeader({
  title,
  username,
  logoUrl,
  chapterName,
  onMenuClick,
  notificationBadgeTotal,
  petitionerPreviews,
  subscriberPreviews,
  tshirtOrderPreviews,
  onMarkAllRead,
  onGoToPetitioners,
  onGoToSubscribers,
  onGoToTshirtOrders,
}: {
  title: string;
  username: string;
  /** Used for logo `alt` text only */
  chapterName?: string | null;
  logoUrl?: string | null;
  onMenuClick: () => void;
  notificationBadgeTotal: number;
  petitionerPreviews: PetitionerNotifPreview[];
  subscriberPreviews: SubscriberNotifPreview[];
  tshirtOrderPreviews: TShirtOrderNotifPreview[];
  onMarkAllRead: () => void;
  onGoToPetitioners: () => void;
  onGoToSubscribers: () => void;
  onGoToTshirtOrders: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const initial = username.trim().charAt(0).toUpperCase() || 'A';

  return (
    <header className="admin-header sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-gold/15 px-4 py-3 backdrop-blur-xl md:px-6 md:py-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <AdminSidebarMobileTrigger onClick={onMenuClick} />
        <AdminBrandMark logoUrl={logoUrl} alt={chapterName || 'Chapter'} size="md" />
        <div className="min-w-0">
          <p className="text-gold/90 text-[10px] font-semibold uppercase tracking-[0.2em] md:text-xs">
            Welcome, Sir Knight
          </p>
          <h1 className="sr-only">{title}</h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2" ref={ref}>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((n) => !n);
              setOpen(false);
            }}
            className="border-gold/20 hover:border-gold/45 text-foreground/85 hover:text-gold relative rounded-xl border bg-black/20 p-2 transition duration-200 hover:bg-white/5"
            aria-expanded={notifOpen}
            aria-haspopup="true"
            aria-label={`Notifications${notificationBadgeTotal ? `, ${notificationBadgeTotal} items` : ''}`}
          >
            <Bell className="h-5 w-5" aria-hidden />
            {notificationBadgeTotal > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-maroon px-1 text-[10px] font-bold text-white shadow-sm">
                {notificationBadgeTotal > 99 ? '99+' : notificationBadgeTotal}
              </span>
            ) : null}
          </button>
          {notifOpen ? (
            <div className="border-gold/25 absolute right-0 z-50 mt-2 flex max-h-[min(70vh,480px)] w-[min(calc(100vw-2rem),380px)] flex-col overflow-hidden rounded-xl border bg-[#141118]/98 shadow-2xl backdrop-blur-lg">
              <div className="border-gold/15 shrink-0 border-b px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-foreground text-sm font-semibold">Notifications</p>
                    <p className="text-foreground/50 text-[11px]">Recent petitioners, subscribers, and T-shirt orders</p>
                  </div>
                  {notificationBadgeTotal > 0 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAllRead();
                      }}
                      className="text-gold/90 hover:text-gold shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold transition hover:bg-white/5"
                    >
                      Mark all as read
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <div className="border-gold/10 border-b py-1">
                  <div className="text-gold/75 flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
                    <User className="h-3.5 w-3.5" aria-hidden />
                    Petitioners
                  </div>
                  {petitionerPreviews.length === 0 ? (
                    <p className="text-foreground/45 px-3 py-3 text-xs">No pending petitions.</p>
                  ) : (
                    petitionerPreviews.map((p) => (
                      <button
                        key={`p-${p.id}`}
                        type="button"
                        onClick={() => {
                          onGoToPetitioners();
                          setNotifOpen(false);
                        }}
                        className={`hover:bg-white/6 flex w-full gap-2 px-3 py-2.5 text-left transition ${p.read ? 'opacity-[0.72]' : ''}`}
                      >
                        <span
                          className={`mt-2.5 h-2 w-2 shrink-0 rounded-full ${p.read ? 'bg-transparent' : 'bg-gold shadow-[0_0_8px_rgba(234,179,8,0.45)]'}`}
                          aria-hidden
                        />
                        <span className="from-gold/35 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-maroon/30 text-sm font-bold text-gold">
                          {p.name.trim().charAt(0).toUpperCase() || '?'}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-foreground block truncate text-sm font-semibold">{p.name}</span>
                          <span className="text-foreground/55 block text-xs">Submitted a membership petition</span>
                        </span>
                        <time
                          className="text-foreground/45 shrink-0 self-start pt-0.5 text-[11px] tabular-nums"
                          dateTime={p.submittedAt}
                        >
                          {formatRelativeTime(p.submittedAt)}
                        </time>
                      </button>
                    ))
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onGoToPetitioners();
                      setNotifOpen(false);
                    }}
                    className="text-gold/90 hover:text-gold w-full px-3 py-2 text-center text-xs font-semibold transition hover:bg-white/5"
                  >
                    See all petitioners
                  </button>
                </div>

                <div className="py-1">
                  <div className="text-gold/75 flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                    Subscribers
                  </div>
                  {subscriberPreviews.length === 0 ? (
                    <p className="text-foreground/45 px-3 py-3 text-xs">No new subscribers in the last 7 days.</p>
                  ) : (
                    subscriberPreviews.map((s) => (
                      <button
                        key={`s-${s.id}`}
                        type="button"
                        onClick={() => {
                          onGoToSubscribers();
                          setNotifOpen(false);
                        }}
                        className={`hover:bg-white/6 flex w-full gap-2 px-3 py-2.5 text-left transition ${s.read ? 'opacity-[0.72]' : ''}`}
                      >
                        <span
                          className={`mt-2.5 h-2 w-2 shrink-0 rounded-full ${s.read ? 'bg-transparent' : 'bg-gold shadow-[0_0_8px_rgba(234,179,8,0.45)]'}`}
                          aria-hidden
                        />
                        <span className="border-gold/25 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-black/30">
                          <Mail className="text-gold/80 h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-foreground block truncate text-sm font-semibold">{s.email}</span>
                          <span className="text-foreground/55 block text-xs">Subscribed to the newsletter</span>
                        </span>
                        <time
                          className="text-foreground/45 shrink-0 self-start pt-0.5 text-[11px] tabular-nums"
                          dateTime={s.dateSubscribed}
                        >
                          {formatRelativeTime(s.dateSubscribed)}
                        </time>
                      </button>
                    ))
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onGoToSubscribers();
                      setNotifOpen(false);
                    }}
                    className="text-gold/90 hover:text-gold w-full px-3 py-2 text-center text-xs font-semibold transition hover:bg-white/5"
                  >
                    See all subscribers
                  </button>
                </div>

                <div className="border-gold/10 border-t py-1">
                  <div className="text-gold/75 flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
                    <HandCoins className="h-3.5 w-3.5" aria-hidden />
                    T-shirt orders
                  </div>
                  {tshirtOrderPreviews.length === 0 ? (
                    <p className="text-foreground/45 px-3 py-3 text-xs">No recent T-shirt orders.</p>
                  ) : (
                    tshirtOrderPreviews.map((order) => (
                      <button
                        key={`o-${order.id}`}
                        type="button"
                        onClick={() => {
                          onGoToTshirtOrders();
                          setNotifOpen(false);
                        }}
                        className={`hover:bg-white/6 flex w-full gap-2 px-3 py-2.5 text-left transition ${order.read ? 'opacity-[0.72]' : ''}`}
                      >
                        <span
                          className={`mt-2.5 h-2 w-2 shrink-0 rounded-full ${order.read ? 'bg-transparent' : 'bg-gold shadow-[0_0_8px_rgba(234,179,8,0.45)]'}`}
                          aria-hidden
                        />
                        <span className="border-gold/25 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-black/30">
                          <HandCoins className="text-gold/80 h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-foreground block truncate text-sm font-semibold">{order.brotherName}</span>
                          <span className="text-foreground/55 block truncate text-xs">
                            {order.campaignName} · Qty {order.quantity} · {order.shirtSize}
                          </span>
                        </span>
                        <time
                          className="text-foreground/45 shrink-0 self-start pt-0.5 text-[11px] tabular-nums"
                          dateTime={order.createdAt}
                        >
                          {formatRelativeTime(order.createdAt)}
                        </time>
                      </button>
                    ))
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onGoToTshirtOrders();
                      setNotifOpen(false);
                    }}
                    className="text-gold/90 hover:text-gold w-full px-3 py-2 text-center text-xs font-semibold transition hover:bg-white/5"
                  >
                    See all T-shirt orders
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setOpen((o) => !o);
              setNotifOpen(false);
            }}
            className="border-gold/20 hover:border-gold/40 flex items-center gap-2 rounded-xl border bg-black/20 py-1.5 pl-1.5 pr-2 transition duration-200 hover:bg-white/5"
            aria-expanded={open}
            aria-haspopup="true"
          >
            <span className="from-gold/25 flex h-8 w-8 items-center justify-center rounded-lg border border-gold/30 bg-gradient-to-br to-maroon/40 text-sm font-bold text-gold">
              {initial}
            </span>
            <span className="text-foreground/85 hidden max-w-[120px] truncate text-sm font-medium sm:inline">{username}</span>
            <ChevronDown className={`text-foreground/50 h-4 w-4 transition ${open ? 'rotate-180' : ''}`} aria-hidden />
          </button>
          {open ? (
            <div className="border-gold/25 absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border bg-[#141118]/96 py-1 shadow-2xl backdrop-blur-lg">
              <div className="text-foreground/60 flex items-center gap-2 px-3 py-2 text-xs">
                <User className="h-3.5 w-3.5" aria-hidden />
                <span className="truncate">{username}</span>
              </div>
              <form action="/api/admin/logout" method="POST" className="border-white/10 border-t">
                <button
                  type="submit"
                  className="text-foreground/70 hover:text-gold flex w-full items-center gap-2 px-3 py-2.5 text-sm transition hover:bg-white/5"
                >
                  <LogOut className="h-4 w-4 opacity-70" aria-hidden />
                  Log out
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
