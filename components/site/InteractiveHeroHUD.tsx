'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  Compass,
  Crosshair,
  Crown,
  Play,
  RotateCw,
  Shield,
  Sparkles,
  Swords,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import HeroScrollIndicator from '@/components/HeroScrollIndicator';
import { useJoinUsModal } from './JoinUsModalContext';

interface Hotspot {
  id: string;
  label: string;
  code: string;
  title: string;
  desc: string;
  x: string;
  y: string;
  icon: typeof Crown;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'crown',
    label: 'NODE 01 // APEX',
    code: 'SYM-CRW',
    title: 'The Crown of Youth',
    desc: 'Adorned with pearls representing the Seven Cardinal Virtues. A reminder that noble character is the truest crowning achievement of life.',
    x: '50%',
    y: '28%',
    icon: Crown,
  },
  {
    id: 'swords',
    label: 'NODE 02 // DEFENSE',
    code: 'SYM-SWD',
    title: 'Crossed Swords of Fidelity',
    desc: 'Symbolizes steadfast loyalty to friends, chapter, and country. A pledge to defend spiritual and civil freedom against tyranny.',
    x: '34%',
    y: '48%',
    icon: Swords,
  },
  {
    id: 'shield',
    label: 'NODE 03 // BASTION',
    code: 'SYM-SHD',
    title: 'Heraldic Chapter Crest',
    desc: 'An enduring emblem of integrity, standing guard against deceit and inspiring generations of brothers in leadership since 1921.',
    x: '66%',
    y: '50%',
    icon: Shield,
  },
];

const VIRTUES = [
  {
    name: 'Filial Love',
    num: 'I',
    desc: 'Love and profound honor for parents who guided our early steps.',
  },
  {
    name: 'Reverence',
    num: 'II',
    desc: 'Faith in a Supreme Being and deep respect for the beliefs of others.',
  },
  {
    name: 'Courtesy',
    num: 'III',
    desc: 'Habitual kindness and gentlemanly respect toward everyone.',
  },
  {
    name: 'Comradeship',
    num: 'IV',
    desc: 'Unwavering brotherly bond through both triumph and adversity.',
  },
  {
    name: 'Fidelity',
    num: 'V',
    desc: 'Golden loyalty to promises, values, and Jacques DeMolay’s mantle.',
  },
  {
    name: 'Cleanness',
    num: 'VI',
    desc: 'Purity in thought, word, and deed: an untarnished reputation.',
  },
  {
    name: 'Patriotism',
    num: 'VII',
    desc: 'Proud, conscientious devotion to the republic and the flag.',
  },
];

export default function InteractiveHeroHUD() {
  const { open: openJoinModal } = useJoinUsModal();
  const prefersReducedMotion = useReducedMotion();

  // Mouse tilt tracking
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [btnMagnet, setBtnMagnet] = useState({ x: 0, y: 0 });

  // Interactive states
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [activeVirtueIndex, setActiveVirtueIndex] = useState(0);
  const [isDialOpen, setIsDialOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

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

  // Auto-cycle through the 7 virtues if enabled
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setActiveVirtueIndex((prev) => (prev + 1) % VIRTUES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoRotate]);

  const activeVirtue = VIRTUES[activeVirtueIndex];
  const virtueAngle = (activeVirtueIndex / VIRTUES.length) * 360;

  const scrollToFeed = () => {
    const el = document.getElementById('feed');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      onMouseMove={handleHeroMouseMove}
      className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden px-4 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-24 lg:px-12 lg:pb-24 lg:pt-28"
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
        className="pointer-events-none absolute left-4 top-20 z-20 flex flex-col gap-1 sm:left-8 sm:top-24 lg:left-12 lg:top-28"
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
        className="pointer-events-none absolute right-4 top-20 z-20 hidden flex-col items-end gap-1 sm:flex sm:right-8 sm:top-24 lg:right-12 lg:top-28"
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
      <div className="pointer-events-none absolute inset-x-4 top-16 z-10 flex justify-between text-gold/25 sm:inset-x-8 lg:inset-x-12" aria-hidden>
        <span className="font-mono text-xs">+</span>
        <span className="font-mono text-xs">+</span>
      </div>
      <div className="pointer-events-none absolute inset-x-4 bottom-12 z-10 flex justify-between text-gold/25 sm:inset-x-8 lg:inset-x-12" aria-hidden>
        <span className="font-mono text-xs">+</span>
        <span className="font-mono text-xs">+</span>
      </div>

      {/* ======================================================== */}
      {/* 2. INTERACTIVE 3D HOTSPOT NODES OVER THE 3D ASSET        */}
      {/* ======================================================== */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {HOTSPOTS.map((spot) => {
          const isSelected = activeHotspot?.id === spot.id;
          const IconComponent = spot.icon;

          return (
            <div
              key={spot.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: spot.x, top: spot.y }}
            >
              <div className="relative">
                {/* Pulsing Pin Button */}
                <button
                  type="button"
                  onClick={() => setActiveHotspot(isSelected ? null : spot)}
                  aria-expanded={isSelected}
                  aria-label={`Inspect ${spot.title}`}
                  className="pointer-events-auto group relative flex h-9 w-9 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold sm:h-11 sm:w-11"
                >
                  <span className="absolute inset-0 rounded-full border border-gold/40 bg-black/40 backdrop-blur-md transition-all duration-300 group-hover:scale-125 group-hover:border-gold group-hover:bg-black/70 group-hover:shadow-[0_0_24px_rgba(212,175,55,0.45)]" />
                  <span className="absolute inset-0 animate-ping rounded-full bg-gold/20 opacity-75" />
                  <IconComponent className={`relative h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${isSelected ? 'text-gold' : 'text-gold/80'}`} />

                  {/* Micro Code Badge */}
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] tracking-widest text-gold/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:text-[10px]">
                    {spot.code}
                  </span>
                </button>

                {/* Floating Inspection Card */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 6 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="pointer-events-auto absolute left-1/2 top-full z-40 mt-3 w-72 -translate-x-1/2 rounded-2xl border border-gold/35 bg-[rgba(12,10,16,0.85)] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_24px_rgba(212,175,55,0.15)] backdrop-blur-2xl sm:w-80"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-gold/80">
                            {spot.label}
                          </p>
                          <h4 className="font-serif mt-0.5 text-base font-bold text-white">
                            {spot.title}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveHotspot(null)}
                          className="rounded-lg p-1 text-foreground/50 transition hover:bg-white/10 hover:text-white"
                          aria-label="Close inspection card"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-2.5 text-xs leading-relaxed text-foreground/75">
                        {spot.desc}
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 font-mono text-[9px] uppercase tracking-widest text-gold/60">
                        <span>HERITAGE RECORD</span>
                        <span className="text-emerald-400">ACTIVE INTEL</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Spacer to keep center 100% negative space */}
      <div className="pointer-events-none flex-1" aria-hidden />

      {/* ======================================================== */}
      {/* 3. PERIMETER EDITORIAL TYPOGRAPHY & MAGNETIC CTA (BOTTOM-LEFT) */}
      {/* ======================================================== */}
      <div className="relative z-20 flex flex-col items-start justify-end gap-8 lg:flex-row lg:items-end lg:justify-between">
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

        {/* ======================================================== */}
        {/* 4. CELESTIAL ASTROLABE / VIRTUES COMPASS (BOTTOM-RIGHT)   */}
        {/* ======================================================== */}
        <motion.div
          animate={{
            x: -mouseOffset.x * 8,
            y: mouseOffset.y * 8,
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          className="relative hidden sm:block"
        >
          <div className="rounded-2xl border border-gold/25 bg-[rgba(12,10,16,0.55)] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:w-72 lg:w-80">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-gold" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-gold">
                  Virtues Astrolabe
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAutoRotate(!autoRotate)}
                className={`rounded-md p-1 transition ${autoRotate ? 'text-gold' : 'text-foreground/40 hover:text-white'}`}
                title={autoRotate ? 'Pause Orbit' : 'Play Orbit'}
                aria-label="Toggle virtue rotation"
              >
                {autoRotate ? <RotateCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '6s' }} /> : <Play className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Compass Dial Display */}
            <div className="my-3 flex items-center justify-center">
              <div className="relative flex h-28 w-28 items-center justify-center">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border border-gold/25" />
                <div className="absolute inset-2 rounded-full border border-dashed border-gold/20" />

                {/* 7 Virtue Markers around perimeter */}
                {VIRTUES.map((v, i) => {
                  const angle = (i / VIRTUES.length) * 2 * Math.PI - Math.PI / 2;
                  const radius = 46;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const isCurrent = i === activeVirtueIndex;

                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => {
                        setActiveVirtueIndex(i);
                        setAutoRotate(false);
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                      }}
                      aria-label={v.name}
                    >
                      <span
                        className={`block h-2 w-2 rounded-full transition-all duration-300 ${
                          isCurrent
                            ? 'scale-150 bg-gold shadow-[0_0_10px_#d4af37]'
                            : 'bg-white/30 hover:bg-gold/60'
                        }`}
                      />
                    </button>
                  );
                })}

                {/* Rotating Astrolabe Needle */}
                <motion.div
                  className="pointer-events-none absolute h-20 w-[1.5px] origin-center bg-gradient-to-t from-transparent via-gold to-white"
                  animate={{ rotate: virtueAngle }}
                  transition={{ type: 'spring', stiffness: 90, damping: 14 }}
                />

                {/* Center Core */}
                <div className="relative flex h-6 w-6 items-center justify-center rounded-full border border-gold/50 bg-black/70 shadow-[0_0_12px_rgba(212,175,55,0.3)]">
                  <span className="font-serif text-[10px] font-bold text-gold">
                    {activeVirtue.num}
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Virtue Readout */}
            <div className="border-t border-white/10 pt-2 text-left">
              <div className="flex items-center justify-between">
                <p className="font-serif text-xs font-bold text-white">
                  {activeVirtue.name}
                </p>
                <span className="font-mono text-[9px] uppercase tracking-widest text-gold/75">
                  VIRTUE {activeVirtueIndex + 1}/7
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-foreground/70">
                {activeVirtue.desc}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ======================================================== */}
      {/* 5. HERO SCROLL INDICATOR ANCHORED AT BOTTOM-CENTER       */}
      {/* ======================================================== */}
      <HeroScrollIndicator targetId="feed" />
    </div>
  );
}
