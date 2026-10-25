'use client';

/* eslint-disable @next/next/no-img-element */

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ImageLightbox({
  open,
  images,
  initialIndex = 0,
  title,
  onClose,
}: {
  open: boolean;
  images: string[];
  initialIndex?: number;
  title: string;
  onClose: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(() => Math.max(initialIndex, 0));
  const normalizedImages = images.filter(Boolean);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (normalizedImages.length < 2) return;
      if (event.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % normalizedImages.length);
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + normalizedImages.length) % normalizedImages.length);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [normalizedImages.length, onClose, open]);

  if (typeof document === 'undefined' || !open || normalizedImages.length === 0) return null;

  const currentImage = normalizedImages[Math.min(activeIndex, normalizedImages.length - 1)] || normalizedImages[0];
  const canCycle = normalizedImages.length > 1;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/92 p-4 backdrop-blur-md sm:p-6"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 18 }}
          transition={{ duration: 0.22 }}
          className="relative flex h-full max-h-[92vh] w-full max-w-6xl flex-col pt-8 sm:pt-10"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0 pt-1">
              <p className="truncate text-sm font-semibold text-white/90">{title}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-gold/80">
                {activeIndex + 1} / {normalizedImages.length}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-[rgba(14,12,18,0.84)] text-white/90 shadow-[0_14px_36px_rgba(0,0,0,0.42)] backdrop-blur-xl transition hover:scale-[1.03] hover:border-gold/45 hover:text-gold"
              aria-label="Close image viewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[1.75rem] border border-gold/20 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_38%),rgba(8,8,12,0.94)] px-3 py-3 sm:px-5 sm:py-5">
            {canCycle ? (
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev - 1 + normalizedImages.length) % normalizedImages.length)}
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white/85 backdrop-blur-xl transition hover:border-gold/35 hover:text-gold"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : null}

            <img
              src={currentImage}
              alt={`${title} image ${activeIndex + 1}`}
              className="max-h-full max-w-full rounded-xl object-contain shadow-[0_20px_60px_rgba(0,0,0,0.38)]"
              draggable={false}
            />

            {canCycle ? (
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev + 1) % normalizedImages.length)}
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white/85 backdrop-blur-xl transition hover:border-gold/35 hover:text-gold"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : null}
          </div>

          {canCycle ? (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {normalizedImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative h-16 overflow-hidden rounded-xl border transition ${
                    index === activeIndex ? 'border-gold/55 shadow-[0_0_18px_rgba(212,175,55,0.18)]' : 'border-white/10 hover:border-gold/30'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" draggable={false} />
                </button>
              ))}
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
