import HomeFeed from '@/components/site/HomeFeed';
import HomeHeroVideoDynamic from '@/components/site/HomeHeroVideoDynamic';
import InteractiveHeroHUD from '@/components/site/InteractiveHeroHUD';
import { NewsletterSubscribeForm } from '@/components/site/NewsletterSubscribeForm';
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
