'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Orbitron } from 'next/font/google';
import { useEffect, useState } from 'react';
import AdminModal from './AdminModal';
import SiteFrame from './site/SiteFrame';
import { useJoinUsModal } from './site/JoinUsModalContext';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700'] });

/** Same gold-to-amber gradient text as the hero's "Chapter No. 47". */
const GOLD_TEXT = 'bg-gradient-to-r from-gold via-amber-200 to-amber-500 bg-clip-text text-transparent';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Officers', href: '/officers' },
  { label: 'Events', href: '/events' },
  { label: 'Contact', href: '/contact' },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const { open: openJoin } = useJoinUsModal();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <SiteFrame scrolled={scrolled} />
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed inset-x-0 top-0 z-50"
      >
        <div className="relative flex h-[70px] items-center px-[calc(var(--frame-inset)+18px)] pt-[var(--frame-inset)] lg:h-[80px] lg:px-[calc(var(--frame-inset)+26px)]">
          <nav className={`${orbitron.className} pointer-events-auto hidden flex-1 items-center gap-7 lg:flex`} aria-label="Primary">
            {NAV.map((item) => (
              <NavLink key={item.href} href={item.href} active={isActive(item.href)}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex-1 lg:hidden" />

          {/* Sits in the frame's top notch (see SiteFrame). */}
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={`${orbitron.className} pointer-events-auto absolute left-1/2 top-[calc(var(--frame-notch-depth)/2+var(--frame-inset)/2)] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[19px] font-bold tracking-[0.04em] ${GOLD_TEXT} transition hover:brightness-125 lg:text-[27px]`}
          >
            TDLC#47
          </Link>

          <div className={`${orbitron.className} pointer-events-auto flex flex-1 items-center justify-end gap-4 lg:gap-5`}>
            <button
              type="button"
              onClick={openJoin}
              className={`hidden text-[12px] ${GOLD_TEXT} opacity-70 transition hover:opacity-100 lg:block`}
            >
              Join Us
            </button>
            <div className="hidden lg:block">
              <AdminModal variant="avatar" />
            </div>
            <button
              type="button"
              className="flex items-center gap-2.5 text-[12px] text-gold transition hover:text-amber-200"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className={`hidden sm:inline ${GOLD_TEXT}`}>Menu</span>
              <svg className="h-3 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 16 12">
                {mobileOpen ? (
                  <path strokeLinecap="round" d="M3 1l10 10M13 1L3 11" />
                ) : (
                  <path strokeLinecap="round" d="M1 1h14M5 6h10M9 11h6" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="border-gold/20 fixed right-0 top-0 z-[60] flex h-full w-[min(100%,320px)] flex-col border-l bg-[#0c0a10]/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gold">Menu</span>
                <button
                  type="button"
                  className="rounded-lg p-2 text-foreground/70 hover:text-gold"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Mobile primary">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider transition ${
                      isActive(item.href)
                        ? 'bg-gold/15 text-gold'
                        : 'text-foreground/85 hover:bg-white/5 hover:text-gold'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    openJoin();
                  }}
                  className="mt-2 rounded-xl bg-gradient-to-r from-gold/25 to-maroon/40 px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-gold"
                >
                  Join Us
                </button>
              </nav>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`text-[12px] underline-offset-[6px] transition-colors duration-200 ${
        active ? `${GOLD_TEXT} underline decoration-gold decoration-1` : `${GOLD_TEXT} opacity-60 hover:opacity-100`
      }`}
    >
      {children}
    </Link>
  );
}
