/**
 * Moon & body lore — the almanac "zodiac man", offered as history and
 * reflection.
 *
 * This file used to be "traditional almanac medical timing": by Moon sign it
 * told people which check-ups to avoid (breast, heart, circulation, kidney —
 * flagged "Not Ideal"), which procedures were "All Clear", suggested "better
 * days" to move an appointment to, and said "Procedures booked now will hold".
 * That is scheduling medical care by the sky, and it is gone entirely. Nothing
 * here tells anyone to book, skip, move or delay care.
 *
 * What remains is the folklore itself: medieval and colonial almanacs printed a
 * figure linking each sign to a part of the body, and many people still find
 * the association a useful prompt for noticing how they feel.
 */

import { getCurrentMoonSign, getMoonPhaseLabel as getMoonPhaseLabelFromSky } from "@/lib/astro/currentSky";
import { localDayWindow, eclipsesBetween, nextEclipseAfter, calendarDayIn } from "@/lib/astro/skyCalendar";
import { mercuryStatus } from "@/lib/almanacData";

// ─── INTERFACES ─────────────────────────────────────────────────────────────

export interface BodyTimingNote {
  label: string;
  detail: string;
  icon: string;
}

export interface BodyTimingForecast {
  planningDate: Date;
  dayLabel: string;          // "THURSDAY"
  dateLabel: string;         // "July 8, 2026"
  daysAway: number;          // 0 = today
  moonSign: string;
  moonPhase: string;
  /** The body area the almanac tradition linked to this Moon sign. */
  bodyArea: string;
  /** One-line preview: "Moon in Leo · heart & back, in almanac lore". */
  summaryLabel: string;
  /** The lore, phrased as reflection. */
  lore: string;
  /** Sky context for the day — computed, never an instruction. */
  notes: BodyTimingNote[];
}

// ─── THE ZODIAC MAN ─────────────────────────────────────────────────────────

const SIGN_BODY_LORE: Record<string, { area: string; reflection: string }> = {
  Aries:       { area: "head & face", reflection: "a day to notice where you carry tension in your jaw and brow" },
  Taurus:      { area: "neck & throat", reflection: "a prompt to notice your voice — what you say, and what you hold back" },
  Gemini:      { area: "arms, hands & lungs", reflection: "a reminder to notice your breath and what your hands are busy with" },
  Cancer:      { area: "chest & stomach", reflection: "a day associated with comfort, nourishment and feeling at home in yourself" },
  Leo:         { area: "heart & upper back", reflection: "a prompt to notice what makes your heart feel warm — and what makes you stand taller" },
  Virgo:       { area: "digestion", reflection: "a day traditionally linked with tending, sorting and small routines" },
  Libra:       { area: "lower back & skin", reflection: "a prompt to notice balance — between effort and ease, others and yourself" },
  Scorpio:     { area: "pelvis & lower torso", reflection: "a day associated with depth, privacy and what you keep close" },
  Sagittarius: { area: "hips & thighs", reflection: "a prompt to notice how much you want to move, stretch, wander" },
  Capricorn:   { area: "knees, bones & teeth", reflection: "a day associated with structure — what holds you up" },
  Aquarius:    { area: "ankles & circulation", reflection: "a prompt to notice what keeps you moving and connected" },
  Pisces:      { area: "feet", reflection: "a day associated with rest, grounding and getting off your feet" },
};

const DAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

function eclipseNote(date: Date): BodyTimingNote {
  const { start, end } = localDayWindow(date);
  const window = 17 * 86400000;
  const near = eclipsesBetween(new Date(start.getTime() - window), new Date(end.getTime() + window))[0];
  if (near) {
    const day = calendarDayIn(near.at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { label: "Eclipse season", detail: `${near.label} in ${near.sign}, ${day}`, icon: "🌑" };
  }
  const next = nextEclipseAfter(end);
  const day = calendarDayIn(next.at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { label: "Outside eclipse season", detail: `Next: ${next.label.toLowerCase()}, ${day}`, icon: "🌕" };
}

/**
 * Moon & body lore for a given date, with that day's computed sky notes.
 */
export function getBodyTiming(date: Date): BodyTimingForecast {
  const { start, end } = localDayWindow(date);
  const noon = new Date((start.getTime() + end.getTime()) / 2);
  const moonSign = getCurrentMoonSign(noon).full;
  const moonPhase = getMoonPhaseLabelFromSky(noon).toLowerCase();
  const lore = SIGN_BODY_LORE[moonSign] ?? SIGN_BODY_LORE.Aries;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysAway = Math.round((start.getTime() - today.getTime()) / 86400000);

  const mercury = mercuryStatus(date);

  return {
    planningDate: date,
    dayLabel: DAY_NAMES[date.getDay()],
    dateLabel: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    daysAway,
    moonSign,
    moonPhase,
    bodyArea: lore.area,
    summaryLabel: `Moon in ${moonSign} · ${lore.area}, in almanac lore`,
    lore: `Old almanacs printed a "zodiac man" linking each sign to part of the body. With the Moon in ${moonSign}, tradition pointed to the ${lore.area} — ${lore.reflection}.`,
    notes: [
      { label: mercury.label, detail: mercury.description, icon: "☿️" },
      eclipseNote(date),
    ],
  };
}
