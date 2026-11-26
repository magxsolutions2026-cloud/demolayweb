import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

/** KPI tile that doubles as a filter: clicking it opens the list it counts. */
export function KpiTile({
  label,
  value,
  note,
  icon: Icon,
  href,
  color = 'var(--cs-accent)',
}: {
  label: string;
  value: React.ReactNode;
  note?: string;
  icon: LucideIcon;
  href: string;
  color?: string;
}) {
  return (
    <Link href={href} className="cs-tile cs-kpi" style={{ '--kpi-c': color } as React.CSSProperties}>
      <span className="cs-kpi-icon">
        <Icon />
      </span>
      <span className="cs-label">{label}</span>
      <span className="cs-kpi-value">{value}</span>
      {note ? <span className="text-xs text-[var(--cs-dim)]">{note}</span> : null}
    </Link>
  );
}
