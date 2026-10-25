'use client';

import { useState } from 'react';
import {
  googleMapsEmbedSrc,
  googleStreetViewOpenUrl,
} from '@/lib/lodgeLocation';

type MapMode = 'map' | 'street';

export default function LodgeMap() {
  const [mode, setMode] = useState<MapMode>('map');

  return (
    <div className="flex min-h-[280px] w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-[rgba(0,0,0,0.35)] lg:min-h-0">
      <div
        className="flex shrink-0 gap-1 rounded-t-2xl border-b border-gold/25 bg-[rgba(0,0,0,0.35)] p-1"
        role="tablist"
        aria-label="Map view"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'map'}
          className={`flex-1 rounded-xl px-3 py-2 text-center text-sm font-medium transition-colors ${
            mode === 'map'
              ? 'bg-gold/20 text-gold'
              : 'text-foreground/70 hover:bg-white/5 hover:text-foreground'
          }`}
          onClick={() => setMode('map')}
        >
          Map
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'street'}
          className={`flex-1 rounded-xl px-3 py-2 text-center text-sm font-medium transition-colors ${
            mode === 'street'
              ? 'bg-gold/20 text-gold'
              : 'text-foreground/70 hover:bg-white/5 hover:text-foreground'
          }`}
          onClick={() => setMode('street')}
        >
          Street View
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-2xl">
        {mode === 'map' ? (
          <iframe
            title="Isabela Lodge No. 60 on Google Maps"
            className="block h-full min-h-0 w-full flex-1 rounded-b-2xl border-0"
            style={{ minHeight: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            src={googleMapsEmbedSrc}
          />
        ) : (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-4 rounded-b-2xl bg-[rgba(0,0,0,0.25)] p-6 text-center">
            <p className="max-w-sm text-sm text-foreground/80">
              Open Google&apos;s interactive 360° Street View on Rizal St in a new tab.
            </p>
            <a
              href={googleStreetViewOpenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-primary btn-shine inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Open Street View
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
