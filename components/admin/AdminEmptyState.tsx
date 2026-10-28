'use client';

import { Inbox } from 'lucide-react';

export function AdminEmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-gold/25 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.1),transparent_60%),rgba(0,0,0,0.25)] px-6 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <Inbox className="text-gold/50 h-10 w-10" aria-hidden />
      <p className="text-foreground/90 font-medium tracking-tight">{title}</p>
      {description ? <p className="text-foreground/55 max-w-sm text-sm leading-relaxed">{description}</p> : null}
    </div>
  );
}
