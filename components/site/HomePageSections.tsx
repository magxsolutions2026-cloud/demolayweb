import HomeFeed from '@/components/site/HomeFeed';
import HomeHeroVideoDynamic from '@/components/site/HomeHeroVideoDynamic';
import InteractiveHeroHUD from '@/components/site/InteractiveHeroHUD';
import { NewsletterSubscribeForm } from '@/components/site/NewsletterSubscribeForm';
import PhilippinesGlobe from '@/components/site/PhilippinesGlobe';
import type { FeedItem } from '@/lib/homeFeed';
import { LODGE_ADDRESS, googleMapsLodgeUrl, googleStreetViewOpenUrl } from '@/lib/lodgeLocation';

interface HomePageSectionsProps {
  feedItems: FeedItem[];
}

/**
 * Entire home route layout: fixed video backdrop, #home hero, feed, newsletter, lodge — one place to edit.
 */
export default function HomePageSections({ feedItems }: HomePageSectionsProps) {
  const virtues = [
    {
      name: 'Filial Love',
      desc: 'Love and respect for parents, acknowledging their role in nurturing and teaching life’s lessons.',
    },
    {
      name: 'Reverence for Sacred Things',
      desc: 'Deep faith in a higher being, with respect for others’ religious beliefs.',
    },
    {
      name: 'Courtesy',
      desc: 'Commitment to kindness and respect for friends, family, and strangers alike.',
    },
    {
      name: 'Comradeship',
      desc: 'Faithful friendship, supporting brothers through both good and hard times.',
    },
    {
      name: 'Fidelity',
      desc: 'Unwavering loyalty to values, friends, duty, and country, like Jacques DeMolay.',
    },
    {
      name: 'Cleanness',
      desc: 'Purity in thought, word, and deed: a clean mind, body, and conscience.',
    },
    {
      name: 'Patriotism',
      desc: 'Serving as a good citizen, honoring your country and the flag.',
    },
  ];

  return (
    <main className="page-enter relative">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[100dvh] w-full overflow-hidden"
        aria-hidden
      >
        <HomeHeroVideoDynamic />
      </div>

      <section id="home" className="relative z-10 min-h-[100dvh] w-full">
        <InteractiveHeroHUD />
      </section>

      <div className="relative z-10 w-full">
        <section id="feed" className="scroll-mt-24 px-4 py-6 sm:px-8 md:py-8 lg:px-12 xl:px-16">
          <HomeFeed items={feedItems} />

          {/* Seven Cardinal Virtues card — sits below the main chapter feed */}
          <div className="mx-auto mt-8 w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] md:mt-12">
            <div className="glass rounded-3xl p-6 backdrop-blur-xl md:p-8">
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-semibold uppercase tracking-[0.22em] text-gold/95 text-[0.72rem] md:text-xs">
                    Seven Cardinal Virtues
                  </p>
                  <h2 className="font-serif mt-2 text-2xl font-bold leading-tight text-foreground md:text-3xl">
                    Learn the principles
                  </h2>
                </div>
                <div className="text-foreground/80 text-sm md:text-base">
                  Live them in thought, word, and deed.
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {virtues.map((v) => (
                  <div
                    key={v.name}
                    className="rounded-2xl border border-gold/15 bg-[rgba(10,10,10,0.18)] p-4"
                  >
                    <p className="text-sm font-semibold leading-tight text-gold">{v.name}</p>
                    <p className="mt-2 text-xs leading-snug text-foreground/80 line-clamp-2">
                      {v.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Philippine DeMolay: a 3D Earth over the Philippines, seen through a capsule cabin window */}
          <div className="mx-auto mt-8 w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] md:mt-12">
            <section className="orbit-cabin px-5 pb-5 pt-10 md:px-10 md:pt-14" aria-labelledby="worldwide-heading">
              <div className="relative z-10 text-center">
                <p className="inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.24em] text-foreground/60 md:text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_#d4af37]" />
                  Philippine Jurisdiction · Supreme Council
                </p>
                <h2 id="worldwide-heading" className="font-serif mt-4 text-3xl font-bold leading-tight text-foreground md:text-5xl">
                  DeMolay in the Philippines,
                </h2>
                <p className="font-serif text-2xl leading-tight text-foreground/50 md:text-4xl">seen from orbit.</p>
              </div>

              <div className="orbit-window-frame relative z-10 mx-auto mt-8 w-full max-w-5xl md:mt-12">
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

              <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-foreground/45">
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

          {/* Lodge CTA merged into the same "chapter feed" area */}
          <div className="mx-auto mt-8 w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] md:mt-12">
            <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gold/25 bg-[rgba(12,10,16,0.38)] shadow-lg backdrop-blur-xl">
              <div className="w-full overflow-hidden bg-gradient-to-br from-maroon/25 via-[rgba(26,20,32,0.45)] to-[rgba(10,10,10,0.5)] p-5">
                <p className="text-gold mb-2 text-xs font-semibold uppercase tracking-[0.2em]">Lodge</p>
                <h3 className="font-serif text-2xl font-bold leading-tight text-gold">Visit the lodge</h3>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-foreground/80 mb-4 text-sm leading-relaxed">{LODGE_ADDRESS}</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={googleMapsLodgeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-ghost !px-4 !py-2 text-sm"
                  >
                    Google Maps
                  </a>
                  <a
                    href={googleStreetViewOpenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-ghost !px-4 !py-2 text-sm"
                  >
                    Street View
                  </a>
                  <a href="/contact" className="cta-primary !px-4 !py-2 text-sm">
                    Full contact
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Make the area behind the newsletter blend with the video backdrop */}
        <div className="bg-[rgba(10,8,16,0.15)]">
          <section id="newsletter" className="px-4 py-4 sm:px-8 md:py-6 lg:px-12 xl:px-16">
            <div className="mx-auto w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] rounded-3xl border border-gold/35 bg-[rgba(10,10,10,0.15)] p-8 backdrop-blur-xl">
              <h2 className="font-serif mb-4 text-3xl font-bold text-gold md:text-4xl">Newsletter</h2>
              <p className="mb-4 text-foreground/80">Get events, announcements, and chapter milestones in your inbox.</p>
              <NewsletterSubscribeForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
