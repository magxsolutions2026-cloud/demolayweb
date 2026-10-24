'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Swords } from 'lucide-react';

const SCROLL_SHOW_MAX = 72;

export default function HeroScrollIndicator({ targetId = 'about' }: { targetId?: string }) {
  const [visible, setVisible] = useState(true);
  const rafRef = useRef<number | null>(null);

  const syncVisibility = useCallback(() => {
    rafRef.current = null;
    setVisible(window.scrollY <= SCROLL_SHOW_MAX);
  }, []);

  useEffect(() => {
    const initRaf = window.requestAnimationFrame(() => syncVisibility());

    const onScroll = () => {
      if (rafRef.current == null) {
        rafRef.current = window.requestAnimationFrame(syncVisibility);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(initRaf);
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [syncVisibility]);

  const handleActivate = () => {
    const el = document.getElementById(targetId);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className="hero-scroll-indicator pointer-events-none absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center md:bottom-8"
      aria-hidden={!visible}
    >
      <button
        type="button"
        onClick={handleActivate}
        tabIndex={visible ? 0 : -1}
        className={`pointer-events-auto flex cursor-pointer flex-col items-center border-0 bg-transparent p-0 transition-[opacity,visibility] duration-500 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/70 ${
          visible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ visibility: visible ? 'visible' : 'hidden' }}
        aria-label="Scroll to explore — go to the next section"
      >
        <span className="hero-scroll-motion flex flex-col items-center gap-2.5 md:gap-3">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-gold/95 md:text-xs">
            Scroll to Explore
          </span>
          <span className="text-gold" aria-hidden>
            <Swords className="h-7 w-7 md:h-8 md:w-8" strokeWidth={1.35} />
          </span>
        </span>
      </button>
    </div>
  );
}
