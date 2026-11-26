'use client';

import { ReactNode } from 'react';
import { useTheme } from '@/lib/useTheme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  useTheme();

  return <>{children}</>;
}
