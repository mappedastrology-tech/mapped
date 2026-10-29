"use client";

/**
 * Tonight's Moon for the public landing page and its footer — phase, how much
 * of it is lit, its sign and the matching image — from the same helpers the
 * almanac uses (getMoonPhase, getCurrentMoonSign).
 *
 * The landing used to print "Waxing Gibbous · 73% · Moon in Scorpio" and the
 * footer "Made under a waxing gibbous moon" every night of the year. Computed
 * after mount, because the page is prerendered and the Moon depends on when
 * it is viewed; null until then, so nothing wrong is ever shown.
 */

import { useEffect, useState } from "react";
import { getMoonPhase, getMoonPhaseImage } from "@/lib/celestialCalendar";
import { getCurrentMoonSign } from "@/lib/astro/currentSky";

export interface TonightMoon {
  label: string;         // "Waxing Gibbous"
  illumination: number;  // 0-100
  sign: string;          // "Scorpio"
  img: string;           // /moons/*.webp
}

export function tonightMoon(date: Date): TonightMoon {
  const phase = getMoonPhase(date);
  return {
    label: phase.label,
    illumination: Math.round(phase.illumination),
    sign: getCurrentMoonSign(date).full,
    img: getMoonPhaseImage(phase.phase),
  };
}

export function useTonightMoon(): TonightMoon | null {
  const [moon, setMoon] = useState<TonightMoon | null>(null);
  useEffect(() => {
    try { setMoon(tonightMoon(new Date())); } catch { /* leave it out */ }
  }, []);
  return moon;
}
