'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import React, { useState } from 'react';
import HeroScrollIndicator from '@/components/HeroScrollIndicator';
import { useJoinUsModal } from './JoinUsModalContext';

export default function InteractiveHeroHUD() {
  const { open: openJoinModal } = useJoinUsModal();
  const prefersReducedMotion = useReducedMotion();

  const [btnMagnet, setBtnMagnet] = useState({ x: 0, y: 0 });

  // Magnetic button logic
  const handleBtnMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.35;
    const dy = (e.clientY - cy) * 0.35;
    setBtnMagnet({ x: dx, y: dy });
  };

  const handleBtnMouseLeave = () => {
    setBtnMagnet({ x: 0, y: 0 });
  };

  const scrollToFeed = () => {
    const el = document.getElementById('feed');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden px-4 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-24 lg:px-12 lg:pb-24 lg:pt-28 xl:px-16"
    >
      {/* ======================================================== */}
      {/* 1. ARCHITECTURAL HUD CORNER RETICLES & DATA READOUTS     */}
      {/* ======================================================== */}

      {/* Corner Brackets [ + ] Decorative Watermarks */}
      <div className="pointer-events-none absolute inset-x-4 top-16 z-10 flex justify-between text-gold/25 sm:inset-x-8 lg:inset-x-12 xl:inset-x-16" aria-hidden>
        <span className="font-mono text-xs">+</span>
        <span className="font-mono text-xs">+</span>
      </div>
      <div className="pointer-events-none absolute inset-x-4 bottom-12 z-10 flex justify-between text-gold/25 sm:inset-x-8 lg:inset-x-12 xl:inset-x-16" aria-hidden>
        <span className="font-mono text-xs">+</span>
        <span className="font-mono text-xs">+</span>
      </div>

      {/* Spacer to keep center 100% open & unobstructed for 3D background */}
      <div className="pointer-events-none flex-1" aria-hidden />

      {/* ======================================================== */}
      {/* 2. PERIMETER EDITORIAL TYPOGRAPHY & MAGNETIC CTA (BOTTOM-LEFT) */}
      {/* ======================================================== */}
      <div className="relative z-20 hidden flex-col items-start justify-end gap-8 md:flex">
        <div className="max-w-xl text-left">
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-black/35 px-3 py-1 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_#d4af37]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-gold/90 sm:text-xs">
              Order of DeMolay · Founded 1921
            </p>
          </div>

          {/* Luxury Perimeter Heading */}
          <h1 className="font-serif mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            T. De Leon <br />
            <span className="bg-gradient-to-r from-gold via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(212,175,55,0.25)]">
              Chapter No. 47
            </span>
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-relaxed text-foreground/75 sm:text-base">
            Molding young men into leaders through character, fraternity, and enduring fidelity to sacred ideals.
          </p>

          {/* Interactive Actions with Magnetic Spring */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <motion.button
              type="button"
              onClick={openJoinModal}
              onMouseMove={handleBtnMouseMove}
              onMouseLeave={handleBtnMouseLeave}
              animate={{ x: btnMagnet.x, y: btnMagnet.y }}
              transition={{ type: 'spring', stiffness: 220, damping: 16 }}
              className="capsule-btn group inline-flex items-center gap-2 overflow-hidden px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] duration-300 hover:scale-[1.03] sm:text-sm"
            >
              <span className="relative z-10">Petition for Entry</span>
              <ArrowUpRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              {/* Shimmer sweep */}
              <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
            </motion.button>

            <button
              type="button"
              onClick={scrollToFeed}
              className="capsule-btn capsule-btn-b inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm"
            >
              <span>Explore Chapter</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. HERO SCROLL INDICATOR ANCHORED AT BOTTOM-CENTER       */}
      {/* ======================================================== */}
      <HeroScrollIndicator targetId="feed" />
    </div>
  );
}
