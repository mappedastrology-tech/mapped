/**
 * The time-of-day greeting, in one place.
 *
 * Home switched to "Good evening" at 17:00 while Rituals, Dolly and the
 * desktop Today page waited until 18:00, so between five and six the app
 * greeted the same person two different ways depending on the screen. Every
 * greeting reads from here now.
 */

export type DayPart = "morning" | "afternoon" | "evening";

/** Evening starts at 17:00 local time, as it always has on Home. */
export const EVENING_STARTS_AT = 17;

export function dayPart(date: Date = new Date()): DayPart {
  const h = date.getHours();
  if (h < 12) return "morning";
  if (h < EVENING_STARTS_AT) return "afternoon";
  return "evening";
}

/** "Good morning" / "Good afternoon" / "Good evening". */
export function greetingFor(date: Date = new Date()): string {
  return `Good ${dayPart(date)}`;
}

/** First word of a display name, or null when there isn't a usable one. */
export function firstNameOf(name: string | null | undefined): string | null {
  const first = (name || "").trim().split(/\s+/)[0];
  return first ? first : null;
}
