/**
 * Daily notifications cron — Netlify Scheduled Function.
 *
 * Replaces the Vercel cron in vercel.json (Netlify ignores that file). Fires
 * daily at 14:00 UTC and calls the app's own /api/cron/notifications route,
 * which does the real work: read push subscriptions, respect each user's
 * preferences and pause state, send via web-push, prune dead subscriptions.
 *
 * The route authenticates with CRON_SECRET as a bearer token and fails closed
 * when it is unset, so CRON_SECRET must be configured in Netlify's environment
 * variables or every run returns 401 and nothing sends.
 *
 * Notes:
 *  - Scheduled functions only run on the published production deploy, never on
 *    branch/preview deploys.
 *  - They have a 30s execution limit; this only kicks off the request, and the
 *    route itself does the sending, so the limit is not a concern here.
 */

import type { Config } from "@netlify/functions";

export default async () => {
  const base = process.env.URL; // Netlify-provided canonical site URL
  const secret = process.env.CRON_SECRET;

  if (!base) {
    console.error("[notifications-cron] No URL env var — cannot resolve site.");
    return new Response("Missing URL", { status: 500 });
  }
  if (!secret) {
    console.error("[notifications-cron] CRON_SECRET unset — the route will reject this call.");
    return new Response("Missing CRON_SECRET", { status: 500 });
  }

  try {
    const res = await fetch(`${base}/api/cron/notifications`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const body = await res.text();
    // Surfaced in Netlify's function logs — the fastest way to see whether a
    // night's run actually delivered.
    console.log(`[notifications-cron] ${res.status} ${body.slice(0, 500)}`);
    return new Response(body, { status: res.status });
  } catch (err) {
    console.error("[notifications-cron] Request failed:", err);
    return new Response("Cron request failed", { status: 500 });
  }
};

export const config: Config = {
  schedule: "0 14 * * *", // daily 14:00 UTC — matches the old vercel.json
};
