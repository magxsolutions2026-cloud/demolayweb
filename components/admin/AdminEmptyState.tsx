'use client';

import { Inbox } from 'lucide-react';

export function AdminEmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gold/25 bg-black/20 px-6 py-16 text-center">
      <Inbox className="text-gold/45 h-10 w-10" aria-hidden />
      <p className="text-foreground/90 font-medium">{title}</p>
      {description ? <p className="text-foreground/55 max-w-sm text-sm">{description}</p> : null}
    </div>
  );
}
