'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import CandleModel from '@/components/site/CandleModel';
import { officerPhotoBackgroundStyle } from '@/lib/officerPhoto';
import type { OfficerRow } from '@/lib/officersDb';

/** Cards per full turn of the spiral, and the vertical rise per card (in card heights). */
const CARDS_PER_TURN = 9;
const RISE_PER_CARD = 0.28;
/** The spiral always holds at least this many cards; short officer lists repeat to fill it. */
const MIN_CARDS = 18;
/** Cards further than this many steps from the front-center are faded out at the spiral's ends. */
const VISIBLE_SPAN = 4.2;
/** Each card is drawn as this many vertical strips laid on the cylinder, so it bends around the candle. */
const STRIPS = 4;
/** Auto-advance in cards per second, and the pause after the visitor interacts (ms). */
const AUTO_SPEED = 0.22;
const IDLE_RESUME_MS = 4000;
/** The spiral widens with the screen up to this width (px); beyond it the room just gets wider. */
const MAX_SPIRAL_WIDTH = 1240;
/** Section-height fractions: where the candle's base and flame appear, the scene's top offset, and the
    stage's perspective origin (kept in sync with `.officer-stage` in globals.css). */
const CANDLE_BASE = 0.77;
const CANDLE_FLAME = 0.36;
const SCENE_TOP = 0.46;
const PERSPECTIVE_ORIGIN_Y = 0.2;
/** CSS perspective distance of the stage (px); also used to size the spiral to the stage width. */
const PERSPECTIVE = 1800;

/**
 * Officers ride a slowly turning spiral around a single lit candle (after the "Spiral Flux" carousel idea).
 * Cards are bent along the spiral; drag, the arrow buttons, the dots, or the keyboard move it.
 * Fills a full-screen section over a room backdrop; `children` (the page heading) sits over the back wall.
 */
export default function OfficersCarousel({ officers, children }: { officers: OfficerRow[]; children?: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const stripRefs = useRef<(HTMLDivElement | null)[]>([]);
  const phase = useRef(0);
  const target = useRef<number | null>(null);
  const lastInteraction = useRef(-Infinity);
  const drag = useRef<{ x: number; phase: number } | null>(null);
  const [focused, setFocused] = useState(0);

  const count = officers.length;
  const repeats = count ? Math.ceil(MIN_CARDS / count) : 0;
  const slots = count * repeats;
  const cards = Array.from({ length: slots }, (_, j) => ({ key: j, officer: officers[j % count], index: j % count }));

  /** Wrap a card's offset from the current phase into -slots/2 … slots/2. */
  const offsetOf = useCallback(
    (j: number, p: number) => ((((j - p) % slots) + slots * 1.5) % slots) - slots / 2,
    [slots]
  );

  const nudge = useCallback((dir: 1 | -1) => {
    const from = target.current ?? Math.round(phase.current);
    lastInteraction.current = performance.now();
    target.current = from + dir;
  }, []);

  /** Bring officer `index` to the front by the shortest route along the spiral. */
  const turnTo = useCallback(
    (index: number) => {
      const from = target.current ?? phase.current;
      let best = 0;
      for (let j = index; j < slots; j += count) {
        const off = offsetOf(j, from);
        if (j === index || Math.abs(off) < Math.abs(best)) best = off;
      }
      lastInteraction.current = performance.now();
      target.current = from + best;
    },
    [count, slots, offsetOf]
  );

  useEffect(() => {
    const stage = stageRef.current;
    const scene = sceneRef.current;
    if (!stage || !scene || slots === 0) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = 360 / CARDS_PER_TURN;
    let frame = 0;
    let last = performance.now();
    let lastFocused = -1;

    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (drag.current) {
        // Phase follows the pointer (set in the pointer handlers).
      } else if (target.current !== null) {
        const diff = target.current - phase.current;
        phase.current += diff * Math.min(1, dt * 6);
        if (Math.abs(diff) < 0.002) {
          phase.current = target.current;
          target.current = null;
        }
      } else if (!reduceMotion && now - lastInteraction.current > IDLE_RESUME_MS) {
        phase.current += AUTO_SPEED * dt;
      }

      // The spiral spans the full stage width: side cards reach its edges, on phones and desktops alike.
      const width = Math.min(stage.clientWidth, MAX_SPIRAL_WIDTH);
      const cardW = width < 640 ? 140 : Math.min(220, Math.max(170, width * 0.16));
      const cardH = cardW * 1.28;
      // Solve for the radius whose side cards land at the stage edges after perspective shrinks them.
      const halfSpan = ((width - cardW) / 2) * 1.04;
      const radius = Math.max(cardW * 1.25, (halfSpan * PERSPECTIVE) / Math.max(PERSPECTIVE - halfSpan, 200));
      stage.style.perspective = `${PERSPECTIVE}px`;
      const stripW = cardW / STRIPS;
      const stripDeg = (stripW / radius) * (180 / Math.PI);
      stage.style.setProperty('--card-w', `${cardW}px`);
      stage.style.setProperty('--card-h', `${cardH}px`);
      stage.style.setProperty('--strip-w', `${stripW + 0.6}px`); // slight overlap hides seams
      scene.style.transform = `translateZ(${-radius}px)`; // upright: no tilt on the cards or the candle

      // Anchor the candle: its base lands at CANDLE_BASE and its flame at CANDLE_FLAME (fractions of the
      // section height). Perspective shrinks the scene toward the stage's perspective origin, so solve in css px.
      const stageH = stage.clientHeight;
      const shrink = PERSPECTIVE / (PERSPECTIVE + radius);
      const dropPx = ((CANDLE_BASE - PERSPECTIVE_ORIGIN_Y) * stageH) / shrink - (SCENE_TOP - PERSPECTIVE_ORIGIN_Y) * stageH;
      const candleH = ((CANDLE_BASE - CANDLE_FLAME) * stageH) / shrink;
      stage.style.setProperty('--candle-h', `${candleH}px`);
      stage.style.setProperty('--candle-drop', `${dropPx}px`);

      let bestJ = 0;
      let bestOff = Infinity;
      for (let j = 0; j < slots; j++) {
        const off = offsetOf(j, phase.current);
        if (Math.abs(off) < Math.abs(bestOff)) {
          bestOff = off;
          bestJ = j;
        }
        const fade = Math.max(0, Math.min(1, VISIBLE_SPAN + 0.8 - Math.abs(off)));
        for (let k = 0; k < STRIPS; k++) {
          const strip = stripRefs.current[j * STRIPS + k];
          if (!strip) continue;
          const along = k - (STRIPS - 1) / 2; // strip position across the card
          const deg = off * step + along * stripDeg;
          const y = off * RISE_PER_CARD * cardH; // level across the card; the spiral rises card by card
          strip.style.transform = `translateY(${y}px) rotateY(${deg}deg) translateZ(${radius}px)`;
          strip.style.opacity = fade.toFixed(3);
          strip.style.visibility = fade === 0 ? 'hidden' : 'visible';
          strip.style.setProperty('--lit', Math.cos((deg * Math.PI) / 180).toFixed(3));
        }
      }
      const officerIndex = bestJ % count;
      if (officerIndex !== lastFocused) {
        lastFocused = officerIndex;
        setFocused(officerIndex);
      }

      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [count, slots, offsetOf]);

  if (count === 0) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, phase: phase.current };
    target.current = null;
    lastInteraction.current = performance.now();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    phase.current = drag.current.phase - (e.clientX - drag.current.x) / 160;
    lastInteraction.current = performance.now();
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = null;
    lastInteraction.current = performance.now();
    target.current = Math.round(phase.current); // snap to the nearest officer
  };

  const officer = officers[focused] ?? officers[0];

  return (
    <section
      className="officer-section relative h-[100svh] min-h-[680px] w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Chapter officers"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') nudge(-1);
        if (e.key === 'ArrowRight') nudge(1);
      }}
    >
      {/* Room: dark back wall under a spotlight, and a checkered marble floor (the mosaic pavement). */}
      <div className="officer-room pointer-events-none absolute inset-0" aria-hidden>
        <div className="officer-wall absolute inset-0" />
        <div className="officer-floor absolute" />
        <div className="officer-floor-glow absolute inset-0" />
      </div>

      <div
        ref={stageRef}
        className="officer-stage absolute inset-0 cursor-grab touch-pan-y select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="officer-candle-light pointer-events-none absolute inset-0" aria-hidden />
        <div ref={sceneRef} className="officer-scene absolute left-1/2 h-0 w-0" style={{ top: `${SCENE_TOP * 100}%` }}>
          {cards.map(({ key, officer: o, index }, j) =>
            Array.from({ length: STRIPS }, (_, k) => (
              <div
                key={`${key}-${k}`}
                ref={(el) => {
                  stripRefs.current[j * STRIPS + k] = el;
                }}
                className={`officer-strip absolute ${k === 0 ? 'officer-strip-first' : ''} ${
                  k === STRIPS - 1 ? 'officer-strip-last' : ''
                }`}
                style={{ '--strip-k': k } as React.CSSProperties}
                aria-hidden={k !== 0 || index !== focused}
              >
                {/* Each strip shows its slice of the full card, offset by its position. */}
                <div className="officer-strip-face officer-strip-front">
                  <div className="officer-card-content">
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-800">
                      <div className="absolute inset-0" style={officerPhotoBackgroundStyle(o)} />
                    </div>
                    <p className="mt-2 truncate font-serif text-sm font-semibold text-[#f5efe4]">{o.name}</p>
                    <p className="truncate text-[0.7rem] text-gold">{o.position}</p>
                  </div>
                </div>
                <div className="officer-strip-face officer-strip-back" />
              </div>
            ))
          )}
          {/* The 3D candle stands on the spiral's axis. */}
          <div className="officer-candle absolute">
            <CandleModel />
          </div>
        </div>
      </div>

      {children ? (
        <div className="pointer-events-none relative z-10 mx-auto max-w-6xl px-6 pt-28 md:px-10 md:pt-32">{children}</div>
      ) : null}

      <div className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-4 px-6 text-center">
        <div aria-live="polite">
          <p key={officer.id} className="officer-focus-in font-serif text-2xl font-semibold md:text-3xl">
            {officer.name}
          </p>
          <p className="text-sm uppercase tracking-[0.2em] text-gold">{officer.position}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => nudge(-1)}
            className="cta-ghost !px-4 !py-2 text-sm"
            aria-label="Previous officer"
          >
            ←
          </button>
          <span className="font-mono text-xs tracking-[0.2em] text-foreground/55">
            {String(focused + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </span>
          <button type="button" onClick={() => nudge(1)} className="cta-ghost !px-4 !py-2 text-sm" aria-label="Next officer">
            →
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5" role="tablist" aria-label="Choose officer">
          {officers.map((o, i) => (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={i === focused}
              aria-label={`${o.name}, ${o.position}`}
              onClick={() => turnTo(i)}
              className={`h-1.5 rounded-full transition-all ${i === focused ? 'w-6 bg-gold' : 'w-1.5 bg-foreground/25 hover:bg-gold/60'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
