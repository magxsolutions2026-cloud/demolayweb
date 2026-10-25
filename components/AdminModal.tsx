'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openModal = () => {
    setError('');
    setUsername('');
    setPassword('');
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
        setError(body?.error || 'Invalid login');
        setLoading(false);
        return;
      }

      setLoading(false);
      router.replace('/admin/dashboard');
    } catch {
      setError('Unable to communicate with server.');
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="text-foreground hover:text-gold transition-colors duration-200 border border-transparent hover:border-gold px-3 py-1 rounded"
      >
        Admin
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-maroon/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="glass text-foreground rounded-2xl w-full max-w-md p-6 relative border border-gold/30"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute right-3 top-3 text-foreground/80 hover:text-gold transition"
                aria-label="Close admin login"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold mb-2 text-gold">Admin Sign In</h2>
              <p className="text-sm text-foreground/80 mb-4">Secure manager gateway with your chapter themes.</p>

              {error && <div className="rounded bg-red-100 text-red-700 p-2 mb-3">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  autoFocus
                  type="text"
                  name="username"
                  value={username}
                  placeholder="Email or username"
                  onChange={(e) => setUsername(e.target.value)}
                  className="input px-3.5 py-2.5"
                  required
                />
                <input
                  type="password"
                  name="password"
                  value={password}
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="input px-3.5 py-2.5"
                  required
                />
                <button
                  disabled={loading}
                  className="btn w-full"
                  type="submit"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
