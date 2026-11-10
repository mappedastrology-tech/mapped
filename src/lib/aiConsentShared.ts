/**
 * AI consent: the parts the server and the browser must agree on.
 *
 * One file with no imports, so both halves read the same values by
 * construction:
 *   - lib/ai/consent.ts — the server, which refuses the request itself
 *   - lib/aiConsent.ts  — the browser, which shows the screen and the setting
 *
 * Before this existed the version lived only on the server, and nothing was
 * stored with a "yes" to say which list of items it was a yes to — so the list
 * could change underneath somebody's permission without them being asked.
 */

/**
 * The user_settings key for a "yes". Its value is `v<version>:<ISO time>`,
 * e.g. "v2:2026-11-09T18:04:00.000Z" — when they agreed, and to which list.
 * Values written before versioning are a bare ISO time and count as v1.
 */
export const AI_CONSENT_KEY = "ai-consent";

/** The user_settings key for a "no". Its value is the ISO time they said it. */
export const AI_DECLINED_KEY = "ai-consent-declined";

/**
 * Which disclosure a "yes" covers.
 *
 * Bump this whenever AI_SHARED_ITEMS changes what it says is sent, or who it
 * goes to. Everyone who agreed to an older list is asked again, and the server
 * refuses their AI requests until they answer.
 *
 *   1 — the original list.
 *   2 — says plainly that every Dolly message carries journal excerpts, the
 *       latest tarot pull, and up to twelve people from the map. Version 1
 *       implied those went only "when you ask" or "when a question is about
 *       them", which was not true.
 *   3 — adds the note you wrote on a single-card pull, which goes with the
 *       cards (lib/dollyCrossFeature.ts, first 160 characters).
 *   4 — Dolly is given the journal ITSELF, not a sample of it. Version 3
 *       described five entries cut to 160 characters each; she now receives
 *       the entries in full — text, dates, titles, moods and the prompt
 *       answered, newest first — with the most recent filling a budget if
 *       there are a great many. That is materially more of someone's writing
 *       leaving the device, so it is a new permission, not a reword.
 */
export const AI_CONSENT_VERSION = 4;

/** The provider, named — Apple wants the company, not "an AI". */
export const AI_PROVIDER_NAME = "Anthropic";

/**
 * What actually leaves Mapped, in the words a reader would use.
 *
 * This has to match the code, not the intention. Checked against:
 *   - api/dolly/route.ts + lib/dollyCrossFeature.ts: every message carries the
 *     journal entries in full (buildJournalContext — text, date, title, mood
 *     and prompt, newest first, to a character budget), the latest
 *     tarot/oracle pull, the memory note, and up to
 *     PROMPT_LIMITS.connections (12) people with their charts.
 *   - api/journal/reflect: the entries for the period being reflected on.
 *   - api/palmistry: the photograph.
 *   - api/chart/interpret, api/horoscope, api/wizard: first name and chart.
 * If you change what any of those send, change this list and bump the version.
 */
export const AI_SHARED_ITEMS = [
  "Your first name, your birth date, time and place, and the chart built from them",
  "What you write to Dolly, what she writes back, and the short note she keeps about your life so she can pick up where you left off",
  "With every message to Dolly: your journal entries in full — their text, dates, titles and the moods you tagged, newest first. Entries you burn are never stored and never sent",
  "With every message to Dolly: up to twelve people on your map — their names, how you know them, and their charts",
  "With every message to Dolly: the cards in your latest tarot or oracle pull, and the start of any note you wrote on a single-card pull",
  "Your journal entries for a week or month, when you ask for a reflection on them",
  "A photograph of your palm, when you ask for a palmistry reading",
] as const;

export type AiConsentState = "unknown" | "granted" | "declined";

/** The stored value for a "yes" given now. */
export function consentValue(at: Date = new Date()): string {
  return `v${AI_CONSENT_VERSION}:${at.toISOString()}`;
}

/** Read a stored "yes". Anything unreadable is treated as no answer. */
export function parseConsentValue(value: unknown): { version: number; at: number } | null {
  if (typeof value !== "string" || !value) return null;
  const m = value.match(/^v(\d+):(.+)$/);
  const version = m ? Number(m[1]) : 1; // a bare timestamp predates versioning
  const at = Date.parse(m ? m[2] : value);
  if (!Number.isFinite(version) || Number.isNaN(at)) return null;
  return { version, at };
}

function parseTime(value: unknown): number | null {
  if (typeof value !== "string" || !value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

/**
 * The person's current answer, from the two stored values.
 *
 * The LATEST answer wins, so a stale row can never override a newer choice:
 * if turning AI off saved the "no" but failed to remove the old "yes", the
 * "no" is newer and still holds. A "yes" to an older list is not a yes to
 * this one — that reads as "unknown", which asks again.
 *
 * Used by both the server (which refuses unless this says "granted") and the
 * browser (which decides whether to show the consent screen).
 */
export function decideAiConsent(granted: unknown, declined: unknown): AiConsentState {
  const yes = parseConsentValue(granted);
  const noAt = parseTime(declined);

  if (noAt !== null && (!yes || noAt >= yes.at)) return "declined";
  if (yes) return yes.version >= AI_CONSENT_VERSION ? "granted" : "unknown";
  return "unknown";
}
