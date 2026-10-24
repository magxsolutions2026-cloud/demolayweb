export type EventCategory = 'important' | 'formal' | 'activity';

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  important: 'Important',
  formal: 'Formal',
  activity: 'Activity',
};

/** Tailwind classes for category dots / tags */
export const EVENT_CATEGORY_STYLES: Record<
  EventCategory,
  { dot: string; tag: string; glow: string }
> = {
  important: {
    dot: 'bg-[#FFD700]',
    tag: 'border-[#FFD700]/60 bg-[#FFD700]/15 text-[#FFD700]',
    glow: 'shadow-[0_0_12px_rgba(255,215,0,0.35)]',
  },
  formal: {
    dot: 'bg-[#8B0000]',
    tag: 'border-[#8B0000]/60 bg-[#8B0000]/20 text-red-200',
    glow: 'shadow-[0_0_12px_rgba(139,0,0,0.45)]',
  },
  activity: {
    dot: 'bg-[#FF4500]',
    tag: 'border-[#FF4500]/55 bg-[#FF4500]/15 text-orange-200',
    glow: 'shadow-[0_0_12px_rgba(255,69,0,0.35)]',
  },
};

export function normalizeEventCategory(raw: string | null | undefined): EventCategory {
  const v = String(raw ?? '').toLowerCase();
  if (v === 'important' || v === 'formal' || v === 'activity') return v;
  return 'activity';
}
