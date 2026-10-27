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
        className={`site-nav fixed top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? 'site-nav-scrolled shadow-[0_12px_40px_rgba(0,0,0,0.45)] py-1'
            : 'py-2'
        }`}
        style={{
          backdropFilter: scrolled ? 'blur(24px)' : 'blur(14px)',
          backgroundColor: scrolled ? 'rgba(12, 10, 16, 0.96)' : 'transparent',
        }}
      >
        <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-8 lg:px-12 xl:px-16">
          <Link href="/" className="group flex min-w-0 items-center gap-3" onClick={() => setMobileOpen(false)}>
            <Logo className="h-9 w-9 shrink-0 transition duration-300 group-hover:scale-105" priority />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold sm:text-xs">T. De Leon Chapter</p>
              <p className="truncate text-sm font-bold tracking-tight text-foreground sm:text-base">Order of DeMolay</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink key={item.href} href={item.href} active={isActive(item.href)}>
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={openJoin}
              className="relative px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-foreground/90 transition hover:text-gold"
            >
              Join Us
            </button>
            <div className="ml-2 flex items-center gap-2 border-l border-white/10 pl-4">
              <ThemeToggle />
              <AdminModal />
            </div>
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <AdminModal />
            <button
              type="button"
              className="nav-icon-btn rounded-xl p-2 text-foreground"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((o) => !o)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-80"
          aria-hidden
        />
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
      className={`nav-pill relative px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors duration-200 ${
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
