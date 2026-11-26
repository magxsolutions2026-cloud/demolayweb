'use client';

import { Inbox } from 'lucide-react';

export function AdminEmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-[var(--cs-edge,rgba(212,175,55,0.26))] bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.08),transparent_60%)] px-6 py-14 text-center">
      <Inbox className="mb-1 h-9 w-9 text-gold/50" aria-hidden />
      <p className="font-[family-name:var(--font-display)] text-xs font-bold uppercase tracking-[0.12em] text-white/85">
        {title}
      </p>
      {description ? <p className="max-w-sm text-sm leading-relaxed text-white/50">{description}</p> : null}
    </div>
  );
}
