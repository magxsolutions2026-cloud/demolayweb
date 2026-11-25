import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Clock, MapPin, Newspaper } from 'lucide-react';
import { formatNewsDateLabel } from '@/lib/formatNewsDate';
import type { HomeEvent, HomeNews } from '@/lib/homeData';
import SectionHeading from './SectionHeading';

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

/** 'YYYY-MM-DD' parsed as a UTC calendar date so the day never shifts by timezone. */
function calendarDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTime(value: string) {
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h)) return value;
  const hour = ((h + 11) % 12) + 1;
  return `${hour}:${String(m || 0).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

/** "What's happening": the next event large, the following ones listed, and the latest news. */
export default function HomeHappenings({ events, news }: { events: HomeEvent[]; news: HomeNews[] }) {
  const [next, ...later] = events;
  const nextDate = next ? calendarDate(next.event_date) : null;

  return (
    <section id="feed" className="home-section scroll-mt-24" aria-labelledby="happenings-heading">
      <div className="home-container">
        <div className="reveal flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="happenings-heading"
            eyebrow="What's happening"
            title="Life in the chapter."
            subtitle="Upcoming events and the latest news from T. De Leon Chapter No. 47."
          />
          <div className="flex gap-6 text-sm">
            <Link href="/events" className="inline-flex items-center gap-1.5 text-gold transition hover:text-amber-200">
              All events <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/news" className="inline-flex items-center gap-1.5 text-gold transition hover:text-amber-200">
              All news <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          {/* Next event */}
          <article className="reveal glass flex flex-col rounded-[var(--frame-radius)] p-6 md:p-8">
            {next && nextDate ? (
              <div className="relative z-10 flex h-full flex-col">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-gold/80">Next event</p>
                <div className="mt-6 flex items-start gap-5">
                  <div className="flex w-20 shrink-0 flex-col items-center rounded-2xl border border-gold/30 bg-gold/10 py-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                      {monthFormatter.format(nextDate)}
                    </span>
                    <span className="font-serif text-4xl font-bold leading-none text-foreground">
                      {nextDate.getUTCDate()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-2xl font-bold leading-tight text-foreground md:text-3xl">{next.title}</h3>
                    <ul className="mt-3 space-y-1.5 text-sm text-foreground/65">
                      <li className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gold/80" aria-hidden />
                        {longDateFormatter.format(nextDate)}
                      </li>
                      {next.event_time ? (
                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gold/80" aria-hidden />
                          {formatTime(next.event_time)}
                        </li>
                      ) : null}
                      {next.location ? (
                        <li className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gold/80" aria-hidden />
                          {next.location}
                        </li>
                      ) : null}
                    </ul>
                  </div>
                </div>
                {next.description ? (
                  <p className="mt-6 line-clamp-3 text-sm leading-relaxed text-foreground/70">{next.description}</p>
                ) : null}

                {later.length ? (
                  <ul className="mt-6 divide-y divide-foreground/10 border-t border-foreground/10">
                    {later.map((event) => {
                      const date = calendarDate(event.event_date);
                      return (
                        <li key={event.id} className="flex items-center gap-4 py-3 text-sm">
                          <span className="w-14 shrink-0 font-mono text-xs uppercase tracking-[0.14em] text-gold/80">
                            {date ? `${monthFormatter.format(date)} ${date.getUTCDate()}` : event.event_date}
                          </span>
                          <span className="truncate text-foreground/80">{event.title}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}

                <div className="mt-auto pt-8">
                  <Link href="/events" className="cta-ghost text-sm uppercase tracking-[0.18em]">
                    View calendar
                  </Link>
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex h-full flex-col items-start justify-center py-6">
                <CalendarDays className="h-8 w-8 text-gold/70" aria-hidden />
                <h3 className="font-serif mt-4 text-2xl font-bold text-foreground">No upcoming events yet.</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/60">
                  New meetings, ceremonies and service projects are posted here first. Subscribe to the newsletter to
                  hear about them.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="#newsletter" className="cta-ghost text-sm uppercase tracking-[0.18em]">
                    Get updates
                  </Link>
                  <Link href="/events" className="cta-ghost text-sm uppercase tracking-[0.18em]">
                    Past events
                  </Link>
                </div>
              </div>
            )}
          </article>

          {/* Latest news */}
          <div className="flex flex-col gap-4">
            {news.length ? (
              news.map((item) => (
                <Link
                  key={item.id}
                  href="/news"
                  className="reveal glass group flex gap-5 rounded-[var(--frame-radius)] p-4"
                >
                  <div className="relative z-10 h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-gold/20 bg-gold/5">
                    {item.image_urls[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element -- remote storage URLs
                      <img src={item.image_urls[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-gold/60">
                        <Newspaper className="h-7 w-7" aria-hidden />
                      </span>
                    )}
                  </div>
                  <div className="relative z-10 min-w-0 py-1">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-gold/75">
                      {formatNewsDateLabel(item.published_at)}
                    </p>
                    <h3 className="mt-1.5 line-clamp-2 font-semibold leading-snug text-foreground transition group-hover:text-gold">
                      {item.title}
                    </h3>
                    {item.summary ? (
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-foreground/60">{item.summary}</p>
                    ) : null}
                  </div>
                </Link>
              ))
            ) : (
              <div className="reveal glass flex h-full flex-col items-start justify-center rounded-[var(--frame-radius)] p-8">
                <Newspaper className="relative z-10 h-8 w-8 text-gold/70" aria-hidden />
                <h3 className="font-serif relative z-10 mt-4 text-2xl font-bold text-foreground">News is on the way.</h3>
                <p className="relative z-10 mt-2 max-w-sm text-sm leading-relaxed text-foreground/60">
                  Chapter announcements and stories will appear here as soon as they are published.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
