'use client';

import { useEffect, useRef, useState } from 'react';

/** The bar's stages: the Seven Cardinal Virtues, one level each. */
const STAGES = [
  'Filial Love',
  'Reverence',
  'Courtesy',
  'Comradeship',
  'Fidelity',
  'Cleanness',
  'Patriotism',
] as const;

/** Timings in ms: bar fill, "READY" burst at 100%, then fade-out. */
const FILL_MS = 1700;
const BURST_MS = 420;
const EXIT_MS = 380;

type Phase = 'loading' | 'burst' | 'exit' | 'done';

/** Fast start, brief hesitation mid-way, then a hard push to the end, like an overdriven gauge. */
const easeProgress = (t: number) => {
  const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  return Math.min(1, eased + Math.sin(t * Math.PI) * 0.04);
};

/** Jagged lightning path across the right end of the bar, regenerated each burst frame. */
const arcPath = (seed: number) => {
  let x = 0;
  let d = 'M0 20';
  for (let i = 1; i <= 7; i++) {
    x += 14 + ((seed * (i + 3) * 9301) % 9);
    const y = 20 + (((seed * (i + 7) * 49297) % 31) - 15);
    d += ` L${x} ${y}`;
  }
  return d;
};

export default function PageIntroLoader() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [stage, setStage] = useState(0);
  const [arcSeed, setArcSeed] = useState(1);
  const fillRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fillMs = reduceMotion ? 300 : FILL_MS;
    const start = performance.now();
    let frame = 0;
    let arcTimer: ReturnType<typeof setInterval> | undefined;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const tick = (now: number) => {
      const t = Math.min((now - start) / fillMs, 1);
      const progress = reduceMotion ? t : easeProgress(t);
      if (fillRef.current) fillRef.current.style.width = `${progress * 100}%`;
      if (percentRef.current) percentRef.current.textContent = String(Math.round(progress * 100)).padStart(3, '0');
      setStage(Math.min(STAGES.length - 1, Math.floor(progress * STAGES.length)));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      setPhase('burst');
      if (!reduceMotion) arcTimer = setInterval(() => setArcSeed((s) => s + 1), 70);
      timers.push(setTimeout(() => setPhase('exit'), reduceMotion ? 120 : BURST_MS));
      timers.push(setTimeout(() => setPhase('done'), (reduceMotion ? 120 : BURST_MS) + EXIT_MS));
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(arcTimer);
      timers.forEach((id) => clearTimeout(id));
    };
  }, []);

  if (phase === 'done') return null;

  const ready = phase !== 'loading';
  const label = ready ? 'Ready' : STAGES[stage];

  return (
    <div
      className={`intro-loader fixed inset-0 z-[70] flex items-center justify-center bg-[#07060a] transition-opacity ease-out ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${EXIT_MS}ms` }}
      role="status"
      aria-live="polite"
      aria-label="Loading T. De Leon Chapter No. 47"
    >
      <div
        className={`intro-panel relative w-[min(92vw,460px)] px-6 pb-5 pt-5 transition-transform duration-300 ${
          phase === 'exit' ? 'scale-[0.97]' : ready ? 'intro-panel-shake' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="flex min-w-0 items-baseline gap-2 font-mono uppercase">
            <span className="shrink-0 text-[0.7rem] tracking-[0.28em] text-gold/80">Chapter//</span>
            <span key={label} className="intro-glitch truncate text-xl font-black tracking-wide text-gold" data-text={label}>
              {label}
            </span>
          </p>
        </div>

        <div className="mt-4 flex justify-between font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[#e9dcc4]/55">
          <span>Initiate</span>
          <span>
            <span ref={percentRef}>000</span>%
          </span>
        </div>

        <div className="relative mt-2 h-6">
          <div className="intro-track absolute inset-0" />
          <div ref={fillRef} className="absolute inset-y-0 left-0 w-0">
            <div className="intro-fill absolute inset-0" />
            <div className="intro-trail absolute inset-y-0 right-0 w-10" aria-hidden />
            <div className="intro-handle absolute -right-2 -top-1 -bottom-1 w-3" aria-hidden />
          </div>
          {/* Stop ticks between the seven stages */}
          <div className="pointer-events-none absolute inset-0 flex justify-around px-[7%]" aria-hidden>
            {Array.from({ length: STAGES.length - 1 }, (_, i) => (
              <span key={i} className="intro-tick h-full w-[3px] -skew-x-[20deg]" />
            ))}
          </div>
          {ready ? (
            <svg className="intro-arcs pointer-events-none absolute -right-4 -top-4 h-14 w-28" viewBox="0 0 110 40" aria-hidden>
              <path d={arcPath(arcSeed)} />
              <path d={arcPath(arcSeed + 17)} className="opacity-60" />
            </svg>
          ) : null}
        </div>

        <p className="mt-3 text-center font-mono text-[0.6rem] uppercase tracking-[0.26em] text-[#e9dcc4]/45">
          ▲ Seven Cardinal Virtues
        </p>
      </div>
    </div>
  );
}
