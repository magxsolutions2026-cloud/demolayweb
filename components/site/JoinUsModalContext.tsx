'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type JoinUsContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
  /** Short confirmation bar (e.g. after successful petition). Safe: text only, auto-dismiss. */
  showToast: (message: string) => void;
  dismissToast: () => void;
  toastMessage: string | null;
};

const JoinUsModalContext = createContext<JoinUsContextValue | null>(null);

const TOAST_MS = 5200;

export function JoinUsModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToastMessage(null);
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, TOAST_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const value = useMemo(
    () => ({
      open,
      close,
      isOpen,
      showToast,
      dismissToast,
      toastMessage,
    }),
    [open, close, isOpen, showToast, dismissToast, toastMessage],
  );

  return <JoinUsModalContext.Provider value={value}>{children}</JoinUsModalContext.Provider>;
}

export function useJoinUsModal() {
  const ctx = useContext(JoinUsModalContext);
  if (!ctx) {
    throw new Error('useJoinUsModal must be used within JoinUsModalProvider');
  }
  return ctx;
}
