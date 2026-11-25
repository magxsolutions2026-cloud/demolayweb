import PhilippinesGlobe from '@/components/site/PhilippinesGlobe';

/** Philippine DeMolay: a 3D Earth over the Philippines, seen through a capsule cabin window. */
export default function HomeGlobe() {
  return (
    <div className="home-section">
      <div className="home-container">
        <section className="relative" aria-labelledby="worldwide-heading">
          <div className="relative z-10 text-center">
            <p className="inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.24em] text-gold/85 md:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_#d4af37]" />
              Philippine Jurisdiction · Supreme Council
            </p>
            <h2 id="worldwide-heading" className="font-serif mt-4 text-3xl font-bold leading-tight text-foreground md:text-5xl">
              DeMolay in the Philippines,
            </h2>
            <p className="font-serif text-2xl leading-tight text-foreground/50 md:text-4xl">seen from orbit.</p>
          </div>

          <div className="orbit-window-frame relative z-10 mt-8 w-full md:mt-12">
            <div
              className="orbit-window"
              role="img"
              aria-label="3D Earth seen from low orbit over the Philippines, with a gold pin on Ilagan, Isabela."
            >
              <PhilippinesGlobe />
            </div>
          </div>

          <div className="relative z-10 mt-8 grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-end">
            <div>
              <p className="text-sm font-semibold text-foreground">113 chapters across the islands.</p>
              <p className="mt-1 max-w-xs text-sm text-foreground/60">
                From Luzon to Mindanao, Philippine DeMolay chapters share the same values of leadership, service,
                and brotherhood. <span className="text-foreground/40">(As of February 2023.)</span>
              </p>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-sm text-foreground/75">
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_10px_#d4af37]" />
                Our home: Ilagan, Isabela
              </p>
              <p className="flex items-center gap-2 text-xs text-foreground/55">
                <span className="h-2 w-2 rounded-full bg-[#d9262b] shadow-[0_0_8px_rgba(217,38,43,0.7)]" />
                Chapters per province (estimated)
              </p>
            </div>
            <div className="md:text-right">
              <p className="text-sm font-semibold text-foreground">Supreme Council of the Philippines</p>
              <p className="mt-1 text-sm text-foreground/60">Instituted May 4, 1983</p>
            </div>
          </div>

          <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/10 pt-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-foreground/45">
            <span>T. De Leon Chapter No. 47</span>
            <span className="flex flex-wrap gap-6">
              <span>
                Lat <b className="font-semibold text-foreground/85">17.15° N</b>
              </span>
              <span>
                Lon <b className="font-semibold text-foreground/85">121.89° E</b>
              </span>
              <span>
                Over <b className="font-semibold text-foreground/85">Northern Luzon</b>
              </span>
            </span>
            <span>Ilagan, Isabela</span>
          </div>
        </section>
      </div>
    </div>
  );
}
