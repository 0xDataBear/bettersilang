import { useEffect, useState } from 'react';
import {
  THEME_KEY, applyThemePref, onSystemThemeChange, readThemePref, resolveTheme, saveThemePref, type ThemePref,
} from '../lib/theme';

const LABEL: Record<ThemePref, string> = { light: 'Light', dark: 'Dark', system: 'Auto' };
const DESCRIBE: Record<ThemePref, string> = {
  light: 'Light theme',
  dark: 'Dark theme',
  system: 'Theme follows your device',
};

/** From "system", go to the opposite of what the device is showing; then back to "system". */
function next(pref: ThemePref): ThemePref {
  if (pref === 'system') return resolveTheme('system') === 'dark' ? 'light' : 'dark';
  return pref === 'light' ? 'dark' : 'system';
}

/** One button cycles light → dark → follows the device. The choice is kept in this browser. */
export default function ThemeToggle() {
  const [pref, setPref] = useState<ThemePref>(readThemePref);

  // Apply and remember every change (and the initial value, which is a no-op).
  useEffect(() => {
    saveThemePref(pref);
  }, [pref]);

  // "Auto" follows the device while the page is open.
  useEffect(() => onSystemThemeChange(() => {
    if (readThemePref() === 'system') applyThemePref('system');
  }), []);

  // A choice made in another tab applies here too.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY || e.key === null) setPref(readThemePref());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const to = next(pref);
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setPref(to)}
      aria-label={`${DESCRIBE[pref]}. Switch to ${LABEL[to].toLowerCase()}`}
      title={`${DESCRIBE[pref]} · click for ${LABEL[to].toLowerCase()}`}
    >
      <ThemeIcon pref={pref} />
      <span className="theme-toggle-label">{LABEL[pref]}</span>
    </button>
  );
}

/** Sun, moon, or a half-filled disc for "auto": one stroke weight, drawn, not typed. */
function ThemeIcon({ pref }: { pref: ThemePref }) {
  const common = {
    width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, focusable: false,
  };
  if (pref === 'light') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7 7 17M17 7l1.7-1.7" />
      </svg>
    );
  }
  if (pref === 'dark') {
    return (
      <svg {...common}>
        <path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5a8.5 8.5 0 1 0 10.8 10.8Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
