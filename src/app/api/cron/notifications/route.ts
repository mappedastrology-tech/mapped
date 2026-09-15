/**
 * GET /api/cron/notifications — the sender.
 *
 * Runs HOURLY, not daily, and that is the point. The old cron ran once at 14:00
 * UTC and pushed to everybody in that single pass, which meant the six delivery
 * times offered on the settings screen did nothing at all: 14:00 UTC is 9am in
 * Texas, 7am in California, 3pm in London and 11pm in Tokyo, inside anyone's
 * quiet hours. Running every hour and sending only to the people whose own
 * clock has reached their chosen hour is what makes that setting real.
 *
 * It also enforces the frequency budget, which was previously written down in
 * one file and enforced in none: the old rate limiter kept its log in
 * localStorage, and this runs on a server.
 *
 * Auth: CRON_SECRET (Vercel sends it as Authorization: Bearer <secret>).
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTodaysMoonEvent } from "@/lib/celestialCalendar";
import { computeStreak } from "@/lib/learn/stats";
import {
  DEFAULT_PREFERENCES,
  getPriority,
  isPaused,
  isQuietHour,
  exceedsCaps,
  dailyReadingBlocked,
  type NotificationPreferences,
  type NotificationCategory,
  type SentNotification,
} from "@/lib/notifications/catalogue";
import { copyFor, renderCopy } from "@/lib/notifications/copy";
import {
  personalTransitNotification,
  journalCheckinNotification,
  exactTransitToday,
  type ChartRow,
} from "@/lib/notifications/transitPush";
import {
  stationsOn, ingressesOn, eclipseOn, eclipseSeasonOpensOn, solarReturnOn,
} from "@/lib/notifications/skyEvents";

/* ─── Types ─── */

interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
}

interface ProfileRow {
  id: string;
  notification_preferences: NotificationPreferences | null;
  timezone: string | null;
}

export interface Candidate {
  category: NotificationCategory;
  title: string;
  body: string;
  /**
   * The hour this fires at, when the event has one of its own. A solar return
   * announced at 7pm when it happened at 4:12am is a worse notification than
   * one that arrives when it happens.
   */
  atHour?: number;
}

/* ─── The user's own clock ─── */

/**
 * The wall-clock date and hour where this person actually is.
 *
 * Everything downstream is a calendar question — is it their hour, is it their
 * quiet time, did the moon peak on their today — and the calendar is theirs,
 * not the server's. A missing or unrecognised timezone falls back to UTC rather
 * than throwing: a notification an hour or two off is better than none.
 */
export function localNow(now: Date, timezone: string | null): { date: Date; hour: number; ymd: string } {
  const read = (tz: string) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", hour12: false,
    }).formatToParts(now);

  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = read(timezone || "UTC");
  } catch {
    parts = read("UTC");
  }
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const y = Number(get("year")), m = Number(get("month")), d = Number(get("day"));
  const hour = Number(get("hour")) % 24;
  return {
    // A Date built from their local parts, so getMonth()/getDate() on it answer
    // "what day is it where they are" — which is what every event helper asks.
    date: new Date(y, m - 1, d, 12),
    hour,
    ymd: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

function getPrefs(profile: ProfileRow | undefined): NotificationPreferences {
  return { ...DEFAULT_PREFERENCES, ...(profile?.notification_preferences ?? {}) };
}

/* ─── What is true for this person today ─── */

export function candidatesFor(
  localDay: Date,
  prefs: NotificationPreferences,
  chart: ChartRow | undefined,
  learning: { atRisk: boolean; streak: number } | undefined,
): Candidate[] {
  const out: Candidate[] = [];
  const push = (c: Candidate) => { if (prefs[c.category] === true) out.push(c); };
  const ymd = `${localDay.getFullYear()}-${String(localDay.getMonth() + 1).padStart(2, "0")}-${String(localDay.getDate()).padStart(2, "0")}`;

  /* Job 01 — the sky did something */

  const moon = getTodaysMoonEvent(localDay);
  if (moon?.isPeak) {
    if (moon.kind === "full") {
      // The named moon is the better title where the month has one: "The
      // Harvest Moon" says more than "Full Moon", and it is the specific half.
      const slots: Record<string, string> = { sign: moon.zodiacSign };
      if (moon.moonName) slots.name = moon.moonName.replace(/ Moon$/, "");
      const variant = moon.moonName ? "named" : "default";
      push({ category: "full_moon", ...renderCopy(copyFor("full_moon", variant), slots) });
    } else {
      push({ category: "new_moon", ...renderCopy(copyFor("new_moon", "default"), { sign: moon.zodiacSign }) });
    }
  }

  const eclipse = eclipseOn(localDay);
  if (eclipse) {
    push({
      category: "eclipses",
      ...renderCopy(copyFor("eclipses", eclipse.kind), { sign: moon?.zodiacSign ?? "the sky" }),
    });
  }

  const season = eclipseSeasonOpensOn(localDay);
  if (season) {
    push({
      category: "eclipse_season",
      ...renderCopy(copyFor("eclipse_season", "default"), {
        count: season.count === 2 ? "two" : season.count === 3 ? "three" : String(season.count),
        axis: eclipseAxis(season.firstAt),
      }),
    });
  }

  for (const st of stationsOn(localDay)) {
    const variant = st.direction === "direct" && !st.retrogradeSince
      ? "direct-undated"
      : st.direction;
    const slots: Record<string, string> = {
      planet: st.planet,
      house: houseOf(chart, st.longitude),
    };
    if (st.retrogradeSince) slots.month = monthName(st.retrogradeSince);
    push({
      category: "retrograde_stations",
      ...renderCopy(copyFor("retrograde_stations", variant), slots),
    });
  }

  for (const ing of ingressesOn(localDay)) {
    push({
      category: "major_ingresses",
      ...renderCopy(copyFor("major_ingresses", "default"), {
        planet: ing.planet, sign: ing.sign, years: ing.years,
        house: houseOf(chart, signStart(ing.sign)),
      }),
    });
  }

  /* Job 02 — your chart did something */

  // One ephemeris lookup, two notifications: the transit push and the journal
  // check-in are asking the same question.
  const hit = chart ? exactTransitToday(chart, ymd) : null;

  if (chart) {
    // The journal version of a transit is strictly the better one: same
    // specificity, plus a question written for exactly this transit. So it
    // REPLACES the plain transit push rather than competing with it — they
    // fire from the same event, and on priority alone the plain one would win
    // every time and the journal check-in would never be seen at all.
    const journal = prefs.journal_checkin ? journalCheckinNotification(chart, ymd, hit) : null;
    const transit = journal ? null : personalTransitNotification(chart, ymd, hit);
    if (journal) push(journal);
    if (transit) push(transit);

    const natalSun = chart.planets?.find((p) => p.name === "Sun");
    if (natalSun) {
      const at = solarReturnOn(localDay, natalSun.absPosition);
      if (at) {
        push({
          category: "solar_return",
          ...renderCopy(copyFor("solar_return", "default"), { time: clockTime(at) }),
          atHour: at.getHours(),
        });
      }
    }
  }

  /* Job 03 — something of yours is waiting */

  if (learning?.atRisk && learning.streak > 0) {
    push({
      category: "learning_reminder",
      ...renderCopy(copyFor("learning_reminder", "default"), { n: learning.streak }),
    });
  }

  /* Job 04 — nothing is happening */

  // Only reached when nothing above was true, which is the whole point of it.
  if (prefs.daily_content && out.length === 0) {
    push({ category: "daily_content", ...renderCopy(copyFor("daily_content", "quiet")) });
  }

  out.sort((a, b) => getPriority(a.category) - getPriority(b.category));
  return out;
}

/* ─── Copy slots ─── */

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

function signStart(sign: string): number {
  return Math.max(0, SIGNS.indexOf(sign)) * 30;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Which of this person's houses a longitude falls in. "1st" when unknown. */
export function houseOf(chart: ChartRow | undefined, longitude: number): string {
  const cusps = chart?.houses;
  if (!Array.isArray(cusps) || cusps.length < 12) return "1st";
  const sorted = [...cusps].sort((a, b) => a.number - b.number);
  for (let i = 0; i < 12; i++) {
    const from = sorted[i].absPosition;
    const to = sorted[(i + 1) % 12].absPosition;
    const inside = from < to
      ? longitude >= from && longitude < to
      : longitude >= from || longitude < to;
    if (inside) return ordinal(sorted[i].number);
  }
  return "1st";
}

/** The sign axis an eclipse falls across — the Sun's sign and its opposite. */
function eclipseAxis(at: Date): string {
  const i = Math.floor((sunLongitudeApprox(at) % 360) / 30) % 12;
  return `${SIGNS[i]}/${SIGNS[(i + 6) % 12]}`;
}

/** Good to a degree or two, which is all a sign name needs. */
function sunLongitudeApprox(at: Date): number {
  const start = Date.UTC(at.getUTCFullYear(), 2, 20);        // ~0 Aries
  const days = (at.getTime() - start) / 86400000;
  return ((days * (360 / 365.2422)) % 360 + 360) % 360;
}

function monthName(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long" });
}

function clockTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/* ─── Handler ─── */

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || "mailto:contacttaylorsometimes@gmail.com";
  if (!vapidPrivate || !vapidPublic) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const webpush: any = require("web-push");
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const now = new Date();

  const { data: subscriptions, error: subErr } = await supabase
    .from("push_subscriptions")
    .select("id, user_id, endpoint, keys_p256dh, keys_auth");
  if (subErr || !subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0, error: subErr?.message ?? "no subscriptions" });
  }

  const userIds = [...new Set((subscriptions as PushSubscriptionRow[]).map((s) => s.user_id))];

  const [{ data: profiles }, { data: charts }, { data: learningRows }, { data: logRows }] = await Promise.all([
    supabase.from("profiles").select("id, notification_preferences, timezone").in("id", userIds),
    supabase.from("charts").select("user_id, planets, houses, zodiac_system, ayanamsa, created_at")
      .in("user_id", userIds).order("created_at", { ascending: false }),
    supabase.from("learning_activity").select("user_id, activity_date, xp, items").in("user_id", userIds),
    // 31 days covers the longest window any cap looks at.
    supabase.from("notification_log").select("user_id, category, sent_at")
      .in("user_id", userIds)
      .gte("sent_at", new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const profileMap = new Map((profiles as ProfileRow[] | null)?.map((p) => [p.id, p]) ?? []);

  const chartMap = new Map<string, ChartRow>();
  for (const c of (charts as (ChartRow & { created_at: string })[] | null) ?? []) {
    if (!chartMap.has(c.user_id)) chartMap.set(c.user_id, c);
  }

  const activeByUser = new Map<string, Set<string>>();
  for (const r of (learningRows as { user_id: string; activity_date: string; xp: number; items: number }[] | null) ?? []) {
    if ((r.items ?? 0) <= 0 && (r.xp ?? 0) <= 0) continue;
    const set = activeByUser.get(r.user_id) ?? new Set<string>();
    set.add(r.activity_date);
    activeByUser.set(r.user_id, set);
  }

  const logByUser = new Map<string, SentNotification[]>();
  for (const r of (logRows as { user_id: string; category: NotificationCategory; sent_at: string }[] | null) ?? []) {
    const list = logByUser.get(r.user_id) ?? [];
    list.push({ category: r.category, sent_at: r.sent_at });
    logByUser.set(r.user_id, list);
  }

  const subsByUser = new Map<string, PushSubscriptionRow[]>();
  for (const sub of subscriptions as PushSubscriptionRow[]) {
    const list = subsByUser.get(sub.user_id) ?? [];
    list.push(sub);
    subsByUser.set(sub.user_id, list);
  }

  const staleEndpoints: string[] = [];
  const logInserts: { user_id: string; category: string; sent_at: string }[] = [];
  let sent = 0, failed = 0, skipped = 0;

  for (const [userId, userSubs] of subsByUser) {
    const profile = profileMap.get(userId);
    const prefs = getPrefs(profile);
    if (isPaused(prefs, now)) { skipped++; continue; }

    const local = localNow(now, profile?.timezone ?? null);
    const log = logByUser.get(userId) ?? [];

    const { streak, atRisk } = computeStreak(activeByUser.get(userId) ?? new Set<string>(), now);
    const candidates = candidatesFor(local.date, prefs, chartMap.get(userId), { streak, atRisk });
    if (candidates.length === 0) { skipped++; continue; }

    // Is it their hour? An event with a moment of its own keeps it; everything
    // else waits for the hour they chose.
    const notif = candidates.find((c) => (c.atHour ?? prefs.preferred_hour) === local.hour);
    if (!notif) { skipped++; continue; }

    // Quiet hours, unless the event has its own moment — a solar return
    // announced nine hours late is worse than one that arrives at 3am.
    if (prefs.quiet_hours && isQuietHour(local.hour) && notif.atHour === undefined) { skipped++; continue; }

    const overBudget = notif.category === "daily_content"
      ? dailyReadingBlocked(log, now)
      : exceedsCaps(log, now);
    if (overBudget) { skipped++; continue; }

    const payload = JSON.stringify({
      title: notif.title, body: notif.body, url: "/home", tag: notif.category,
    });

    let deliveredToAny = false;
    for (const sub of userSubs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
          payload,
        );
        deliveredToAny = true;
        sent++;
      } catch (err: unknown) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) staleEndpoints.push(sub.endpoint);
        failed++;
      }
    }

    // Logged once per person, not once per device: the budget is about how
    // often someone hears from us, not how many phones they own.
    if (deliveredToAny) {
      logInserts.push({ user_id: userId, category: notif.category, sent_at: now.toISOString() });
    }
  }

  if (logInserts.length > 0) await supabase.from("notification_log").insert(logInserts);
  if (staleEndpoints.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", staleEndpoints);
  }

  return NextResponse.json({
    at: now.toISOString(),
    sent, failed, skipped,
    cleaned: staleEndpoints.length,
    users: subsByUser.size,
  });
}
