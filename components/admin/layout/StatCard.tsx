'use client';

import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react';

export type StatTone = 'gold' | 'emerald' | 'maroon' | 'sky';

const toneClasses: Record<StatTone, { icon: string; ring: string; glow: string }> = {
  gold: {
    icon: 'text-gold',
    ring: 'border-gold/20 bg-gold/10',
    glow: 'from-gold/12',
  },
  emerald: {
    icon: 'text-emerald-400',
    ring: 'border-emerald-400/20 bg-emerald-400/10',
    glow: 'from-emerald-400/10',
  },
  maroon: {
    icon: 'text-rose-400',
    ring: 'border-rose-400/20 bg-rose-400/10',
    glow: 'from-rose-400/10',
  },
  sky: {
    icon: 'text-sky-400',
    ring: 'border-sky-400/20 bg-sky-400/10',
    glow: 'from-sky-400/10',
  },
};

function sparklinePoints(values: number[], width = 112, height = 34) {
  if (values.length === 0) return `0,${height / 2} ${width},${height / 2}`;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : width;

  return values
    .map((value, index) => {
      const x = values.length > 1 ? index * step : width / 2;
      const y = height - 3 - ((value - min) / span) * (height - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  spark,
  tone = 'gold',
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  spark?: number[];
  tone?: StatTone;
}) {
  const classes = toneClasses[tone];
  const isUp = typeof trend === 'number' && trend > 0;
  const isDown = typeof trend === 'number' && trend < 0;
  const TrendIcon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus;

  return (
    <article className="admin-panel group relative min-w-0 overflow-hidden rounded-2xl p-4 transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.14]">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b to-transparent opacity-80 ${classes.glow}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white/90 tabular-nums sm:text-3xl">{value}</p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${classes.ring} ${classes.icon}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>

      <div className="relative mt-4 flex items-end justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {typeof trend === 'number' ? (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                isUp
                  ? 'bg-emerald-400/10 text-emerald-300'
                  : isDown
                    ? 'bg-rose-400/10 text-rose-300'
                    : 'bg-white/[0.06] text-white/45'
              }`}
            >
              <TrendIcon className="h-3 w-3" aria-hidden />
              {Math.abs(trend)}%
            </span>
          ) : null}
          {trendLabel ? <span className="truncate text-[11px] text-white/35">{trendLabel}</span> : null}
        </div>
        {spark ? (
          <svg className="h-8 w-24 shrink-0 overflow-visible" viewBox="0 0 112 34" fill="none" aria-hidden>
            <polyline points={sparklinePoints(spark)} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={classes.icon} opacity="0.8" />
          </svg>
        ) : null}
      </div>
    </article>
  );
}
