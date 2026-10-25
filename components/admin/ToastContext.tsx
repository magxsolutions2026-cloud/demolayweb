'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

type ToastItem = { id: number; type: 'success' | 'error'; message: string };

type ToastContextValue = {
  toast: (type: 'success' | 'error', message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useAdminToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useAdminToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((type: 'success' | 'error', message: string) => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-md ${
                t.type === 'success'
                  ? 'border-emerald-500/35 bg-emerald-950/90 text-emerald-50'
                  : 'border-rose-500/40 bg-rose-950/90 text-rose-50'
              }`}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
