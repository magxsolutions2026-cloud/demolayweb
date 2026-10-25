'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import {
  EVENT_CATEGORY_LABELS,
  EVENT_CATEGORY_STYLES,
  normalizeEventCategory,
  type EventCategory,
} from '@/lib/eventCategory';

export interface EventsCalendarEvent {
  id: number;
  title: string;
  event_date: string;
  event_time: string;
  location: string;
  description?: string;
  category?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 24,
  mass: 0.92,
};

function padKey(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function keyToDate(key: string): Date {
  return new Date(`${key}T12:00:00`);
}

function buildMonthCells(year: number, month: number) {
  const firstDow = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const cells: ({ day: number; key: string } | null)[] = [];

  for (let i = 0; i < firstDow; i += 1) cells.push(null);
  for (let day = 1; day <= lastDate; day += 1) {
    cells.push({ day, key: padKey(year, month, day) });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function formatMonthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1));
}

function formatLongDate(key: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(keyToDate(key));
}

function formatShortDate(key: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(keyToDate(key));
}

function formatEventTime(value: string) {
  const trimmed = value?.trim();
  return trimmed || 'Time to be announced';
}

function getCategoryMeta(category: EventCategory) {
  if (category === 'important') {
    return {
      icon: Star,
      iconWrap: 'border-[#FFD700]/25 bg-[#FFD700]/12 text-[#FFD700]',
    };
  }

  if (category === 'formal') {
    return {
      icon: ShieldCheck,
      iconWrap: 'border-red-400/20 bg-red-500/12 text-red-200',
    };
  }

  return {
    icon: Sparkles,
    iconWrap: 'border-orange-400/20 bg-orange-500/12 text-orange-200',
  };
}

export default function EventsCalendarSection({
  events,
  hideIntro = false,
}: {
  events: EventsCalendarEvent[];
  hideIntro?: boolean;
}) {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(
    () => padKey(today.getFullYear(), today.getMonth(), today.getDate()),
    [today],
  );

  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) => {
        const dateCompare = a.event_date.localeCompare(b.event_date);
        if (dateCompare !== 0) return dateCompare;
        return a.id - b.id;
      }),
    [events],
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventsCalendarEvent[]>();

    for (const event of sortedEvents) {
      const key = event.event_date.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }

    return map;
  }, [sortedEvents]);

  const upcomingEvents = useMemo(() => {
    const future = sortedEvents.filter((event) => event.event_date >= todayKey);
    return future.length ? future : sortedEvents;
  }, [sortedEvents, todayKey]);

  const defaultDateKey = useMemo(
    () => upcomingEvents[0]?.event_date.slice(0, 10) ?? sortedEvents[0]?.event_date.slice(0, 10) ?? todayKey,
    [sortedEvents, todayKey, upcomingEvents],
  );

  const initialViewDate = useMemo(() => keyToDate(defaultDateKey), [defaultDateKey]);
  const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());
  const [activeDateKey, setActiveDateKey] = useState<string | null>(null);
  const [previewEvent, setPreviewEvent] = useState<EventsCalendarEvent | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    dateLabel: string;
    events: string[];
  } | null>(null);

  const selectedDateKey = activeDateKey ?? defaultDateKey;
  const selectedDateEvents = useMemo(
    () => eventsByDate.get(selectedDateKey) ?? [],
    [eventsByDate, selectedDateKey],
  );

  const sidebarEvents = activeDateKey ? selectedDateEvents : upcomingEvents.slice(0, 6);
  const selectedDateLabel = useMemo(() => formatLongDate(selectedDateKey), [selectedDateKey]);
  const monthLabel = useMemo(() => formatMonthLabel(viewYear, viewMonth), [viewYear, viewMonth]);
  const cells = useMemo(() => buildMonthCells(viewYear, viewMonth), [viewYear, viewMonth]);
  const mobileMonthCells = useMemo(() => {
    const visible = new Map<string, { day: number; key: string }>();

    for (const cell of cells) {
      if (!cell) continue;
      const hasEvents = (eventsByDate.get(cell.key)?.length ?? 0) > 0;
      if (hasEvents || cell.key === selectedDateKey || cell.key === todayKey) {
        visible.set(cell.key, cell);
      }
    }

    return [...visible.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [cells, eventsByDate, selectedDateKey, todayKey]);

  const monthEventCount = useMemo(
    () =>
      sortedEvents.filter((event) => {
        const eventDate = keyToDate(event.event_date.slice(0, 10));
        return eventDate.getFullYear() === viewYear && eventDate.getMonth() === viewMonth;
      }).length,
    [sortedEvents, viewMonth, viewYear],
  );

  const monthActiveDays = useMemo(() => {
    const keys = new Set<string>();

    for (const event of sortedEvents) {
      const eventDate = keyToDate(event.event_date.slice(0, 10));
      if (eventDate.getFullYear() === viewYear && eventDate.getMonth() === viewMonth) {
        keys.add(event.event_date.slice(0, 10));
      }
    }

    return keys.size;
  }, [sortedEvents, viewMonth, viewYear]);

  const focusedSummary = activeDateKey
    ? selectedDateEvents.length
      ? `${selectedDateEvents.length} event${selectedDateEvents.length === 1 ? '' : 's'} scheduled`
      : 'No events scheduled on this date'
    : `${upcomingEvents.length} event${upcomingEvents.length === 1 ? '' : 's'} ahead`;

  const focusDate = (key: string) => {
    const date = keyToDate(key);
    setActiveDateKey(key);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
  };

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
      return;
    }

    setViewMonth((month) => month - 1);
  };

  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
      return;
    }

    setViewMonth((month) => month + 1);
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setActiveDateKey(todayKey);
  };

  useEffect(() => {
    if (!previewEvent) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewEvent(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewEvent]);

  return (
    <section id="events" className="relative w-full px-6 pb-20 pt-6 md:px-10 md:pb-24 md:pt-8">
      <div className="mx-auto w-full max-w-7xl">
        {!hideIntro ? (
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-gold/85 text-xs font-semibold uppercase tracking-[0.24em]">Calendar workspace</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                Premium chapter scheduler
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-white/58 md:text-right">
              Click a date to focus the left rail, inspect the month at a glance, and open event previews from the
              activity list.
            </p>
          </div>
        ) : null}

        <div className="relative overflow-hidden rounded-[2rem] border border-gold/15 bg-[linear-gradient(145deg,rgba(15,11,18,0.92),rgba(8,8,11,0.94))] shadow-[0_32px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_70%)]" />
            <div className="absolute -left-12 top-1/4 h-60 w-60 rounded-full bg-maroon/18 blur-3xl" />
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02)_0%,transparent_42%,rgba(212,175,55,0.03)_100%)]" />
          </div>

          <div className="relative grid gap-6 p-4 md:p-6 lg:grid-cols-[minmax(17rem,0.92fr)_minmax(0,2.08fr)] lg:gap-8 lg:p-8">
            <aside className="order-2 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:order-1 lg:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-gold/80 text-[11px] font-semibold uppercase tracking-[0.24em]">
                    Upcoming Events
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                    {activeDateKey ? selectedDateLabel : 'Next scheduled moments'}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{focusedSummary}</p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold shadow-[0_0_24px_rgba(212,175,55,0.12)]">
                  <CalendarDays className="h-5 w-5" />
                </span>
              </div>

              <div className="my-5 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0.08),rgba(212,175,55,0.22),rgba(255,255,255,0.08))]" />

              {activeDateKey ? (
                <button
                  type="button"
                  onClick={() => setActiveDateKey(null)}
                  className="mb-4 inline-flex items-center rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold transition duration-300 hover:border-gold/45 hover:bg-gold/15"
                >
                  Show upcoming queue
                </button>
              ) : null}

              <div className="desktop-thin-scrollbar max-h-[24rem] space-y-3 overflow-y-auto pr-1 sm:max-h-[28rem] lg:max-h-[34rem]">
                <AnimatePresence initial={false} mode="popLayout">
                  {sidebarEvents.map((event, index) => {
                    const category = normalizeEventCategory(event.category);
                    const styles = EVENT_CATEGORY_STYLES[category];
                    const { icon: Icon, iconWrap } = getCategoryMeta(category);
                    const eventDateKey = event.event_date.slice(0, 10);
                    const shouldHideOnMobile = !activeDateKey && index >= 4;

                    return (
                      <motion.button
                        key={event.id}
                        layout
                        type="button"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ ...SPRING, delay: index * 0.02 }}
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ scale: 0.995 }}
                        onClick={() => {
                          focusDate(eventDateKey);
                          setPreviewEvent(event);
                        }}
                        className={`${shouldHideOnMobile ? 'hidden sm:block ' : ''}group w-full rounded-[1.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(14,14,18,0.78),rgba(12,11,15,0.94))] p-4 text-left shadow-[0_16px_32px_rgba(0,0,0,0.18)] transition duration-300 hover:border-gold/35 hover:shadow-[0_22px_48px_rgba(115,14,27,0.22)]`}
                      >
                        <div className="flex items-start gap-3.5">
                          <span
                            className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${iconWrap} shadow-[0_0_20px_rgba(255,255,255,0.02)]`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="line-clamp-2 text-sm font-semibold leading-6 text-white transition group-hover:text-gold/95">
                                {event.title}
                              </p>
                              <span
                                className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${styles.tag}`}
                              >
                                {EVENT_CATEGORY_LABELS[category]}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/55">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5 text-gold/80" />
                                {formatShortDate(eventDateKey)}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 className="h-3.5 w-3.5 text-gold/80" />
                                {formatEventTime(event.event_time)}
                              </span>
                            </div>

                            {event.location ? (
                              <div className="mt-2 flex items-center gap-1.5 text-xs text-white/45">
                                <MapPin className="h-3.5 w-3.5 text-gold/70" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            ) : null}

                            <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-white/35">
                              <span className={`h-2 w-2 rounded-full ${styles.dot} ${styles.glow}`} />
                              Open preview
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>

                {sidebarEvents.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-dashed border-white/12 bg-black/20 px-5 py-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-base font-semibold text-white">No events on this date</p>
                    <p className="mt-2 text-sm leading-6 text-white/48">
                      {selectedDateLabel} is currently open. Jump back to the next scheduled queue.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveDateKey(null)}
                      className="mt-5 inline-flex items-center rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition duration-300 hover:border-gold/45 hover:bg-gold/15"
                    >
                      View upcoming events
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 hidden border-t border-white/8 pt-4 sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">Categories</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(['important', 'formal', 'activity'] as EventCategory[]).map((category) => {
                    const styles = EVENT_CATEGORY_STYLES[category];
                    const { icon: Icon } = getCategoryMeta(category);

                    return (
                      <span
                        key={category}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${styles.tag}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {EVENT_CATEGORY_LABELS[category]}
                      </span>
                    );
                  })}
                </div>
              </div>
            </aside>

            <div className="order-1 min-w-0 lg:order-2">
              <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-6">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                      <p className="text-gold/80 text-[11px] font-semibold uppercase tracking-[0.24em]">
                        Interactive Calendar
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={goPrev}
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-white/70 transition duration-300 hover:border-gold/30 hover:bg-gold/10 hover:text-gold"
                            aria-label="Previous month"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </button>

                          <div className="min-w-0">
                            <AnimatePresence mode="wait">
                              <motion.h3
                                key={`${viewYear}-${viewMonth}`}
                                initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                                transition={{ duration: 0.26, ease: EASE }}
                                className="text-center text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl md:text-3xl"
                              >
                                {monthLabel}
                              </motion.h3>
                            </AnimatePresence>
                            <p className="mt-1 text-center text-xs text-white/48 sm:text-sm">
                              {monthEventCount} event{monthEventCount === 1 ? '' : 's'} across {monthActiveDays} active
                              day{monthActiveDays === 1 ? '' : 's'}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={goNext}
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-white/70 transition duration-300 hover:border-gold/30 hover:bg-gold/10 hover:text-gold"
                            aria-label="Next month"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={goToday}
                        className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition duration-300 hover:border-gold/50 hover:bg-gold/15"
                      >
                        Today
                      </button>
                      <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/58 sm:block">
                        Focused: <span className="font-semibold text-white">{selectedDateLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:hidden">
                    <div className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/58">
                      <span className="font-semibold text-white">{monthEventCount}</span> event
                      {monthEventCount === 1 ? '' : 's'} this month
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/58">
                      <span className="font-semibold text-white">{monthActiveDays}</span> active day
                      {monthActiveDays === 1 ? '' : 's'}
                    </div>
                  </div>

                  <div className="hidden gap-3 sm:grid sm:grid-cols-3">
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">Month overview</p>
                      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">{monthEventCount}</p>
                      <p className="mt-2 text-sm text-white/48">Scheduled sessions, ceremonies, and service work.</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">Focused date</p>
                      <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-white">{formatShortDate(selectedDateKey)}</p>
                      <p className="mt-2 text-sm text-white/48">{focusedSummary}</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">Interaction</p>
                      <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-white">Select any date</p>
                      <p className="mt-2 text-sm text-white/48">The left rail updates instantly and event cards open a preview modal.</p>
                    </div>
                  </div>

                  <div className="hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(6,6,8,0.38),rgba(6,6,8,0.16))] p-4 md:block">
                    <div className="mb-3 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-white/34">
                      {WEEKDAYS.map((weekday) => (
                        <div key={weekday} className="px-1 py-2">
                          {weekday}
                        </div>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${viewYear}-${viewMonth}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.24, ease: EASE }}
                        className="grid grid-cols-7 gap-2"
                      >
                        {cells.map((cell, index) => {
                          if (!cell) {
                            return (
                              <div
                                key={`empty-${viewYear}-${viewMonth}-${index}`}
                                className="aspect-[0.94] min-h-[7.25rem] rounded-[1.15rem] border border-transparent bg-transparent"
                              />
                            );
                          }

                          const dayEvents = eventsByDate.get(cell.key) ?? [];
                          const isToday = cell.key === todayKey;
                          const isSelected = cell.key === selectedDateKey;
                          const hasEvents = dayEvents.length > 0;

                          const uniqueCategories = Array.from(
                            new Set(dayEvents.map((event) => normalizeEventCategory(event.category))),
                          ) as EventCategory[];

                          return (
                            <motion.button
                              key={cell.key}
                              type="button"
                              whileHover={{ y: -4, scale: 1.012 }}
                              whileTap={{ scale: 0.995 }}
                              transition={{ duration: 0.22, ease: EASE }}
                              onClick={() => focusDate(cell.key)}
                              onMouseEnter={(event) => {
                                if (!hasEvents) return;
                                setTooltip({
                                  x: event.clientX + 16,
                                  y: event.clientY + 16,
                                  dateLabel: formatLongDate(cell.key),
                                  events: dayEvents.map((item) => item.title),
                                });
                              }}
                              onMouseMove={(event) => {
                                if (!hasEvents) return;
                                setTooltip({
                                  x: event.clientX + 16,
                                  y: event.clientY + 16,
                                  dateLabel: formatLongDate(cell.key),
                                  events: dayEvents.map((item) => item.title),
                                });
                              }}
                              onMouseLeave={() => setTooltip(null)}
                              className={`relative flex aspect-[0.94] min-h-[7.25rem] flex-col justify-between overflow-hidden rounded-[1.15rem] border p-3 text-left transition duration-300 ${
                                isSelected
                                  ? 'border-gold/75 bg-[linear-gradient(180deg,rgba(212,175,55,0.14),rgba(72,46,14,0.08)_34%,rgba(11,10,14,0.96))] shadow-[0_0_0_1px_rgba(212,175,55,0.28),0_20px_36px_rgba(115,14,27,0.18)]'
                                  : hasEvents
                                    ? 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(10,10,13,0.92))] hover:border-gold/35 hover:bg-[linear-gradient(180deg,rgba(212,175,55,0.08),rgba(11,10,14,0.95))]'
                                    : 'border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(10,10,13,0.82))] hover:border-white/12'
                              }`}
                            >
                              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_52%)]" />

                              <div className="relative flex items-start justify-between gap-3">
                                <span
                                  className={`text-sm font-semibold ${
                                    isSelected ? 'text-gold' : isToday ? 'text-gold/95' : 'text-white/86'
                                  }`}
                                >
                                  {cell.day}
                                </span>
                                {hasEvents ? (
                                  <span className="inline-flex min-w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/58">
                                    {dayEvents.length}
                                  </span>
                                ) : null}
                              </div>

                              <div className="relative mt-3 min-h-[3.5rem] space-y-1.5">
                                {dayEvents.slice(0, 2).map((event) => {
                                  const category = normalizeEventCategory(event.category);
                                  const styles = EVENT_CATEGORY_STYLES[category];

                                  return (
                                    <div
                                      key={event.id}
                                      className={`truncate rounded-xl border px-2 py-1 text-[10px] font-medium ${styles.tag}`}
                                    >
                                      {event.title}
                                    </div>
                                  );
                                })}
                                {dayEvents.length > 2 ? (
                                  <p className="text-[10px] font-medium text-white/35">+{dayEvents.length - 2} more</p>
                                ) : null}
                              </div>

                              <div className="relative mt-4 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  {uniqueCategories.slice(0, 3).map((category) => {
                                    const styles = EVENT_CATEGORY_STYLES[category];

                                    return (
                                      <span
                                        key={`${cell.key}-${category}`}
                                        className={`h-2.5 w-2.5 rounded-full ${styles.dot} ${styles.glow}`}
                                      />
                                    );
                                  })}
                                </div>
                                {isToday ? (
                                  <span className="rounded-full border border-gold/25 bg-gold/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">
                                    Today
                                  </span>
                                ) : null}
                              </div>
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="md:hidden">
                    <div className="space-y-3">
                      {mobileMonthCells.length === 0 ? (
                        <div className="rounded-[1.2rem] border border-dashed border-white/10 bg-black/20 px-4 py-6 text-center">
                          <p className="text-sm font-semibold text-white">No active dates this month</p>
                          <p className="mt-2 text-xs leading-6 text-white/48">
                            Use the month navigation to explore other schedules.
                          </p>
                        </div>
                      ) : null}

                      {mobileMonthCells.map((cell) => {
                          const dayEvents = eventsByDate.get(cell.key) ?? [];
                          const isSelected = cell.key === selectedDateKey;
                          const isToday = cell.key === todayKey;

                          return (
                            <button
                              key={cell.key}
                              type="button"
                              onClick={() => focusDate(cell.key)}
                              className={`w-full rounded-[1.2rem] border p-3.5 text-left transition duration-300 ${
                                isSelected
                                  ? 'border-gold/60 bg-gold/10 shadow-[0_18px_34px_rgba(115,14,27,0.18)]'
                                  : 'border-white/10 bg-black/20'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-white">{formatLongDate(cell.key)}</p>
                                  <p className="mt-1 text-xs text-white/48">
                                    {dayEvents.length
                                      ? `${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'} scheduled`
                                      : 'No events scheduled'}
                                  </p>
                                </div>
                                {isToday ? (
                                  <span className="rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">
                                    Today
                                  </span>
                                ) : null}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {tooltip && tooltip.events.length > 0 ? (
        <div
          className="pointer-events-none fixed z-[92] hidden max-w-xs rounded-2xl border border-gold/25 bg-[rgba(8,8,10,0.94)] px-4 py-3 text-sm text-white shadow-[0_24px_48px_rgba(0,0,0,0.3)] backdrop-blur-xl md:block"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="text-gold text-[11px] font-semibold uppercase tracking-[0.18em]">Calendar preview</p>
          <p className="mt-2 font-semibold text-white">{tooltip.dateLabel}</p>
          <div className="mt-3 space-y-1.5 text-xs text-white/65">
            {tooltip.events.slice(0, 4).map((eventTitle) => (
              <div key={eventTitle} className="truncate">
                {eventTitle}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {previewEvent ? (
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="event-preview-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="fixed inset-0 z-[86] flex items-center justify-center bg-black/72 p-4 backdrop-blur-md"
            onClick={() => setPreviewEvent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.24, ease: EASE }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-gold/25 bg-[linear-gradient(160deg,rgba(18,14,24,0.96),rgba(8,8,11,0.98))] p-6 shadow-[0_36px_90px_rgba(0,0,0,0.46)] backdrop-blur-2xl md:p-7"
            >
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gold/12 blur-3xl" />
                <div className="absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-maroon/22 blur-3xl" />
              </div>

              {(() => {
                const category = normalizeEventCategory(previewEvent.category);
                const styles = EVENT_CATEGORY_STYLES[category];
                const { icon: Icon, iconWrap } = getCategoryMeta(category);

                return (
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${iconWrap}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${styles.tag}`}
                          >
                            {EVENT_CATEGORY_LABELS[category]}
                          </span>
                          <h3
                            id="event-preview-title"
                            className="mt-4 max-w-lg text-2xl font-semibold leading-tight tracking-[-0.03em] text-white"
                          >
                            {previewEvent.title}
                          </h3>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPreviewEvent(null)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/65 transition duration-300 hover:border-gold/30 hover:text-gold"
                        aria-label="Close preview"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.15rem] border border-white/10 bg-black/20 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">Date</p>
                        <div className="mt-3 flex items-center gap-2 text-sm text-white/82">
                          <CalendarDays className="h-4 w-4 text-gold" />
                          {formatLongDate(previewEvent.event_date.slice(0, 10))}
                        </div>
                      </div>
                      <div className="rounded-[1.15rem] border border-white/10 bg-black/20 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">Time</p>
                        <div className="mt-3 flex items-center gap-2 text-sm text-white/82">
                          <Clock3 className="h-4 w-4 text-gold" />
                          {formatEventTime(previewEvent.event_time)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-[1.15rem] border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">Location</p>
                      <div className="mt-3 flex items-center gap-2 text-sm text-white/82">
                        <MapPin className="h-4 w-4 text-gold" />
                        {previewEvent.location || 'Location to be announced'}
                      </div>
                    </div>

                    <div className="mt-3 rounded-[1.15rem] border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">Overview</p>
                      <p className="mt-3 text-sm leading-7 text-white/68">
                        {previewEvent.description?.trim() || 'More information for this event will be shared soon.'}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
