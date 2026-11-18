/**
 * Turning what RevenueCat says about a customer into Mapped's tier and decks.
 *
 * Server only. The App Store and Google Play are the source of truth for what
 * someone bought inside the apps; RevenueCat validates the receipts with both
 * stores and keeps one record per Mapped account (the app logs in with the
 * Supabase user id, see lib/iap.ts). The server reads that record rather than
 * trusting anything the app sends, so a tampered client cannot grant itself a
 * plan, and a missed or out-of-order webhook is healed by the next read.
 *
 * How it combines with Stripe, which still sells on the web:
 *
 *   - profiles.store_tier records what the stores grant, on its own.
 *   - profiles.tier stays the one column every gate reads. Whenever either
 *     side changes, tier becomes the higher of the two (lib/tier higherTier),
 *     so someone who pays in both places is never downgraded by one lapsing.
 *   - The Stripe writers call stripeTierWithStore() so a lapsed web plan falls
 *     back to an active store plan instead of to free.
 *   - A tier granted by hand (a comp, a tester) has no store record and no
 *     Stripe subscription. Store reads never touch it unless the stores have
 *     owned the tier at some point: the same rule /api/stripe/sync follows.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { higherTier, type TierLevel } from "@/lib/tier";
import { TIER_ENTITLEMENTS, deckForProduct, tierForProduct, type PaidTier } from "@/lib/storeProducts";

/** The parts of RevenueCat's GET /v1/subscribers/{id} response we read. */
export interface RevenueCatSubscriber {
  entitlements?: Record<string, {
    expires_date: string | null;
    product_identifier?: string;
    purchase_date?: string;
  }>;
  subscriptions?: Record<string, {
    expires_date: string | null;
    store?: string;
    unsubscribe_detected_at?: string | null;
    billing_issues_detected_at?: string | null;
    refunded_at?: string | null;
  }>;
  non_subscriptions?: Record<string, Array<{
    id?: string;
    store_transaction_id?: string;
    purchase_date?: string;
    store?: string;
  }>>;
}

export interface StoreEntitlements {
  tier: TierLevel;
  /** "app_store" | "play_store" | other RevenueCat store name, for the account screen. */
  platform: string | null;
  periodEnd: string | null;
  willRenew: boolean | null;
  decks: Array<{ deckId: string; transactionId: string | null }>;
}

function isActive(expires: string | null | undefined, now: Date): boolean {
  // Lifetime grants have no expiry.
  if (expires === null || expires === undefined) return true;
  const t = Date.parse(expires);
  return Number.isFinite(t) && t > now.getTime();
}

/**
 * Pure: what a RevenueCat subscriber record entitles the account to right now.
 *
 * Reads entitlements first (the configured mapping), and falls back to the
 * raw subscriptions by product id, so a product that was created in the store
 * but not yet attached to an entitlement in RevenueCat still unlocks the plan
 * someone paid for rather than silently failing.
 */
export function computeStoreEntitlements(sub: RevenueCatSubscriber | null | undefined, now: Date = new Date()): StoreEntitlements {
  let tier: TierLevel = "free";
  let periodEnd: string | null = null;
  let platform: string | null = null;
  let willRenew: boolean | null = null;
  let bestProduct: string | null = null;

  for (const [id, ent] of Object.entries(sub?.entitlements ?? {})) {
    const granted: PaidTier | undefined = TIER_ENTITLEMENTS[id];
    if (!granted || !isActive(ent.expires_date, now)) continue;
    if (higherTier(tier, granted) !== tier) {
      tier = granted;
      periodEnd = ent.expires_date;
      bestProduct = ent.product_identifier ?? null;
    }
  }

  for (const [productId, s] of Object.entries(sub?.subscriptions ?? {})) {
    if (s.refunded_at) continue;
    const granted = tierForProduct(productId);
    if (!granted || !isActive(s.expires_date, now)) continue;
    if (higherTier(tier, granted) !== tier) {
      tier = granted;
      periodEnd = s.expires_date;
      bestProduct = productId;
    }
  }

  if (bestProduct) {
    const s = sub?.subscriptions?.[bestProduct];
    if (s) {
      platform = s.store ?? null;
      willRenew = !s.unsubscribe_detected_at;
    }
  }

  const decks: StoreEntitlements["decks"] = [];
  for (const [productId, purchases] of Object.entries(sub?.non_subscriptions ?? {})) {
    const deckId = deckForProduct(productId);
    if (!deckId || !purchases?.length) continue;
    const p = purchases[purchases.length - 1];
    decks.push({ deckId, transactionId: p.store_transaction_id ?? p.id ?? null });
  }

  return { tier, platform, periodEnd, willRenew, decks };
}

/**
 * Pure: the tier to write to profiles.tier after a store change.
 *
 * `previousStoreTier` is what the stores granted before this read. When the
 * stores have never granted anything and still don't, the account's tier is
 * not theirs to touch (comps, promos, Stripe) and this returns undefined.
 */
export function nextTierAfterStoreChange(opts: {
  storeTier: TierLevel;
  previousStoreTier: TierLevel | null | undefined;
  stripeTier: TierLevel;
  currentTier: TierLevel | null | undefined;
}): TierLevel | undefined {
  const { storeTier, previousStoreTier, stripeTier, currentTier } = opts;
  const storeOwnedBefore = !!previousStoreTier && previousStoreTier !== "free";
  if (storeTier === "free" && !storeOwnedBefore) return undefined;
  if (storeTier === "free") return stripeTier;
  // Raising never lowers a higher tier granted elsewhere while the store plan
  // is being bought; switching between store plans follows the store.
  if (!storeOwnedBefore) return higherTier(higherTier(storeTier, stripeTier), currentTier);
  return higherTier(storeTier, stripeTier);
}

/**
 * Pure: the tier a Stripe writer should store, given what the stores grant.
 * A lapsed web plan falls back to an active store plan, never below it.
 */
export function stripeTierWithStore(stripeTier: TierLevel, storeTier: TierLevel | null | undefined): TierLevel {
  return higherTier(stripeTier, storeTier);
}

/** Read store_tier for one profile; "free" when unknown. */
export async function readStoreTier(admin: SupabaseClient, userId: string): Promise<TierLevel> {
  try {
    const { data } = await admin.from("profiles").select("store_tier").eq("id", userId).single();
    const t = data?.store_tier;
    return t === "mid" || t === "max" ? t : "free";
  } catch {
    // Column not migrated yet: behave exactly as before this existed.
    return "free";
  }
}

const REVENUECAT_API = "https://api.revenuecat.com/v1";

/**
 * Fetch one customer from RevenueCat. Null when RevenueCat is not configured
 * on this deployment, which leaves everything exactly as it was.
 */
export async function fetchRevenueCatSubscriber(appUserId: string): Promise<RevenueCatSubscriber | null> {
  const key = process.env.REVENUECAT_SECRET_KEY;
  if (!key) return null;
  const res = await fetch(`${REVENUECAT_API}/subscribers/${encodeURIComponent(appUserId)}`, {
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`RevenueCat subscriber read failed: ${res.status}`);
  const body = await res.json();
  return (body?.subscriber ?? null) as RevenueCatSubscriber | null;
}

/** Remove a customer from RevenueCat when their Mapped account is deleted. */
export async function deleteRevenueCatSubscriber(appUserId: string): Promise<void> {
  const key = process.env.REVENUECAT_SECRET_KEY;
  if (!key) return;
  const res = await fetch(`${REVENUECAT_API}/subscribers/${encodeURIComponent(appUserId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok && res.status !== 404) throw new Error(`RevenueCat delete failed: ${res.status}`);
}

const STRIPE_ENTITLED = new Set(["active", "trialing", "past_due"]);

/**
 * What Stripe currently grants this profile, so a store change never drops a
 * live web plan. Only asks Stripe when the profile actually holds a live
 * subscription.
 */
async function stripeTierFor(profile: { stripe_subscription_id?: string | null; subscription_status?: string | null }): Promise<TierLevel> {
  if (!profile.stripe_subscription_id || !STRIPE_ENTITLED.has(profile.subscription_status ?? "")) return "free";
  try {
    const { stripe } = await import("@/lib/stripe");
    const sub: Stripe.Subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
    if (!STRIPE_ENTITLED.has(sub.status)) return "free";
    const priceId = sub.items?.data?.[0]?.price?.id;
    const max = [process.env.STRIPE_PRICE_ID_MAX, process.env.STRIPE_PRICE_ID_MAX_ANNUAL].filter(Boolean);
    if (priceId && max.includes(priceId)) return "max";
    return sub.metadata?.mapped_tier === "max" ? "max" : "mid";
  } catch {
    // If Stripe cannot be reached, keep whatever web plan they appear to hold
    // rather than risk downgrading a paying customer.
    return "mid";
  }
}

/**
 * Read RevenueCat for one account and write the result to Supabase.
 * Returns the account's tier afterwards, or null when RevenueCat is not set up.
 */
export async function syncStoreEntitlements(admin: SupabaseClient, userId: string): Promise<{ tier: TierLevel; store: StoreEntitlements } | null> {
  const subscriber = await fetchRevenueCatSubscriber(userId);
  if (subscriber === null) return null;
  const store = computeStoreEntitlements(subscriber);

  const { data: profile } = await admin
    .from("profiles")
    .select("tier, store_tier, stripe_subscription_id, subscription_status")
    .eq("id", userId)
    .single();

  const stripeTier = await stripeTierFor(profile ?? {});
  const next = nextTierAfterStoreChange({
    storeTier: store.tier,
    previousStoreTier: profile?.store_tier,
    stripeTier,
    currentTier: profile?.tier,
  });

  await admin
    .from("profiles")
    .update({
      ...(next === undefined ? {} : { tier: next }),
      store_tier: store.tier,
      store_platform: store.platform,
      store_period_end: store.periodEnd,
      store_will_renew: store.willRenew,
    })
    .eq("id", userId);

  // Decks bought in the stores are non-consumable: once bought, owned. Rows
  // are only ever added here, never removed.
  for (const d of store.decks) {
    await admin.from("purchased_decks").upsert(
      {
        user_id: userId,
        deck_id: d.deckId,
        source: "store",
        store_transaction_id: d.transactionId,
      },
      { onConflict: "user_id,deck_id", ignoreDuplicates: true },
    );
  }

  const tier = next ?? ((profile?.tier === "mid" || profile?.tier === "max") ? profile.tier : "free");
  return { tier, store };
}
