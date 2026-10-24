'use client';

import { ReactNode, useLayoutEffect } from 'react';
import { applyThemeMode, getStoredTheme } from '@/lib/themeMode';
import { useTheme } from '@/lib/useTheme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    applyThemeMode(getStoredTheme());
  }, []);

  useTheme();

  return <>{children}</>;
}
