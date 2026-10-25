import type { ReactNode } from 'react';

/**
 * Static shell used as the SSR/loading fallback for the hero video layer.
 * With no `children`, renders the cinematic gradient fallback; with `children`, used as the
 * outer wrapper for `HomeHeroVideoClient` (client-only via `dynamic`).
 */
export function HeroVideoPlaceholder({ children }: { children?: ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 w-full overflow-hidden"
      aria-hidden
    >
      {children ?? (
        <div className="absolute inset-0 bg-[#050508]" aria-hidden>
          <div
            className="absolute inset-0 opacity-95"
            style={{
              background: `
                radial-gradient(circle at 50% 24%, rgba(115, 14, 27, 0.58), transparent 44%),
                radial-gradient(circle at 14% 72%, rgba(212, 175, 55, 0.2), transparent 34%),
                radial-gradient(circle at 86% 70%, rgba(92, 20, 70, 0.36), transparent 32%),
                linear-gradient(180deg, rgba(10, 8, 16, 0.08) 0%, rgba(5, 5, 8, 0.54) 100%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(to bottom, rgba(2, 2, 4, 0.34) 0%, rgba(4, 4, 8, 0.5) 28%, rgba(8, 8, 12, 0.72) 64%, rgba(10, 8, 16, 0.92) 100%),
                radial-gradient(circle at 50% 14%, rgba(212, 175, 55, 0.09), transparent 34%),
                radial-gradient(circle at 50% 62%, rgba(115, 14, 27, 0.18), transparent 44%)`,
            }}
          />
        </div>
      )}
    </div>
  );
}
