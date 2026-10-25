'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { X } from 'lucide-react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const maxW: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function DashboardModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-[#0a0810]/72 p-0 backdrop-blur-[10px] sm:items-center sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
            className={`admin-modal-surface border-gold/25 text-foreground relative mt-auto max-h-[92vh] w-full overflow-hidden rounded-t-2xl border shadow-2xl sm:mt-0 sm:max-h-[min(90vh,840px)] sm:rounded-2xl ${maxW[size]}`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-glow pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative flex max-h-[inherit] flex-col">
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0 space-y-1 pr-8">
                  <h2 id="admin-modal-title" className="text-lg font-semibold tracking-tight text-gold sm:text-xl">
                    {title}
                  </h2>
                  {description ? (
                    <p className="text-foreground/65 text-sm leading-relaxed">{description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-foreground/50 hover:text-gold absolute right-3 top-3 rounded-lg p-2 transition duration-200 hover:scale-105 hover:bg-white/10"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {children ? (
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">{children}</div>
              ) : null}
              {footer ? (
                <div className="border-gold/15 flex shrink-0 flex-wrap items-center justify-end gap-3 border-t bg-black/25 px-5 py-4 sm:px-6">
                  {footer}
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
