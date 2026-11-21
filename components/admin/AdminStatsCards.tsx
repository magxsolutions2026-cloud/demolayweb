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
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {items.map((card, i) => {
        const preset = statPresets[normalizeLabel(card.label)] ?? fallbackPreset;
        const Icon = preset.icon;

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            className="admin-stat-card border-gold/20 group relative min-w-0 overflow-hidden rounded-2xl border bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.1),transparent_55%),linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] p-4 shadow-[0_12px_36px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200 hover:border-gold/40"
          >
            <div className={`pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-br ${preset.glowClass} opacity-70 blur-2xl transition duration-300 group-hover:opacity-100`} />
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

            <div className="relative flex h-full flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-foreground/60 truncate text-[10px] font-semibold uppercase tracking-[0.16em]">
                    {card.label}
                  </p>
                  <p className="text-foreground mt-2 text-3xl font-bold leading-none tabular-nums tracking-tight md:text-4xl xl:text-3xl">
                    {card.value}
                  </p>
                </div>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition duration-200 group-hover:border-gold/50 ${preset.iconShellClass}`}>
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
              </div>
              <p className="text-foreground/50 mt-3 line-clamp-2 text-[11px] leading-snug">
                {preset.note}
              </p>
              <div className={`mt-4 h-1 w-12 rounded-full bg-gradient-to-r ${preset.progressClass}`} aria-hidden />
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}
