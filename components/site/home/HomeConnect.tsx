import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { NewsletterSubscribeForm } from '@/components/site/NewsletterSubscribeForm';
import { LODGE_ADDRESS, googleMapsEmbedSrc, googleMapsLodgeUrl, googleStreetViewOpenUrl } from '@/lib/lodgeLocation';
import SectionHeading from './SectionHeading';

/** Closing section: where we meet (map) and the newsletter, side by side. */
export default function HomeConnect() {
  return (
    <section id="connect" className="home-section" aria-labelledby="connect-heading">
      <div className="home-container">
        <div className="reveal">
          <SectionHeading
            id="connect-heading"
            eyebrow="Visit & stay connected"
            title="Find us in Ilagan."
            subtitle="Chapter meetings are held at Isabela Lodge No. 60. Drop by, or follow along from home."
          />
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div className="reveal glass flex flex-col overflow-hidden rounded-[var(--frame-radius)]">
            <iframe
              title="Map to Isabela Lodge No. 60"
              src={googleMapsEmbedSrc}
              className="relative z-10 h-64 w-full border-0 grayscale-[35%] md:h-80"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="relative z-10 flex flex-1 flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
              <p className="flex items-start gap-3 text-sm leading-relaxed text-foreground/75">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                {LODGE_ADDRESS}
              </p>
              <div className="flex shrink-0 flex-wrap gap-3">
                <a href={googleMapsLodgeUrl} target="_blank" rel="noopener noreferrer" className="cta-ghost !px-4 !py-2 text-xs uppercase tracking-[0.16em]">
                  Directions
                </a>
                <a href={googleStreetViewOpenUrl} target="_blank" rel="noopener noreferrer" className="cta-ghost !px-4 !py-2 text-xs uppercase tracking-[0.16em]">
                  Street View
                </a>
              </div>
            </div>
          </div>

          <div id="newsletter" className="reveal glass flex scroll-mt-24 flex-col justify-between rounded-[var(--frame-radius)] p-6 md:p-8">
            <div className="relative z-10">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-gold/80">Newsletter</p>
              <h3 className="font-serif mt-3 text-2xl font-bold leading-tight text-foreground md:text-3xl">
                Never miss a chapter moment.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/65">
                Events, announcements and milestones, straight to your inbox. No spam.
              </p>
            </div>
            <div className="relative z-10 mt-8">
              <NewsletterSubscribeForm />
              <p className="mt-4 text-xs text-foreground/45">
                Prefer to talk?{' '}
                <Link href="/contact" className="text-gold hover:text-amber-200">
                  Contact the chapter
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
