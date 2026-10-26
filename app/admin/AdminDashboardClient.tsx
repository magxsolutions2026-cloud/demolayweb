'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, Pencil, Trash2, XCircle } from 'lucide-react';
import { notificationEventTimeOrMin, useAdminNotifLastRead } from '@/lib/adminNotifLastRead';
import { formatSqlDate } from '@/lib/formatDb';
import { cleanNewsImageUrls, MAX_NEWS_IMAGES } from '@/lib/newsImages';
import { officerPhotoBackgroundStyle } from '@/lib/officerPhoto';
import { AdminAccountsWorkspace } from '@/components/admin/AdminAccountsWorkspace';
import { AdminActionBar } from '@/components/admin/AdminActionBar';
import { AdminBadge } from '@/components/admin/AdminBadge';
import { AdminGhostButton, AdminPrimaryButton } from '@/components/admin/AdminButtons';
import { DashboardModal } from '@/components/admin/DashboardModal';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminField, adminInputClass } from '@/components/admin/AdminFormFields';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminIconButton } from '@/components/admin/AdminIconButton';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminSkeleton, TableRowSkeleton } from '@/components/admin/AdminSkeleton';
import { FundsWorkspace, type FundsTabId } from '@/components/admin/funds/FundsWorkspace';
import { AdminStatsCards } from '@/components/admin/AdminStatsCards';
import { ToastProvider, useAdminToast } from '@/components/admin/ToastContext';
import type {
  CampaignOrderItem,
  EventCategory,
  EventItem,
  AdminUserItem,
  LandingData,
  LandingSection,
  NavSection,
  NewsItem,
  OfficerItem,
  PetitionerItem,
  SubscriberItem,
} from '@/components/admin/types';

const sections: NavSection[] = [
  { id: 'funds', label: 'Chapter Funds' },
  { id: 'events', label: 'Events' },
  { id: 'news', label: 'News' },
  {
    id: 'chapterMembers',
    label: 'Chapter Members',
    children: [
      { id: 'officers', label: 'Officers' },
      { id: 'sirKnights', label: 'Sir Knights' },
      { id: 'petitioners', label: 'Petitioners' },
    ],
  },
  { id: 'subscribers', label: 'Subscribers' },
  { id: 'accounts', label: 'Account Management' },
];

const moduleTitle: Record<LandingSection, string> = {
  funds: 'Chapter Funds',
  events: 'Events',
  officers: 'Officers',
  news: 'News',
  sirKnights: 'Sir Knights',
  petitioners: 'Petitioners',
  subscribers: 'Subscribers',
  accounts: 'Account Management',
};

const emptyOfficerForm = () => ({
  id: 0,
  name: '',
  position: '',
  photo_url: '',
  photo_pos_x: 50,
  photo_pos_y: 45,
  photo_zoom: 100,
});

const emptyEventForm = () => ({
  id: 0,
  title: '',
  event_date: '',
  event_time: '',
  location: '',
  description: '',
  category: 'activity' as EventCategory,
});

const emptyNewsForm = () => ({
  id: 0,
  title: '',
  slug: '',
  summary: '',
  content: '',
  image_urls: [] as string[],
  is_published: true,
  published_at: '',
});

type PendingDelete =
  | { kind: 'event'; id: number; title: string }
  | { kind: 'officer'; id: number; title: string }
  | { kind: 'news'; id: number; title: string }
  | null;

type RowItem = EventItem | OfficerItem | NewsItem | PetitionerItem | SubscriberItem;

function DashboardInner({
  username,
  currentAdminId,
}: {
  username: string;
  currentAdminId: number;
}) {
  const { toast } = useAdminToast();
  const { lastReadAt, markAllRead } = useAdminNotifLastRead(username);
  const [active, setActive] = useState<LandingSection>('funds');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [listLoading, setListLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPetitioners, setSelectedPetitioners] = useState<number[]>([]);
  const [officerUploading, setOfficerUploading] = useState(false);
  const [officerUploadPreview, setOfficerUploadPreview] = useState('');
  const [newsUploadingCurrent, setNewsUploadingCurrent] = useState(0);
  const [newsUploadingTotal, setNewsUploadingTotal] = useState(0);
  const [fundsTab, setFundsTab] = useState<FundsTabId>('dashboard');
  const [fundsRefreshSignal, setFundsRefreshSignal] = useState(0);
  const pageSize = 8;

  const [events, setEvents] = useState<EventItem[]>([]);
  const [officers, setOfficers] = useState<OfficerItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [petitioners, setPetitioners] = useState<PetitionerItem[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [campaignOrders, setCampaignOrders] = useState<CampaignOrderItem[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>([]);
  const [landing, setLanding] = useState<LandingData>({});

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [officerModalOpen, setOfficerModalOpen] = useState(false);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [eventFieldErr, setEventFieldErr] = useState<Record<string, string>>({});
  const [officerForm, setOfficerForm] = useState(emptyOfficerForm);
  const [newsForm, setNewsForm] = useState(emptyNewsForm);

  const [modalSaving, setModalSaving] = useState(false);
  const realtimeFetchInFlightRef = useRef(false);
  const realtimeFetchQueuedRef = useRef(false);

  const fetchAll = useCallback(
    async (opts?: { boot?: boolean }) => {
      const isBoot = opts?.boot === true;
      setListLoading(true);
      try {
        const [l, e, o, n, p, s, a, ord] = await Promise.all([
          fetch('/api/admin/landing', { credentials: 'include' }),
          fetch('/api/admin/events', { credentials: 'include' }),
          fetch('/api/admin/officers', { credentials: 'include' }),
          fetch('/api/admin/news', { credentials: 'include' }),
          fetch('/api/admin/petitioners', { credentials: 'include' }),
          fetch('/api/admin/subscribers', { credentials: 'include' }),
          fetch('/api/admin/accounts', { credentials: 'include' }),
          fetch('/api/admin/funds/orders', { credentials: 'include' }),
        ]);

        if (!l.ok || !e.ok || !o.ok || !n.ok || !p.ok || !s.ok || !a.ok) {
          const failed: string[] = [];
          if (!l.ok) failed.push(`landing ${l.status}`);
          if (!e.ok) failed.push(`events ${e.status}`);
          if (!o.ok) failed.push(`officers ${o.status}`);
          if (!n.ok) failed.push(`news ${n.status}`);
          if (!p.ok) failed.push(`petitioners ${p.status}`);
          if (!s.ok) failed.push(`subscribers ${s.status}`);
          if (!a.ok) failed.push(`accounts ${a.status}`);
          throw new Error(failed.join(', '));
        }

        const ld = await l.json();
        const ev = await e.json();
        const of = await o.json();
        const nw = await n.json();
        const pt = await p.json();
        const sb = await s.json();
        const ac = await a.json();
        const ordJson = ord.ok ? await ord.json() : { orders: [] };

        setLanding(ld.landing || {});
        setEvents(ev.events || []);
        setOfficers(of.officers || []);
        setNews(nw.news || []);
        setPetitioners(pt.petitioners || []);
        setSubscribers(sb.subscribers || []);
        setCampaignOrders(ord.ok ? ordJson.orders || [] : []);
        setAdminUsers(ac.admins || []);
        setLoadError('');
      } catch (err: unknown) {
        console.error(err);
        const msg = err instanceof Error ? err.message : String(err);
        if (isBoot) {
          setLoadError(`Could not load dashboard data: ${msg}`);
        } else {
          toast('error', 'Could not refresh data.');
        }
      } finally {
        setListLoading(false);
        setInitialLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void fetchAll({ boot: true });
  }, [fetchAll]);

  useEffect(() => {
    let disposed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let eventSource: EventSource | null = null;

    const runRealtimeRefresh = async () => {
      if (disposed) return;
      if (realtimeFetchInFlightRef.current) {
        realtimeFetchQueuedRef.current = true;
        return;
      }

      realtimeFetchInFlightRef.current = true;
      try {
        await fetchAll();
      } finally {
        realtimeFetchInFlightRef.current = false;
        if (realtimeFetchQueuedRef.current && !disposed) {
          realtimeFetchQueuedRef.current = false;
          void runRealtimeRefresh();
        }
      }
    };

    const connect = () => {
      if (disposed) return;

      eventSource = new EventSource('/api/admin/realtime');

      const handleRealtimeEvent = () => {
        void runRealtimeRefresh();
      };
      const handleOrderEvent = () => {
        setFundsRefreshSignal((value) => value + 1);
        void runRealtimeRefresh();
      };

      eventSource.addEventListener('ready', handleRealtimeEvent);
      eventSource.addEventListener('petitioners', handleRealtimeEvent);
      eventSource.addEventListener('subscribers', handleRealtimeEvent);
      eventSource.addEventListener('orders', handleOrderEvent);
      eventSource.onerror = () => {
        if (disposed) return;
        eventSource?.close();
        eventSource = null;
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = undefined;
            connect();
          }, 3000);
        }
      };
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (eventSource) eventSource.close();
    };
  }, [fetchAll]);

  useEffect(() => {
    setPage(1);
  }, [active, search]);

  useEffect(() => {
    return () => {
      if (officerUploadPreview.startsWith('blob:')) {
        URL.revokeObjectURL(officerUploadPreview);
      }
    };
  }, [officerUploadPreview]);

  const revokeOfficerBlob = () => {
    setOfficerUploadPreview((prev) => {
      if (prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return '';
    });
  };

  const handleOfficerPhotoUpload = async (file: File) => {
    revokeOfficerBlob();
    const previewUrl = URL.createObjectURL(file);
    setOfficerUploadPreview(previewUrl);
    setOfficerUploading(true);

    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setOfficerForm((prev) => ({
        ...prev,
        photo_url: data.url as string,
        photo_pos_x: 50,
        photo_pos_y: 45,
        photo_zoom: 100,
      }));
      setOfficerUploadPreview((prev) => {
        if (prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        return '';
      });
      toast('success', 'Photo uploaded.');
    } catch (err) {
      toast('error', `Upload failed: ${err instanceof Error ? err.message : String(err)}`);
      revokeOfficerBlob();
    } finally {
      setOfficerUploading(false);
    }
  };

  const resetNewsUploadProgress = () => {
    setNewsUploadingCurrent(0);
    setNewsUploadingTotal(0);
  };

  const handleNewsImagesUpload = async (files: FileList | null) => {
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length === 0) return;

    const remainingSlots = Math.max(0, MAX_NEWS_IMAGES - newsForm.image_urls.length);
    if (remainingSlots === 0) {
      toast('error', `You can upload up to ${MAX_NEWS_IMAGES} photos per news post.`);
      return;
    }

    const uploadQueue = selectedFiles.slice(0, remainingSlots);
    if (uploadQueue.length < selectedFiles.length) {
      toast('error', `Only ${remainingSlots} photo${remainingSlots === 1 ? '' : 's'} can still be added to this post.`);
    }

    setNewsUploadingCurrent(0);
    setNewsUploadingTotal(uploadQueue.length);

    let uploadedCount = 0;
    try {
      for (let index = 0; index < uploadQueue.length; index += 1) {
        const file = uploadQueue[index];
        setNewsUploadingCurrent(index + 1);

        const body = new FormData();
        body.append('file', file);

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          credentials: 'include',
          body,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Upload failed for ${file.name}`);
        }

        uploadedCount += 1;
        setNewsForm((prev) => ({
          ...prev,
          image_urls: cleanNewsImageUrls([...prev.image_urls, data.url]),
        }));
      }

      toast('success', uploadedCount === 1 ? 'Photo uploaded.' : `${uploadedCount} photos uploaded.`);
    } catch (err) {
      toast('error', `Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      resetNewsUploadProgress();
    }
  };

  const removeNewsImage = (url: string) => {
    setNewsForm((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((entry) => entry !== url),
    }));
  };

  const makeNewsImageCover = (url: string) => {
    setNewsForm((prev) => ({
      ...prev,
      image_urls: [url, ...prev.image_urls.filter((entry) => entry !== url)],
    }));
  };

  const normalize = (value: unknown) => String(value || '').toLowerCase();
  const paginate = <T,>(rows: T[]) => rows.slice((page - 1) * pageSize, page * pageSize);
  const filterRows = <T,>(rows: T[], fields: Array<keyof T>) => {
    if (!search.trim()) return rows;
    return rows.filter((row) =>
      fields.some((f) => normalize(row[f]).includes(search.toLowerCase())),
    );
  };
  const totalPages = (totalItems: number) => Math.max(1, Math.ceil(totalItems / pageSize));

  const sirKnights = useMemo(
    () => petitioners.filter((petitioner) => petitioner.status.toLowerCase() === 'approved'),
    [petitioners],
  );
  const chapterPetitioners = useMemo(
    () => petitioners.filter((petitioner) => petitioner.status.toLowerCase() !== 'approved'),
    [petitioners],
  );

  const statCards = [
    { label: 'Events', value: events.length },
    { label: 'Officers', value: officers.length },
    { label: 'News', value: news.length },
    { label: 'Sir Knights', value: sirKnights.length },
    { label: 'Petitioners', value: chapterPetitioners.length },
    { label: 'Subscribers', value: subscribers.length },
  ];

  const notifUnreadPetitionersCount = useMemo(() => {
    return petitioners.filter((p) => {
      if (p.status.toLowerCase() !== 'pending') return false;
      return notificationEventTimeOrMin(p.submitted_at) > lastReadAt;
    }).length;
  }, [petitioners, lastReadAt]);

  const notifUnreadSubscribersCount = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return subscribers.filter((s) => {
      const t = notificationEventTimeOrMin(s.date_subscribed);
      if (t < weekAgo) return false;
      return t > lastReadAt;
    }).length;
  }, [subscribers, lastReadAt]);

  const notifUnreadOrdersCount = useMemo(() => {
    return campaignOrders.filter((order) => notificationEventTimeOrMin(order.created_at) > lastReadAt).length;
  }, [campaignOrders, lastReadAt]);

  const NOTIF_PREVIEW_LIMIT = 8;

  const petitionerPreviews = useMemo(() => {
    const pending = petitioners.filter((p) => p.status.toLowerCase() === 'pending');
    const sorted = [...pending].sort((a, b) => {
      const ta = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
      const tb = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
      if (tb !== ta) return tb - ta;
      return b.id - a.id;
    });
    return sorted.slice(0, NOTIF_PREVIEW_LIMIT).map((p) => {
      const t = notificationEventTimeOrMin(p.submitted_at);
      return {
        id: p.id,
        name: p.name,
        submittedAt: p.submitted_at ?? '',
        read: t <= lastReadAt,
      };
    });
  }, [petitioners, lastReadAt]);

  const subscriberPreviews = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = subscribers.filter((s) => {
      const t = notificationEventTimeOrMin(s.date_subscribed);
      return t >= weekAgo;
    });
    const sorted = [...recent].sort((a, b) => {
      const ta = new Date(a.date_subscribed).getTime();
      const tb = new Date(b.date_subscribed).getTime();
      return tb - ta;
    });
    return sorted.slice(0, NOTIF_PREVIEW_LIMIT).map((s) => {
      const t = notificationEventTimeOrMin(s.date_subscribed);
      return {
        id: s.id,
        email: s.email,
        dateSubscribed: s.date_subscribed,
        read: t <= lastReadAt,
      };
    });
  }, [subscribers, lastReadAt]);

  const tshirtOrderPreviews = useMemo(() => {
    const sorted = [...campaignOrders].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (tb !== ta) return tb - ta;
      return b.id - a.id;
    });
    return sorted.slice(0, NOTIF_PREVIEW_LIMIT).map((order) => {
      const t = notificationEventTimeOrMin(order.created_at);
      return {
        id: order.id,
        brotherName: order.brother_name,
        campaignName: order.campaign_name || 'T-shirt campaign',
        shirtSize: order.shirt_size,
        quantity: Number(order.quantity ?? 0),
        createdAt: order.created_at,
        read: t <= lastReadAt,
      };
    });
  }, [campaignOrders, lastReadAt]);

  const activeRows: RowItem[] = (() => {
    if (active === 'events') return filterRows(events, ['title', 'location', 'description', 'category']);
    if (active === 'officers') return filterRows(officers, ['name', 'position']);
    if (active === 'news') return filterRows(news, ['title', 'slug', 'summary']);
    if (active === 'sirKnights') return filterRows(sirKnights, ['name', 'email', 'school', 'status']);
    if (active === 'petitioners') return filterRows(chapterPetitioners, ['name', 'email', 'school', 'status']);
    if (active === 'subscribers') return filterRows(subscribers, ['email']);
    return [];
  })();

  const pagedRows = paginate(activeRows);

  const openEventCreate = () => {
    setEventForm(emptyEventForm());
    setEventFieldErr({});
    setEventModalOpen(true);
  };

  const openEventEdit = (event: EventItem) => {
    setEventForm({
      ...event,
      event_date: formatSqlDate(event.event_date),
      category: (event.category as EventCategory) || 'activity',
    });
    setEventFieldErr({});
    setEventModalOpen(true);
  };

  const openOfficerCreate = () => {
    revokeOfficerBlob();
    setOfficerForm(emptyOfficerForm());
    setOfficerModalOpen(true);
  };

  const openOfficerEdit = (officer: OfficerItem) => {
    revokeOfficerBlob();
    setOfficerForm({
      ...officer,
      photo_url: officer.photo_url || '',
      photo_pos_x: Number(officer.photo_pos_x ?? 50),
      photo_pos_y: Number(officer.photo_pos_y ?? 45),
      photo_zoom: Number(officer.photo_zoom ?? 100),
    });
    setOfficerModalOpen(true);
  };

  const openNewsCreate = () => {
    resetNewsUploadProgress();
    setNewsForm(emptyNewsForm());
    setNewsModalOpen(true);
  };

  const openNewsEdit = (item: NewsItem) => {
    resetNewsUploadProgress();
    setNewsForm({
      ...item,
      summary: item.summary || '',
      content: item.content || '',
      image_urls: item.image_urls || [],
      published_at: item.published_at ? item.published_at.slice(0, 16) : '',
      is_published: !!item.is_published,
    });
    setNewsModalOpen(true);
  };

  const validateEvent = () => {
    const err: Record<string, string> = {};
    if (!eventForm.title.trim()) err.title = 'Required';
    if (!eventForm.event_date) err.event_date = 'Required';
    if (!eventForm.event_time.trim()) err.event_time = 'Required';
    if (!eventForm.location.trim()) err.location = 'Required';
    setEventFieldErr(err);
    return Object.keys(err).length === 0;
  };

  const submitEvent = async () => {
    if (!validateEvent()) return;
    const wasEdit = !!eventForm.id;
    setModalSaving(true);
    try {
      if (eventForm.id) {
        const r = await fetch(`/api/admin/events/${eventForm.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventForm),
        });
        if (!r.ok) throw new Error('Update failed');
      } else {
        const r = await fetch('/api/admin/events', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventForm),
        });
        if (!r.ok) throw new Error('Create failed');
      }
      setEventModalOpen(false);
      setEventForm(emptyEventForm());
      await fetchAll();
      toast('success', wasEdit ? 'Event updated.' : 'Event created.');
    } catch {
      toast('error', 'Could not save event.');
    } finally {
      setModalSaving(false);
    }
  };

  const submitOfficer = async () => {
    const wasEdit = !!officerForm.id;
    setModalSaving(true);
    try {
      if (officerForm.id) {
        const r = await fetch(`/api/admin/officers/${officerForm.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(officerForm),
        });
        if (!r.ok) throw new Error('Update failed');
      } else {
        const r = await fetch('/api/admin/officers', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(officerForm),
        });
        if (!r.ok) throw new Error('Create failed');
      }
      revokeOfficerBlob();
      setOfficerModalOpen(false);
      setOfficerForm(emptyOfficerForm());
      await fetchAll();
      toast('success', wasEdit ? 'Officer updated.' : 'Officer added.');
    } catch {
      toast('error', 'Could not save officer.');
    } finally {
      setModalSaving(false);
    }
  };

  const submitNews = async () => {
    if (newsUploadingTotal > 0) return;
    const wasEdit = !!newsForm.id;
    setModalSaving(true);
    try {
      const endpoint = newsForm.id ? `/api/admin/news/${newsForm.id}` : '/api/admin/news';
      const method = newsForm.id ? 'PUT' : 'POST';
      const r = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsForm),
      });
      const payload = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(payload?.error || 'Save failed');
      setNewsModalOpen(false);
      setNewsForm(emptyNewsForm());
      resetNewsUploadProgress();
      await fetchAll();
      toast('success', wasEdit ? 'News updated.' : 'News created.');
      if (payload?.mailError) {
        toast('error', payload.mailError);
      } else if (payload?.mailSent) {
        toast('success', 'Newsletter sent to subscribers.');
      }
    } catch {
      toast('error', 'Could not save news.');
    } finally {
      setModalSaving(false);
    }
  };

  const runDelete = async () => {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    try {
      let path = '';
      if (pendingDelete.kind === 'event') path = `/api/admin/events/${pendingDelete.id}`;
      if (pendingDelete.kind === 'officer') path = `/api/admin/officers/${pendingDelete.id}`;
      if (pendingDelete.kind === 'news') path = `/api/admin/news/${pendingDelete.id}`;
      const response = await fetch(path, { method: 'DELETE', credentials: 'include' });
      if (!response.ok) throw new Error('Delete failed');
      setPendingDelete(null);
      await fetchAll();
      toast('success', 'Deleted.');
    } catch {
      toast('error', 'Could not delete.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPetitioners.length === 0) return;
    setModalSaving(true);
    try {
      const promises = selectedPetitioners.map(id =>
        fetch('/api/admin/petitioners', {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: 'Approved' }),
        })
      );
      const results = await Promise.all(promises);
      if (results.some(r => !r.ok)) {
        throw new Error('Some requests failed');
      }
      setSelectedPetitioners([]);
      await fetchAll();
      toast('success', `Successfully approved ${selectedPetitioners.length} petitioners.`);
    } catch (err) {
      toast('error', 'Could not approve all selected petitioners.');
    } finally {
      setModalSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPetitioners.length === 0) return;
    setDeleteLoading(true);
    try {
      const promises = selectedPetitioners.map(id =>
        fetch(`/api/admin/petitioners/${id}`, { method: 'DELETE', credentials: 'include' })
      );
      const results = await Promise.all(promises);
      if (results.some(r => !r.ok)) {
        throw new Error('Some deletions failed');
      }
      setSelectedPetitioners([]);
      await fetchAll();
      toast('success', 'Deleted selected petitioners.');
    } catch (err) {
      toast('error', 'Could not delete selected items.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const togglePetitionerSelection = (id: number) => {
    setSelectedPetitioners(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllPetitioners = () => {
    if (selectedPetitioners.length === chapterPetitioners.length) {
      setSelectedPetitioners([]);
    } else {
      setSelectedPetitioners(chapterPetitioners.map(p => p.id));
    }
  };

  const actionBarConfig = () => {
    if (active === 'funds') {
      return { showSearch: false, showAction: false };
    }
    if (active === 'events') {
      return {
        showSearch: true,
        showAction: true,
        actionLabel: 'Add event',
        onAction: openEventCreate,
        searchPlaceholder: 'Search events…',
      };
    }
    if (active === 'officers') {
      return {
        showSearch: true,
        showAction: true,
        actionLabel: 'Add officer',
        onAction: openOfficerCreate,
        searchPlaceholder: 'Search officers…',
      };
    }
    if (active === 'news') {
      return {
        showSearch: true,
        showAction: true,
        actionLabel: 'Add news',
        onAction: openNewsCreate,
        searchPlaceholder: 'Search news…',
      };
    }
    if (active === 'sirKnights') {
      return {
        showSearch: true,
        showAction: false,
        searchPlaceholder: 'Search Sir Knights…',
      };
    }
    if (active === 'petitioners') {
      return {
        showSearch: true,
        showAction: false,
        searchPlaceholder: 'Search petitioners…',
      };
    }
    if (active === 'subscribers') {
      return {
        showSearch: true,
        showAction: false,
        searchPlaceholder: 'Search subscribers…',
      };
    }
    return { showSearch: true, showAction: false };
  };

  const ac = actionBarConfig();
  const showPagination = active !== 'funds' && activeRows.length > 0;
  const rangeStart = activeRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, activeRows.length);

  if (initialLoading) {
    return (
      <div className="admin-dashboard-bg flex h-[100dvh] flex-col overflow-hidden">
        <div className="admin-header h-14 shrink-0 animate-pulse md:h-16" />
        <AdminSkeleton />
      </div>
    );
  }

  if (loadError && events.length === 0 && officers.length === 0) {
    return (
      <div className="admin-dashboard-bg flex min-h-[100dvh] flex-col items-center justify-center p-6">
        <AdminEmptyState title="Could not load dashboard" description={loadError} />
        <AdminPrimaryButton className="mt-6" onClick={() => void fetchAll({ boot: true })}>
          Retry
        </AdminPrimaryButton>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-bg flex h-[100dvh] overflow-hidden text-foreground">
      <AdminSidebar
        sections={sections}
        active={active}
        onSelect={setActive}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((s) => !s)}
        mobileOpen={mobileSidebar}
        onMobileOpenChange={setMobileSidebar}
        chapterName={landing.hero?.title || null}
        logoUrl={landing.hero?.logo_url || null}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:pl-0">
        <AdminHeader
          title={moduleTitle[active]}
          username={username}
          chapterName={landing.hero?.title || null}
          logoUrl={landing.hero?.logo_url || null}
          onMenuClick={() => setMobileSidebar(true)}
          notificationBadgeTotal={notifUnreadPetitionersCount + notifUnreadSubscribersCount + notifUnreadOrdersCount}
          petitionerPreviews={petitionerPreviews}
          subscriberPreviews={subscriberPreviews}
          tshirtOrderPreviews={tshirtOrderPreviews}
          onMarkAllRead={markAllRead}
          onGoToPetitioners={() => {
            setActive('petitioners');
            setMobileSidebar(false);
          }}
          onGoToSubscribers={() => {
            setActive('subscribers');
            setMobileSidebar(false);
          }}
          onGoToTshirtOrders={() => {
            setFundsTab('orders');
            setFundsRefreshSignal((value) => value + 1);
            setActive('funds');
            setMobileSidebar(false);
          }}
        />

        <div className="flex-1 overflow-y-auto">
          <div
            className={`mx-auto space-y-6 px-4 py-5 md:space-y-8 md:px-6 md:py-6 ${active === 'funds' ? 'max-w-7xl' : 'max-w-6xl'}`}
          >
            {active === 'funds' ? (
              <FundsWorkspace
                toast={toast}
                chapterName={landing.hero?.title || null}
                logoUrl={landing.hero?.logo_url || null}
                activeTab={fundsTab}
                onTabChange={setFundsTab}
                refreshSignal={fundsRefreshSignal}
              />
            ) : active === 'accounts' ? (
              <AdminAccountsWorkspace
                admins={adminUsers}
                currentAdminId={currentAdminId}
                onRefresh={fetchAll}
                loading={listLoading}
              />
            ) : (
              <>
                <AdminStatsCards items={statCards} />

                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <AdminActionBar
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder={'searchPlaceholder' in ac ? ac.searchPlaceholder : 'Search…'}
                    showSearch={'showSearch' in ac ? ac.showSearch !== false : true}
                    actionLabel={'actionLabel' in ac ? ac.actionLabel : undefined}
                    onAction={'onAction' in ac ? ac.onAction : undefined}
                    showAction={'showAction' in ac ? ac.showAction !== false : false}
                  />
                  <p className="text-foreground/55 text-xs tabular-nums md:text-sm">
                    Showing{' '}
                    <span className="text-foreground/85 font-medium">
                      {rangeStart}–{rangeEnd}
                    </span>{' '}
                    of {activeRows.length}
                  </p>
                </div>

                {listLoading ? <TableRowSkeleton rows={5} /> : null}

            {!listLoading && active === 'events' && (
              <section className="admin-data-shell rounded-2xl p-3 md:p-4">
                {pagedRows.length === 0 ? (
                  <AdminEmptyState
                    title="No events yet"
                    description="Create your first event — it will appear on the public calendar."
                  />
                ) : (
                  <ul className="space-y-2">
                    {(pagedRows as EventItem[]).map((event) => (
                      <motion.li
                        layout
                        key={event.id}
                        className="group border-gold/12 hover:border-gold/25 flex flex-col gap-3 rounded-xl border border-transparent bg-black/20 px-4 py-3 transition duration-200 hover:bg-white/[0.05] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground font-semibold tracking-tight">{event.title}</p>
                          <p className="text-foreground/60 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="text-gold/60 h-3.5 w-3.5" aria-hidden />
                              {formatSqlDate(event.event_date)}
                            </span>
                            <span aria-hidden>·</span>
                            <span>{event.event_time}</span>
                            <span aria-hidden>·</span>
                            <span className="truncate">{event.location}</span>
                          </p>
                          {event.description ? (
                            <p className="text-foreground/50 mt-2 line-clamp-2 text-xs">{event.description}</p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2 sm:shrink-0">
                          {event.category ? (
                            <AdminBadge variant={event.category}>{event.category}</AdminBadge>
                          ) : null}
                          <AdminIconButton label="Edit event" onClick={() => openEventEdit(event)}>
                            <Pencil className="h-4 w-4" />
                          </AdminIconButton>
                          <AdminIconButton
                            label="Delete event"
                            destructive
                            onClick={() =>
                              setPendingDelete({ kind: 'event', id: event.id, title: event.title })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </AdminIconButton>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {!listLoading && active === 'officers' && (
              <section className="admin-data-shell rounded-2xl p-3 md:p-4">
                {pagedRows.length === 0 ? (
                  <AdminEmptyState title="No officers" description="Add chapter officers for the public roster." />
                ) : (
                  <ul className="space-y-2">
                    {(pagedRows as OfficerItem[]).map((officer) => (
                      <motion.li
                        layout
                        key={officer.id}
                        className="group border-gold/12 hover:border-gold/25 flex flex-col gap-3 rounded-xl border border-transparent bg-black/20 px-4 py-3 transition duration-200 hover:bg-white/[0.05] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div
                            className="border-gold/25 h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-slate-800"
                            style={
                              officer.photo_url ? officerPhotoBackgroundStyle(officer) : undefined
                            }
                            aria-hidden={!officer.photo_url}
                          />
                          <div className="min-w-0">
                            <p className="text-foreground font-semibold">{officer.name}</p>
                            <p className="text-foreground/65 text-sm">{officer.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <AdminIconButton label="Edit officer" onClick={() => openOfficerEdit(officer)}>
                            <Pencil className="h-4 w-4" />
                          </AdminIconButton>
                          <AdminIconButton
                            label="Delete officer"
                            destructive
                            onClick={() =>
                              setPendingDelete({ kind: 'officer', id: officer.id, title: officer.name })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </AdminIconButton>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {!listLoading && active === 'news' && (
              <section className="admin-data-shell rounded-2xl p-3 md:p-4">
                {pagedRows.length === 0 ? (
                  <AdminEmptyState title="No news posts" description="Publish updates for your chapter." />
                ) : (
                  <ul className="space-y-2">
                    {(pagedRows as NewsItem[]).map((item) => (
                      <motion.li
                        layout
                        key={item.id}
                        className="group border-gold/12 hover:border-gold/25 flex flex-col gap-3 rounded-xl border border-transparent bg-black/20 px-4 py-3 transition duration-200 hover:bg-white/[0.05] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground font-semibold">{item.title}</p>
                          <p className="text-foreground/55 mt-1 line-clamp-2 text-sm">{item.summary}</p>
                          <p className="text-foreground/45 mt-2 text-xs">/{item.slug}</p>
                          <p className="text-gold/70 mt-2 text-xs">
                            {item.image_urls?.length ? `${item.image_urls.length} photo${item.image_urls.length === 1 ? '' : 's'}` : 'No photos'}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <AdminBadge variant={item.is_published ? 'published' : 'draft'}>
                            {item.is_published ? 'Published' : 'Draft'}
                          </AdminBadge>
                          <AdminIconButton label="Edit news" onClick={() => openNewsEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </AdminIconButton>
                          <AdminIconButton
                            label="Delete news"
                            destructive
                            onClick={() =>
                              setPendingDelete({ kind: 'news', id: item.id, title: item.title })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </AdminIconButton>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {!listLoading && active === 'sirKnights' && (
              <section className="admin-data-shell rounded-2xl p-3 md:p-4">
                {pagedRows.length === 0 ? (
                  <AdminEmptyState title="No Sir Knights" description="Approved petitioners will appear here." />
                ) : (
                  <ul className="space-y-2">
                    {(pagedRows as PetitionerItem[]).map((member) => (
                      <motion.li
                        layout
                        key={member.id}
                        className="border-gold/12 flex flex-col gap-3 rounded-xl border bg-black/20 px-4 py-3 transition duration-200 hover:border-gold/25 hover:bg-white/[0.04] md:flex-row md:items-start md:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="text-foreground font-semibold">
                            {member.name}{' '}
                            <span className="text-foreground/50 font-normal">({member.age})</span>
                          </p>
                          <p className="text-foreground/65 text-sm">
                            {member.email} · {member.phone}
                          </p>
                          <p className="text-foreground/55 text-sm">
                            {member.school} · {member.address}
                          </p>
                          <p className="text-foreground/50 mt-1 text-sm">Reason: {member.reason}</p>
                        </div>
                        <div className="shrink-0">
                          <AdminBadge variant="approved">{member.status}</AdminBadge>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {!listLoading && active === 'petitioners' && (
              <section className="admin-data-shell rounded-2xl p-3 md:p-4">
                {pagedRows.length === 0 ? (
                  <AdminEmptyState
                    title="No petitioners"
                    description="Pending and declined applications will show here."
                  />
                ) : (
                  <ul className="space-y-2">
                    {(pagedRows as PetitionerItem[]).map((applicant) => {
                      const st = applicant.status.toLowerCase();
                      const variant =
                        st === 'pending' ? 'pending' : st === 'approved' ? 'approved' : 'declined';
                      return (
                        <motion.li
                          layout
                          key={applicant.id}
                          className="border-gold/12 flex flex-col gap-3 rounded-xl border bg-black/20 px-4 py-3 transition duration-200 hover:border-gold/25 hover:bg-white/[0.04] md:flex-row md:items-start md:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-foreground font-semibold">
                              {applicant.name}{' '}
                              <span className="text-foreground/50 font-normal">({applicant.age})</span>
                            </p>
                            <p className="text-foreground/65 text-sm">
                              {applicant.email} · {applicant.phone}
                            </p>
                            <p className="text-foreground/55 text-sm">
                              {applicant.school} · {applicant.address}
                            </p>
                            <p className="text-foreground/50 mt-1 text-sm">Reason: {applicant.reason}</p>
                            <div className="mt-2">
                              <AdminBadge variant={variant}>{applicant.status}</AdminBadge>
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              className="text-foreground/80 hover:text-emerald-200 inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold transition duration-200 hover:scale-[1.02]"
                              onClick={async () => {
                                try {
                                  const originalPetitioners = [...petitioners];
                                  setPetitioners(prev =>
                                    prev.map(p => p.id === applicant.id ? { ...p, status: 'Approved' } : p)
                                  );

                                  const r = await fetch('/api/admin/petitioners', {
                                    method: 'PUT',
                                    credentials: 'include',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: applicant.id, status: 'Approved' }),
                                  });
                                  const payload = await r.json().catch(() => null);
                                  if (!r.ok) {
                                    setPetitioners(originalPetitioners);
                                    throw new Error(payload?.error || 'Could not update status.');
                                  }
                                  await fetchAll();
                                  toast(
                                    'success',
                                    payload?.mailSent
                                      ? 'Marked approved and emailed the parent consent PDF.'
                                      : 'Marked approved.',
                                  );
                                } catch (error) {
                                  toast('error', error instanceof Error ? error.message : 'Could not update status.');
                                }
                              }}
                            >
                              <Check className="h-3.5 w-3.5" aria-hidden />
                              Approve
                            </button>
                            <button
                              type="button"
                              className="text-foreground/80 hover:text-rose-200 inline-flex items-center gap-1 rounded-lg border border-rose-500/35 bg-rose-500/10 px-3 py-2 text-xs font-semibold transition duration-200 hover:scale-[1.02]"
                              onClick={async () => {
                                try {
                                  const originalPetitioners = [...petitioners];
                                  setPetitioners(prev =>
                                    prev.map(p => p.id === applicant.id ? { ...p, status: 'Declined' } : p)
                                  );

                                  const r = await fetch('/api/admin/petitioners', {
                                    method: 'PUT',
                                    credentials: 'include',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: applicant.id, status: 'Declined' }),
                                  });
                                  const payload = await r.json().catch(() => null);
                                  if (!r.ok) {
                                    setPetitioners(originalPetitioners);
                                    throw new Error(payload?.error || 'Could not update status.');
                                  }
                                  await fetchAll();
                                  toast('success', 'Marked declined.');
                                } catch (error) {
                                  toast('error', error instanceof Error ? error.message : 'Could not update status.');
                                }
                              }}
                            >
                              <XCircle className="h-3.5 w-3.5" aria-hidden />
                              Decline
                            </button>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}

            {!listLoading && active === 'subscribers' && (
              <section className="admin-data-shell rounded-2xl p-3 md:p-4">
                {pagedRows.length === 0 ? (
                  <AdminEmptyState title="No subscribers" description="Newsletter signups appear here." />
                ) : (
                  <ul className="space-y-2">
                    {(pagedRows as SubscriberItem[]).map((sub) => (
                      <motion.li
                        layout
                        key={sub.id}
                        className="border-gold/12 hover:border-gold/20 flex items-center justify-between rounded-xl border bg-black/20 px-4 py-3 transition duration-200 hover:bg-white/[0.05]"
                      >
                        <span className="text-foreground/90 font-medium">{sub.email}</span>
                        <span className="text-foreground/50 text-xs tabular-nums">
                          {new Date(sub.date_subscribed).toLocaleDateString()}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {showPagination ? (
              <AdminPagination
                page={page}
                totalPages={totalPages(activeRows.length)}
                onPageChange={setPage}
              />
            ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      <DashboardModal
        open={eventModalOpen}
        onClose={() => !modalSaving && setEventModalOpen(false)}
        title={eventForm.id ? 'Edit event' : 'Create event'}
        description="Details appear on the public events calendar."
        size="lg"
        footer={
          <>
            <AdminGhostButton type="button" disabled={modalSaving} onClick={() => setEventModalOpen(false)}>
              Cancel
            </AdminGhostButton>
            <AdminPrimaryButton type="button" loading={modalSaving} onClick={() => void submitEvent()}>
              Save
            </AdminPrimaryButton>
          </>
        }
      >
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            void submitEvent();
          }}
        >
          <AdminField label="Title" htmlFor="ev-title" required error={eventFieldErr.title}>
            <input
              id="ev-title"
              className={adminInputClass(!!eventFieldErr.title)}
              value={eventForm.title}
              onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))}
            />
          </AdminField>
          <AdminField label="Date" htmlFor="ev-date" required error={eventFieldErr.event_date}>
            <input
              id="ev-date"
              type="date"
              className={adminInputClass(!!eventFieldErr.event_date)}
              value={eventForm.event_date}
              onChange={(e) => setEventForm((p) => ({ ...p, event_date: e.target.value }))}
            />
          </AdminField>
          <AdminField label="Time" htmlFor="ev-time" required error={eventFieldErr.event_time}>
            <input
              id="ev-time"
              className={adminInputClass(!!eventFieldErr.event_time)}
              value={eventForm.event_time}
              onChange={(e) => setEventForm((p) => ({ ...p, event_time: e.target.value }))}
              placeholder="e.g. 7:00 PM"
            />
          </AdminField>
          <AdminField label="Location" htmlFor="ev-loc" required error={eventFieldErr.location}>
            <input
              id="ev-loc"
              className={adminInputClass(!!eventFieldErr.location)}
              value={eventForm.location}
              onChange={(e) => setEventForm((p) => ({ ...p, location: e.target.value }))}
            />
          </AdminField>
          <AdminField label="Type" htmlFor="ev-cat" className="md:col-span-2 md:max-w-md">
            <select
              id="ev-cat"
              className={adminInputClass()}
              value={eventForm.category}
              onChange={(e) =>
                setEventForm((p) => ({ ...p, category: e.target.value as EventCategory }))
              }
              aria-label="Event type"
            >
              <option value="important">Important</option>
              <option value="formal">Formal</option>
              <option value="activity">Activity</option>
            </select>
          </AdminField>
          <AdminField label="Description" htmlFor="ev-desc" className="md:col-span-2">
            <textarea
              id="ev-desc"
              className={adminInputClass()}
              rows={4}
              value={eventForm.description}
              onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))}
            />
          </AdminField>
        </form>
      </DashboardModal>

      <DashboardModal
        open={officerModalOpen}
        onClose={() => !modalSaving && !officerUploading && setOfficerModalOpen(false)}
        title={officerForm.id ? 'Edit officer' : 'Add officer'}
        size="xl"
        footer={
          <>
            <AdminGhostButton
              type="button"
              disabled={modalSaving || officerUploading}
              onClick={() => setOfficerModalOpen(false)}
            >
              Cancel
            </AdminGhostButton>
            <AdminPrimaryButton
              type="button"
              loading={modalSaving}
              disabled={officerUploading}
              onClick={() => void submitOfficer()}
            >
              Save
            </AdminPrimaryButton>
          </>
        }
      >
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            void submitOfficer();
          }}
        >
          <AdminField label="Name" htmlFor="of-name" required>
            <input
              id="of-name"
              className={adminInputClass()}
              value={officerForm.name}
              onChange={(e) => setOfficerForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </AdminField>
          <AdminField label="Position" htmlFor="of-pos" required>
            <input
              id="of-pos"
              className={adminInputClass()}
              value={officerForm.position}
              onChange={(e) => setOfficerForm((p) => ({ ...p, position: e.target.value }))}
              required
            />
          </AdminField>
          <div className="border-gold/20 rounded-2xl border bg-black/25 p-4 md:col-span-2">
            <p className="text-gold/75 mb-3 text-[11px] font-semibold uppercase tracking-[0.18em]">Photo</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className={adminInputClass()}
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) void handleOfficerPhotoUpload(selectedFile);
                e.target.value = '';
              }}
            />
            <p className="text-foreground/50 mt-2 text-xs">JPG, PNG, WEBP, GIF — max 5MB.</p>
            {officerUploading ? <p className="text-gold mt-2 text-sm">Uploading…</p> : null}
            {(officerUploadPreview || officerForm.photo_url) && (
              <div className="mt-4 space-y-4">
                <p className="text-foreground/55 text-xs">Click preview to set focal point; use sliders for fine tuning.</p>
                <div
                  role="img"
                  aria-label="Officer photo preview; click to set focal point"
                  tabIndex={0}
                  className="border-gold/25 relative h-44 max-w-xs cursor-crosshair overflow-hidden rounded-xl border outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
                  style={officerPhotoBackgroundStyle({
                    ...officerForm,
                    photo_url: officerUploadPreview || officerForm.photo_url,
                  })}
                  onClick={(e) => {
                    const el = e.currentTarget;
                    const rect = el.getBoundingClientRect();
                    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                    setOfficerForm((p) => ({
                      ...p,
                      photo_pos_x: Math.min(100, Math.max(0, x)),
                      photo_pos_y: Math.min(100, Math.max(0, y)),
                    }));
                  }}
                />
                <div className="max-w-xs space-y-3">
                  {(['photo_pos_x', 'photo_pos_y', 'photo_zoom'] as const).map((key) => (
                    <label key={key} className="text-foreground/75 block text-xs">
                      <span className="text-gold/85 flex justify-between">
                        <span>
                          {key === 'photo_pos_x'
                            ? 'Horizontal'
                            : key === 'photo_pos_y'
                              ? 'Vertical'
                              : 'Zoom'}
                        </span>
                        <span>
                          {key === 'photo_zoom'
                            ? officerForm.photo_zoom === 100
                              ? 'Cover'
                              : `${officerForm.photo_zoom}%`
                            : `${officerForm[key]}%`}
                        </span>
                      </span>
                      <input
                        type="range"
                        className="mt-1 w-full accent-[var(--gold)]"
                        min={key === 'photo_zoom' ? 100 : 0}
                        max={key === 'photo_zoom' ? 200 : 100}
                        value={officerForm[key]}
                        onChange={(e) =>
                          setOfficerForm((p) => ({ ...p, [key]: Number(e.target.value) }))
                        }
                      />
                    </label>
                  ))}
                  <button
                    type="button"
                    className="text-gold/80 text-xs underline decoration-gold/30 hover:text-gold"
                    onClick={() =>
                      setOfficerForm((p) => ({
                        ...p,
                        photo_pos_x: 50,
                        photo_pos_y: 45,
                        photo_zoom: 100,
                      }))
                    }
                  >
                    Reset framing
                  </button>
                </div>
                {officerForm.photo_url ? (
                  <button
                    type="button"
                    className="text-rose-300/90 text-xs underline hover:text-rose-200"
                    onClick={() => {
                      revokeOfficerBlob();
                      setOfficerForm((p) => ({
                        ...p,
                        photo_url: '',
                        photo_pos_x: 50,
                        photo_pos_y: 45,
                        photo_zoom: 100,
                      }));
                    }}
                  >
                    Remove photo
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </form>
      </DashboardModal>

      <DashboardModal
        open={newsModalOpen}
        onClose={() => !modalSaving && newsUploadingTotal === 0 && setNewsModalOpen(false)}
        title={newsForm.id ? 'Edit news' : 'Create news'}
        size="xl"
        footer={
          <>
            <AdminGhostButton
              type="button"
              disabled={modalSaving || newsUploadingTotal > 0}
              onClick={() => setNewsModalOpen(false)}
            >
              Cancel
            </AdminGhostButton>
            <AdminPrimaryButton
              type="button"
              loading={modalSaving}
              disabled={newsUploadingTotal > 0}
              onClick={() => void submitNews()}
            >
              Save
            </AdminPrimaryButton>
          </>
        }
      >
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            void submitNews();
          }}
        >
          <AdminField label="Title" htmlFor="nw-title" required>
            <input
              id="nw-title"
              className={adminInputClass()}
              value={newsForm.title}
              onChange={(e) => setNewsForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </AdminField>
          <AdminField label="Slug" htmlFor="nw-slug">
            <input
              id="nw-slug"
              className={adminInputClass()}
              value={newsForm.slug}
              onChange={(e) => setNewsForm((p) => ({ ...p, slug: e.target.value }))}
              placeholder="optional"
            />
          </AdminField>
          <AdminField label="Publish date" htmlFor="nw-pub">
            <input
              id="nw-pub"
              type="datetime-local"
              className={adminInputClass()}
              value={newsForm.published_at}
              onChange={(e) => setNewsForm((p) => ({ ...p, published_at: e.target.value }))}
            />
          </AdminField>
          <AdminField label="Status" htmlFor="nw-st">
            <select
              id="nw-st"
              className={adminInputClass()}
              value={newsForm.is_published ? '1' : '0'}
              onChange={(e) => setNewsForm((p) => ({ ...p, is_published: e.target.value === '1' }))}
            >
              <option value="1">Published</option>
              <option value="0">Draft</option>
            </select>
          </AdminField>
          <AdminField label="Summary" htmlFor="nw-sum" className="md:col-span-2">
            <textarea
              id="nw-sum"
              className={adminInputClass()}
              rows={3}
              value={newsForm.summary}
              onChange={(e) => setNewsForm((p) => ({ ...p, summary: e.target.value }))}
            />
          </AdminField>
          <AdminField label="Photos" htmlFor="nw-images" className="md:col-span-2">
            <div className="space-y-3">
              <label
                htmlFor="nw-images"
                className={`border-gold/20 flex cursor-pointer flex-col rounded-2xl border border-dashed px-4 py-4 text-sm transition ${
                  newsUploadingTotal > 0 || newsForm.image_urls.length >= MAX_NEWS_IMAGES
                    ? 'cursor-not-allowed opacity-60'
                    : 'hover:border-gold/40 hover:bg-white/[0.03]'
                }`}
              >
                <input
                  id="nw-images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="sr-only"
                  disabled={newsUploadingTotal > 0 || newsForm.image_urls.length >= MAX_NEWS_IMAGES}
                  onChange={(event) => {
                    const files = event.currentTarget.files;
                    void handleNewsImagesUpload(files);
                    event.currentTarget.value = '';
                  }}
                />
                <span className="text-foreground font-medium">
                  {newsUploadingTotal > 0 ? 'Uploading photos...' : 'Click to upload one or more photos'}
                </span>
                <span className="text-foreground/55 mt-1 text-xs">
                  Up to {MAX_NEWS_IMAGES} photos per post. The first photo becomes the feed cover.
                </span>
              </label>

              {newsUploadingTotal > 0 ? (
                <p className="text-gold text-xs font-medium">
                  Uploading {newsUploadingCurrent} of {newsUploadingTotal}...
                </p>
              ) : null}

              {newsForm.image_urls.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {newsForm.image_urls.map((url, index) => (
                    <div key={url} className="rounded-2xl border border-gold/15 bg-black/20 p-3">
                      <div
                        className="h-32 rounded-xl border border-white/10 bg-cover bg-center"
                        style={{ backgroundImage: `url(${url})` }}
                        aria-label={`News photo ${index + 1}`}
                      />
                      <div className="mt-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-foreground text-sm font-medium">
                            {index === 0 ? 'Cover photo' : `Photo ${index + 1}`}
                          </p>
                          <p className="text-foreground/45 mt-1 truncate text-[11px]">{url}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {index !== 0 ? (
                            <button
                              type="button"
                              className="text-gold text-[11px] font-semibold hover:text-foreground"
                              onClick={() => makeNewsImageCover(url)}
                            >
                              Use as cover
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="text-rose-300 text-[11px] font-semibold hover:text-rose-200"
                            onClick={() => removeNewsImage(url)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-foreground/45 rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm">
                  No photos uploaded yet.
                </div>
              )}
            </div>
          </AdminField>
          <AdminField label="Content" htmlFor="nw-body" className="md:col-span-2">
            <textarea
              id="nw-body"
              className={adminInputClass()}
              rows={8}
              value={newsForm.content}
              onChange={(e) => setNewsForm((p) => ({ ...p, content: e.target.value }))}
            />
          </AdminField>
        </form>
      </DashboardModal>

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => !deleteLoading && setPendingDelete(null)}
        title="Delete this item?"
        message={
          pendingDelete
            ? `Permanently remove “${pendingDelete.title}”? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={runDelete}
      />
    </div>
  );
}

export default function AdminDashboardClient({
  username,
  currentAdminId,
}: {
  username: string;
  currentAdminId: number;
}) {
  return (
    <ToastProvider>
      <DashboardInner username={username} currentAdminId={currentAdminId} />
    </ToastProvider>
  );
}
