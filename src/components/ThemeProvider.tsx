"use client";

/**
 * ThemeProvider — manages light/dark mode for the entire app.
 *
 * Dark = "Midnight Scrapbook" (default — dark background with warm texture)
 * Light = "Clean & Bright" (white background with dark text)
 *
 * Persists preference to localStorage, defaults to dark.
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = "mapped:theme";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === "dark" || stored === "light") {
        setThemeState(stored);
        document.documentElement.setAttribute("data-theme", stored);
      } else {
        // Default to dark (Midnight Scrapbook); respect system light preference
        const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        const detected = prefersLight ? "light" : "dark";
        setThemeState(detected);
        document.documentElement.setAttribute("data-theme", detected);
      }
    } catch {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  // Listen for system preference changes (only if no manual override)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const next = e.matches ? "dark" : "light";
        setThemeState(next);
        document.documentElement.setAttribute("data-theme", next);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
