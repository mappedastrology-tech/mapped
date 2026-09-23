/**
 * What Dolly's limits SAY — the user-facing strings, and nothing else.
 *
 * Split out of budget.ts because that module is server-only: it builds a
 * service-role Supabase client, and the ceilings in it are deliberately
 * private. A client component that only wants to render one of these
 * sentences would have dragged all of that into the browser bundle. The
 * amounts stay server-side; only the words live here.
 *
 * Nothing in this file may reference a ceiling, a dollar figure or a message
 * count. If a number belongs in one of these sentences, it is the wrong
 * sentence.
 */

/**
 * What the reader is told when they reach the ceiling.
 *
 * Still no number — the dollar figure stays private. But the previous wording,
 * "Dolly's resting right now — she'll be back with you soon", had three
 * problems. It attributed a deliberate rule to Dolly's mood, so a subscriber
 * could not tell a limit from an outage and had nothing to act on. "Soon" is
 * an affirmative claim that is usually false: the ceiling is a calendar month,
 * so hitting it on the 3rd means four weeks, not soon. And it was ALSO served
 * when the database read failed, which told people they had used up an
 * allowance they had barely touched.
 *
 * Naming the reset without naming the amount keeps the figure private and
 * still lets someone plan.
 */
export const AI_RESTING_MESSAGE =
  "You've used up this month's time with Dolly. It comes back when the new month starts — everything else in Mapped keeps working.";

/**
 * What the reader is told when WE cannot answer — a failed read, not a limit.
 * Kept separate so an outage is never reported as a usage cap.
 */
export const AI_UNAVAILABLE_MESSAGE =
  "Dolly can't be reached right now. This one is on us, not you — please try again shortly.";

/** What a free-tier account is told when it reaches for an AI feature. */
export const AI_UPGRADE_MESSAGE = "Dolly comes with Mapped+.";
