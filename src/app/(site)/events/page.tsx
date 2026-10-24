import EventsCalendarSection from '@/components/EventsCalendarSection';
import { query } from '@/lib/db';
import { normalizeEventCategory } from '@/lib/eventCategory';
import { formatSqlDate } from '@/lib/formatDb';

export const dynamic = 'force-dynamic';

interface EventItem {
  id: number;
  title: string;
  event_date: string;
  event_time: string;
  location: string;
  description?: string;
  category?: string;
}

async function fetchEvents() {
  try {
    return await query<EventItem>(
      'SELECT id, title, event_date, event_time, location, description, category FROM events ORDER BY event_date ASC, id ASC',
    );
  } catch {
    return [];
  }
}

export default async function EventsPage() {
  const raw = await fetchEvents();
  const events = raw.map((e) => ({
    ...e,
    event_date: formatSqlDate(e.event_date),
  }));
  const todayKey = formatSqlDate(new Date());
  const upcomingEvents = events.filter((event) => event.event_date >= todayKey);
  const visibleUpcoming = upcomingEvents.length ? upcomingEvents : events;
  const nextEvent = visibleUpcoming[0] ?? null;

  const categoryCounts = events.reduce(
    (acc, event) => {
      const category = normalizeEventCategory(event.category);
      acc[category] += 1;
      return acc;
    },
    { important: 0, formal: 0, activity: 0 },
  );

  return (
    <main className="relative overflow-hidden pb-20 pt-20 sm:pb-24 sm:pt-24 md:pb-28 md:pt-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem]" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top_left,rgba(115,14,27,0.26),transparent_44%),radial-gradient(circle_at_top_right,rgba(212,175,55,0.12),transparent_36%),linear-gradient(180deg,rgba(8,7,10,0.1),transparent_74%)]" />
      </div>

      <div className="mx-auto mb-6 max-w-7xl px-6 md:mb-8 md:px-10">
        <section className="relative overflow-hidden rounded-[1.6rem] border border-gold/18 bg-[linear-gradient(145deg,rgba(14,11,18,0.9),rgba(8,8,11,0.96))] p-5 shadow-[0_36px_110px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-7 md:p-10">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_72%)]" />
            <div className="absolute -left-12 top-16 h-56 w-56 rounded-full bg-maroon/20 blur-3xl" />
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_38%,rgba(212,175,55,0.04)_100%)]" />
          </div>

          <div className="relative grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.95fr)] lg:items-end">
            <div>
              <span className="inline-flex rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                Calendar Dashboard
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:mt-6 sm:text-4xl md:text-6xl">Events</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68 sm:mt-4 sm:text-base sm:leading-7 md:text-lg">
                Chapter activities, ceremonial nights, and service projects in one premium planning workspace.
                Browse the month, focus any date, and inspect upcoming events without losing context.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#FFD700]/35 bg-[#FFD700]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#FFD700]">
                  <span className="h-2 w-2 rounded-full bg-[#FFD700]" />
                  Important
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-red-200">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  Formal
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">
                  <span className="h-2 w-2 rounded-full bg-orange-400" />
                  Activity
                </span>
              </div>
            </div>

            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:hidden">
              <div className="min-w-[10.5rem] rounded-[1.15rem] border border-white/10 bg-black/20 p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">Queued</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{visibleUpcoming.length}</p>
                <p className="mt-1.5 text-xs leading-5 text-white/48">Upcoming moments in the scheduler.</p>
              </div>
              <div className="min-w-[12rem] rounded-[1.15rem] border border-white/10 bg-black/20 p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">Next event</p>
                <p className="mt-2 text-sm font-semibold leading-5 text-white">
                  {nextEvent ? nextEvent.title : 'No event scheduled yet'}
                </p>
                <p className="mt-1.5 text-xs leading-5 text-white/48">
                  {nextEvent ? `${nextEvent.event_date} · ${nextEvent.event_time}` : 'Add a new chapter activity to get started.'}
                </p>
              </div>
              <div className="min-w-[12rem] rounded-[1.15rem] border border-white/10 bg-black/20 p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">Category mix</p>
                <p className="mt-2 text-sm font-semibold leading-5 text-white">
                  {categoryCounts.important} important · {categoryCounts.formal} formal
                </p>
                <p className="mt-1.5 text-xs leading-5 text-white/48">{categoryCounts.activity} activity events in the queue.</p>
              </div>
            </div>

            <div className="hidden gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/38">Queued events</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{visibleUpcoming.length}</p>
                <p className="mt-2 text-sm text-white/48">Upcoming moments currently visible in the scheduler.</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/38">Next event</p>
                <p className="mt-3 text-base font-semibold leading-6 text-white">
                  {nextEvent ? nextEvent.title : 'No event scheduled yet'}
                </p>
                <p className="mt-2 text-sm text-white/48">
                  {nextEvent ? `${nextEvent.event_date} · ${nextEvent.event_time}` : 'Add a new chapter activity to get started.'}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/38">Category mix</p>
                <p className="mt-3 text-base font-semibold leading-6 text-white">
                  {categoryCounts.important} important · {categoryCounts.formal} formal · {categoryCounts.activity} activity
                </p>
                <p className="mt-2 text-sm text-white/48">Clear color-coding keeps the chapter calendar easy to scan.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <EventsCalendarSection events={events} hideIntro />
    </main>
  );
}
