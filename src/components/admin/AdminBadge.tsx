'use client';

const tone: Record<string, string> = {
  important: 'border-amber-400/35 bg-amber-500/15 text-amber-100',
  formal: 'border-rose-400/35 bg-rose-500/15 text-rose-100',
  activity: 'border-orange-400/35 bg-orange-500/15 text-orange-100',
  draft: 'border-white/20 bg-white/10 text-foreground/80',
  published: 'border-emerald-400/35 bg-emerald-500/15 text-emerald-100',
  active: 'border-emerald-400/35 bg-emerald-500/15 text-emerald-100',
  inactive: 'border-slate-400/30 bg-slate-500/10 text-slate-100',
  pending: 'border-amber-400/40 bg-amber-500/20 text-amber-50',
  approved: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-50',
  declined: 'border-rose-400/40 bg-rose-500/15 text-rose-50',
};

export function AdminBadge({
  children,
  variant = 'activity',
  className = '',
}: {
  children: React.ReactNode;
  variant?: keyof typeof tone | string;
  className?: string;
}) {
  const style = tone[variant] ?? 'border-gold/30 bg-gold/10 text-gold/95';
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${style} ${className}`}
    >
      {children}
    </span>
  );
}
