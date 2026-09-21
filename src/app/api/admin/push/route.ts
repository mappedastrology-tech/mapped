/**
 * /api/admin/push — send a hand-written push. Admins only.
 *
 * GET   → { admin: true, people, devices } for an admin; 404 for anyone else.
 * POST  → { title, body, url, audience: "me" | "everyone" }
 *
 * WHO CAN USE IT: only the accounts in src/lib/admin.ts, checked here on the
 * server against the id in the caller's verified session token. Everyone else,
 * signed in or not, gets the same 404 an unknown URL would — no hint that the
 * route exists.
 *
 * WHAT "EVERYONE" RESPECTS, because a manual push is still a push:
 *   - a pause the person set
 *   - their quiet hours, in their own timezone
 *   - the same caps as every other push (1 a day, 4 a week, 10 a month)
 * and it is logged, so the scheduler counts it and nobody hears from Mapped
 * twice in one day because a manual send and a moon landed together.
 *
 * "Me" goes to the caller's own devices only, skips the caps and is not
 * logged — it is a preview, and must not use up the day's one real push.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthedUserId } from "@/lib/apiAuth";
import { isAdmin } from "@/lib/admin";
import { validateManualPush, localHour } from "@/lib/notifications/manualPush";
import {
  DEFAULT_PREFERENCES, exceedsCaps, isPaused, isQuietHour,
  type NotificationPreferences, type SentNotification,
} from "@/lib/notifications/catalogue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOT_FOUND = () => NextResponse.json({ error: "Not found" }, { status: 404 });

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

interface SubRow { user_id: string; endpoint: string; keys_p256dh: string; keys_auth: string }
interface ProfileRow { id: string; notification_preferences: Partial<NotificationPreferences> | null; timezone: string | null }

export async function GET(request: Request) {
  const userId = await getAuthedUserId(request);
  if (!isAdmin(userId)) return NOT_FOUND();

  const { data } = await admin().from("push_subscriptions").select("user_id");
  const rows = (data ?? []) as { user_id: string }[];
  return NextResponse.json({
    admin: true,
    people: new Set(rows.map((r) => r.user_id)).size,
    devices: rows.length,
  });
}

export async function POST(request: Request) {
  const userId = await getAuthedUserId(request);
  if (!userId || !isAdmin(userId)) return NOT_FOUND();

  const check = validateManualPush(await request.json().catch(() => null));
  if (!check.ok) return NextResponse.json({ ok: false, field: check.field, error: check.error }, { status: 400 });
  const push = check.push;

  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || "mailto:contacttaylorsometimes@gmail.com";
  if (!vapidPrivate || !vapidPublic) {
    return NextResponse.json({ ok: false, error: "VAPID keys aren't set on the server, so nothing can send." }, { status: 503 });
  }

  const db = admin();
  const now = new Date();

  let query = db.from("push_subscriptions").select("user_id, endpoint, keys_p256dh, keys_auth");
  if (push.audience === "me") query = query.eq("user_id", userId);
  const { data: subData, error: subErr } = await query;
  if (subErr) return NextResponse.json({ ok: false, error: subErr.message }, { status: 500 });
  const subs = (subData ?? []) as SubRow[];
  if (subs.length === 0) {
    return NextResponse.json({
      ok: false,
      error: push.audience === "me"
        ? "This account has no device with notifications on. Turn them on in Settings on your phone first."
        : "Nobody has notifications on yet.",
    }, { status: 404 });
  }

  // Decide who is eligible. "Me" always is; "everyone" goes through the SOP.
  const byUser = new Map<string, SubRow[]>();
  for (const s of subs) byUser.set(s.user_id, [...(byUser.get(s.user_id) ?? []), s]);

  const skipped = { paused: 0, quiet: 0, capped: 0 };
  let eligible = [...byUser.keys()];

  if (push.audience === "everyone") {
    const ids = [...byUser.keys()];
    const [{ data: profiles }, { data: logRows }] = await Promise.all([
      db.from("profiles").select("id, notification_preferences, timezone").in("id", ids),
      db.from("notification_log").select("user_id, category, sent_at").in("user_id", ids)
        .gte("sent_at", new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000).toISOString()),
    ]);
    const profileMap = new Map(((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p]));
    const logs = new Map<string, SentNotification[]>();
    for (const r of (logRows ?? []) as (SentNotification & { user_id: string })[]) {
      logs.set(r.user_id, [...(logs.get(r.user_id) ?? []), r]);
    }

    eligible = ids.filter((id) => {
      const p = profileMap.get(id);
      const prefs = { ...DEFAULT_PREFERENCES, ...(p?.notification_preferences ?? {}) } as NotificationPreferences;
      if (isPaused(prefs, now)) { skipped.paused++; return false; }
      if (prefs.quiet_hours && isQuietHour(localHour(now, p?.timezone))) { skipped.quiet++; return false; }
      if (exceedsCaps(logs.get(id) ?? [], now)) { skipped.capped++; return false; }
      return true;
    });
  }

  // web-push ships no types; the cron route requires it the same way.
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const webpush: any = require("web-push");
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  // A unique tag, so a second manual push arrives as its own notification
  // instead of silently replacing the first on the lock screen.
  const payload = JSON.stringify({ title: push.title, body: push.body, url: push.url, tag: `manual-${now.getTime()}` });

  let devicesSent = 0;
  let failed = 0;
  const reached: string[] = [];
  const stale: string[] = [];

  for (const id of eligible) {
    let any = false;
    for (const s of byUser.get(id) ?? []) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.keys_p256dh, auth: s.keys_auth } }, payload);
        devicesSent++;
        any = true;
      } catch (err) {
        const code = (err as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) stale.push(s.endpoint);
        else failed++;
      }
    }
    if (any) reached.push(id);
  }

  if (stale.length) await db.from("push_subscriptions").delete().in("endpoint", stale);
  if (push.audience === "everyone" && reached.length) {
    await db.from("notification_log").insert(
      reached.map((id) => ({ user_id: id, category: "manual", sent_at: now.toISOString() })),
    );
  }

  // Everyone being skipped by the rules is the rules working, not a failure.
  // It is only an error when someone was eligible and nothing got through.
  const broke = eligible.length > 0 && devicesSent === 0;
  return NextResponse.json({
    ok: !broke,
    audience: push.audience,
    people: reached.length,
    devices: devicesSent,
    failed,
    expired: stale.length,
    skipped,
  }, { status: broke ? 502 : 200 });
}
