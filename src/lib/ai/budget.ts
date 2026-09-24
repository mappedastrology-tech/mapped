/**
 * Monthly AI spend ceilings, enforced server-side.
 *
 * SERVER ONLY. Never import this from a client component. The ceilings below
 * are deliberately not shown to subscribers, and anything imported by the
 * browser bundle is readable by anyone who opens devtools. This module reads
 * SUPABASE_SERVICE_ROLE_KEY, so importing it client-side would break the build
 * loudly rather than leak quietly — but do not rely on that as the guard.
 *
 * Why the ceiling is measured in dollars rather than messages: what a request
 * costs varies by an order of magnitude with how much chart context gets sent
 * and how long the answer runs. A message count that is generous for a short
 * question is ruinous for a long one. Counting the actual spend is the only
 * limit that tracks the thing being protected.
 *
 * Why it lives in the database rather than localStorage, where the older
 * per-day counters live: a limit that protects real money has to survive the
 * user clearing their browser storage. The localStorage counters in tier.ts
 * remain useful for shaping the UI, but they are advisory only — this is the
 * one that actually holds.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { effectiveTier, type TierLevel } from "@/lib/tier";
import { AI_TIER_MULTIPLIER } from "@/lib/ai/dailyLimits";
import { costMicros, type TokenUsage } from "@/lib/ai/pricing";

/**
 * Micro-dollars of Claude spend allowed per calendar month, per tier.
 *
 * Free gets nothing because AI is the paid boundary. The paid ceilings sit
 * well above what an ordinary month of use costs — they exist to stop runaway
 * or automated use, not to ration normal reading.
 */
/** What Mapped+ gets in a month. The figure itself stays server-side. */
const MONTHLY_BUDGET_BASE_MICROS = 5_000_000; // $5.00

/**
 * Derived from the shared multiplier rather than written out per tier, so the
 * ceilings cannot drift from the ratio the app sells Mapped Complete on. The
 * base stays private here; only the ratio is public.
 */
const MONTHLY_BUDGET_MICROS: Record<TierLevel, number> = {
  free: MONTHLY_BUDGET_BASE_MICROS * AI_TIER_MULTIPLIER.free,
  mid: MONTHLY_BUDGET_BASE_MICROS * AI_TIER_MULTIPLIER.mid,
  max: MONTHLY_BUDGET_BASE_MICROS * AI_TIER_MULTIPLIER.max,
};

/**
 * The user-facing wording lives in ./messages, which is safe for the browser
 * to import; re-exported here so server callers keep one import.
 */
export { AI_RESTING_MESSAGE, AI_UNAVAILABLE_MESSAGE, AI_UPGRADE_MESSAGE } from "@/lib/ai/messages";
import { AI_RESTING_MESSAGE, AI_UNAVAILABLE_MESSAGE, AI_UPGRADE_MESSAGE } from "@/lib/ai/messages";

let cached: SupabaseClient | null = null;

function admin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("AI budget needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

/** Calendar month in UTC, as YYYY-MM. Everyone's month turns over together. */
export function currentMonth(now: Date = new Date()): string {
  return now.toISOString().slice(0, 7);
}

export interface BudgetVerdict {
  allowed: boolean;
  tier: TierLevel;
  /** Set when allowed is false: which message the route should return. */
  message?: string;
  /** HTTP status the route should use. 402 for "needs a paid plan", 429 for "over budget". */
  status?: number;
}

/**
 * May this user make an AI request right now?
 *
 * Fails CLOSED. If the tier or the spend cannot be read, the answer is no.
 * The alternative — waving requests through whenever the database hiccups —
 * turns a transient outage into an unbounded bill, and an outage that stops
 * this read has almost certainly broken the rest of the app already.
 */
export async function checkAiBudget(userId: string): Promise<BudgetVerdict> {
  const db = admin();

  const { data: profile, error: profileErr } = await db
    .from("profiles")
    .select("tier, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (profileErr) {
    console.error("[ai-budget] could not read tier:", profileErr.message);
    return { allowed: false, tier: "free", message: AI_UNAVAILABLE_MESSAGE, status: 503 };
  }

  // effectiveTier, not the stored column: a new account is inside its opening
  // trial and gets Mapped+ without having paid. The browser resolves the tier
  // through the same function, so the plan the UI offers and the one this
  // enforces cannot drift apart.
  const tier = effectiveTier(profile?.tier, profile?.created_at);
  const budget = MONTHLY_BUDGET_MICROS[tier];

  if (budget <= 0) {
    return { allowed: false, tier, message: AI_UPGRADE_MESSAGE, status: 402 };
  }

  const { data: rows, error: usageErr } = await db
    .from("ai_usage")
    .select("cost_micros")
    .eq("user_id", userId)
    .eq("month", currentMonth());

  if (usageErr) {
    console.error("[ai-budget] could not read usage:", usageErr.message);
    return { allowed: false, tier, message: AI_UNAVAILABLE_MESSAGE, status: 503 };
  }

  const spent = (rows ?? []).reduce((sum, r) => sum + Number(r.cost_micros ?? 0), 0);
  if (spent >= budget) {
    return { allowed: false, tier, message: AI_RESTING_MESSAGE, status: 429 };
  }

  return { allowed: true, tier };
}

/**
 * Write what a finished call cost.
 *
 * Never throws. A failure to record is a metering gap, which is bad, but
 * throwing here would fail a request the user has already been served — and
 * the answer is usually already streaming by the time this runs.
 */
export async function recordAiUsage(args: {
  userId: string;
  route: string;
  model: string;
  usage: TokenUsage | null | undefined;
}): Promise<void> {
  try {
    const cost = costMicros(args.model, args.usage);
    await admin().from("ai_usage").insert({
      user_id: args.userId,
      month: currentMonth(),
      route: args.route,
      model: args.model,
      input_tokens: args.usage?.input_tokens ?? 0,
      output_tokens: args.usage?.output_tokens ?? 0,
      cache_read_tokens: args.usage?.cache_read_input_tokens ?? 0,
      cache_write_tokens: args.usage?.cache_creation_input_tokens ?? 0,
      cost_micros: cost,
    });
  } catch (err) {
    console.error("[ai-budget] could not record usage:", err instanceof Error ? err.message : err);
  }
}
