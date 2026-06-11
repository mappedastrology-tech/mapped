"use client";

/**
 * Refresh Mode — lets the user override today's algorithm pick by
 * specifying time, location, and vibe. Returns filtered ritual suggestions
 * from the catalog.
 *
 * Source: Mapped_Skeptic_Mode_Refresh.md (Part 2)
 * All colors use CSS custom properties for light/dark theme support.
 */

import { useState, useMemo, useRef, useEffect } from "react";
import {
  REFRESH_TIMES,
  REFRESH_LOCATIONS,
  REFRESH_VIBES,
  isLocationCompatible,
  parseDuration,
  type RefreshTime,
  type RefreshLocation,
  type RefreshVibe,
} from "@/lib/feedback";
import { RITUAL_CATALOG, type CatalogRitual } from "@/lib/ritualCatalog";

interface Props {
  onSelect: (ritual: CatalogRitual) => void;
  onClose: () => void;
}

export default function RefreshModal({ onSelect, onClose }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | "results">(1);
  const [time, setTime] = useState<RefreshTime | null>(null);
  const [location, setLocation] = useState<RefreshLocation | null>(null);
  const [vibe, setVibe] = useState<RefreshVibe | null>(null);

  // ─── Matching logic ──────────────────────────────────────────────────

  const results = useMemo(() => {
    if (!time || !location || !vibe) return [];

    const maxMin = REFRESH_TIMES.find((t) => t.value === time)?.maxMinutes ?? 10;
    const vibeCategories = REFRESH_VIBES.find((v) => v.value === vibe)?.categories ?? [];

    const matches = RITUAL_CATALOG.filter((r) => {
      // Time filter
      const dur = parseDuration(r.duration);
      if (dur > maxMin) return false;

      // Location filter
      if (!isLocationCompatible(r.toolsNeeded || [], r.tier ?? 0, location)) return false;

      // Vibe/category filter — soft match on category or mood
      const moodMap: Record<string, string[]> = {
        calm_down: ["calm", "grounded"],
        wake_up: ["energized", "joyful"],
        cry_it_out: ["releasing", "reflective"],
        find_clarity: ["reflective", "grounded"],
        feel_less_alone: ["joyful", "calm"],
        get_out_of_head: ["grounded", "energized"],
        process_something: ["reflective", "releasing"],
        let_go: ["releasing", "calm"],
        ask_for_something: ["energized", "joyful"],
        just_be_still: ["calm", "grounded", "reflective"],
      };
      const matchMoods = moodMap[vibe!] ?? [];
      const catMatch = vibeCategories.some((vc) => r.category === vc) ||
        matchMoods.includes(r.mood);
      if (!catMatch) return false;

      return true;
    });

    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const shuffled = matches.sort(
      (a, b) => ((a.id.charCodeAt(0) + dayOfYear) % 7) - ((b.id.charCodeAt(0) + dayOfYear) % 7)
    );

    return shuffled.slice(0, 3);
  }, [time, location, vibe]);

  // ─── If no matches, try softening ─────────────────────────────────────

  const softenedResults = useMemo(() => {
    if (results.length > 0 || !time || !location || !vibe) return null;

    const maxMin = REFRESH_TIMES.find((t) => t.value === time)?.maxMinutes ?? 10;
    let pool = RITUAL_CATALOG.filter((r) => {
      const dur = parseDuration(r.duration);
      return dur <= maxMin && isLocationCompatible(r.toolsNeeded || [], r.tier ?? 0, location);
    });
    if (pool.length > 0) {
      return { reason: "broadened what you need", rituals: pool.slice(0, 3) };
    }

    pool = RITUAL_CATALOG.filter((r) => {
      const dur = parseDuration(r.duration);
      return dur <= maxMin + 5 && isLocationCompatible(r.toolsNeeded || [], r.tier ?? 0, location);
    });
    if (pool.length > 0) {
      return { reason: "added a few more minutes", rituals: pool.slice(0, 3) };
    }

    pool = RITUAL_CATALOG.filter((r) => {
      const dur = parseDuration(r.duration);
      return dur <= maxMin;
    });
    if (pool.length > 0) {
      return { reason: "loosened the location filter", rituals: pool.slice(0, 3) };
    }

    return null;
  }, [results, time, location, vibe]);

  function handleTimeSelect(t: RefreshTime) {
    setTime(t);
    setTimeout(() => setStep(2), 200);
  }

  function handleLocationSelect(l: RefreshLocation) {
    setLocation(l);
    setTimeout(() => setStep(3), 200);
  }

  function handleVibeSelect(v: RefreshVibe) {
    setVibe(v);
    setTimeout(() => setStep("results"), 200);
  }

  const finalResults = results.length > 0 ? results : softenedResults?.rituals ?? [];
  const wasSoftened = results.length === 0 && softenedResults;

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    first?.focus();
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [onClose]);

  // Shared option button style
  const optionStyle = (isSelected: boolean) => ({
    backgroundColor: isSelected ? "var(--terracotta-bg)" : "var(--background-card)",
    border: isSelected ? "1px solid var(--border-accent)" : "1px solid var(--border-card)",
    color: isSelected ? "var(--terracotta)" : "var(--foreground-secondary)",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm"
         style={{ backgroundColor: "var(--modal-overlay)" }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Refresh ritual selection"
           className="rounded-t-3xl sm:rounded-3xl p-5 pb-8 mx-0 sm:mx-6 max-w-md w-full max-h-[85vh] overflow-y-auto"
           style={{ backgroundColor: "var(--modal-bg)" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] uppercase tracking-wider font-semibold"
             style={{ color: "var(--foreground-faint)" }}>
            {step === "results"
              ? "Better fit for right now"
              : `Step ${step} of 3`}
          </p>
          <button
            onClick={onClose}
            className="text-[12px] transition-colors"
            style={{ color: "var(--foreground-faint)" }}
          >
            Close
          </button>
        </div>

        {/* ─── STEP 1: Time ─── */}
        {step === 1 && (
          <div>
            <h3 className="text-[15px] font-medium mb-4" style={{ color: "var(--foreground)" }}>
              How much time do you have?
            </h3>
            <div className="flex flex-wrap gap-2">
              {REFRESH_TIMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleTimeSelect(t.value)}
                  className="px-4 py-3 rounded-xl text-[13px] font-medium transition-all"
                  style={optionStyle(time === t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── STEP 2: Location ─── */}
        {step === 2 && (
          <div>
            <h3 className="text-[15px] font-medium mb-4" style={{ color: "var(--foreground)" }}>
              Where are you?
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {REFRESH_LOCATIONS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => handleLocationSelect(l.value)}
                  className="px-3 py-3 rounded-xl text-[13px] font-medium transition-all text-left"
                  style={optionStyle(location === l.value)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── STEP 3: Vibe ─── */}
        {step === 3 && (
          <div>
            <h3 className="text-[15px] font-medium mb-4" style={{ color: "var(--foreground)" }}>
              What do you need?
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {REFRESH_VIBES.map((v) => (
                <button
                  key={v.value}
                  onClick={() => handleVibeSelect(v.value)}
                  className="px-3 py-3 rounded-xl text-[13px] font-medium transition-all text-left"
                  style={optionStyle(vibe === v.value)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── RESULTS ─── */}
        {step === "results" && (
          <div>
            {wasSoftened && (
              <p className="text-[11px] mb-3 italic" style={{ color: "var(--foreground-muted)" }}>
                No exact match — {wasSoftened.reason} to find these.
              </p>
            )}

            {finalResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[13px] mb-2" style={{ color: "var(--foreground-muted)" }}>
                  Nothing matched those filters yet.
                </p>
                <p className="text-[11px]" style={{ color: "var(--foreground-faint)" }}>
                  Try adjusting your time or location.
                </p>
                <button
                  onClick={() => { setStep(1); setTime(null); setLocation(null); setVibe(null); }}
                  className="mt-4 px-4 py-2 rounded-xl text-[12px] font-medium"
                  style={{ backgroundColor: "var(--background-elevated)", color: "var(--foreground-muted)" }}
                >
                  ↻ Try again
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {finalResults.map((ritual, i) => (
                  <button
                    key={ritual.id}
                    onClick={() => onSelect(ritual)}
                    className="w-full text-left p-4 rounded-2xl transition-all"
                    style={{
                      backgroundColor: i === 0 ? "var(--terracotta-bg)" : "var(--background-card)",
                      border: i === 0 ? "1px solid var(--border-accent)" : "1px solid var(--border-card)",
                    }}
                  >
                    <h4 className="text-[14px] font-medium mb-1" style={{ color: "var(--foreground)" }}>
                      {ritual.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] mb-2">
                      <span style={{ color: "var(--foreground-muted)" }}>{ritual.duration}</span>
                      <span style={{ color: "var(--foreground-ghost)" }}>·</span>
                      <span style={{ color: "var(--foreground-muted)" }}>
                        {ritual.tier === 0 ? "No tools" : ritual.tier === 1 ? "Household" : "Crystals"}
                      </span>
                    </div>
                    <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: "var(--foreground-muted)" }}>
                      {ritual.description}
                    </p>
                  </button>
                ))}

                {/* Refresh again */}
                <button
                  onClick={() => { setStep(1); setTime(null); setLocation(null); setVibe(null); }}
                  className="w-full py-2 text-[12px] font-medium transition-colors"
                  style={{ color: "var(--foreground-faint)" }}
                >
                  ↻ Try different filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
