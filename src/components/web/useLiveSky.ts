"use client";

/**
 * Client-side "today's sky" + birth-chart data for the web pages, computed from
 * the same libraries the mobile app uses. Runs after mount (these helpers read
 * `new Date()` and localStorage), so pages render their sample copy until the
 * real values arrive, then swap in seamlessly.
 */

import { useEffect, useState } from "react";
import { getTodaySky } from "@/lib/almanacData";
import { getSabianSymbolForDate } from "@/lib/sabianSymbols";
import { getGoodForToday, getHoldOffToday } from "@/lib/almanacData";

// Moon-phase enum → /moons/*.png filename.
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
  moonImg: string;        // /moons/*.png for the current phase
  illumination: number;   // 0-100
  moonSign: string;       // "Scorpio"
  moonSignTheme: string;  // sun-sign theme sentence
  sunrise: string;
  sunset: string;
  daylight: string;       // "14h 33m"
  vocStart: string | null;
  sabian: { sign: string; degree: number; symbol: string; keynote: string };
  goodFor: { why: string; activities: string[] };
  holdOff: { reason: string; activities: string[] };
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
        moonImg: `/moons/${MOON_FILE[s.moonPhase.phase] ?? "waxing-gibbous"}.png`,
        illumination: s.moonPhase.illumination,
        moonSign: s.moonSign,
        moonSignTheme: s.sunSignTheme,
        sunrise: s.sunrise,
        sunset: s.sunset,
        daylight: `${s.dayLengthHours}h ${s.dayLengthMinutes}m`,
        vocStart: s.voidOfCourseMoon?.start ?? null,
        sabian: sab,
        goodFor: { why: good.why, activities: good.activities.map((a) => a.activity) },
        holdOff: { reason: hold.reason, activities: hold.items.map((a) => a.activity) },
      });
    } catch { /* keep sample copy on any failure */ }
  }, []);
  return sky;
}

export interface BigThree { sun: string; moon: string; rising: string }

/** The user's real Sun/Moon/rising from the chart the app cached, if present. */
export function useBigThree(): BigThree | null {
  const [bt, setBt] = useState<BigThree | null>(null);
  useEffect(() => {
    try {
      for (const key of ["chartResult", "mapped:chartData"]) {
        const raw = sessionStorage.getItem(key);
        if (!raw) continue;
        const p = JSON.parse(raw);
        const b = p?.bigThree || p?.big_three;
        if (b?.sun && b?.moon && b?.rising) { setBt({ sun: b.sun, moon: b.moon, rising: b.rising }); return; }
      }
    } catch { /* ignore */ }
  }, []);
  return bt;
}
