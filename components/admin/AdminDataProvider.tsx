'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { notificationEventTimeOrMin, useAdminNotifLastRead } from '@/lib/adminNotifLastRead';
import { useAdminToast } from '@/components/admin/ToastContext';
import type {
  AdminUserItem,
  CampaignOrderItem,
  EventItem,
  LandingData,
  NewsItem,
  OfficerItem,
  PetitionerItem,
  SubscriberItem,
} from '@/components/admin/types';

export type PetitionerStatus = 'Pending' | 'Approved' | 'Declined';
export type DeletableKind = 'event' | 'officer' | 'news';

export type PetitionerNotifPreview = { id: number; name: string; submittedAt: string; read: boolean };
export type SubscriberNotifPreview = { id: number; email: string; dateSubscribed: string; read: boolean };
export type OrderNotifPreview = {
  id: number;
  brotherName: string;
  campaignName: string;
  shirtSize: string;
  quantity: number;
  createdAt: string;
  read: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const NOTIF_PREVIEW_LIMIT = 8;

const deletePath: Record<DeletableKind, string> = {
  event: '/api/admin/events',
  officer: '/api/admin/officers',
  news: '/api/admin/news',
};

/** Parse a fetch response as JSON, throwing the API's `error` message when it is not OK. */
async function readJson(response: Response, fallback: string) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || fallback);
  return payload;
}

async function sendJson(url: string, method: 'POST' | 'PUT', body: unknown, fallback: string) {
  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson(response, fallback);
}

export async function uploadAdminFile(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch('/api/admin/upload', { method: 'POST', credentials: 'include', body });
  const data = await readJson(response, `Upload failed for ${file.name}`);
  return data.url as string;
}

function useAdminDataState(username: string) {
  const { toast } = useAdminToast();
  const { lastReadAt, markAllRead } = useAdminNotifLastRead(username);
  const [booting, setBooting] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [fundsRefreshSignal, setFundsRefreshSignal] = useState(0);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [officers, setOfficers] = useState<OfficerItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [petitioners, setPetitioners] = useState<PetitionerItem[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [orders, setOrders] = useState<CampaignOrderItem[]>([]);
  const [admins, setAdmins] = useState<AdminUserItem[]>([]);
  const [landing, setLanding] = useState<LandingData>({});

  const inFlightRef = useRef(false);
  const queuedRef = useRef(false);

  const fetchAll = useCallback(
    async (opts?: { boot?: boolean; silent?: boolean }) => {
      if (!opts?.silent) setRefreshing(true);
      try {
        const endpoints = ['landing', 'events', 'officers', 'news', 'petitioners', 'subscribers', 'accounts'];
        const [core, ord] = await Promise.all([
          Promise.all(endpoints.map((name) => fetch(`/api/admin/${name}`, { credentials: 'include' }))),
          fetch('/api/admin/funds/orders', { credentials: 'include' }),
        ]);
        const failed = core.flatMap((r, i) => (r.ok ? [] : [`${endpoints[i]} ${r.status}`]));
        if (failed.length) throw new Error(failed.join(', '));

        const [ld, ev, of, nw, pt, sb, ac] = await Promise.all(core.map((r) => r.json()));
        const ordJson = ord.ok ? await ord.json() : { orders: [] };

        setLanding(ld.landing || {});
        setEvents(ev.events || []);
        setOfficers(of.officers || []);
        setNews(nw.news || []);
        setPetitioners(pt.petitioners || []);
        setSubscribers(sb.subscribers || []);
        setAdmins(ac.admins || []);
        setOrders(ordJson.orders || []);
        setLoadError('');
      } catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : String(err);
        if (opts?.boot) setLoadError(`Could not load dashboard data: ${msg}`);
        else if (!opts?.silent) toast('error', 'Could not refresh data.');
      } finally {
        setRefreshing(false);
        setBooting(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void fetchAll({ boot: true });
  }, [fetchAll]);

  // Live updates: the server pushes an event whenever petitions, subscribers or orders change.
  useEffect(() => {
    let disposed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let source: EventSource | null = null;

    const refreshQuietly = async () => {
      if (disposed) return;
      if (inFlightRef.current) {
        queuedRef.current = true;
        return;
      }
      inFlightRef.current = true;
      try {
        await fetchAll({ silent: true });
      } finally {
        inFlightRef.current = false;
        if (queuedRef.current && !disposed) {
          queuedRef.current = false;
          void refreshQuietly();
        }
      }
    };

    const connect = () => {
      if (disposed) return;
      source = new EventSource('/api/admin/realtime');
      const onData = () => void refreshQuietly();
      source.addEventListener('petitioners', onData);
      source.addEventListener('subscribers', onData);
      source.addEventListener('orders', () => {
        setFundsRefreshSignal((value) => value + 1);
        void refreshQuietly();
      });
      source.onerror = () => {
        if (disposed) return;
        source?.close();
        source = null;
        reconnectTimer ??= setTimeout(() => {
          reconnectTimer = undefined;
          connect();
        }, 3000);
      };
    };

    connect();
    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      source?.close();
    };
  }, [fetchAll]);

  const refresh = useCallback(async () => {
    await fetchAll();
    setFundsRefreshSignal((value) => value + 1);
  }, [fetchAll]);

  const saveEvent = useCallback(
    async (form: Omit<EventItem, 'id'> & { id: number }) => {
      if (form.id) await sendJson(`/api/admin/events/${form.id}`, 'PUT', form, 'Could not update event.');
      else await sendJson('/api/admin/events', 'POST', form, 'Could not create event.');
      await fetchAll({ silent: true });
    },
    [fetchAll],
  );

  const saveOfficer = useCallback(
    async (form: OfficerItem) => {
      if (form.id) await sendJson(`/api/admin/officers/${form.id}`, 'PUT', form, 'Could not update officer.');
      else await sendJson('/api/admin/officers', 'POST', form, 'Could not add officer.');
      await fetchAll({ silent: true });
    },
    [fetchAll],
  );

  /** Returns the API payload so the caller can report whether the newsletter went out. */
  const saveNews = useCallback(
    async (form: Record<string, unknown> & { id: number }) => {
      const payload = form.id
        ? await sendJson(`/api/admin/news/${form.id}`, 'PUT', form, 'Could not update news.')
        : await sendJson('/api/admin/news', 'POST', form, 'Could not create news.');
      await fetchAll({ silent: true });
      return payload as { mailSent?: boolean; mailError?: string };
    },
    [fetchAll],
  );

  const remove = useCallback(
    async (kind: DeletableKind, id: number) => {
      const response = await fetch(`${deletePath[kind]}/${id}`, { method: 'DELETE', credentials: 'include' });
      await readJson(response, 'Could not delete.');
      await fetchAll({ silent: true });
    },
    [fetchAll],
  );

  /** Optimistically sets the status, rolls back on failure, and reports the approval email. */
  const setPetitionerStatus = useCallback(
    async (ids: number[], status: PetitionerStatus) => {
      const before = petitioners;
      setPetitioners((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, status } : p)));
      try {
        const results = await Promise.all(
          ids.map((id) => sendJson('/api/admin/petitioners', 'PUT', { id, status }, 'Could not update status.')),
        );
        await fetchAll({ silent: true });
        const mailed = results.filter((r) => r?.mailSent).length;
        const noun = ids.length === 1 ? 'petition' : `${ids.length} petitions`;
        toast(
          'success',
          status === 'Approved' && mailed
            ? `Approved ${noun} and emailed the parent consent PDF.`
            : `Marked ${noun} ${status.toLowerCase()}.`,
        );
      } catch (err) {
        setPetitioners(before);
        toast('error', err instanceof Error ? err.message : 'Could not update status.');
      }
    },
    [fetchAll, petitioners, toast],
  );

  const notifications = useMemo(() => {
    const weekAgo = Date.now() - 7 * DAY_MS;
    const byNewest = (a?: string, b?: string) =>
      (b ? new Date(b).getTime() : 0) - (a ? new Date(a).getTime() : 0);

    const pending = petitioners
      .filter((p) => p.status.toLowerCase() === 'pending')
      .sort((a, b) => byNewest(a.submitted_at, b.submitted_at) || b.id - a.id);
    const recentSubs = subscribers
      .filter((s) => notificationEventTimeOrMin(s.date_subscribed) >= weekAgo)
      .sort((a, b) => byNewest(a.date_subscribed, b.date_subscribed));
    const sortedOrders = [...orders].sort((a, b) => byNewest(a.created_at, b.created_at) || b.id - a.id);

    const petitionerPreviews: PetitionerNotifPreview[] = pending.slice(0, NOTIF_PREVIEW_LIMIT).map((p) => ({
      id: p.id,
      name: p.name,
      submittedAt: p.submitted_at ?? '',
      read: notificationEventTimeOrMin(p.submitted_at) <= lastReadAt,
    }));
    const subscriberPreviews: SubscriberNotifPreview[] = recentSubs.slice(0, NOTIF_PREVIEW_LIMIT).map((s) => ({
      id: s.id,
      email: s.email,
      dateSubscribed: s.date_subscribed,
      read: notificationEventTimeOrMin(s.date_subscribed) <= lastReadAt,
    }));
    const orderPreviews: OrderNotifPreview[] = sortedOrders.slice(0, NOTIF_PREVIEW_LIMIT).map((o) => ({
      id: o.id,
      brotherName: o.brother_name,
      campaignName: o.campaign_name || 'T-shirt campaign',
      shirtSize: o.shirt_size,
      quantity: Number(o.quantity ?? 0),
      createdAt: o.created_at,
      read: notificationEventTimeOrMin(o.created_at) <= lastReadAt,
    }));

    const unreadPetitions = pending.filter((p) => notificationEventTimeOrMin(p.submitted_at) > lastReadAt).length;
    const unreadSubscribers = recentSubs.filter((s) => notificationEventTimeOrMin(s.date_subscribed) > lastReadAt).length;
    const unreadOrders = orders.filter((o) => notificationEventTimeOrMin(o.created_at) > lastReadAt).length;

    return {
      petitionerPreviews,
      subscriberPreviews,
      orderPreviews,
      unreadPetitions,
      unreadSubscribers,
      unreadOrders,
      unreadTotal: unreadPetitions + unreadSubscribers + unreadOrders,
      markAllRead,
    };
  }, [petitioners, subscribers, orders, lastReadAt, markAllRead]);

  return {
    booting,
    loadError,
    refreshing,
    fundsRefreshSignal,
    landing,
    events,
    officers,
    news,
    petitioners,
    subscribers,
    orders,
    admins,
    notifications,
    fetchAll,
    refresh,
    saveEvent,
    saveOfficer,
    saveNews,
    remove,
    setPetitionerStatus,
  };
}

export type AdminData = ReturnType<typeof useAdminDataState> & { username: string; currentAdminId: number };

const AdminDataContext = createContext<AdminData | null>(null);

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider');
  return ctx;
}

export function AdminDataProvider({
  username,
  currentAdminId,
  children,
}: {
  username: string;
  currentAdminId: number;
  children: React.ReactNode;
}) {
  const state = useAdminDataState(username);
  return (
    <AdminDataContext.Provider value={{ ...state, username, currentAdminId }}>{children}</AdminDataContext.Provider>
  );
}
