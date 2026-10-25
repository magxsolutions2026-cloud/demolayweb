'use client';

import { useMemo, useState } from 'react';

const sizes = {
  sm: 'h-8 w-8 min-h-8 min-w-8',
  md: 'h-10 w-10 min-h-10 min-w-10',
  lg: 'h-12 w-12 min-h-12 min-w-12',
};

export function AdminBrandMark({
  logoUrl,
  alt,
  size = 'md',
  className = '',
  /** If set, used when `logoUrl` is empty; on primary load error, tries this next (e.g. `/logo.png`). */
  fallbackSrc,
}: {
  logoUrl?: string | null;
  alt: string;
  size?: keyof typeof sizes;
  className?: string;
  fallbackSrc?: string | null;
}) {
  const primary = logoUrl?.trim() || '';
  const fallback = fallbackSrc?.trim() || '';
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const src = useMemo(() => {
    return [primary, fallback].find((candidate) => candidate && !failedSources.includes(candidate)) || '';
  }, [failedSources, fallback, primary]);

  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      onError={() => {
        setFailedSources((prev) => (prev.includes(src) ? prev : [...prev, src]));
      }}
      className={`${sizes[size]} shrink-0 rounded-xl border border-gold/25 bg-black/35 object-contain p-0.5 ${className}`}
    />
  );
}
