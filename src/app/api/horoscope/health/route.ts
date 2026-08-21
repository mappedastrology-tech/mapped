import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, FALLBACK_MODEL } from "@/lib/aiModel";

export const runtime = "nodejs";

/**
 * GET /api/horoscope/health
 *
 * Lightweight health check for the AI horoscope pipeline. Makes a 1-token call
 * to verify the configured model actually resolves on Anthropic's side — this
 * is what catches a retired/renamed model (the failure that silently broke the
 * horoscope) before users do.
 *
 * Returns:
 *   200 { ok: true, model }                      — primary model healthy
 *   200 { ok: true, degraded: true, model }      — primary down, fallback works
 *   503 { ok: false, error }                     — both models / API key down
 *
 * Cheap (1 output token) and lightly rate-limited so it can't be abused.
 * Intended for the scheduled uptime monitor.
 */
export async function GET(request: NextRequest) {
  const { checkRateLimitDurable, getClientIP } = await import("@/lib/rateLimit");
  const ip = getClientIP(request);
  const { allowed } = await checkRateLimitDurable(`horoscope-health:${ip}`, 20, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "ANTHROPIC_API_KEY missing" }, { status: 503 });
  }

  const client = new Anthropic({ apiKey });
  const ping = async (model: string) =>
    client.messages.create({ model, max_tokens: 1, messages: [{ role: "user", content: "ping" }] });

  try {
    await ping(CLAUDE_MODEL);
    return NextResponse.json({ ok: true, model: CLAUDE_MODEL });
  } catch (primaryErr) {
    const primaryMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
    try {
      await ping(FALLBACK_MODEL);
      return NextResponse.json({ ok: true, degraded: true, model: FALLBACK_MODEL, primaryError: primaryMsg });
    } catch (fallbackErr) {
      const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      return NextResponse.json(
        { ok: false, error: primaryMsg, fallbackError: fallbackMsg },
        { status: 503 },
      );
    }
  }
}
