'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  MapPin,
  Megaphone,
  Newspaper,
  Sparkles,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CampaignOrderForm from '@/components/site/CampaignOrderForm';
import ImageLightbox from '@/components/site/ImageLightbox';
import NewsImageGallery from '@/components/site/NewsImageGallery';
import { parseCampaignImageUrls } from '@/lib/campaignImages';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatSqlDate, formatSqlDateTime } from '@/lib/formatDb';
import { formatNewsDateLabel, formatNewsDateTimeLabel } from '@/lib/formatNewsDate';
import type { FeedItem } from '@/lib/homeFeed';
import { parseNewsImageUrls } from '@/lib/newsImages';
import { htmlToPlainText } from '@/lib/plainText';

type Filter = 'all' | 'news' | 'events' | 'campaigns';

function toText(value: unknown, fallback = ''): string {
  if (value == null || value === '') return fallback;
  if (value instanceof Date) return formatSqlDateTime(value);
  return String(value);
}

function toDateText(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value || fallback;
  const formatted = formatSqlDate(value);
  return formatted || fallback;
}

function toDateTimeText(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value === 'string') return value;
  return formatSqlDateTime(value);
}

function toSizes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => toText(entry).trim()).filter(Boolean);
  }
  const raw = toText(value);
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeFeedItem(item: FeedItem): FeedItem {
  if (item.kind === 'news') {
    const publishedAt = toDateTimeText(item.published_at);
    return {
      ...item,
      title: toText(item.title),
      slug: toText(item.slug),
      summary: item.summary != null ? htmlToPlainText(item.summary) : undefined,
      content: item.content != null ? htmlToPlainText(item.content) : undefined,
      image_urls: parseNewsImageUrls(item.image_urls),
      published_at: publishedAt,
    };
  }

  if (item.kind === 'event') {
    return {
      ...item,
      title: toText(item.title),
      description: item.description != null ? htmlToPlainText(item.description) : undefined,
      event_date: toDateText(item.event_date),
      event_time: toText(item.event_time),
      location: toText(item.location),
      category: item.category != null ? toText(item.category) : undefined,
    };
  }

  return {
    ...item,
    title: toText(item.title),
    slug: toText(item.slug),
    summary: item.summary != null ? htmlToPlainText(item.summary) : undefined,
    description: item.description != null ? htmlToPlainText(item.description) : undefined,
    start_date: toDateText(item.start_date),
    end_date: toDateText(item.end_date),
    status: toText(item.status),
    unit_price: Number(item.unit_price ?? 0),
    size_options: toSizes(item.size_options),
    cover_image_url: item.cover_image_url ? toText(item.cover_image_url) : null,
    image_urls: parseCampaignImageUrls(item.image_urls, item.cover_image_url),
    created_at: toDateTimeText(item.created_at),
  };
}

function parseDateOnly(value?: string, mode: 'start' | 'end' = 'start'): number | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map((part) => Number(part));
  if (!year || !month || !day) return null;
  const hour = mode === 'end' ? 23 : 0;
  const minute = mode === 'end' ? 59 : 0;
  const second = mode === 'end' ? 59 : 0;
  const millis = mode === 'end' ? 999 : 0;
  return new Date(year, month - 1, day, hour, minute, second, millis).getTime();
}

function parseDateTime(value?: string): number | null {
  if (!value) return null;
  const parsed = new Date(value.includes('T') ? value : value.replace(' ', 'T')).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function formatCountdownLabel(endDate: string, nowTs?: number | null): string {
  if (nowTs == null) return `Open until ${endDate}`;
  const endTs = parseDateOnly(endDate, 'end');
  if (!endTs) return 'Ends soon';

  const diff = endTs - nowTs;
  if (diff <= 0) return 'Closed';

  const hours = Math.ceil(diff / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h left`;

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 1) return '1 day left';
  if (days <= 21) return `${days} days left`;

  const weeks = Math.ceil(days / 7);
  return `${weeks} weeks left`;
}

function formatEventMomentumLabel(eventDate: string, nowTs?: number | null): string {
  if (nowTs == null) return 'Scheduled';
  const eventTs = parseDateOnly(eventDate, 'end');
  if (!eventTs) return 'Upcoming';

  const diffDays = Math.floor((eventTs - nowTs) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Recent event';
  if (diffDays === 0) return 'Happening today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return 'This week';
  return 'Upcoming';
}

function formatNewsMomentumLabel(publishedAt: string | undefined, nowTs?: number | null): string {
  if (nowTs == null) return 'Featured update';
  const publishedTs = parseDateTime(publishedAt);
  if (!publishedTs) return 'Chapter update';

  const diffHours = Math.floor((nowTs - publishedTs) / (1000 * 60 * 60));
  if (diffHours <= 24) return 'Live today';
  if (diffHours <= 72) return 'Fresh this week';
  return 'Featured update';
}

function estimateReadTime(text?: string): string {
  const words = (text || '')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 180) || 1);
  return `${minutes} min read`;
}

function getItemBadge(item: FeedItem, nowTs?: number | null): string {
  if (item.kind === 'campaign') return formatCountdownLabel(item.end_date, nowTs);
  if (item.kind === 'event') return formatEventMomentumLabel(item.event_date, nowTs);
  return formatNewsMomentumLabel(item.published_at, nowTs);
}

function getItemPreview(item: FeedItem): string {
  if (item.kind === 'campaign') {
    return item.summary || item.description || 'Premium fundraising drop now open for orders.';
  }
  if (item.kind === 'event') {
    return item.description || `${item.location} - ${item.event_date}`;
  }
  return item.summary || item.content || 'Fresh chapter announcement ready to read.';
}

export default function HomeFeed({ items }: { items: FeedItem[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [detail, setDetail] = useState<FeedItem | null>(null);
  const [detailIntent, setDetailIntent] = useState<'view' | 'order'>('view');
  const [imageLightbox, setImageLightbox] = useState<{
    images: string[];
    initialIndex: number;
    title: string;
  } | null>(null);
  const [nowTs, setNowTs] = useState<number | null>(null);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const detailBodyRef = useRef<HTMLDivElement | null>(null);
  const orderSectionRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const normalizedItems = useMemo(() => items.map(normalizeFeedItem), [items]);

  const filtered = useMemo(() => {
    if (filter === 'all') return normalizedItems;
    if (filter === 'campaigns') return normalizedItems.filter((x) => x.kind === 'campaign');
    return normalizedItems.filter((x) => x.kind === filter);
  }, [normalizedItems, filter]);

  const slice = filtered;
  const activeItem = slice[activeIndex] ?? slice[0] ?? null;

  useEffect(() => {
    const initialSync = window.requestAnimationFrame(() => {
      setNowTs(Date.now());
    });
    const timer = window.setInterval(() => {
      setNowTs(Date.now());
    }, 60_000);

    return () => {
      window.cancelAnimationFrame(initialSync);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const sync = () => {
      const max = el.scrollWidth - el.clientWidth;
      setCanLeft(el.scrollLeft > 2);
      setCanRight(max > 2 && el.scrollLeft < max - 2);

      const slides = Array.from(el.querySelectorAll('[data-slide="true"]')) as HTMLElement[];
      if (slides.length === 0) return;

      const scrollCenter = el.scrollLeft + el.clientWidth / 2;
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < slides.length; i += 1) {
        const slideCenter = slides[i].offsetLeft + slides[i].clientWidth / 2;
        const dist = Math.abs(slideCenter - scrollCenter);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      setActiveIndex(bestIdx);
    };

    sync();
    el.addEventListener('scroll', sync, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener('scroll', sync);
      ro?.disconnect();
    };
  }, [slice.length]);

  const scrollToSlide = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const el = scrollerRef.current;
    if (!el) return;
    const slides = Array.from(el.querySelectorAll('[data-slide="true"]')) as HTMLElement[];
    if (slides.length === 0) return;
    const boundedIndex = ((index % slides.length) + slides.length) % slides.length;
    const slide = slides[boundedIndex];
    const targetLeft = Math.max(slide.offsetLeft - (el.clientWidth - slide.clientWidth) / 2, 0);
    el.scrollTo({ left: targetLeft, behavior });
  }, []);

  const scrollByCards = (dir: -1 | 1) => {
    if (slice.length === 0) return;
    const target = Math.max(0, Math.min(activeIndex + dir, slice.length - 1));
    scrollToSlide(target);
  };

  const closeDetail = () => {
    setDetail(null);
    setDetailIntent('view');
  };

  const openImageLightbox = (images: string[], title: string, initialIndex = 0) => {
    const normalizedImages = images.filter(Boolean);
    if (normalizedImages.length === 0) return;
    setImageLightbox({ images: normalizedImages, initialIndex, title });
  };

  const openDetail = (item: FeedItem, intent: 'view' | 'order' = 'view') => {
    setDetail(item);
    setDetailIntent(intent);
  };

  useEffect(() => {
    if (!detail) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDetail();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [detail]);

  useEffect(() => {
    if (!detail) return;

    const resetScroll = window.requestAnimationFrame(() => {
      detailBodyRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    });

    return () => window.cancelAnimationFrame(resetScroll);
  }, [detail]);

  useEffect(() => {
    if (!detail || detail.kind !== 'campaign' || detailIntent !== 'order') return;

    const scrollToForm = window.requestAnimationFrame(() => {
      orderSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const firstField = orderSectionRef.current?.querySelector<HTMLElement>('input, select, textarea, button');
      firstField?.focus();
    });

    return () => window.cancelAnimationFrame(scrollToForm);
  }, [detail, detailIntent]);

  useEffect(() => {
    if (detail || isAutoplayPaused || slice.length < 2) return;

    const autoplay = window.setInterval(() => {
      scrollToSlide(activeIndex + 1);
    }, 6800);

    return () => window.clearInterval(autoplay);
  }, [activeIndex, detail, isAutoplayPaused, scrollToSlide, slice.length]);

  return (
    <>
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[1.75rem] border border-gold/20 bg-[linear-gradient(180deg,rgba(34,10,14,0.96),rgba(9,8,14,0.96))] px-4 py-5 shadow-[0_24px_72px_rgba(0,0,0,0.42)] sm:px-6 sm:py-6 lg:px-7">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_62%)]" />
            <div className="absolute left-[-10%] top-10 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
            <div className="absolute right-[-10%] top-0 h-64 w-64 rounded-full bg-maroon/30 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:42px_42px] opacity-[0.08]" />
          </div>

          <div className="relative">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-gold text-xs font-semibold uppercase tracking-[0.28em]">Announcements</p>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold/90 backdrop-blur-xl">
                    <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_12px_rgba(212,175,55,0.8)]" />
                    Live chapter pulse
                  </span>
                </div>
                <h2 className="font-serif mt-3 text-3xl font-bold tracking-tight text-gold sm:text-4xl">Chapter feed</h2>
                <p className="text-foreground/70 mt-2.5 max-w-xl text-sm leading-relaxed">
                  Premium updates for campaigns, events, and chapter news in one immersive stream built to drive action.
                </p>
              </div>

	              <div className="flex flex-wrap items-center gap-3">
	                {activeItem ? (
	                  <div className="hidden rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-xl sm:block">
	                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/45">Featured now</p>
	                    <div className="mt-2 flex flex-wrap items-center gap-2">
	                      <span className="rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                        {activeItem.kind === 'campaign' ? 'Campaign' : activeItem.kind === 'event' ? 'Event' : 'News'}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/70">
                        <Clock3 className="h-3.5 w-3.5" />
                        {getItemBadge(activeItem, nowTs)}
                      </span>
                    </div>
                  </div>
                ) : null}

	                <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/85 backdrop-blur-xl sm:px-4 sm:py-2 sm:text-xs">
	                  {slice.length === 0 ? '0 / 0' : `${activeIndex + 1} / ${slice.length}`}
	                </div>
	              </div>
            </div>

            <div className="no-scrollbar mt-6 overflow-x-auto pb-2">
              <div className="inline-flex min-w-max items-center gap-2 rounded-full border border-white/10 bg-black/30 p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
                {(
                  [
                    ['all', 'Latest'],
                    ['news', 'News'],
                    ['events', 'Events'],
                    ['campaigns', 'Campaigns'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setFilter(key);
                      setActiveIndex(0);
                      requestAnimationFrame(() => {
                        scrollToSlide(0, 'auto');
                      });
                    }}
                    className={`relative rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition duration-300 ${
                      filter === key ? 'text-[#0b090d]' : 'text-foreground/70 hover:text-foreground'
                    }`}
                  >
                    {filter === key ? (
                      <motion.span
                        layoutId="feed-filter-pill"
                        className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#d4af37_0%,#a8742a_42%,#730e1b_100%)] shadow-[0_0_24px_rgba(212,175,55,0.25)]"
                      />
                    ) : null}
                    <span className="relative z-10">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {slice.length === 0 ? (
              <div className="border-gold/20 text-foreground/55 mt-8 rounded-[1.75rem] border border-dashed py-16 text-center text-sm">
                Nothing in this filter yet.
              </div>
            ) : (
              <div className="relative mt-6">
                <button
                  type="button"
                  onClick={() => scrollByCards(-1)}
                  disabled={!canLeft}
                  aria-label="Scroll feed left"
                  className={`absolute left-0 top-[45%] z-20 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/25 bg-black/45 text-gold shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition md:flex ${
                    canLeft ? 'opacity-100 hover:scale-105 hover:border-gold/50 hover:bg-black/60' : 'pointer-events-none opacity-0'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByCards(1)}
                  disabled={!canRight}
                  aria-label="Scroll feed right"
                  className={`absolute right-0 top-[45%] z-20 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/25 bg-black/45 text-gold shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition md:flex ${
                    canRight ? 'opacity-100 hover:scale-105 hover:border-gold/50 hover:bg-black/60' : 'pointer-events-none opacity-0'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div
                  ref={scrollerRef}
                  className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 py-2"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                  onMouseEnter={() => setIsAutoplayPaused(true)}
                  onMouseLeave={() => setIsAutoplayPaused(false)}
                  onFocusCapture={() => setIsAutoplayPaused(true)}
                  onBlurCapture={() => setIsAutoplayPaused(false)}
                >
                  {slice.map((item, i) => (
                    <div
                      key={`${item.kind}-${item.id}`}
                      data-slide="true"
                      className="w-[97%] shrink-0 snap-center sm:w-[95%] lg:w-full"
                    >
                      <FeedCard
                        item={item}
                        index={i}
                        isActive={i === activeIndex}
                        nowTs={nowTs}
                        onOpen={() => openDetail(item)}
                        onOpenImage={(images, initialIndex) => openImageLightbox(images, item.title, initialIndex)}
                        onOrder={item.kind === 'campaign' ? () => openDetail(item, 'order') : undefined}
                      />
                    </div>
                  ))}
                </div>

	                <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
	                  <div className="hidden rounded-2xl border border-white/10 bg-black/20 px-4 py-4 backdrop-blur-xl sm:block sm:px-5">
	                    <div className="flex flex-wrap items-center gap-2">
	                      <span className="rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
	                        {activeItem ? (activeItem.kind === 'campaign' ? 'Campaign' : activeItem.kind === 'event' ? 'Event' : 'News') : 'Feed'}
                      </span>
                      {activeItem ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55">
                          <Sparkles className="h-3.5 w-3.5 text-gold/75" />
                          {getItemBadge(activeItem, nowTs)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-base font-semibold text-foreground sm:text-lg">
                      {activeItem?.title || 'Featured chapter update'}
                    </p>
                    <p className="text-foreground/65 mt-1 max-w-2xl text-sm leading-relaxed">
                      {activeItem ? getItemPreview(activeItem) : 'Swipe through the latest chapter stories.'}
                    </p>
                  </div>

	                  <div className="flex flex-col items-center gap-3 sm:items-end">
	                    <div className="hidden w-44 overflow-hidden rounded-full border border-white/10 bg-white/[0.05] sm:block">
	                      <motion.div
	                        className="h-1.5 rounded-full bg-[linear-gradient(90deg,#d4af37_0%,#a8742a_42%,#730e1b_100%)]"
                        animate={{ width: `${slice.length === 0 ? 0 : ((activeIndex + 1) / slice.length) * 100}%` }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {slice.map((item, i) => (
                        <button
                          key={`${item.kind}-${item.id}-dot`}
                          type="button"
                          onClick={() => scrollToSlide(i)}
                          aria-label={`Go to ${item.title}`}
                          className={`transition ${i === activeIndex ? 'w-9' : 'w-2.5 hover:bg-white/35'} h-2.5 rounded-full ${
                            i === activeIndex
                              ? 'bg-[linear-gradient(90deg,#d4af37_0%,#a8742a_42%,#730e1b_100%)] shadow-[0_0_18px_rgba(212,175,55,0.25)]'
                              : 'bg-white/15'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>
      </div>

      <ImageLightbox
        key={
          imageLightbox
            ? `${imageLightbox.title}-${imageLightbox.initialIndex}-${imageLightbox.images.join('|')}`
            : 'feed-image-lightbox'
        }
        open={imageLightbox != null}
        images={imageLightbox?.images || []}
        initialIndex={imageLightbox?.initialIndex ?? 0}
        title={imageLightbox?.title || 'Chapter feed image'}
        onClose={() => setImageLightbox(null)}
      />

      <AnimatePresence>
        {detail ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeDetail();
            }}
          >
            <motion.article
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.28 }}
              className="glass border-gold/30 text-foreground relative w-full max-w-2xl overflow-hidden rounded-t-3xl border shadow-2xl sm:rounded-3xl"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="relative flex max-h-[min(92dvh,760px)] flex-col sm:max-h-[90vh]">
                <div className="flex items-center justify-end px-4 pt-4 sm:px-5 sm:pt-5">
                  <button
                    type="button"
                    onClick={closeDetail}
                    className="rounded-xl p-2 text-foreground/65 transition hover:bg-white/10 hover:text-gold"
                    aria-label="Close details"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div ref={detailBodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6 sm:px-7">
                  {detail.kind === 'news' ? (
                    <>
                      <p className="text-gold mb-2 text-xs uppercase tracking-[0.2em]">
                        {formatNewsDateTimeLabel(detail.published_at)}
                      </p>
                      <h3 className="font-serif text-2xl font-bold md:text-3xl">{detail.title}</h3>
                      {detail.image_urls?.length ? (
                        <NewsImageGallery
                          key={`${detail.id}-${detail.image_urls.join('|')}`}
                          images={detail.image_urls}
                          title={detail.title}
                          className="mt-5"
                        />
                      ) : null}
                      <p className="text-foreground/80 mt-4 leading-relaxed whitespace-pre-wrap">
                        {detail.content || detail.summary || 'No additional content.'}
                      </p>
                    </>
                  ) : detail.kind === 'event' ? (
                    <>
                      <p className="text-gold mb-2 text-xs uppercase tracking-[0.2em]">Event</p>
                      <h3 className="font-serif text-2xl font-bold md:text-3xl">{detail.title}</h3>
                      <ul className="text-foreground/75 mt-4 space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Calendar className="text-gold h-4 w-4 shrink-0" />
                          {detail.event_date} · {detail.event_time}
                        </li>
                        <li>{detail.location}</li>
                        {detail.category ? (
                          <li>
                            <span className="rounded-md border border-gold/30 px-2 py-0.5 text-xs uppercase text-gold">
                              {detail.category}
                            </span>
                          </li>
                        ) : null}
                      </ul>
                      <p className="text-foreground/80 mt-4 leading-relaxed whitespace-pre-wrap">
                        {detail.description || '—'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-gold mb-2 text-xs uppercase tracking-[0.2em]">T-Shirt Fundraiser</p>
                      <h3 className="font-serif text-2xl font-bold md:text-3xl">{detail.title}</h3>
                      {detail.image_urls?.length ? (
                        <NewsImageGallery
                          key={`${detail.id}-${detail.image_urls.join('|')}`}
                          images={detail.image_urls}
                          title={detail.title}
                          className="mt-5"
                        />
                      ) : null}
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-gold/20 bg-black/20 px-4 py-3">
                          <p className="text-foreground/50 text-[11px] uppercase tracking-[0.16em]">Price</p>
                          <p className="text-gold mt-1 text-lg font-bold">{formatCurrency(detail.unit_price)}</p>
                        </div>
                        <div className="rounded-2xl border border-gold/20 bg-black/20 px-4 py-3">
                          <p className="text-foreground/50 text-[11px] uppercase tracking-[0.16em]">Order Window</p>
                          <p className="text-foreground mt-1 text-sm font-medium">
                            {detail.start_date} to {detail.end_date}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-gold/20 bg-black/20 px-4 py-3">
                          <p className="text-foreground/50 text-[11px] uppercase tracking-[0.16em]">Sizes</p>
                          <p className="text-foreground mt-1 text-sm font-medium">{detail.size_options.join(', ')}</p>
                        </div>
                      </div>
                      <p className="text-foreground/80 mt-4 leading-relaxed whitespace-pre-wrap">
                        {detail.description || detail.summary || 'Support the chapter by ordering an official fundraiser shirt.'}
                      </p>
                      <div ref={orderSectionRef}>
                        <CampaignOrderForm
                          slug={detail.slug}
                          title={detail.title}
                          sizes={detail.size_options}
                          unitPrice={detail.unit_price}
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={closeDetail}
                    className="cta-primary mt-6 rounded-xl px-5 py-2.5 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.article>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function FeedCard({
  item,
  index,
  isActive,
  nowTs,
  onOpen,
  onOpenImage,
  onOrder,
}: {
  item: FeedItem;
  index: number;
  isActive: boolean;
  nowTs: number | null;
  onOpen: () => void;
  onOpenImage?: (images: string[], initialIndex: number) => void;
  onOrder?: () => void;
}) {
  const isNews = item.kind === 'news';
  const isEvent = item.kind === 'event';
  const isCampaign = item.kind === 'campaign';
  const newsPhotoCount = isNews ? item.image_urls?.length ?? 0 : 0;
  const newsCoverImage = isNews ? item.image_urls?.[0] : null;
  const campaignPhotoCount = isCampaign ? item.image_urls?.length ?? (item.cover_image_url ? 1 : 0) : 0;
  const campaignCoverImage = isCampaign ? item.image_urls?.[0] || item.cover_image_url : null;
  const cardCoverImage = isCampaign ? campaignCoverImage : newsCoverImage;
  const cardImages = isCampaign
    ? (item.image_urls?.length ? item.image_urls : item.cover_image_url ? [item.cover_image_url] : [])
    : isNews
      ? item.image_urls || []
      : [];
  const preview = getItemPreview(item);
  const liveBadge = getItemBadge(item, nowTs);
  const headlineKicker = isCampaign
    ? 'Premium fundraiser'
    : isEvent
      ? 'Chapter event'
      : newsPhotoCount > 0
        ? 'Photo bulletin'
        : 'Editorial spotlight';
  const primaryActionLabel = isCampaign ? 'Order now' : isEvent ? 'View event' : 'Read update';
  const actionHint = isCampaign
    ? 'Drive conversions with a bold, high-visibility CTA and live campaign details.'
    : isEvent
      ? 'Open the full event sheet, timings, and lodge details.'
      : 'Expand the full bulletin and continue through the feed.';
  const infoPanels = isCampaign
    ? [
        { label: 'Unit price', value: formatCurrency(item.unit_price) },
        { label: 'Order window', value: `${item.start_date} - ${item.end_date}` },
        { label: 'Deadline', value: formatCountdownLabel(item.end_date, nowTs) },
        { label: 'Available sizes', value: item.size_options.length > 0 ? item.size_options.join(', ') : 'Made to order' },
      ]
    : isEvent
      ? [
          { label: 'Schedule', value: `${item.event_date} - ${item.event_time}` },
          { label: 'Location', value: item.location },
          { label: 'Category', value: item.category || 'Chapter activity' },
          { label: 'Momentum', value: formatEventMomentumLabel(item.event_date, nowTs) },
        ]
      : [
          { label: 'Published', value: formatNewsDateLabel(item.published_at, 'Latest update') },
          { label: 'Read time', value: estimateReadTime(item.content || item.summary) },
          { label: 'Media', value: newsPhotoCount > 0 ? `${newsPhotoCount} photo${newsPhotoCount === 1 ? '' : 's'}` : 'Text update' },
          { label: 'Momentum', value: formatNewsMomentumLabel(item.published_at, nowTs) },
        ];
  const compactInfoPanels = isCampaign
    ? [
        { label: 'Price', value: formatCurrency(item.unit_price) },
        { label: 'Deadline', value: formatCountdownLabel(item.end_date, nowTs) },
        { label: 'Sizes', value: item.size_options.length > 0 ? item.size_options.join(', ') : 'Made to order' },
      ]
    : isEvent
      ? [
          { label: 'Schedule', value: `${item.event_date} - ${item.event_time}` },
          { label: 'Location', value: item.location },
        ]
      : [
          { label: 'Published', value: formatNewsDateLabel(item.published_at, 'Latest update') },
          { label: 'Read time', value: estimateReadTime(item.content || item.summary) },
        ];
  const primaryActionClassName =
    'inline-flex items-center gap-2 rounded-full border border-gold/40 bg-[linear-gradient(135deg,#d4af37_0%,#a8742a_42%,#730e1b_100%)] px-[1.125rem] py-2.5 text-sm font-semibold text-[#0b090d] shadow-[0_14px_34px_rgba(115,14,27,0.35)] transition hover:scale-[1.02] hover:shadow-[0_18px_38px_rgba(115,14,27,0.42)]';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -6 }}
      className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.8rem] border backdrop-blur-md ${
        isActive
          ? 'border-gold/45 bg-[rgba(12,9,16,0.92)] shadow-[0_30px_90px_rgba(0,0,0,0.45),0_0_32px_rgba(212,175,55,0.12)]'
          : 'border-gold/20 bg-[rgba(12,9,16,0.82)] shadow-[0_20px_60px_rgba(0,0,0,0.36)]'
      }`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-44 w-44 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-maroon/25 blur-3xl" />
      </div>

	      <div className="grid min-h-[360px] grid-cols-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] sm:min-h-[440px] xl:min-h-[480px]">
	        <div className="relative h-[240px] overflow-hidden border-b border-white/10 sm:h-[300px] lg:h-auto lg:min-h-full lg:border-b-0 lg:border-r">
          {cardCoverImage ? (
            <>
              {cardImages.length > 0 ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenImage?.(cardImages, 0);
                  }}
                  className="absolute inset-0 z-10 cursor-zoom-in"
                  aria-label={`Open full image of ${item.title}`}
                />
              ) : null}
              <motion.div
                className="pointer-events-none absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${cardCoverImage})` }}
                animate={{ scale: isActive ? 1.03 : 1 }}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,8,0.15)_0%,rgba(7,5,8,0.06)_24%,rgba(7,5,8,0.6)_78%,rgba(7,5,8,0.92)_100%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.14),transparent_48%)]" />
            </>
          ) : (
            <>
              <div
                className={`absolute inset-0 ${
                  isNews
                    ? 'bg-[linear-gradient(135deg,rgba(16,16,24,1)_0%,rgba(49,16,24,1)_46%,rgba(8,8,12,1)_100%)]'
                    : isEvent
                      ? 'bg-[linear-gradient(135deg,rgba(12,16,20,1)_0%,rgba(46,22,32,1)_46%,rgba(8,8,12,1)_100%)]'
                      : 'bg-[linear-gradient(135deg,rgba(12,16,20,1)_0%,rgba(58,22,18,1)_46%,rgba(8,8,12,1)_100%)]'
                }`}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_42%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:46px_46px] opacity-[0.16]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-gold/20 bg-black/25 shadow-[0_0_50px_rgba(212,175,55,0.08)] backdrop-blur-xl sm:h-40 sm:w-40">
                  <div className="absolute inset-3 rounded-full border border-white/10" />
                  {isNews ? (
                    <Newspaper className="h-12 w-12 text-gold/70 sm:h-14 sm:w-14" />
                  ) : isEvent ? (
                    <Calendar className="h-12 w-12 text-gold/70 sm:h-14 sm:w-14" />
                  ) : (
                    <Megaphone className="h-12 w-12 text-gold/70 sm:h-14 sm:w-14" />
                  )}
                </div>
              </div>
            </>
          )}

          <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2 sm:left-5 sm:top-5">
            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/90 backdrop-blur-xl">
              {isNews ? 'News' : isEvent ? 'Event' : 'Campaign'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold backdrop-blur-xl">
              <Flame className="h-3.5 w-3.5" />
              {liveBadge}
            </span>
            {isNews && newsPhotoCount > 0 ? (
              <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/90 backdrop-blur-xl">
                {newsPhotoCount} photo{newsPhotoCount === 1 ? '' : 's'}
              </span>
            ) : null}
            {isCampaign && campaignPhotoCount > 1 ? (
              <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/90 backdrop-blur-xl">
                {campaignPhotoCount} photos
              </span>
            ) : null}
          </div>

          <div className="absolute inset-x-4 bottom-4 z-20 sm:inset-x-5 sm:bottom-5">
            <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-[1.15rem] border border-white/10 bg-black/30 px-3.5 py-2.5 text-left shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold/80">{headlineKicker}</span>
              {isCampaign ? (
                <span className="text-sm font-semibold text-white/90">{formatCurrency(item.unit_price)} per shirt</span>
              ) : isEvent ? (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-white/85">
                  <MapPin className="h-4 w-4 text-gold/70" />
                  {item.location}
                </span>
              ) : (
                <span className="text-sm font-medium text-white/85">{formatNewsDateLabel(item.published_at, 'Fresh bulletin')}</span>
              )}
            </div>
            {cardImages.length > 0 ? (
              <div className="mt-2">
                <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-xl sm:inline-flex">
                  Click image to view full photo
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative flex flex-1 flex-col justify-between p-4 sm:p-5 xl:p-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/45">
              <span>{headlineKicker}</span>
              <span className="hidden text-gold/65 sm:inline">/</span>
              <span className="hidden sm:inline">{isCampaign ? 'Conversion focused' : isEvent ? 'High attendance cue' : 'Editorial read'}</span>
            </div>

            <h3 className="font-serif mt-3 text-2xl font-bold leading-[1.05] text-white sm:text-[2rem] xl:text-[2.35rem]">
              {item.title}
            </h3>

            <p className="text-foreground/72 mt-3 max-w-xl text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">
              {preview}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
              {compactInfoPanels.map((panel, panelIndex) => (
                <div
                  key={panel.label}
                  className={`rounded-[0.95rem] border border-white/10 bg-white/[0.03] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${
                    compactInfoPanels.length % 2 === 1 && panelIndex === compactInfoPanels.length - 1 ? 'col-span-2' : ''
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/45">{panel.label}</p>
                  <p className="mt-1.5 text-sm font-medium leading-relaxed text-foreground/90 line-clamp-2">{panel.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 hidden gap-3 sm:grid sm:grid-cols-2">
              {infoPanels.map((panel) => (
                <div key={panel.label} className="rounded-[1.05rem] border border-white/10 bg-white/[0.03] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/45">{panel.label}</p>
                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-foreground/90">
                    {panel.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 sm:hidden" onClick={(event) => event.stopPropagation()}>
            <div className="flex">
              {isCampaign && onOrder ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOrder();
                  }}
                  className={`${primaryActionClassName} w-full justify-center`}
                >
                  {primaryActionLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen();
                  }}
                  className={`${primaryActionClassName} w-full justify-center`}
                >
                  {primaryActionLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 hidden rounded-[1.2rem] border border-gold/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 shadow-[0_18px_38px_rgba(0,0,0,0.18)] sm:block">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold/80">Next step</p>
                <p className="text-foreground/70 mt-2 max-w-md text-sm leading-relaxed">{actionHint}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/65">
                <Sparkles className="h-3.5 w-3.5 text-gold/75" />
                Premium interaction
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5" onClick={(event) => event.stopPropagation()}>
              {isCampaign && onOrder ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOrder();
                  }}
                  className={primaryActionClassName}
                >
                  {primaryActionLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen();
                  }}
                  className={primaryActionClassName}
                >
                  {primaryActionLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
