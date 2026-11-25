import type { ReactNode } from 'react';
import { HERO_POSTER_SRC, HERO_VIDEO_CLASS_NAME } from './heroVideoFrame';

/**
 * Static shell used as the SSR/loading fallback for the hero video layer.
 * With no `children`, shows the hero poster (first video frame); with `children`, used as the
 * outer wrapper for `HomeHeroVideoClient` (client-only via `dynamic`).
 */
export function HeroVideoPlaceholder({ children }: { children?: ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 w-full overflow-hidden"
      aria-hidden
    >
      {children ?? (
        <div className="absolute inset-0 bg-black" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element -- static public file, must match the video framing */}
          <img src={HERO_POSTER_SRC} alt="" className={HERO_VIDEO_CLASS_NAME} fetchPriority="high" />
        </div>
      )}
    </div>
  );
}
