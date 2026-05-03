/**
 * POST /api/notifications — Send push notifications to subscribed users.
 *
 * This endpoint is meant to be called by a cron job (Vercel Cron, etc.)
 * to send scheduled notifications. It reads from push_subscriptions table,
 * checks user preferences, and sends via Web Push.
 *
 * Required env vars:
 *   VAPID_PRIVATE_KEY — base64url encoded private key
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY — base64url encoded public key
 *   VAPID_SUBJECT — mailto: or https:// contact
 *   CRON_SECRET — secret to authenticate cron requests
 *
 * Body: { category, title, body, url?, userId? }
 */

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Authenticate
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category, title, body, url, userId } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: "title and body required" }, { status: 400 });
    }

    // For now, since web-push npm package requires Node.js crypto,
    // and we want to keep this lightweight, we'll use the Web Push protocol directly.
    // In production, install `web-push` package and use it here.

    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || "mailto:contacttaylorsometimes@gmail.com";

    if (!vapidPrivateKey || !vapidPublicKey) {
      return NextResponse.json({
        error: "VAPID keys not configured. Set VAPID_PRIVATE_KEY and NEXT_PUBLIC_VAPID_PUBLIC_KEY in env.",
        hint: "Generate keys with: npx web-push generate-vapid-keys",
      }, { status: 500 });
    }

    // Dynamically require web-push (must be installed: npm install web-push)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let webpush: any;
    try {
      webpush = require("web-push");
    } catch {
      return NextResponse.json({
        error: "web-push package not installed. Run: npm install web-push",
        sent: 0,
      }, { status: 500 });
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // Fetch subscriptions from Supabase
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    let query = supabaseAdmin.from("push_subscriptions").select("*");
    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError || !subscriptions) {
      return NextResponse.json({ error: "Failed to fetch subscriptions", detail: fetchError?.message }, { status: 500 });
    }

    // If targeting by category, check each user's preferences
    let targets = subscriptions;
    if (category && !userId) {
      const userIds = [...new Set(subscriptions.map((s: { user_id: string }) => s.user_id))];
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, notification_preferences")
        .in("id", userIds);

      const enabledUserIds = new Set(
        (profiles || [])
          .filter((p: { notification_preferences?: Record<string, unknown> }) => {
            const prefs = p.notification_preferences;
            if (!prefs) return true; // default to sending
            if (prefs.paused_until && new Date(prefs.paused_until as string) > new Date()) return false;
            return prefs[category] !== false;
          })
          .map((p: { id: string }) => p.id)
      );

      targets = subscriptions.filter((s: { user_id: string }) => enabledUserIds.has(s.user_id));
    }

    // Send to all targets
    const payload = JSON.stringify({ title, body, url: url || "/home", tag: category || "mapped" });
    let sent = 0;
    let failed = 0;
    const staleEndpoints: string[] = [];

    for (const sub of targets) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys_p256dh,
          auth: sub.keys_auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        sent++;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // Subscription expired — mark for cleanup
          staleEndpoints.push(sub.endpoint);
        }
        failed++;
      }
    }

    // Clean up stale subscriptions
    if (staleEndpoints.length > 0) {
      await supabaseAdmin.from("push_subscriptions").delete().in("endpoint", staleEndpoints);
    }

    return NextResponse.json({
      sent,
      failed,
      cleaned: staleEndpoints.length,
      total: targets.length,
    });
  } catch (err) {
    console.error("[notifications API]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET for health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    configured: !!(process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
    hint: !process.env.VAPID_PRIVATE_KEY
      ? "Run `npx web-push generate-vapid-keys` and add to .env"
      : undefined,
  });
}
