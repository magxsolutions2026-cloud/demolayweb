'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import ImageLightbox from '@/components/site/ImageLightbox';

export default function NewsImageGallery({
  images,
  title,
  className = '',
  frameClassName = 'h-64 sm:h-72',
}: {
  images: string[];
  title: string;
  className?: string;
  frameClassName?: string;
}) {
  const normalizedImages = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (normalizedImages.length === 0) return null;

  const currentImage = normalizedImages[Math.min(activeIndex, normalizedImages.length - 1)] || normalizedImages[0];
  const canCycle = normalizedImages.length > 1;

  return (
    <div className={className}>
      <div className={`group relative overflow-hidden rounded-[1.5rem] border border-gold/20 bg-black/30 ${frameClassName}`}>
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute inset-0 z-10 cursor-zoom-in"
          aria-label={`Open full image of ${title}`}
        />
        <div className="pointer-events-none absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${currentImage})` }} aria-label={title} />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,8,0.08)_0%,rgba(7,5,8,0.18)_34%,rgba(7,5,8,0.72)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.14),transparent_48%)]" />

        <div className="absolute left-4 top-4 z-20">
          <span className="rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-xl">
            {activeIndex + 1} / {normalizedImages.length}
          </span>
        </div>

        {canCycle ? (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex((prev) => (prev - 1 + normalizedImages.length) % normalizedImages.length);
              }}
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white/85 backdrop-blur-xl transition hover:border-gold/35 hover:text-gold"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex((prev) => (prev + 1) % normalizedImages.length);
              }}
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white/85 backdrop-blur-xl transition hover:border-gold/35 hover:text-gold"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {canCycle ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {normalizedImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 overflow-hidden rounded-xl border transition ${
                index === activeIndex ? 'border-gold/55 shadow-[0_0_18px_rgba(212,175,55,0.18)]' : 'border-white/10 hover:border-gold/30'
              }`}
              aria-label={`View photo ${index + 1}`}
            >
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
              <div className={`absolute inset-0 ${index === activeIndex ? 'bg-gold/10' : 'bg-black/25'}`} />
            </button>
          ))}
        </div>
      ) : null}

      <ImageLightbox
        key={`${title}-${activeIndex}-${normalizedImages.join('|')}`}
        open={lightboxOpen}
        images={normalizedImages}
        initialIndex={activeIndex}
        title={title}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
