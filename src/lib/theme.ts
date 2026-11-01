/**
 * Colour theme: light, dark, or follow the system.
 *
 * The choice is kept in this browser's localStorage under `theme` ("light" or
 * "dark"; no key means "system"). public/theme-init.js reads the same key
 * before the first paint and sets `data-theme` on <html>; this module keeps
 * the attribute current after that. Pure DOM, no React, so both can agree.
 */
export type ThemePref = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

export const THEME_PREFS: readonly ThemePref[] = ['light', 'dark', 'system'];
export const THEME_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

export function readThemePref(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* storage blocked (private mode, strict settings): behave as "system" */
  }
  return 'system';
}

export function resolveTheme(pref: ThemePref): Theme {
  if (pref !== 'system') return pref;
  return typeof matchMedia === 'function' && matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

/** The browser bar matches the page: white paper in light, dark paper in dark. Kept in step with theme.css. */
const THEME_COLOR: Record<Theme, string> = { light: '#ffffff', dark: '#0f131a' };

export function applyThemePref(pref: ThemePref): void {
  const theme = resolveTheme(pref);
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}

/** Persist the choice (or forget it, for "system") and apply it. */
export function saveThemePref(pref: ThemePref): void {
  try {
    if (pref === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, pref);
  } catch {
    /* storage blocked: the choice lasts for this page only */
  }
  applyThemePref(pref);
}

/** Calls `fn` whenever the system preference flips; returns the unsubscribe. */
export function onSystemThemeChange(fn: () => void): () => void {
  if (typeof matchMedia !== 'function') return () => {};
  const mq = matchMedia(DARK_QUERY);
  mq.addEventListener('change', fn);
  return () => mq.removeEventListener('change', fn);
}
