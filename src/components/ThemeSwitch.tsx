import { useEffect, useState } from 'react';
import {
  THEME_KEY, THEME_PREFS, applyThemePref, onSystemThemeChange, readThemePref, saveThemePref, type ThemePref,
} from '../lib/theme';

const LABELS: Record<ThemePref, string> = { light: 'Light', dark: 'Dark', system: 'System' };

/** Light, dark or system. Three buttons; the pressed one is the current choice. */
export default function ThemeSwitch() {
  const [pref, setPref] = useState<ThemePref>(readThemePref);

  // Apply and remember every change (and the initial value, which is a no-op).
  useEffect(() => {
    saveThemePref(pref);
  }, [pref]);

  // "System" follows the OS while the page is open.
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

  return (
    <span className="theme-switch" role="group" aria-label="Colour theme">
      {THEME_PREFS.map((p) => (
        <button key={p} type="button" aria-pressed={pref === p} onClick={() => setPref(p)}>
          {LABELS[p]}
        </button>
      ))}
    </span>
  );
}
