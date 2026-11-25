'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import AdminModal from './AdminModal';
import ThemeToggle from './ThemeToggle';
import { useJoinUsModal } from './site/JoinUsModalContext';

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
      <motion.header
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-3 sm:top-5"
      >
        {/* Geometry is measured from the design reference: 750×56 units on desktop, center tab only on mobile. */}
        <div
          className={`nav-ref pointer-events-auto relative aspect-[420/56] w-[min(92vw,360px)] lg:aspect-[750/56] lg:w-[min(63vw,980px)] ${
            scrolled ? 'nav-ref-scrolled' : ''
          }`}
        >
          <NavShape variant="desktop" className="absolute inset-0 hidden h-full w-full lg:block" />
          <NavShape variant="mobile" className="absolute inset-0 h-full w-full lg:hidden" />

          <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[92%] items-center justify-center">
            <NavSlot>
              <ThemeToggle bare />
            </NavSlot>
            <NavSlot>
              <NavDivider />
            </NavSlot>
            <NavSlot>
              <Link href="/" aria-label="Home" onClick={() => setMobileOpen(false)}>
                <Logo className="h-9 w-9 shrink-0 transition duration-300 hover:scale-105" priority />
              </Link>
            </NavSlot>
            <NavSlot className="lg:hidden">
              <NavDivider />
            </NavSlot>
            <NavSlot className="lg:hidden">
              <AdminModal variant="avatar" />
            </NavSlot>
            <NavSlot>
              <NavDivider />
            </NavSlot>
            <NavSlot>
              <button
                type="button"
                className="flex h-8 w-9 items-center justify-center text-[#1a0a0d] transition hover:opacity-70"
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileOpen((o) => !o)}
              >
                <svg className="h-3.5 w-8" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 32 14">
                  {mobileOpen ? (
                    <path strokeLinecap="round" d="M10 1l12 12M22 1L10 13" />
                  ) : (
                    <path strokeLinecap="round" d="M1 1h30M1 7h30M1 13h30" />
                  )}
                </svg>
              </button>
            </NavSlot>
          </div>

          <nav className="absolute left-[4.3%] top-0 hidden h-[92%] items-center gap-8 lg:flex" aria-label="Primary">
            {NAV.slice(0, 2).map((item) => (
              <NavLink key={item.href} href={item.href} active={isActive(item.href)}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="absolute right-[4.3%] top-0 hidden h-[92%] items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={openJoin}
              className="text-[13px] text-[#f3e6e2]/85 transition hover:text-white"
            >
              Join Us
            </button>
            <span className="h-px w-6 bg-[#f3e6e2]/55" aria-hidden />
            <AdminModal variant="avatar" />
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
              className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="border-gold/20 fixed right-0 top-0 z-50 flex h-full w-[min(100%,320px)] flex-col border-l bg-[#0c0a10]/95 shadow-2xl backdrop-blur-xl"
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
      className={`text-[13px] transition-colors duration-200 ${
        active ? 'text-white' : 'text-[#f3e6e2]/75 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}

/** Equal-width slots put the center icons at the reference's spacing (~6.9% of the bar on desktop). */
function NavSlot({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`pointer-events-auto flex w-[12.4%] justify-center lg:w-[6.9%] ${className}`}>{children}</div>
  );
}

function NavDivider() {
  return <span className="block h-5 w-px bg-[#1a0a0d]/40" aria-hidden />;
}

const CENTER_PATH =
  'M190 2H562.5Q572.5 2 567 10L545 47Q542.5 51 538 51H214.5Q210 51 207.5 47L185.5 10Q180 2 190 2Z';
const SOCKET_PATH =
  'M178 0H574.5Q586 0 580 9L556 52Q554 55 549 55H203.5Q198.5 55 196.5 52L172.5 9Q166.5 0 178 0Z';
const LEFT_PILL_PATH = 'M10 2H230L260 51H20Q13 51 11.5 46L0.8 8Q0 2 10 2Z';
const RIGHT_PILL_PATH = 'M740 2H520L490 51H730Q737 51 738.5 46L749.2 8Q750 2 740 2Z';

function NavShape({ variant, className }: { variant: 'desktop' | 'mobile'; className: string }) {
  const id = `nav-${variant}`;
  return (
    <svg
      className={className}
      viewBox={variant === 'desktop' ? '0 0 750 56' : '166 0 420 56'}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-pill-l`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#9c3a4e" stopOpacity="0.92" />
          <stop offset="0.55" stopColor="#5e1a28" stopOpacity="0.9" />
          <stop offset="1" stopColor="#2e0b12" stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id={`${id}-pill-r`} x1="1" x2="0" y1="0" y2="0">
          <stop offset="0" stopColor="#9c3a4e" stopOpacity="0.92" />
          <stop offset="0.55" stopColor="#5e1a28" stopOpacity="0.9" />
          <stop offset="1" stopColor="#2e0b12" stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id={`${id}-center`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#efd47e" />
          <stop offset="1" stopColor="#d4af37" />
        </linearGradient>
      </defs>
      {variant === 'desktop' ? (
        <>
          <path d={LEFT_PILL_PATH} fill={`url(#${id}-pill-l)`} stroke="rgba(255,255,255,0.14)" vectorEffect="non-scaling-stroke" />
          <path d={RIGHT_PILL_PATH} fill={`url(#${id}-pill-r)`} stroke="rgba(255,255,255,0.14)" vectorEffect="non-scaling-stroke" />
        </>
      ) : null}
      <path d={SOCKET_PATH} fill="#12060a" fillOpacity="0.92" />
      <path d={CENTER_PATH} fill={`url(#${id}-center)`} />
      <path d="M192 3.2H560.5" stroke="rgba(255,255,255,0.55)" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
