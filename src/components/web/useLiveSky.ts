"use client";

/**
 * Client-side "today's sky" + birth-chart data for the web pages, computed from
 * the same libraries the mobile app uses. Runs after mount (these helpers read
 * `new Date()` and localStorage), so pages render their sample copy until the
 * real values arrive, then swap in seamlessly.
 */

import { useEffect, useState } from "react";
import { getTodaySky, getComingUp } from "@/lib/almanacData";
import { getSabianSymbolForDate } from "@/lib/sabianSymbols";
import { getGoodForToday, getHoldOffToday } from "@/lib/almanacData";
import { getOnThisDay } from "@/lib/onThisDay";
import { moonSignTheme } from "./moonSignThemes";
import { useSavedChart, type BigThree } from "./useSavedChart";

const MONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Moon-phase enum → /moons/*.webp filename.
const MOON_FILE: Record<string, string> = {
  "new": "new-moon",
  "waxing-crescent": "waxing-crescent",
  "first-quarter": "first-quarter",
  "waxing-gibbous": "waxing-gibbous",
  "full": "full-moon",
  "waning-gibbous": "waning-gibbous",
  "last-quarter": "third-quarter",
  "waning-crescent": "waning-crescent",
};

export interface LiveSky {
  date: Date;
  dateLabel: string;      // "Wednesday, July 1"
  weekday: string;        // "Wednesday"
  longDate: string;       // "July 1, 2026"
  moonLabel: string;      // "Waxing Gibbous"
  moonImg: string;        // /moons/*.webp for the current phase
  illumination: number;   // 0-100
  moonSign: string;       // "Scorpio"
  moonSignTheme: string;  // sun-sign theme sentence
  sunrise: string;
  sunset: string;
  daylight: string;       // "14h 33m"
  vocStart: string | null;
  /** "Moon void of course from 2:15 PM to 6:42 PM" — computed, null when not void today. */
  vocSummary: string | null;
  vocNextSign: string | null;
  sabian: { sign: string; degree: number; symbol: string; keynote: string };
  goodFor: { why: string; activities: string[] };
  holdOff: { reason: string; activities: string[] };
  comingUp: { day: string; mon: string; title: string }[];
  onThisDay: { year: number; event: string; astroNote: string }[];
}

export function useLiveSky(): LiveSky | null {
  const [sky, setSky] = useState<LiveSky | null>(null);
  useEffect(() => {
    try {
      const d = new Date();
      const s = getTodaySky(d);
      const sab = getSabianSymbolForDate(d);
      const good = getGoodForToday(d);
      const hold = getHoldOffToday(d);
      setSky({
        date: d,
        dateLabel: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
        weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
        longDate: d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        moonLabel: s.moonPhase.label,
        moonImg: `/moons/${MOON_FILE[s.moonPhase.phase] ?? "waxing-gibbous"}.webp`,
        illumination: s.moonPhase.illumination,
        moonSign: s.moonSign,
        moonSignTheme: moonSignTheme(s.moonSign),
        sunrise: s.sunrise,
        sunset: s.sunset,
        daylight: `${s.dayLengthHours}h ${s.dayLengthMinutes}m`,
        vocStart: s.voidOfCourseMoon?.start ?? null,
        vocSummary: s.voidOfCourseMoon?.summary ?? null,
        vocNextSign: s.voidOfCourseMoon?.nextSign ?? null,
        sabian: sab,
        goodFor: { why: good.why, activities: good.activities.map((a) => a.activity) },
        holdOff: { reason: hold.reason, activities: hold.items.map((a) => a.activity) },
        comingUp: getComingUp(d)
          .filter((e) => e.date.getTime() >= d.getTime() - 12 * 3600 * 1000)
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(0, 3)
          .map((e) => ({ day: String(e.date.getDate()), mon: MONS[e.date.getMonth()], title: e.label })),
        onThisDay: getOnThisDay(d).slice(0, 4).map((e) => ({ year: e.year, event: e.event, astroNote: e.astroNote })),
      });
    } catch { /* keep sample copy on any failure */ }
  }, []);
  return sky;
}

export type { BigThree };

/**
 * The user's real Sun/Moon/rising — from their saved chart (see useSavedChart),
 * not just whatever this tab happened to cache in sessionStorage.
 */
export function useBigThree(): BigThree | null {
  const chart = useSavedChart();
  return chart.status === "ready" ? chart.bigThree : null;
}
