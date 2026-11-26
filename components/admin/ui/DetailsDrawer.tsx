'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useId } from 'react';

/** Right-side panel for one record: header, scrollable body, and an action footer. Escape or the backdrop closes it. */
export function DetailsDrawer({
  open,
  onClose,
  title,
  subtitle,
  avatar,
  chip,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  chip?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close details"
            className="fixed inset-0 z-[79] cursor-default bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="cs-drawer"
            initial={reduce ? { opacity: 0 } : { x: 460 }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: 460 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="cs-drawer-head">
              {avatar}
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="truncate text-lg font-semibold text-[var(--cs-ink)]">
                  {title}
                </h2>
                {subtitle ? <p className="mt-0.5 truncate text-sm text-[var(--cs-muted)]">{subtitle}</p> : null}
                {chip ? <div className="mt-2">{chip}</div> : null}
              </div>
              <button type="button" className="cs-icon-btn" onClick={onClose} aria-label="Close details">
                <X />
              </button>
            </div>
            <div className="cs-drawer-body admin-scroll">{children}</div>
            {footer ? <div className="cs-drawer-foot">{footer}</div> : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
