export const THEME_STORAGE_KEY = 'demolay-theme';

export type ThemeMode = 'light' | 'dark';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : 'dark';
  } catch {
    return 'dark';
  }
}

export const THEME_CHANGE_EVENT = 'demolay-theme-change';

export function applyThemeMode(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', mode);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }
}
