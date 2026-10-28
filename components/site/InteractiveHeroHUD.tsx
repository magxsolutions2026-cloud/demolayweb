'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Crosshair, Sparkles } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import HeroScrollIndicator from '@/components/HeroScrollIndicator';
import { useJoinUsModal } from './JoinUsModalContext';

export default function InteractiveHeroHUD() {
  const { open: openJoinModal } = useJoinUsModal();
  const prefersReducedMotion = useReducedMotion();

  // Mouse tilt tracking
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
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

  // Parallax mouse tracker for the viewport HUD
  const handleHeroMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMouseOffset({ x, y });
    },
    [prefersReducedMotion]
  );

  const scrollToFeed = () => {
    const el = document.getElementById('feed');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      onMouseMove={handleHeroMouseMove}
      className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden px-4 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-24 lg:px-12 lg:pb-24 lg:pt-28 xl:px-16"
    >
      {/* ======================================================== */}
      {/* 1. ARCHITECTURAL HUD CORNER RETICLES & DATA READOUTS     */}
      {/* ======================================================== */}

      {/* Top Left: Chapter Identity & Monospace Coordinates */}
      <motion.div
        animate={{
          x: mouseOffset.x * 6,
          y: mouseOffset.y * 6,
        }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="pointer-events-none absolute left-4 top-20 z-20 flex flex-col gap-1 sm:left-8 sm:top-24 lg:left-12 lg:top-28 xl:left-16"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 items-center justify-center">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-gold/60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
          </span>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/90 sm:text-xs">
            ARCHIVE // SPECIMEN 01
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/45 sm:text-[10px]">
          <span>COORD: 14°42&apos;N 120°58&apos;E</span>
          <span className="text-gold/40">/</span>
          <span>VALENZUELA</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-gold/30">
          <Crosshair className="h-3 w-3" />
          <div className="h-[1px] w-12 bg-gold/25" />
        </div>
      </motion.div>

      {/* Top Right: Status Badge & 3D Interactive Indicator */}
      <motion.div
        animate={{
          x: -mouseOffset.x * 6,
          y: mouseOffset.y * 6,
        }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="pointer-events-none absolute right-4 top-20 z-20 hidden flex-col items-end gap-1 sm:flex sm:right-8 sm:top-24 lg:right-12 lg:top-28 xl:right-16"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-black/40 px-3 py-1 backdrop-blur-md">
          <Sparkles className="h-3 w-3 text-gold" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-gold/90">
            3D SPATIAL CANVAS
          </span>
        </div>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/40">
          STABILITY 100% · SCROLL TO ORBIT
        </p>
      </motion.div>

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
        <motion.div
          animate={{
            x: mouseOffset.x * 10,
            y: mouseOffset.y * 10,
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          className="max-w-xl text-left"
        >
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
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-gold/50 bg-[linear-gradient(135deg,#d4af37_0%,#a8742a_45%,#730e1b_100%)] px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-[#0b090d] shadow-[0_12px_32px_rgba(212,175,55,0.35)] transition duration-300 hover:scale-[1.03] hover:shadow-[0_16px_42px_rgba(212,175,55,0.5)] sm:text-sm"
            >
              <span className="relative z-10">Petition for Entry</span>
              <ArrowUpRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              {/* Shimmer sweep */}
              <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
            </motion.button>

            <button
              type="button"
              onClick={scrollToFeed}
              className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-black/35 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold/90 backdrop-blur-xl transition hover:border-gold/60 hover:bg-black/55 hover:text-white sm:text-sm"
            >
              <span>Explore Chapter</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* ======================================================== */}
      {/* 3. HERO SCROLL INDICATOR ANCHORED AT BOTTOM-CENTER       */}
      {/* ======================================================== */}
      <HeroScrollIndicator targetId="feed" />
    </div>
  );
}
