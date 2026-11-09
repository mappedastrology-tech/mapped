/**
 * A Big 3 reading written in-house — no AI, no network.
 *
 * chart/result used to send a stranger's first name and placements to
 * Anthropic before they had an account, let alone agreed to it (Guideline
 * 5.1.2(i)). This is what that page shows instead until someone is signed in
 * and has said yes to AI; after that, Interpretations asks Dolly as before.
 *
 * Nothing here is new copy. It is assembled from text Mapped already ships:
 *   - Sun and Moon: the planet and sign entries in the Learn library
 *     (lib/learn/reference/astrology.ts)
 *   - Rising: the Rising descriptions on the You tab (lib/risingDescriptions.ts)
 * so the reading a new person sees agrees with what the rest of the app says
 * about the same placements.
 */

import { astrologyReference } from "@/lib/learn/reference/astrology";
import { RISING_DESCRIPTIONS } from "@/lib/risingDescriptions";
import type { ReferenceEntry } from "@/lib/learn/types";

const SIGN_FULL: Record<string, string> = {
  Ari: "Aries", Tau: "Taurus", Gem: "Gemini", Can: "Cancer",
  Leo: "Leo", Vir: "Virgo", Lib: "Libra", Sco: "Scorpio",
  Sag: "Sagittarius", Cap: "Capricorn", Aqu: "Aquarius", Pis: "Pisces",
};

export interface BigThreeReading {
  sun: string;
  moon: string;
  rising: string;
}

function entry(id: string): ReferenceEntry | undefined {
  return astrologyReference.find((e) => e.id === id);
}

function field(e: ReferenceEntry | undefined, label: string): string {
  return e?.fields.find((f) => f.label === label)?.value ?? "";
}

/** "Brave, energetic, honest" → "brave, energetic and honest" */
function asList(text: string): string {
  const parts = text.split(",").map((p) => p.trim().toLowerCase()).filter(Boolean);
  if (parts.length < 2) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

function lower(text: string): string {
  return text.toLowerCase();
}

/** The first sentence of a library summary — the "what this planet is" line. */
function firstSentence(text: string): string {
  const m = text.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : text).trim();
}

function fullSign(abbr: string): string {
  return SIGN_FULL[abbr] || abbr;
}

/** Accepts "Ari" or "Aries". */
function signEntry(sign: string): ReferenceEntry | undefined {
  return entry(`sign-${fullSign(sign).toLowerCase()}`);
}

export function composeBigThreeReading(bigThree: { sun: string; moon: string; rising?: string | null }): BigThreeReading {
  // Sun: what the Sun is, then the sign in full.
  const sunSign = signEntry(bigThree.sun);
  const sun = sunSign
    ? `${firstSentence(entry("planet-sun")?.summary ?? "")} ${sunSign.summary}`.trim()
    : `Your Sun is in ${fullSign(bigThree.sun)}.`;

  // Moon: what the Moon is, then the sign's themes rather than its summary
  // again — a Sun and Moon in the same sign should not read twice.
  const moonSign = signEntry(bigThree.moon);
  const moon = moonSign
    ? [
        firstSentence(entry("planet-moon")?.summary ?? ""),
        `With your Moon in ${moonSign.name}, the themes are ${asList(field(moonSign, "Keywords"))}.`,
        // Colons, not a sentence: the library's lists mix adjectives with
        // phrases ("can pick fights") and only read cleanly as lists.
        `At its best: ${lower(field(moonSign, "Strengths"))}. On a harder day: ${lower(field(moonSign, "Watch-outs"))}.`,
      ].join(" ").trim()
    : `Your Moon is in ${fullSign(bigThree.moon)}.`;

  // Rising: the You tab's own words for it.
  const rising = bigThree.rising
    ? RISING_DESCRIPTIONS[bigThree.rising]?.summary
      ?? RISING_DESCRIPTIONS[Object.keys(SIGN_FULL).find((k) => SIGN_FULL[k] === bigThree.rising) ?? ""]?.summary
      ?? `Your Rising sign is ${fullSign(bigThree.rising)}.`
    : "Your Rising sign depends on the exact minute you were born. Add a birth time and it fills itself in.";

  return { sun, moon, rising };
}
