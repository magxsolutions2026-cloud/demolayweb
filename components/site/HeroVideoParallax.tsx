'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Slow parallax for the fixed hero video: over the first screen of scrolling it drifts up at about a
 * third of the scroll speed, zooms in slightly and darkens. The layer is 115% tall so the drift never
 * shows an edge. Static when the user prefers reduced motion.
 */
export default function HeroVideoParallax({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [screen, setScreen] = useState(900);

  useEffect(() => {
    const measure = () => setScreen(window.innerHeight);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const y = useTransform(scrollY, [0, screen], reduce ? [0, 0] : [0, -screen * 0.13]);
  const scale = useTransform(scrollY, [0, screen], reduce ? [1, 1] : [1, 1.06]);
  const shade = useTransform(scrollY, [0, screen], reduce ? [0, 0] : [0, 0.45]);

  return (
    <>
      <motion.div style={{ y, scale }} className="absolute inset-x-0 top-0 h-[115%] origin-top will-change-transform">
        {children}
      </motion.div>
      <motion.div style={{ opacity: shade }} className="absolute inset-0 bg-black" />
    </>
  );
}
