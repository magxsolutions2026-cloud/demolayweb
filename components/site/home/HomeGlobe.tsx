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
