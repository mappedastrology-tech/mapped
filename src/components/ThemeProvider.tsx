"use client";

/**
 * ThemeProvider — manages light/dark mode for the entire app.
 *
 * Dark = "Midnight Scrapbook" (default — dark background with warm texture)
 * Light = "Clean & Bright" (white background with dark text)
 * Auto  = light between sunrise and sunset where the reader is, dark otherwise
 *
 * What is stored is the MODE the reader picked; what the rest of the app reads
 * is the RESOLVED theme. Keeping `theme` resolved means every existing
 * consumer — and there are a lot of them — carries on working unchanged, and
 * only the settings screen needs to know that "auto" exists at all.
 *
 * The stored values "light" and "dark" from before this existed are still
 * valid modes, so nobody's saved preference is disturbed.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  themeForMoment,
  msUntilNextSwitch,
  readThemeCoords,
  type ResolvedTheme as Theme,
  type ThemeMode,
} from "@/lib/autoTheme";

interface ThemeContextValue {
  /** What is on screen right now. Always light or dark, never "auto". */
  theme: Theme;
  /** What the reader chose. "auto" follows the sun. */
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  setMode: (m: ThemeMode) => void;
  /** True when auto is on but we have no location, so it is following the OS. */
  autoWithoutLocation: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  mode: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
  setMode: () => {},
  autoWithoutLocation: false,
});

export function useTheme() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = "mapped:theme";

function systemTheme(): Theme {
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function apply(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [autoWithoutLocation, setAutoWithoutLocation] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The scheduled re-check calls through this rather than naming applyAuto
  // inside its own body: a function cannot reference itself in the callback it
  // is still being defined by without the linter — rightly — pointing out that
  // the captured binding would go stale if it ever gained dependencies.
  const applyAutoRef = useRef<() => void>(() => {});

  /**
   * Work out what auto should show right now and set it, then schedule the
   * next check for the next sunrise or sunset.
   *
   * Re-arming a timeout rather than polling on an interval means the switch
   * lands on the boundary instead of up to a tick late, and the app is not
   * waking to recompute the sun's position every minute all day.
   */
  const applyAuto = useCallback(() => {
    const coords = readThemeCoords();
    const resolved = themeForMoment(new Date(), coords);
    setAutoWithoutLocation(resolved === null);
    const next = resolved ?? systemTheme();
    setThemeState(next);
    apply(next);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => applyAutoRef.current(), msUntilNextSwitch(new Date(), coords));
  }, []);

  useEffect(() => { applyAutoRef.current = applyAuto; }, [applyAuto]);

  // Initial resolution, from the stored mode.
  useEffect(() => {
    setMounted(true);
    let stored: string | null = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch { /* blocked */ }

    if (stored === "auto") {
      setModeState("auto");
      applyAuto();
      return;
    }
    if (stored === "dark" || stored === "light") {
      setModeState(stored);
      setThemeState(stored);
      apply(stored);
      return;
    }
    // Nothing chosen yet: dark by default, but respect a system light setting.
    const detected = systemTheme();
    setModeState(detected);
    setThemeState(detected);
    apply(detected);
  }, [applyAuto]);

  /**
   * A timeout does not fire while the device is asleep, and a phone is asleep
   * across most sunrises. Re-resolving whenever the app comes back to the
   * foreground is what actually makes auto feel correct.
   */
  useEffect(() => {
    if (mode !== "auto") return;
    const recheck = () => { if (document.visibilityState === "visible") applyAuto(); };
    document.addEventListener("visibilitychange", recheck);
    window.addEventListener("focus", recheck);
    return () => {
      document.removeEventListener("visibilitychange", recheck);
      window.removeEventListener("focus", recheck);
    };
  }, [mode, applyAuto]);

  // Stop the timer when auto is switched off, so it cannot fight a manual choice.
  useEffect(() => {
    if (mode !== "auto" && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [mode]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Follow the OS only while nothing explicit is chosen, or while auto is on
  // and has no location to work from.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      let stored: string | null = null;
      try { stored = localStorage.getItem(STORAGE_KEY); } catch { /* blocked */ }
      const following = !stored || (stored === "auto" && !readThemeCoords());
      if (!following) return;
      const next = e.matches ? "dark" : "light";
      setThemeState(next);
      apply(next);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    try { localStorage.setItem(STORAGE_KEY, m); } catch { /* blocked */ }
    if (m === "auto") {
      applyAuto();
    } else {
      setAutoWithoutLocation(false);
      setThemeState(m);
      apply(m);
    }
  }, [applyAuto]);

  const setTheme = useCallback((t: Theme) => setMode(t), [setMode]);

  // Toggling from auto picks the opposite of what is currently showing, which
  // is what someone tapping a light/dark switch means by it.
  const toggleTheme = useCallback(() => {
    setMode(theme === "light" ? "dark" : "light");
  }, [theme, setMode]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setTheme, setMode, autoWithoutLocation }}>
      {children}
    </ThemeContext.Provider>
  );
}
