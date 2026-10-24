'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useJoinUsModal } from './JoinUsModalContext';

/** Non-blocking snackbar; z-index above Join Us modal. */
export default function SiteToast() {
  const { toastMessage, dismissToast } = useJoinUsModal();

  return (
    <AnimatePresence mode="wait">
      {toastMessage ? (
        <motion.div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="border-gold/30 fixed bottom-5 left-4 right-4 z-[110] mx-auto flex max-w-md items-start gap-3 rounded-2xl border bg-[#141018]/95 px-4 py-3 shadow-2xl backdrop-blur-md sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
        >
          <p className="text-foreground/95 min-w-0 flex-1 text-sm leading-snug">{toastMessage}</p>
          <button
            type="button"
            onClick={dismissToast}
            className="text-foreground/50 hover:text-gold shrink-0 rounded-lg p-1 transition"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
