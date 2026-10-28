'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function AdminModal() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [open]);

  const openModal = () => {
    setError('');
    setUsername('');
    setPassword('');
    setShowPassword(false);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body?.error || 'Invalid username or password.');
        setLoading(false);
        return;
      }

      setLoading(false);
      setOpen(false);
      router.replace('/admin/dashboard');
    } catch {
      setError('Unable to connect to the authentication server.');
      setLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-gold/35 bg-[linear-gradient(180deg,rgba(26,12,18,0.94),rgba(12,10,16,0.96))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.7),0_0_32px_rgba(212,175,55,0.12)] backdrop-blur-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient gold/maroon subtle glows */}
            <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-gold/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-maroon/30 blur-3xl" />

            {/* Header row */}
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold shadow-[0_0_12px_rgba(212,175,55,0.25)]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-gold/90">
                  Officer Gateway · Chapter 47
                </span>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-1.5 text-foreground/60 transition hover:border-gold/40 hover:bg-white/10 hover:text-gold"
                aria-label="Close admin login"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Title & subtitle */}
            <div className="relative mt-4">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Admin Sign In
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground/70">
                Enter your authorized chapter credentials to access the administrative portal.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mt-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="relative mt-5 space-y-4">
              {/* Username field */}
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-foreground/45">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    autoFocus
                    type="text"
                    name="username"
                    value={username}
                    placeholder="officer@demolay.org"
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/40 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-foreground/35 shadow-inner transition focus:border-gold focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-gold/50"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-foreground/45">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    placeholder="••••••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/40 py-2.5 pl-10 pr-10 text-sm text-white placeholder-foreground/35 shadow-inner transition focus:border-gold focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-gold/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-foreground/45 transition hover:text-gold"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-gold/45 bg-[linear-gradient(135deg,#d4af37_0%,#a8742a_45%,#730e1b_100%)] py-3 text-xs font-bold uppercase tracking-[0.22em] text-[#0b090d] shadow-[0_12px_28px_rgba(212,175,55,0.3)] transition duration-300 hover:scale-[1.01] hover:shadow-[0_16px_36px_rgba(212,175,55,0.45)] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#0b090d]" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Access Portal</span>
                      <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                  {/* Subtle shimmer effect */}
                  <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="rounded-lg border border-transparent px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/80 transition duration-300 hover:border-gold/30 hover:bg-gold/10 hover:text-gold"
      >
        Admin
      </button>

      {/* Render via React Portal so it breaks free from Navbar's transform stacking context */}
      {mounted ? createPortal(modalContent, document.body) : null}
    </>
  );
}
