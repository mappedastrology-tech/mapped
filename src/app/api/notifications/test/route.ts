/**
 * POST /api/notifications/test — send a push to the caller's own devices.
 *
 * The single most useful endpoint for getting push working, because it turns an
 * opaque pipeline into one button with an answer. Every step between "the app
 * says notifications are on" and "a notification appears on the lock screen"
 * can fail silently and independently:
 *
 *   permission granted → service worker registered → subscription created →
 *   subscription stored → VAPID keys configured → push service accepts it →
 *   the device is awake enough to show it
 *
 * The response names which of those failed rather than saying "sent". It is
 * authenticated as the USER (not the cron secret) and can only ever send to
 * that user's own stored subscriptions — a test button that could target
 * someone else would be a way to push arbitrary text to strangers.
 */

import { NextResponse } from "next/server";
import { getAuthedUserId } from "@/lib/apiAuth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getAuthedUserId(request);
  if (!userId) {
    return NextResponse.json({ ok: false, step: "auth", error: "Sign in first." }, { status: 401 });
  }

  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || "mailto:contacttaylorsometimes@gmail.com";
  if (!vapidPrivate || !vapidPublic) {
    return NextResponse.json({
      ok: false,
      step: "server-config",
      error: "VAPID keys are not set on the server, so nothing can be sent.",
      fix: "Add NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in Vercel, then redeploy.",
    }, { status: 503 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: subs, error } = await admin
    .from("push_subscriptions")
    .select("endpoint, keys_p256dh, keys_auth")
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ ok: false, step: "lookup", error: error.message }, { status: 500 });
  }
  if (!subs || subs.length === 0) {
    return NextResponse.json({
      ok: false,
      step: "no-subscription",
      error: "This account has no push subscription stored.",
      fix: "Turn notifications on in Settings on this device. On iPhone the app must be opened from the Home Screen, not Safari.",
    }, { status: 404 });
  }

  // web-push ships no types; the cron route requires it the same way.
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const webpush: any = require("web-push");
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const payload = JSON.stringify({
    title: "Mapped",
    body: "Notifications are working. This is the test you sent yourself.",
    url: "/home",
    tag: "mapped-test",
  });

  const results = await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.keys_p256dh, auth: s.keys_auth } },
          payload,
        );
        return { ok: true, endpoint: s.endpoint.slice(0, 48) };
      } catch (err) {
        const e = err as { statusCode?: number; body?: string; message?: string };
        // 404/410 mean the push service has retired this endpoint — the
        // browser was reinstalled, or the person cleared site data. Prune it so
        // the next run isn't still shouting at a dead address.
        if (e.statusCode === 404 || e.statusCode === 410) {
          await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
          return { ok: false, endpoint: s.endpoint.slice(0, 48), status: e.statusCode, pruned: true,
                   error: "Subscription expired — removed. Turn notifications on again on that device." };
        }
        return { ok: false, endpoint: s.endpoint.slice(0, 48), status: e.statusCode,
                 error: e.body || e.message || "Push service rejected it." };
      }
    }),
  );

  const sent = results.filter((r) => r.ok).length;
  return NextResponse.json({
    ok: sent > 0,
    step: sent > 0 ? "sent" : "push-service",
    sent,
    of: subs.length,
    results,
  }, { status: sent > 0 ? 200 : 502 });
}
