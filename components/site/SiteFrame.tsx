'use client';

import { useEffect, useRef, useState } from 'react';

type Frame = { w: number; h: number; inset: number; radius: number; top: number; bottom: number; depth: number };

const readPx = (style: CSSStyleDeclaration, name: string) => parseFloat(style.getPropertyValue(name)) || 0;

/**
 * Inner edge of the bezel: a rounded rectangle whose top edge dips into a trapezoid notch at the center
 * (the notch holds the TDLC#47 title). Notch corners are softened with short quadratic curves.
 */
function innerPath({ w, h, inset: i, radius: r, top, bottom, depth }: Frame) {
  const cx = w / 2;
  const c = 9;
  const dx = top - bottom;
  const len = Math.hypot(dx, depth);
  const ux = (dx / len) * c;
  const uy = (depth / len) * c;
  const y0 = i;
  const y1 = i + depth;
  return [
    `M${i + r} ${y0}`,
    `L${cx - top - c} ${y0}`,
    `Q${cx - top} ${y0} ${cx - top + ux} ${y0 + uy}`,
    `L${cx - bottom - ux} ${y1 - uy}`,
    `Q${cx - bottom} ${y1} ${cx - bottom + c} ${y1}`,
    `L${cx + bottom - c} ${y1}`,
    `Q${cx + bottom} ${y1} ${cx + bottom + ux} ${y1 - uy}`,
    `L${cx + top - ux} ${y0 + uy}`,
    `Q${cx + top} ${y0} ${cx + top + c} ${y0}`,
    `L${w - i - r} ${y0}`,
    `A${r} ${r} 0 0 1 ${w - i} ${y0 + r}`,
    `L${w - i} ${h - i - r}`,
    `A${r} ${r} 0 0 1 ${w - i - r} ${h - i}`,
    `L${i + r} ${h - i}`,
    `A${r} ${r} 0 0 1 ${i} ${h - i - r}`,
    `L${i} ${y0 + r}`,
    `A${r} ${r} 0 0 1 ${i + r} ${y0}`,
    'Z',
  ].join(' ');
}

/** Fixed, viewport-sized 3D bezel around the public site, with the header notch at top center. */
export default function SiteFrame({ scrolled }: { scrolled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<Frame | null>(null);

  // Hide the page scrollbar while the framed public site is shown; the admin keeps its scrollbar.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('site-no-scrollbar');
    // Inline too, so the scrollbar hides even before the stylesheet updates (Chrome 121+, Firefox).
    root.style.scrollbarWidth = 'none';
    document.body.style.scrollbarWidth = 'none';
    return () => {
      root.classList.remove('site-no-scrollbar');
      root.style.scrollbarWidth = '';
      document.body.style.scrollbarWidth = '';
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const style = getComputedStyle(el);
      setFrame({
        w: window.innerWidth > el.clientWidth ? el.clientWidth : window.innerWidth,
        h: window.innerHeight,
        inset: readPx(style, '--frame-inset'),
        radius: readPx(style, '--frame-radius'),
        top: readPx(style, '--frame-notch-top'),
        bottom: readPx(style, '--frame-notch-bottom'),
        depth: readPx(style, '--frame-notch-depth'),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const inner = frame ? innerPath(frame) : '';

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-50" aria-hidden>
      <div className={`site-frame-band ${scrolled ? 'site-frame-band-scrolled' : ''}`} />
      {frame ? (
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${frame.w} ${frame.h}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="site-frame-bezel" x1="0" x2="0" y1="0" y2="1">
              {/* Globe capsule gunmetal: grey top, black middle, bronze bottom. */}
              <stop offset="0" stopColor="#4a4446" />
              <stop offset="0.3" stopColor="#1a1719" />
              <stop offset="0.55" stopColor="#0d0b0c" />
              <stop offset="0.8" stopColor="#2b2628" />
              <stop offset="1" stopColor="#6b5f4a" />
            </linearGradient>
            <linearGradient id="site-frame-edge" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="0.5" stopColor="rgba(212,175,55,0.25)" />
              <stop offset="1" stopColor="rgba(212,175,55,0.45)" />
            </linearGradient>
            <clipPath id="site-frame-inner">
              <path d={inner} />
            </clipPath>
            <filter id="site-frame-blur" x="-5%" y="-5%" width="110%" height="110%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>

          {/* Inset shadow so the page looks sunk into the bezel. */}
          <g clipPath="url(#site-frame-inner)">
            <path d={inner} fill="none" stroke="#000" strokeOpacity="0.75" strokeWidth="18" filter="url(#site-frame-blur)" />
          </g>

          <path d={`M0 0H${frame.w}V${frame.h}H0Z ${inner}`} fill="url(#site-frame-bezel)" fillRule="evenodd" />

          {/* Raised rim of the bezel along the screen edge. */}
          <rect
            x="1.5"
            y="1.5"
            width={frame.w - 3}
            height={frame.h - 3}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
          <path d={inner} fill="none" stroke="#000" strokeOpacity="0.6" strokeWidth="3" />
          <path d={inner} fill="none" stroke="url(#site-frame-edge)" strokeWidth="1" />
        </svg>
      ) : null}
    </div>
  );
}
