'use client';

import { useEffect, useState } from 'react';

const clockFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'Asia/Manila',
});

const dateFormat = new Intl.DateTimeFormat('en-PH', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'Asia/Manila',
});

/** Ticks every second on the client; renders a placeholder on the server so hydration matches. */
function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  return now;
}

export function LiveClock() {
  const now = useNow();
  return <span className="cs-clock">{now ? clockFormat.format(now) : '--:--:--'} PHT</span>;
}

export function LiveDate() {
  const now = useNow();
  return <span className="cs-date">{now ? dateFormat.format(now) : ''}</span>;
}
