/**
 * GET /api/cron/notifications — Vercel Cron handler for daily push notifications.
 *
 * Runs daily at 14:00 UTC. For each user with push subscriptions:
 *   1. Checks notification preferences and pause state
 *   2. Determines which notifications to send today (moon phase, daily content, practice)
 *   3. Sends via web-push, cleaning up stale subscriptions
 *
 * Auth: CRON_SECRET env var (Vercel sends it as Authorization: Bearer <secret>)
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTodaysMoonEvent, type TodaysMoonEvent } from "@/lib/celestialCalendar";
import { computeStreak } from "@/lib/learn/stats";
import { personalTransitNotification, type ChartRow } from "@/lib/notifications/transitPush";
import {
  SAMPLE_COPY,
  type NotificationPreferences,
  DEFAULT_PREFERENCES,
  type NotificationCategory,
  getPriority,
} from "@/lib/notifications";

/* ─── Types ─── */

interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
  last_notification_date: string | null;
}

interface ProfileRow {
  id: string;
  notification_preferences: NotificationPreferences | null;
}

interface SendResult {
  user_id: string;
  category: NotificationCategory;
  success: boolean;
}

/* ─── Helpers ─── */

function todayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPrefs(profile: ProfileRow): NotificationPreferences {
  return { ...DEFAULT_PREFERENCES, ...(profile.notification_preferences ?? {}) };
}

function isPaused(prefs: NotificationPreferences): boolean {
  if (!prefs.paused_until) return false;
  return new Date(prefs.paused_until) > new Date();
}

/* ─── Determine today's notifications for a user ─── */

function determineNotifications(
  prefs: NotificationPreferences,
  moonEvent: TodaysMoonEvent | null,
  chart: ChartRow | undefined,
  today: string,
  learning: { atRisk: boolean; streak: number } | undefined,
): { category: NotificationCategory; title: string; body: string }[] {
  const out: { category: NotificationCategory; title: string; body: string }[] = [];

  // 1. Moon phase — on the peak day only.
  //
  // The moon READS as full or new for about three days, and the old test here
  // (getMoonPhaseLabel === "Full Moon") was true for all of them, so one
  // lunation sent on three consecutive nights, each one saying "tonight".
  // isPeak is the day holding the exact instant, which is the night the copy
  // is actually describing.
  const isPeakFull = moonEvent?.kind === "full" && moonEvent.isPeak;
  const isPeakNew = moonEvent?.kind === "new" && moonEvent.isPeak;

  if (isPeakFull && prefs.full_moon) {
    const copies = SAMPLE_COPY.filter((c) => c.category === "full_moon");
    const copy = pickRandom(copies);
    const body = copy.body.replace("[sign]", moonEvent!.zodiacSign);
    // The traditional name where the month has one — "The Harvest Moon" is a
    // better title than "Full Moon", and it is the specific half.
    const title = moonEvent!.moonName
      ? `The ${moonEvent!.moonName}`
      : `Full moon in ${moonEvent!.zodiacSign}`;
    out.push({ category: "full_moon", title, body });
  }

  if (isPeakNew && prefs.new_moon) {
    const copies = SAMPLE_COPY.filter((c) => c.category === "new_moon");
    const copy = pickRandom(copies);
    const body = copy.body.replace("[sign]", moonEvent!.zodiacSign);
    out.push({ category: "new_moon", title: `New moon in ${moonEvent!.zodiacSign}`, body });
  }

  // 2. Personal transits — major aspect exact today against the natal chart
  if (prefs.major_transits && chart) {
    const transit = personalTransitNotification(chart, today);
    if (transit) out.push(transit);
  }

  // 3. Daily content (only if nothing else is queued, to avoid stacking)
  if (prefs.daily_content && out.length === 0) {
    const copies = SAMPLE_COPY.filter((c) => c.category === "daily_content");
    const copy = pickRandom(copies);
    out.push({ category: "daily_content", title: "Mapped", body: copy.body });
  }

  // 3b. Learning streak about to lapse — active yesterday, nothing today yet.
  if (prefs.learning_reminder && learning?.atRisk && learning.streak > 0) {
    const copies = SAMPLE_COPY.filter((c) => c.category === "learning_reminder");
    if (copies.length > 0) {
      const copy = pickRandom(copies);
      const body = copy.body.replace("[streak]", String(learning.streak));
      out.push({ category: "learning_reminder", title: "Mapped", body });
    }
  }

  // 4. Practice reminders — same peak gate, or they repeat for three nights too.
  if (prefs.practice_reminders && (isPeakFull || isPeakNew)) {
    const copies = SAMPLE_COPY.filter((c) => c.category === "practice_reminders");
    if (copies.length > 0) {
      const copy = pickRandom(copies);
      const body = copy.body
        .replace("[time]", "tonight")
        .replace("[ritual name]", "your moon ritual");
      out.push({ category: "practice_reminders", title: "Moon Practice", body });
    }
  }

  // Highest-priority notification first — the caller sends only out[0].
  out.sort((a, b) => getPriority(a.category) - getPriority(b.category));
  return out;
}

/* ─── Main handler ─── */

export async function GET(request: Request) {
  // Authenticate — Vercel Cron sends CRON_SECRET as Bearer token.
  // Fail closed: if CRON_SECRET isn't configured, reject everything
  // rather than leaving the endpoint open to the public internet.
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

  const today = todayDateStr();

  // Fetch all push subscriptions that haven't been notified today
  const { data: subscriptions, error: subErr } = await supabase
    .from("push_subscriptions")
    .select("id, user_id, endpoint, keys_p256dh, keys_auth, last_notification_date")
    .or(`last_notification_date.is.null,last_notification_date.neq.${today}`);

  if (subErr || !subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0, error: subErr?.message ?? "no subscriptions" });
  }

  // Get unique user IDs and fetch their profiles
  const userIds = [...new Set((subscriptions as PushSubscriptionRow[]).map((s) => s.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, notification_preferences")
    .in("id", userIds);

  const profileMap = new Map((profiles as ProfileRow[] | null)?.map((p) => [p.id, p]) ?? []);

  // Fetch each user's natal chart for personal-transit notifications. Most recent
  // chart per user wins (matches what the app treats as their primary chart).
  const { data: charts } = await supabase
    .from("charts")
    .select("user_id, planets, houses, zodiac_system, ayanamsa, created_at")
    .in("user_id", userIds)
    .order("created_at", { ascending: false });

  const chartMap = new Map<string, ChartRow>();
  for (const c of (charts as (ChartRow & { created_at: string })[] | null) ?? []) {
    if (!chartMap.has(c.user_id)) chartMap.set(c.user_id, c);
  }

  // Fetch learning activity to detect streaks about to lapse.
  const { data: learningRows } = await supabase
    .from("learning_activity")
    .select("user_id, activity_date, xp, items")
    .in("user_id", userIds);
  const activeByUser = new Map<string, Set<string>>();
  for (const r of (learningRows as { user_id: string; activity_date: string; xp: number; items: number }[] | null) ?? []) {
    if ((r.items ?? 0) <= 0 && (r.xp ?? 0) <= 0) continue;
    const set = activeByUser.get(r.user_id) ?? new Set<string>();
    set.add(r.activity_date);
    activeByUser.set(r.user_id, set);
  }

  // Compute today's moon event once. Null on the ~26 ordinary days of the month.
  const now = new Date();
  const moonEvent = getTodaysMoonEvent(now);

  // Group subscriptions by user
  const subsByUser = new Map<string, PushSubscriptionRow[]>();
  for (const sub of subscriptions as PushSubscriptionRow[]) {
    const list = subsByUser.get(sub.user_id) ?? [];
    list.push(sub);
    subsByUser.set(sub.user_id, list);
  }

  const results: SendResult[] = [];
  const staleEndpoints: string[] = [];

  for (const [userId, userSubs] of subsByUser) {
    const profile = profileMap.get(userId);
    const prefs = profile ? getPrefs(profile) : DEFAULT_PREFERENCES;

    if (isPaused(prefs)) continue;

    const { streak, atRisk } = computeStreak(activeByUser.get(userId) ?? new Set<string>(), now);
    const notifications = determineNotifications(prefs, moonEvent, chartMap.get(userId), today, { streak, atRisk });
    if (notifications.length === 0) continue;

    // Send highest-priority notification only (respect rate limits)
    const notif = notifications[0];
    const payload = JSON.stringify({
      title: notif.title,
      body: notif.body,
      url: "/home",
      tag: notif.category,
    });

    for (const sub of userSubs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
          payload,
        );
        results.push({ user_id: userId, category: notif.category, success: true });
      } catch (err: unknown) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          staleEndpoints.push(sub.endpoint);
        }
        results.push({ user_id: userId, category: notif.category, success: false });
      }
    }

    // Mark all user subs as notified today
    const subIds = userSubs.map((s) => s.id);
    await supabase
      .from("push_subscriptions")
      .update({ last_notification_date: today })
      .in("id", subIds);
  }

  // Clean up stale subscriptions
  if (staleEndpoints.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", staleEndpoints);
  }

  const sent = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return NextResponse.json({
    date: today,
    moon: moonEvent ? `${moonEvent.kind}${moonEvent.isPeak ? " (peak)" : ""}` : "none",
    sent,
    failed,
    cleaned: staleEndpoints.length,
    users: subsByUser.size,
  });
}
