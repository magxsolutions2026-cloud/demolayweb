'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUp, Mail, MapPin } from 'lucide-react';
import Logo from './Logo';
import { LODGE_ADDRESS, googleMapsLodgeUrl } from '@/lib/lodgeLocation';
import { NewsletterSubscribeForm } from './site/NewsletterSubscribeForm';
import { useJoinUsModal } from './site/JoinUsModalContext';

const CONTACT_EMAIL = 'tdeleonchapter47@gmail.com';

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Officers', href: '/officers' },
  { label: 'Events', href: '/events' },
  { label: 'News', href: '/news' },
  { label: 'Contact', href: '/contact' },
] as const;

/** Site footer on a solid backdrop. The home page has its own newsletter section, so the footer form is hidden there. */
export default function Footer() {
  const pathname = usePathname();
  const { open: openJoin } = useJoinUsModal();
  const showNewsletter = pathname !== '/';

  return (
    <footer className="relative z-10 border-t border-gold/15 bg-[var(--background)]">
      <div className="home-container py-16 md:py-20">
        <div className={`grid gap-12 md:grid-cols-2 ${showNewsletter ? 'lg:grid-cols-[1.3fr_0.8fr_1fr_1.2fr]' : 'lg:grid-cols-[1.4fr_0.8fr_1.2fr]'}`}>
          <div>
            <div className="flex items-center gap-3">
              <Logo className="h-11 w-11" />
              <div>
                <p className="font-serif text-lg font-bold leading-tight text-foreground">T. De Leon Chapter No. 47</p>
                <p className="text-xs uppercase tracking-[0.2em] text-gold/80">Order of DeMolay</p>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-foreground/60">
              Timeless Devotion, Lasting Camaraderie. Building character, leadership and brotherhood among the young men
              of Ilagan City, Isabela.
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-gold/80">Explore</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-foreground/65 transition-colors hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" onClick={openJoin} className="text-foreground/65 transition-colors hover:text-gold">
                  Join Us
                </button>
              </li>
            </ul>
          </nav>

          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-gold/80">Visit</p>
            <ul className="mt-5 space-y-4 text-sm text-foreground/65">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-start gap-3 transition-colors hover:text-gold">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold/80" aria-hidden />
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={googleMapsLodgeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 leading-relaxed transition-colors hover:text-gold"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold/80" aria-hidden />
                  {LODGE_ADDRESS}
                </a>
              </li>
            </ul>
          </div>

          {showNewsletter ? (
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-gold/80">Stay updated</p>
              <p className="mt-5 text-sm text-foreground/60">Events and chapter news in your inbox.</p>
              <NewsletterSubscribeForm variant="compact" placeholder="Your email" className="mt-4 max-w-md" />
            </div>
          ) : null}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-foreground/10 pt-6 sm:flex-row">
          <p className="text-center text-xs text-foreground/50 sm:text-left">
            © {new Date().getFullYear()} T. De Leon Chapter No. 47 · Order of DeMolay. All rights reserved.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cta-ghost !px-4 !py-2 gap-2 text-xs uppercase tracking-[0.16em]"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </footer>
  );
}
