/** Short relative time for notification UIs (e.g. "2h ago", "Just now"). */
export function formatRelativeTime(iso: string | undefined | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const t = d.getTime();
  if (Number.isNaN(t)) return '—';

  const now = Date.now();
  const diff = Math.max(0, now - t);
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 45) return 'Just now';
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 7) return `${day}d ago`;

  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
