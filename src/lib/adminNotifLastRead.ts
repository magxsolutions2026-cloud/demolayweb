'use client';

import { useCallback, useSyncExternalStore } from 'react';

const EVENT = 'demolay-notif-last-read';

function storageKey(username: string) {
  return `demolay_admin_notif_last_read_${encodeURIComponent(username)}`;
}

/** Milliseconds; 0 means nothing marked read yet (all notifications count as unread). */
export function getAdminNotifLastReadMs(username: string): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(storageKey(username));
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function setAdminNotifLastReadNow(username: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKey(username), String(Date.now()));
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(username: string, onChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  const fn = () => onChange();
  window.addEventListener('storage', fn);
  window.addEventListener(EVENT, fn);
  return () => {
    window.removeEventListener('storage', fn);
    window.removeEventListener(EVENT, fn);
  };
}

export function notificationEventTimeMs(iso: string | undefined | null): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Effective sort/compare time: missing/invalid timestamps use 1 so they are still
 * "newer" than lastReadAt 0, but become read after mark-all (large lastReadAt).
 */
export function notificationEventTimeOrMin(iso: string | undefined | null): number {
  const t = notificationEventTimeMs(iso);
  return t > 0 ? t : 1;
}

export function useAdminNotifLastRead(username: string) {
  const lastReadAt = useSyncExternalStore(
    (onChange) => subscribe(username, onChange),
    () => getAdminNotifLastReadMs(username),
    () => 0,
  );

  const markAllRead = useCallback(() => {
    setAdminNotifLastReadNow(username);
  }, [username]);

  return { lastReadAt, markAllRead };
}
