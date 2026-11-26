export type ChipTone = 'gold' | 'amber' | 'red' | 'green' | 'maroon' | 'muted';

/** Tinted pill with mono uppercase text; tone sets the color. */
export function StatusChip({ tone = 'gold', children }: { tone?: ChipTone; children: React.ReactNode }) {
  return (
    <span className="cs-chip" data-tone={tone === 'gold' ? undefined : tone}>
      {children}
    </span>
  );
}

const statusTones: Record<string, ChipTone> = {
  pending: 'amber',
  approved: 'gold',
  declined: 'red',
  rejected: 'red',
  published: 'green',
  draft: 'muted',
  active: 'green',
  inactive: 'muted',
  important: 'red',
  formal: 'maroon',
  activity: 'amber',
};

export function toneFor(status: string | undefined | null): ChipTone {
  return statusTones[String(status ?? '').toLowerCase()] ?? 'gold';
}
