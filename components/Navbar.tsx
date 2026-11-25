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
        className={`pointer-events-none fixed inset-x-0 top-3 z-50 flex items-start justify-center px-3 sm:top-4 ${
          scrolled ? 'nav-notch-scrolled' : ''
        }`}
      >
        <nav
          className="nav-notch-side nav-notch-left pointer-events-auto mt-1.5 hidden h-11 min-w-[22rem] items-center justify-start gap-3 pl-8 pr-10 lg:flex"
          aria-label="Primary"
        >
          {NAV.slice(0, 3).map((item) => (
            <NavLink key={item.href} href={item.href} active={isActive(item.href)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-notch-center pointer-events-auto z-10 flex h-[4.5rem] items-center gap-5 px-10 lg:mx-2 lg:px-12">
          <ThemeToggle />
          <span className="h-5 w-px bg-gold/30" aria-hidden />
          <Link href="/" aria-label="Home" onClick={() => setMobileOpen(false)}>
            <Logo className="h-10 w-10 shrink-0 transition duration-300 hover:scale-105" priority />
          </Link>
          <span className="h-5 w-px bg-gold/30 lg:hidden" aria-hidden />
          <div className="lg:hidden">
            <AdminModal />
          </div>
          <span className="h-5 w-px bg-gold/30" aria-hidden />
          <button
            type="button"
            className="nav-icon-btn rounded-xl p-1.5 text-foreground"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <div className="nav-notch-side nav-notch-right pointer-events-auto mt-1.5 hidden h-11 min-w-[22rem] items-center justify-end gap-3 pl-10 pr-8 lg:flex">
          {NAV.slice(3).map((item) => (
            <NavLink key={item.href} href={item.href} active={isActive(item.href)}>
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={openJoin}
            className="relative px-3 py-2 text-[13px] font-medium tracking-wide text-gold transition hover:text-foreground"
          >
            Join Us
          </button>
          <AdminModal />
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
              className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="border-gold/20 fixed right-0 top-0 z-50 flex h-full w-[min(100%,320px)] flex-col border-l bg-[#0c0a10]/95 shadow-2xl backdrop-blur-xl lg:hidden"
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
      className={`nav-pill relative px-3 py-2 text-[13px] font-medium tracking-wide transition-colors duration-200 ${
        active ? 'text-gold' : 'text-foreground/85 hover:text-gold'
      }`}
    >
      {children}
      <span
        className={`absolute bottom-1 left-3 right-3 h-0.5 origin-center rounded-full bg-gradient-to-r from-gold via-[#c9a227] to-maroon transition-transform duration-300 ${
          active ? 'scale-x-100' : 'scale-x-0 hover:scale-x-60'
        }`}
        aria-hidden
      />
    </Link>
  );
}
