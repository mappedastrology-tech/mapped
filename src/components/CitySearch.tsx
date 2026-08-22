"use client";

import { useState, useEffect, useRef } from "react";

export interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface CitySearchProps {
  onSelect: (location: LocationResult) => void;
  value: string;
  onChange: (value: string) => void;
}

export default function CitySearch({ onSelect, value, onChange }: CitySearchProps) {
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // "no results" and "the lookup failed" look identical to a user unless we say
  // which happened. Chart creation is the only funnel into the app, and this is
  // the field it hinges on, so a dropped request has to read as retryable
  // instead of as "your city isn't in the list".
  const [status, setStatus] = useState<"ok" | "empty" | "error">("ok");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const justSelected = useRef(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Don't re-search after selecting a result
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }

    if (value.length < 3) {
      setResults([]);
      setIsOpen(false);
      setStatus("ok");
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&addressdetails=1`,
          { headers: { "User-Agent": "Mapped-Astrology-App" } }
        );
        if (!response.ok) throw new Error(`Geocoder returned ${response.status}`);
        const data = await response.json();
        setResults(data);
        setStatus(data.length > 0 ? "ok" : "empty");
        setIsOpen(data.length > 0);
      } catch {
        setResults([]);
        setStatus("error");
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start typing a city..."
        aria-label="Search cities"
        className="w-full px-4 py-2.5 rounded-xl bg-card/50 border border-foreground/15
                   text-foreground placeholder:text-muted
                   focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20
                   text-sm"
      />

      {isLoading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" />
        </div>
      )}

      {!isLoading && status === "error" && value.length >= 3 && (
        <p role="status" className="mt-2 text-xs text-terracotta">
          Couldn&apos;t reach the city lookup. Check your connection and try again — or
          keep typing to retry.
        </p>
      )}

      {!isLoading && status === "empty" && value.length >= 3 && (
        <p role="status" className="mt-2 text-xs text-muted">
          No cities matched &ldquo;{value}&rdquo;. Try the city name on its own, or a
          larger nearby city.
        </p>
      )}

      {isOpen && results.length > 0 && (
        <ul
          className="absolute z-50 w-full mt-2 rounded-xl border border-foreground/15 overflow-hidden bg-elevated"
          style={{
            boxShadow:
              "0 12px 28px -8px rgba(42, 31, 24, 0.25), 0 4px 10px -4px rgba(42, 31, 24, 0.15)",
          }}
        >
          {results.map((result, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => {
                  justSelected.current = true;
                  onSelect(result);
                  onChange(result.display_name);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-foreground
                           hover:bg-terracotta/10 hover:text-foreground
                           border-b border-foreground/8 last:border-b-0
                           transition-colors"
              >
                {result.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
