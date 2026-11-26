'use client';

import { CalendarDays, Check, ChevronRight, Mail, ShieldCheck, Timer, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAdminData } from '@/components/admin/AdminDataProvider';
import { ADMIN_BASE } from '@/components/admin/shell/nav';
import { ApprovalRing } from '@/components/admin/ui/ApprovalRing';
import { KpiTile } from '@/components/admin/ui/KpiTile';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { StatusChip, toneFor } from '@/components/admin/ui/StatusChip';
import { formatSqlDate } from '@/lib/formatDb';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { ActivityChart } from './ActivityChart';

const DAY_MS = 24 * 60 * 60 * 1000;

function todayYmd() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date());
}

function TileHead({ title, sub, href, linkLabel }: { title: string; sub: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <p className="cs-tile-title">{title}</p>
        <p className="cs-tile-sub">{sub}</p>
      </div>
      {href ? (
        <Link href={href} className="cs-btn cs-btn-ghost cs-btn-sm shrink-0">
          {linkLabel ?? 'View all'} <ChevronRight />
        </Link>
      ) : null}
    </div>
  );
}

export function OverviewSection() {
  const { username, landing, petitioners, subscribers, events, news, setPetitionerStatus } = useAdminData();

  const [now] = useState(() => Date.now());
  const stats = useMemo(() => {
    const status = (s: string) => petitioners.filter((p) => p.status.toLowerCase() === s);
    const pending = status('pending').sort(
      (a, b) => new Date(b.submitted_at ?? 0).getTime() - new Date(a.submitted_at ?? 0).getTime(),
    );
    const approved = status('approved').length;
    const declined = status('declined').length;
    const today = todayYmd();
    const upcoming = events
      .filter((e) => formatSqlDate(e.event_date) >= today)
      .sort((a, b) => formatSqlDate(a.event_date).localeCompare(formatSqlDate(b.event_date)));
    const weekAgo = now - 7 * DAY_MS;
    const newSubs = subscribers.filter((s) => new Date(s.date_subscribed).getTime() >= weekAgo).length;
    return { pending, approved, declined, upcoming, newSubs };
  }, [petitioners, events, subscribers, now]);

  const firstName = username.trim().split(/\s+/)[0] || username;
  const published = news.filter((n) => n.is_published).length;

  return (
    <>
      <PageHeader
        kicker={`Overview · ${landing.hero?.title?.trim() || 'T. De Leon Chapter No. 47'}`}
        title={`Welcome back, ${firstName}`}
        lead="Here is what needs you today, and how the chapter is doing."
        meta={
          <>
            <StatusChip tone="green">Live</StatusChip>
            <StatusChip tone={stats.pending.length ? 'amber' : 'muted'}>{stats.pending.length} awaiting review</StatusChip>
            <StatusChip tone="muted">{published} news published</StatusChip>
          </>
        }
        actions={
          <>
            <Link href={`${ADMIN_BASE}/news?new=1`} className="cs-btn cs-btn-ghost">
              New post
            </Link>
            <Link href={`${ADMIN_BASE}/events?new=1`} className="cs-btn cs-btn-primary">
              New event
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-12">
        <div className="xl:col-span-3">
          <KpiTile
            label="Awaiting review"
            value={stats.pending.length}
            note="Petitions to approve or decline"
            icon={Timer}
            color="var(--cs-amber)"
            href={`${ADMIN_BASE}/members?status=pending`}
          />
        </div>
        <div className="xl:col-span-3">
          <KpiTile
            label="Sir Knights"
            value={stats.approved}
            note="Approved members"
            icon={ShieldCheck}
            href={`${ADMIN_BASE}/members?status=approved`}
          />
        </div>
        <div className="xl:col-span-3">
          <KpiTile
            label="Upcoming events"
            value={stats.upcoming.length}
            note={`${events.length} on the calendar`}
            icon={CalendarDays}
            color="#e0566b"
            href={`${ADMIN_BASE}/events?when=upcoming`}
          />
        </div>
        <div className="xl:col-span-3">
          <KpiTile
            label="Subscribers"
            value={subscribers.length}
            note={`+${stats.newSubs} this week`}
            icon={Mail}
            color="var(--cs-green)"
            href={`${ADMIN_BASE}/subscribers`}
          />
        </div>

        <section className="cs-tile p-5 sm:col-span-2 xl:col-span-8">
          <TileHead
            title="Needs review"
            sub="Newest membership petitions. Approving emails the parent consent form."
            href={`${ADMIN_BASE}/members?status=pending`}
          />
          {stats.pending.length === 0 ? (
            <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-white/10 py-10 text-center">
              <Check className="h-7 w-7 text-[var(--cs-green)]" />
              <p className="text-sm text-white/70">All caught up. No petitions are waiting.</p>
            </div>
          ) : (
            <ul className="grid gap-2">
              {stats.pending.slice(0, 5).map((p) => (
                <li key={p.id} className="cs-mini">
                  <span className="cs-avatar-sm">{p.name.trim().charAt(0).toUpperCase() || '?'}</span>
                  <Link href={`${ADMIN_BASE}/members?status=pending&open=${p.id}`} className="min-w-0 flex-1 hover:text-gold">
                    <span className="block truncate text-sm font-medium">{p.name}</span>
                    <span className="block truncate text-xs text-white/45">
                      {p.school || 'No school given'} · age {p.age} · {formatRelativeTime(p.submitted_at)}
                    </span>
                  </Link>
                  <button
                    type="button"
                    className="cs-btn cs-btn-ok cs-btn-sm"
                    onClick={() => void setPetitionerStatus([p.id], 'Approved')}
                  >
                    <Check /> <span className="hidden sm:inline">Approve</span>
                  </button>
                  <button
                    type="button"
                    className="cs-btn cs-btn-danger cs-btn-sm"
                    onClick={() => void setPetitionerStatus([p.id], 'Declined')}
                    aria-label={`Decline ${p.name}`}
                  >
                    <X />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="cs-tile flex flex-col p-5 sm:col-span-2 xl:col-span-4">
          <TileHead title="Approval rate" sub="Approved out of all decided petitions" />
          <div className="flex flex-1 flex-wrap items-center justify-around gap-5">
            <ApprovalRing value={stats.approved} total={stats.approved + stats.declined} label="Approved" />
            <dl className="grid gap-3 text-sm">
              {[
                { label: 'Approved', value: stats.approved, tone: 'gold' as const },
                { label: 'Declined', value: stats.declined, tone: 'red' as const },
                { label: 'Pending', value: stats.pending.length, tone: 'amber' as const },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-6">
                  <dt>
                    <StatusChip tone={row.tone}>{row.label}</StatusChip>
                  </dt>
                  <dd className="font-[family-name:var(--font-display)] text-lg font-bold tabular-nums">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="cs-tile p-5 sm:col-span-2 xl:col-span-8">
          <TileHead title="Activity" sub="Petitions and newsletter signups per week" />
          <ActivityChart
            petitionDates={petitioners.map((p) => p.submitted_at)}
            subscriberDates={subscribers.map((s) => s.date_subscribed)}
          />
        </section>

        <section className="cs-tile p-5 sm:col-span-2 xl:col-span-4">
          <TileHead title="Upcoming" sub="Next events on the calendar" href={`${ADMIN_BASE}/events`} linkLabel="Events" />
          {stats.upcoming.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 py-8 text-center text-sm text-white/50">
              Nothing scheduled.{' '}
              <Link href={`${ADMIN_BASE}/events?new=1`} className="text-gold hover:underline">
                Add an event
              </Link>
            </p>
          ) : (
            <ul className="grid gap-2">
              {stats.upcoming.slice(0, 4).map((e) => {
                const d = new Date(`${formatSqlDate(e.event_date)}T00:00:00`);
                return (
                  <li key={e.id}>
                    <Link href={`${ADMIN_BASE}/events?edit=${e.id}`} className="cs-mini hover:!shadow-[inset_0_0_0_1px_var(--cs-edge)]">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[image:var(--cs-grad)] text-[#140a0c]">
                        <span className="text-center leading-none">
                          <span className="block font-mono text-[9px] uppercase">
                            {d.toLocaleDateString('en-PH', { month: 'short' })}
                          </span>
                          <span className="block font-[family-name:var(--font-display)] text-base font-extrabold">
                            {d.getDate()}
                          </span>
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{e.title}</span>
                        <span className="block truncate text-xs text-white/45">
                          {e.event_time} · {e.location}
                        </span>
                      </span>
                      {e.category ? <StatusChip tone={toneFor(e.category)}>{e.category}</StatusChip> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
