/** Donut showing `value` out of `total`, with a gold-to-maroon gradient stroke. */
export function ApprovalRing({ value, total, label }: { value: number; total: number; label: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-[140px] w-[140px] place-items-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="cs-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#a3192c" />
          </linearGradient>
        </defs>
        <circle className="cs-ring-track" cx="60" cy="60" r={r} strokeWidth="10" />
        <circle
          className="cs-ring-value"
          cx="60"
          cy="60"
          r={r}
          strokeWidth="10"
          stroke="url(#cs-ring-grad)"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
        />
      </svg>
      <div className="text-center">
        <p className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-[var(--cs-ink)]">{pct}%</p>
        <p className="cs-label mt-1">{label}</p>
      </div>
    </div>
  );
}
