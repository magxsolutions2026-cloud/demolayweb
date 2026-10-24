'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Subtle vertical shift on scroll for the hero content only.
 * Disabled when the user prefers reduced motion (accessibility).
 * Inner wrapper fades in on first paint.
 */
export default function HomeHeroParallax({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // Keep initial render hydration-consistent with server.
  // We only enable the scroll-based opacity once mounted (post-hydration).
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 420], reduce ? [0, 0] : [0, 36]);
  const opacity = useTransform(scrollY, [0, 420], reduce ? [1, 1] : [1, 0.92]);

  return (
    <motion.div
      ref={ref}
      // Avoid hydration mismatch: keep server/client initial styles identical.
      // (On first paint, `mounted` is false on both server and client.)
      style={mounted ? { y, opacity } : { y }}
      className="relative z-10 will-change-transform"
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
