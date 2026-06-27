/**
 * Simple in-memory rate limiter for edge runtime.
 *
 * Tracks requests per IP per route with a sliding window.
 * Resets automatically. No external dependencies.
 *
 * Note: In-memory means each edge worker instance has its own counter.
 * This is fine for a small app — it prevents obvious abuse without
 * needing Redis. For serious scale, use Cloudflare Rate Limiting rules.
 */

interface RateEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateEntry>();

// Clean up old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}

/**
 * Check if a request should be rate-limited.
 *
 * @param key - Unique identifier (usually IP + route)
 * @param limit - Max requests per window
 * @param windowMs - Window duration in milliseconds
 * @returns { allowed: boolean, remaining: number }
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count++;
  if (entry.count > limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - entry.count };
}

// ───────────────────────── Durable (Redis-backed) limiter ─────────────────────────
//
// The in-memory limiter above resets per worker and is easy to bypass. When an
// Upstash Redis store is connected (via the Vercel Marketplace, which injects
// KV_REST_API_URL / KV_REST_API_TOKEN — or a direct Upstash UPSTASH_REDIS_*),
// counts are shared across all workers and survive restarts. If no store is
// configured (or it errors), this transparently falls back to the in-memory
// limiter so the app keeps working before/without Redis.

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

/** True when a shared Redis store is configured. */
export const hasDurableRateLimit = Boolean(REDIS_URL && REDIS_TOKEN);

/**
 * Durable rate limit check. Same contract as checkRateLimit, but backed by a
 * shared Redis fixed-window counter when configured. Falls back to in-memory.
 */
export async function checkRateLimitDurable(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number }> {
  if (!REDIS_URL || !REDIS_TOKEN) return checkRateLimit(key, limit, windowMs);

  const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const k = `rl:${key}`;
  try {
    // Atomic-ish fixed window: INCR the counter, and set the expiry only on the
    // first hit of the window (EXPIRE ... NX) so the window doesn't keep sliding.
    const res = await fetch(`${REDIS_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", k],
        ["EXPIRE", k, String(ttlSeconds), "NX"],
      ]),
    });
    if (!res.ok) return checkRateLimit(key, limit, windowMs);
    const data = (await res.json()) as Array<{ result?: number }>;
    const count = Number(data?.[0]?.result ?? 0);
    if (!count) return checkRateLimit(key, limit, windowMs);
    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  } catch {
    // Network/Redis error — fail over to the in-memory limiter rather than 500.
    return checkRateLimit(key, limit, windowMs);
  }
}

/**
 * Get client IP from request headers (works on Cloudflare + Vercel).
 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
