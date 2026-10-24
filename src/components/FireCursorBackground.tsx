'use client';

import { useEffect, useRef, useState } from 'react';

const DEEP_RED = { r: 120, g: 18, b: 28 };
const ORANGE = { r: 220, g: 90, b: 40 };
const GOLD = { r: 230, g: 190, b: 90 };

const POOL_SIZE = 22;
const TRAIL_LEN = 10;
const IDLE_MS = 2800;
/** Fast follow toward raw pointer — filters micro-jitter before the visible layers */
const POINTER_LERP_PER_SEC = 11;
/** Main glow trail — lower = silkier, less twitchy */
const LERP_PER_SEC = 1.75;
/** Head / core — soft second layer */
const HEAD_LERP_PER_SEC = 3.1;

type PoolParticle = {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  cr: number;
  cg: number;
  cb: number;
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function pickColor(t: number) {
  if (t < 0.34) {
    const k = t / 0.34;
    return {
      r: lerp(DEEP_RED.r, ORANGE.r, k),
      g: lerp(DEEP_RED.g, ORANGE.g, k),
      b: lerp(DEEP_RED.b, ORANGE.b, k),
    };
  }
  if (t < 0.67) {
    const k = (t - 0.34) / 0.33;
    return {
      r: lerp(ORANGE.r, GOLD.r, k),
      g: lerp(ORANGE.g, GOLD.g, k),
      b: lerp(ORANGE.b, GOLD.b, k),
    };
  }
  return { r: GOLD.r, g: GOLD.g, b: GOLD.b };
}

function expSmoothing(current: number, target: number, dt: number, perSec: number) {
  const k = 1 - Math.exp(-perSec * dt);
  return lerp(current, target, k);
}

export default function FireCursorBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Canvas only mounts on the client so SSR HTML matches hydration (avoids canvas/tree mismatch). */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctxMaybe = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctxMaybe) return;
    const g: CanvasRenderingContext2D = ctxMaybe;

    const surface = canvas;

    const prefersReduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ambientMode =
      window.matchMedia('(max-width: 768px)').matches ||
      window.matchMedia('(pointer: coarse)').matches;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let lastTs = 0;

    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.42;
    /** Low-pass of pointer (reduces sensor noise before trail) */
    let pointerX = targetX;
    let pointerY = targetY;
    /** Follows smoothed pointer with delay */
    let smoothX = targetX;
    let smoothY = targetY;
    /** Second layer — even softer “energy” center */
    let headX = targetX;
    let headY = targetY;

    let lastMove = performance.now();
    let velocity = 0;
    let ambientT = 0;

    const trail: { x: number; y: number }[] = [];
    const pool: PoolParticle[] = Array.from({ length: POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      size: 1,
      cr: GOLD.r,
      cg: GOLD.g,
      cb: GOLD.b,
    }));

    function acquireSlot(): PoolParticle | null {
      for (const p of pool) {
        if (!p.active) return p;
      }
      return null;
    }

    function spawnNear(x: number, y: number, spread: number, intensity: number) {
      const p = acquireSlot();
      if (!p) return;
      const angle = Math.random() * Math.PI * 2;
      const sp = (0.25 + Math.random() * 0.9) * (0.5 + intensity * 0.6);
      p.active = true;
      p.x = x + (Math.random() - 0.5) * spread;
      p.y = y + (Math.random() - 0.5) * spread;
      p.vx = Math.cos(angle) * sp * 0.28;
      p.vy = -Math.abs(Math.sin(angle)) * sp * 0.55 - 0.12;
      p.life = 1;
      p.maxLife = 0.7 + Math.random() * 0.45;
      const c = pickColor(Math.random());
      p.cr = c.r;
      p.cg = c.g;
      p.cb = c.b;
      p.size = 0.6 + Math.random() * 1.4;
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      w = window.innerWidth;
      h = window.innerHeight;
      surface.width = Math.floor(w * dpr);
      surface.height = Math.floor(h * dpr);
      surface.style.width = `${w}px`;
      surface.style.height = `${h}px`;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onMove(e: MouseEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
      lastMove = performance.now();
    }

    function onLeave() {
      lastMove = performance.now() - IDLE_MS * 0.45;
    }

    resize();
    window.addEventListener('resize', resize);
    if (!ambientMode) {
      window.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('mouseleave', onLeave);
    }

    function themeMul() {
      return document.documentElement.getAttribute('data-theme') === 'light' ? 0.38 : 1;
    }

    function frame(now: number) {
      const dt = lastTs ? Math.min(0.05, (now - lastTs) / 1000) : 1 / 60;
      lastTs = now;

      const tm = themeMul();
      const idleFactor = ambientMode ? 0 : Math.min(1, (now - lastMove) / IDLE_MS);
      const activeBoost = ambientMode ? 0.42 + Math.sin(now * 0.00055) * 0.06 : 1 - idleFactor * idleFactor;

      if (ambientMode) {
        ambientT += dt * 0.45;
        const cx = w * 0.5;
        const cy = h * 0.4;
        targetX = cx + Math.sin(ambientT * 0.55) * w * 0.28 + Math.cos(ambientT * 0.31) * w * 0.1;
        targetY = cy + Math.cos(ambientT * 0.48) * h * 0.22 + Math.sin(ambientT * 0.36) * h * 0.08;
      }

      if (ambientMode) {
        pointerX = targetX;
        pointerY = targetY;
      } else {
        pointerX = expSmoothing(pointerX, targetX, dt, POINTER_LERP_PER_SEC);
        pointerY = expSmoothing(pointerY, targetY, dt, POINTER_LERP_PER_SEC);
      }
      smoothX = expSmoothing(smoothX, pointerX, dt, LERP_PER_SEC);
      smoothY = expSmoothing(smoothY, pointerY, dt, LERP_PER_SEC);
      headX = expSmoothing(headX, smoothX, dt, HEAD_LERP_PER_SEC);
      headY = expSmoothing(headY, smoothY, dt, HEAD_LERP_PER_SEC);

      const dx = headX - (trail[trail.length - 1]?.x ?? headX);
      const dy = headY - (trail[trail.length - 1]?.y ?? headY);
      velocity = expSmoothing(velocity, Math.hypot(dx, dy) / Math.max(dt, 0.001), dt, 5.5);

      trail.push({ x: headX, y: headY });
      while (trail.length > TRAIL_LEN) trail.shift();

      const speedNorm = Math.min(velocity / 22, 1.8);
      const dtScale = Math.min(1, dt * 60);
      const spawnP =
        (ambientMode ? 0.05 : (0.028 + speedNorm * 0.09) * activeBoost) * dtScale;

      if (!prefersReduced && activeBoost > 0.05) {
        if (Math.random() < spawnP) {
          spawnNear(headX, headY, 32, (0.3 + speedNorm * 0.35) * activeBoost);
        }
        if (!ambientMode && Math.random() < spawnP * 0.28) {
          spawnNear(headX + (Math.random() - 0.5) * 80, headY + (Math.random() - 0.5) * 80, 44, 0.18 * activeBoost);
        }
      }

      g.clearRect(0, 0, w, h);
      g.globalCompositeOperation = 'source-over';

      const intensity = (0.22 + speedNorm * 0.12) * activeBoost * tm;
      const coreR = 52 + speedNorm * 38;

      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        const age = i / Math.max(1, trail.length - 1);
        const fade = age * age;
        const r = 14 + fade * 32 + speedNorm * 12;
        const a = (0.018 + fade * 0.045) * activeBoost * tm;

        const grd = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        grd.addColorStop(0, `rgba(${ORANGE.r},${ORANGE.g},${ORANGE.b},${a * 0.85})`);
        grd.addColorStop(0.5, `rgba(${DEEP_RED.r},${DEEP_RED.g},${DEEP_RED.b},${a * 0.4})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grd;
        g.beginPath();
        g.arc(p.x, p.y, r, 0, Math.PI * 2);
        g.fill();
      }

      const core = g.createRadialGradient(headX, headY, 0, headX, headY, coreR);
      core.addColorStop(0, `rgba(${GOLD.r},${GOLD.g},${GOLD.b},${0.06 * intensity})`);
      core.addColorStop(0.4, `rgba(${ORANGE.r},${ORANGE.g},${ORANGE.b},${0.05 * intensity})`);
      core.addColorStop(0.75, `rgba(${DEEP_RED.r},${DEEP_RED.g},${DEEP_RED.b},${0.025 * intensity})`);
      core.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = core;
      g.beginPath();
      g.arc(headX, headY, coreR, 0, Math.PI * 2);
      g.fill();

      const outer = g.createRadialGradient(headX, headY, coreR * 0.35, headX, headY, coreR * 1.35);
      outer.addColorStop(0, 'rgba(0,0,0,0)');
      outer.addColorStop(0.55, `rgba(${DEEP_RED.r},${DEEP_RED.g},${DEEP_RED.b},${0.04 * activeBoost * tm})`);
      outer.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = outer;
      g.beginPath();
      g.arc(headX, headY, coreR * 1.35, 0, Math.PI * 2);
      g.fill();

      for (const p of pool) {
        if (!p.active) continue;
        p.x += p.vx * (dt * 60);
        p.y += p.vy * (dt * 60);
        p.vy -= 0.008 * (dt * 60);
        p.life -= (dt * 0.85) / p.maxLife;

        if (p.life <= 0 || p.y < -16 || p.x < -32 || p.x > w + 32) {
          p.active = false;
          continue;
        }

        const alpha = p.life * 0.38 * activeBoost * tm;
        g.fillStyle = `rgba(${p.cr},${p.cg},${p.cb},${alpha})`;
        g.beginPath();
        g.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        g.fill();
      }

      if (!prefersReduced) {
        raf = requestAnimationFrame(frame);
      }
    }

    if (prefersReduced) {
      g.clearRect(0, 0, w, h);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      if (!ambientMode) {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseleave', onLeave);
      }
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fire-canvas pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden
    />
  );
}
