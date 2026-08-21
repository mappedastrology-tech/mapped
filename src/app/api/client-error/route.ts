import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/client-error
 *
 * Receives a captured client error. Logs it server-side (so it shows up in your
 * Vercel logs, which client errors otherwise never reach) and, if a Sentry DSN
 * is configured, forwards it to Sentry. Rate-limited so it can't be abused.
 *
 * Configure (optional) to enable Sentry forwarding:
 *   SENTRY_DSN = https://<key>@<host>/<projectId>
 */
export async function POST(request: NextRequest) {
  const { checkRateLimitDurable, getClientIP } = await import("@/lib/rateLimit");
  const ip = getClientIP(request);
  const { allowed } = await checkRateLimitDurable(`client-error:${ip}`, 40, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ ok: false }, { status: 429 });

  let body: Record<string, unknown> = {};
  try { body = await request.json(); } catch { /* ignore */ }

  const message = String(body.message ?? "Unknown client error").slice(0, 500);
  // Lands in Vercel logs (searchable by "[client-error]").
  console.error("[client-error]", message, {
    name: body.name,
    url: body.url,
    stack: String(body.stack ?? "").slice(0, 2000),
    userAgent: body.userAgent,
    context: body.context,
  });

  // Best-effort forward to Sentry (only if a DSN is set). Never blocks the response.
  try { await forwardToSentry(body); } catch { /* monitoring must never throw */ }

  return NextResponse.json({ ok: true });
}

async function forwardToSentry(body: Record<string, unknown>): Promise<void> {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  const m = dsn.match(/^https:\/\/([^@]+)@([^/]+)\/(.+)$/);
  if (!m) return;
  const [, key, host, projectId] = m;

  const eventId = (globalThis.crypto?.randomUUID?.() || `${Date.now()}${Math.random()}`).replace(/-/g, "");
  const event = {
    event_id: eventId,
    timestamp: Date.now() / 1000,
    platform: "javascript",
    level: "error",
    logger: "client",
    exception: {
      values: [{ type: String(body.name ?? "Error"), value: String(body.message ?? "") }],
    },
    request: { url: body.url, headers: { "User-Agent": String(body.userAgent ?? "") } },
    extra: { stack: body.stack, ...(body.context as Record<string, unknown> | undefined) },
  };

  const envelope =
    JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString(), dsn }) + "\n" +
    JSON.stringify({ type: "event" }) + "\n" +
    JSON.stringify(event) + "\n";

  await fetch(`https://${host}/api/${projectId}/envelope/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-sentry-envelope",
      "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${key}, sentry_client=mapped/1.0`,
    },
    body: envelope,
  });
}
