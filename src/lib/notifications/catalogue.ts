/**
 * The notification catalogue: what Mapped is allowed to say, and how often.
 *
 * Every push does exactly one of four jobs, and a push that does none of them
 * has no business being sent:
 *
 *   SKY       Something happened overhead. Factual, dateable, the same for
 *             everyone — a moon peaked, a planet stopped, an eclipse season
 *             opened. The app is reporting, not interpreting.
 *   CHART     Something happened in THIS person's chart. Rare and specific: a
 *             transit perfected on their natal placement, their Sun came back
 *             to where it started. It is the thing a generic horoscope app
 *             structurally cannot send, and the research on personalization
 *             says it is the form that actually works — chart-derived
 *             specificity, not a name merged into a template.
 *   PRACTICE  Something of theirs is waiting. Their journal prompt, the ritual
 *             they saved for tonight. The app hands something back rather than
 *             asking for attention.
 *   QUIET     Nothing is happening. Counter-intuitive, and the one that makes
 *             the other three trustworthy — an app that only ever finds
 *             something portentous to say is an app you stop believing.
 *
 * Two jobs a push must never do: sell something, or manufacture a reason to
 * open the app. The single most-upvoted complaint against a competitor in this
 * category is from someone who opted in for their daily reading and got
 * celebrity gossip. That pipe stays clean.
 *
 * This module is pure. Nothing here reads a clock, a browser, or a database —
 * the caller passes in the time and the log, which is what makes it testable
 * and what makes it usable from the cron, where the old localStorage version
 * silently did nothing at all.
 */

/* ─── Categories ─── */

export type NotificationCategory =
  // Sky
  | "new_moon"
  | "new_moon_act"
  | "full_moon"
  | "quarter_moon"
  | "eclipses"
  | "eclipse_season"
  | "retrograde_stations"
  | "retrograde_shadow"
  | "mercury_retrograde"
  | "major_ingresses"
  // Chart
  | "major_transits"
  | "transit_approaching"
  | "solar_return"
  | "birthday_week"
  // Practice
  | "journal_checkin"
  | "practice_reminders"
  | "learning_reminder"
  // Daily
  | "daily_content"
  // Lifecycle
  | "re_engagement";

export type NotificationGroup = "sky" | "chart" | "practice" | "daily" | "lifecycle";

/**
 * Which group each category belongs to.
 *
 * The settings screen shows the groups; the per-category switches live behind
 * a disclosure for people who want them. Three decisions before anyone gets a
 * notification, not fourteen.
 */
export const CATEGORY_GROUP: Record<NotificationCategory, NotificationGroup> = {
  new_moon: "sky",
  new_moon_act: "sky",
  full_moon: "sky",
  quarter_moon: "sky",
  eclipses: "sky",
  eclipse_season: "sky",
  retrograde_stations: "sky",
  retrograde_shadow: "sky",
  mercury_retrograde: "sky",
  major_ingresses: "sky",

  major_transits: "chart",
  transit_approaching: "chart",
  solar_return: "chart",
  birthday_week: "chart",

  journal_checkin: "practice",
  practice_reminders: "practice",
  learning_reminder: "practice",

  daily_content: "daily",
  re_engagement: "lifecycle",
};

export function categoriesInGroup(group: NotificationGroup): NotificationCategory[] {
  return (Object.keys(CATEGORY_GROUP) as NotificationCategory[])
    .filter((c) => CATEGORY_GROUP[c] === group);
}

/* ─── Preferences ─── */

export interface NotificationPreferences {
  new_moon: boolean;
  new_moon_act: boolean;
  full_moon: boolean;
  quarter_moon: boolean;
  eclipses: boolean;
  eclipse_season: boolean;
  retrograde_stations: boolean;
  retrograde_shadow: boolean;
  mercury_retrograde: boolean;
  major_ingresses: boolean;

  major_transits: boolean;
  transit_approaching: boolean;
  solar_return: boolean;
  birthday_week: boolean;

  journal_checkin: boolean;
  practice_reminders: boolean;
  learning_reminder: boolean;

  daily_content: boolean;
  re_engagement: boolean;

  /** Hour in the user's own timezone, 0–23. */
  preferred_hour: number;
  /** Suppress everything between 22:00 and 07:00 local, except exact-instant events. */
  quiet_hours: boolean;
  paused_until: string | null;
  email_marketing: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  // Sky — the peaks are on, the second-order beats are not.
  new_moon: true,
  new_moon_act: false,
  full_moon: true,
  quarter_moon: false,
  eclipses: true,
  eclipse_season: true,
  retrograde_stations: true,
  retrograde_shadow: false,
  mercury_retrograde: false,   // the stations say it better; see the copy note
  major_ingresses: true,

  // Chart — the rarest and most specific things the app can say.
  major_transits: true,
  transit_approaching: false,
  solar_return: true,
  birthday_week: true,

  // Practice — their own material.
  journal_checkin: true,
  practice_reminders: true,
  /**
   * Off by default, and deliberately.
   *
   * A streak nudge is the app talking about itself: it isn't the sky, it isn't
   * their chart, and it isn't something of theirs waiting — it fails all four
   * jobs above. It sits badly next to "default to silence", and an app that
   * guilts people about a lapsed streak is a different app from this one.
   * Anyone who wants it can switch it on.
   */
  learning_reminder: false,

  daily_content: false,        // opt-in; a daily push has to be asked for
  re_engagement: false,        // see shouldSendReengagement

  preferred_hour: 19,
  quiet_hours: true,
  paused_until: null,
  email_marketing: false,
};

/** A group is on when any of its categories is on. */
export function groupEnabled(prefs: NotificationPreferences, group: NotificationGroup): boolean {
  return categoriesInGroup(group).some((c) => prefs[c] === true);
}

/**
 * Turn a whole group on or off.
 *
 * Switching a group ON restores that group's defaults rather than enabling
 * everything in it — otherwise one tap on "The sky" would opt someone into the
 * second-order beats (the act beat, shadow periods) that are deliberately off.
 */
export function setGroup(
  prefs: NotificationPreferences,
  group: NotificationGroup,
  on: boolean,
): NotificationPreferences {
  const next = { ...prefs };
  for (const c of categoriesInGroup(group)) {
    next[c] = on ? DEFAULT_PREFERENCES[c] : false;
  }
  return next;
}

export const TIME_OPTIONS = [
  { label: "Morning", hour: 8, description: "8 AM your time" },
  { label: "Late morning", hour: 10, description: "10 AM" },
  { label: "Lunchtime", hour: 12, description: "12 PM" },
  { label: "Late afternoon", hour: 17, description: "5 PM" },
  { label: "Evening", hour: 19, description: "7 PM" },
  { label: "Night", hour: 21, description: "9 PM" },
] as const;

export const PAUSE_OPTIONS = [
  { label: "A day", hours: 24 },
  { label: "A week", hours: 24 * 7 },
  { label: "A month", hours: 24 * 30 },
] as const;

export function getPauseUntil(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export function isPaused(prefs: NotificationPreferences, now: Date = new Date()): boolean {
  if (!prefs.paused_until) return false;
  return new Date(prefs.paused_until) > now;
}

/* ─── Priority ─── */

/**
 * When two things are true on the same day, this decides which one is sent.
 * Rarity first: a solar return happens once a year and a full moon happens
 * thirteen times, so the solar return wins.
 */
export const PRIORITY_ORDER: NotificationCategory[] = [
  "solar_return",
  "eclipses",
  "eclipse_season",
  "birthday_week",
  "major_transits",
  "transit_approaching",
  "retrograde_stations",
  "major_ingresses",
  "full_moon",
  "new_moon",
  "journal_checkin",
  "practice_reminders",
  "retrograde_shadow",
  "new_moon_act",
  "mercury_retrograde",
  "quarter_moon",
  "daily_content",
  "learning_reminder",
  "re_engagement",
];

export function getPriority(category: NotificationCategory): number {
  const idx = PRIORITY_ORDER.indexOf(category);
  return idx === -1 ? 99 : idx;
}

/* ─── Delivery timing ─── */

/**
 * Categories delivered at their own astronomical moment rather than at the
 * user's chosen hour. A solar return announced at 7pm when it happened at
 * 4:12am is a worse notification than one that arrives when it happens.
 */
const NATURAL_TIME_EVENTS = new Set<NotificationCategory>([
  "full_moon",        // moonrise
  "new_moon",         // sunset
  "quarter_moon",     // sunrise
  "solar_return",     // the exact instant
  "eclipses",         // the exact instant
  "retrograde_stations",
  "major_ingresses",
]);

export function usesNaturalTime(category: NotificationCategory): boolean {
  return NATURAL_TIME_EVENTS.has(category);
}

/**
 * Quiet hours, as a pure function of the user's own local hour.
 *
 * 22:00–07:00 is convention, not evidence — I looked and there is no data
 * establishing an optimal window. It is a reasonable convention and worth
 * keeping, but it should not be described as research-backed.
 */
export const QUIET_START = 22;
export const QUIET_END = 7;

export function isQuietHour(localHour: number): boolean {
  return localHour >= QUIET_START || localHour < QUIET_END;
}

/* ─── Frequency caps ─── */

export interface SentNotification {
  category: NotificationCategory;
  /** ISO timestamp. */
  sent_at: string;
}

/**
 * The budget.
 *
 * These numbers were previously written down and enforced nowhere: the old
 * rate limiter kept its log in localStorage, and the only thing that sends
 * notifications is a cron running on a server, where localStorage does not
 * exist. The functions had no callers anywhere in the codebase.
 *
 * The evidence for any specific ceiling is weak — the two most-cited studies
 * contradict each other, and neither covers consumer astrology. What is clear
 * is that unsolicited volume is what drives people to switch push off, so the
 * budget is spent on things that actually happened rather than on reasons to
 * open the app.
 */
export const CAP_PER_DAY = 1;
export const CAP_PER_WEEK = 4;
export const CAP_PER_MONTH = 10;

function countSince(log: SentNotification[], now: Date, ms: number): number {
  const cutoff = now.getTime() - ms;
  return log.filter((e) => new Date(e.sent_at).getTime() > cutoff).length;
}

const DAY = 24 * 60 * 60 * 1000;

/** Would sending now exceed the budget? The daily reading has its own rules. */
export function exceedsCaps(log: SentNotification[], now: Date = new Date()): boolean {
  if (countSince(log, now, DAY) >= CAP_PER_DAY) return true;
  if (countSince(log, now, 7 * DAY) >= CAP_PER_WEEK) return true;
  if (countSince(log, now, 30 * DAY) >= CAP_PER_MONTH) return true;
  return false;
}

/**
 * The daily reading is exempt from the weekly and monthly caps — it is
 * anticipated content that someone asked for, which is a different thing from
 * an interruption, and capping it at four a week would just make it erratic.
 * It still cannot double up with another push on the same day.
 */
export function dailyReadingBlocked(log: SentNotification[], now: Date = new Date()): boolean {
  return countSince(log, now, DAY) >= CAP_PER_DAY;
}

/**
 * Re-engagement: day 7, day 21, day 60, then never again.
 *
 * Kept behind an off-by-default switch because it is the weakest-evidenced
 * thing in this file — there is no published benchmark for win-back cadence or
 * reactivation rates anywhere I could find. There is also a real cost to
 * getting it wrong now that Apple Intelligence and Android's notification
 * cooldown both learn from per-app engagement: sends that are ignored train
 * the OS to suppress the app for everybody.
 */
export const REENGAGEMENT_DAYS = [7, 21, 60] as const;

export function shouldSendReengagement(daysInactive: number, alreadySent: number): boolean {
  if (alreadySent >= REENGAGEMENT_DAYS.length) return false;
  return daysInactive >= REENGAGEMENT_DAYS[alreadySent];
}
