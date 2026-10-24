import LodgeMap from '@/components/LodgeMap';
import { LODGE_ADDRESS, googleMapsLodgeUrl, googleStreetViewOpenUrl } from '@/lib/lodgeLocation';

export default function ContactPage() {
  return (
    <main className="px-6 py-28 md:px-10 md:py-32">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-stretch">
        <div className="rounded-3xl border border-gold/35 bg-[rgba(10,10,10,0.55)] p-8 backdrop-blur-xl lg:min-h-0 lg:min-w-0 lg:flex-1">
          <p className="text-gold mb-3 text-xs font-semibold uppercase tracking-[0.22em]">Contact</p>
          <h1 className="font-serif mb-6 text-4xl font-bold text-gold md:text-5xl">Reach the chapter</h1>
          <p className="mb-6 text-foreground/80">Membership inquiries, visit requests, and event questions.</p>
          <div className="space-y-3 text-foreground/85">
            <p>
              <span className="text-gold">Email:</span> tdeleonchapter47@gmail.com
            </p>
            <p>
              <span className="text-gold">Address:</span>{' '}
              <span className="block sm:inline sm:pl-1">{LODGE_ADDRESS}</span>
            </p>
            <p className="space-y-1 pt-1">
              <a
                href={googleMapsLodgeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gold/90 underline decoration-gold/40 underline-offset-2 hover:text-gold"
              >
                Open lodge location in Google Maps
              </a>
              <a
                href={googleStreetViewOpenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gold/90 underline decoration-gold/40 underline-offset-2 hover:text-gold"
              >
                Open Street View (360° on Rizal St)
              </a>
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="https://facebook.com" className="cta-ghost">
              Facebook
            </a>
          </div>
        </div>
        <div className="flex min-h-[360px] w-full min-w-0 flex-col overflow-hidden rounded-3xl border border-gold/35 bg-[rgba(10,10,10,0.55)] p-2 backdrop-blur-xl lg:min-h-0 lg:flex-1">
          <LodgeMap />
        </div>
      </div>
    </main>
  );
}
