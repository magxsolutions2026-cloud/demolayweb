'use client';

import { motion } from 'framer-motion';
import { Calendar, ClipboardList, Mail, Newspaper, Shield, type LucideIcon, Users } from 'lucide-react';

type StatItem = { label: string; value: number };

type StatPreset = {
  icon: LucideIcon;
  note: string;
  glowClass: string;
  iconShellClass: string;
  progressClass: string;
};

const statPresets: Record<string, StatPreset> = {
  events: {
    icon: Calendar,
    note: 'Calendar items in the chapter pipeline',
    glowClass: 'from-amber-400/18 via-gold/10 to-transparent',
    iconShellClass: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
    progressClass: 'from-amber-300 via-gold to-gold/55',
  },
  officers: {
    icon: Users,
    note: 'Visible leadership roster entries',
    glowClass: 'from-sky-400/18 via-cyan-400/10 to-transparent',
    iconShellClass: 'border-sky-300/25 bg-sky-300/10 text-sky-200',
    progressClass: 'from-sky-300 via-cyan-300 to-cyan-400/55',
  },
  news: {
    icon: Newspaper,
    note: 'Published updates and announcements',
    glowClass: 'from-rose-400/18 via-maroon/12 to-transparent',
    iconShellClass: 'border-rose-300/25 bg-rose-300/10 text-rose-200',
    progressClass: 'from-rose-300 via-rose-400 to-maroon/60',
  },
  'sir knights': {
    icon: Shield,
    note: 'Approved members in the chapter list',
    glowClass: 'from-emerald-400/18 via-emerald-300/10 to-transparent',
    iconShellClass: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-200',
    progressClass: 'from-emerald-300 via-emerald-400 to-emerald-500/60',
  },
  petitioners: {
    icon: ClipboardList,
    note: 'Open applications waiting on action',
    glowClass: 'from-violet-400/18 via-fuchsia-300/10 to-transparent',
    iconShellClass: 'border-violet-300/25 bg-violet-300/10 text-violet-200',
    progressClass: 'from-violet-300 via-fuchsia-300 to-fuchsia-400/55',
  },
  subscribers: {
    icon: Mail,
    note: 'Newsletter audience collected so far',
    glowClass: 'from-gold/22 via-yellow-300/10 to-transparent',
    iconShellClass: 'border-gold/25 bg-gold/10 text-gold',
    progressClass: 'from-gold via-yellow-300 to-yellow-200/60',
  },
};

const fallbackPreset: StatPreset = {
  icon: Calendar,
  note: 'Tracked live in the admin dashboard',
  glowClass: 'from-gold/18 via-white/8 to-transparent',
  iconShellClass: 'border-gold/20 bg-gold/10 text-gold',
  progressClass: 'from-gold via-gold/80 to-gold/35',
};

function normalizeLabel(label: string) {
  return label.trim().toLowerCase();
}

export function AdminStatsCards({
  items,
}: {
  items: StatItem[];
}) {
  const total = items.reduce((sum, item) => sum + Math.max(item.value, 0), 0);

  return (
    <section className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6 xl:gap-3">
      {items.map((card, i) => {
        const preset = statPresets[normalizeLabel(card.label)] ?? fallbackPreset;
        const Icon = preset.icon;
        const share = total > 0 ? Math.round((card.value / total) * 100) : 0;
        const progressWidth = total > 0 ? Math.max(10, Math.min(100, share)) : card.value > 0 ? 32 : 10;

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: i * 0.035 }}
            whileHover={{ y: -4, transition: { duration: 0.18 } }}
            className="admin-stat-card border-gold/20 group relative min-w-0 overflow-hidden rounded-[24px] border bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_55%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.015))] p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(212,175,55,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] xl:p-3"
          >
            <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${preset.glowClass} opacity-90 blur-3xl transition duration-500 group-hover:opacity-100`} />
            <div className="admin-stat-card-ring pointer-events-none absolute inset-0 rounded-[24px] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

            <div className="relative flex h-full flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold/80 shadow-[0_0_8px_rgba(212,175,55,0.45)]" aria-hidden />
                    <p className="text-foreground/65 truncate text-[10px] font-semibold uppercase tracking-[0.17em]">
                      {card.label}
                    </p>
                  </div>
                  <p className="text-foreground mt-2.5 text-[2.65rem] font-bold leading-none tabular-nums tracking-[-0.05em] xl:text-[2.35rem]">
                    {card.value}
                  </p>
                </div>

                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_0_4px_rgba(212,175,55,0.08)] xl:h-9 xl:w-9 ${preset.iconShellClass}`}>
                  <Icon className="h-4.5 w-4.5" aria-hidden />
                </div>
              </div>

              <div className="mt-3 space-y-2.5">
                <p className="text-foreground/45 h-8 overflow-hidden text-[11px] leading-[1.28] xl:text-[10.5px]">
                  {preset.note}
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-foreground/40 truncate text-[9px] font-semibold uppercase tracking-[0.16em]">
                      Share
                    </span>
                    <span className="text-foreground/65 text-[11px] font-semibold tabular-nums">
                      {share}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${preset.progressClass} transition-[width] duration-700 ease-out`}
                    style={{ width: `${progressWidth}%` }}
                  />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}
