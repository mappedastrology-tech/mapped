/**
 * What Mapped sells through the App Store and Google Play, and how each store
 * names it.
 *
 * The web keeps selling through Stripe. Inside the iOS and Android apps,
 * Apple's Guideline 3.1.1 and Google Play's Payments policy require their own
 * billing for digital subscriptions and digital goods in every storefront
 * outside the United States, so the apps sell through StoreKit and Play
 * Billing instead, via RevenueCat (see lib/iap.ts and STORE-PURCHASES.md).
 *
 * These ids must be created, exactly as written, in App Store Connect, the
 * Play Console and the RevenueCat dashboard. They are deliberately plain and
 * stable: a product id can never be reused once it has been created in App
 * Store Connect, even if the product is deleted.
 *
 * Shared by the client and the server, so it must stay free of anything
 * platform-specific.
 */

import type { TierLevel } from "@/lib/tier";

export type PaidTier = Exclude<TierLevel, "free">;
export type BillingInterval = "month" | "year";

/**
 * Subscriptions.
 *
 * Apple: one auto-renewable subscription per row, all four in ONE
 * subscription group ("Mapped") so that moving between them is an upgrade or
 * downgrade rather than a second subscription. Rank Complete above Plus in the
 * group.
 *
 * Google: one subscription product per plan, with a monthly and a yearly base
 * plan. RevenueCat reports a Play subscription as "product:baseplan".
 */
export const PLAN_PRODUCTS: Record<PaidTier, Record<BillingInterval, { ios: string; android: string }>> = {
  mid: {
    month: { ios: "mapped_plus_monthly", android: "mapped_plus:monthly" },
    year: { ios: "mapped_plus_annual", android: "mapped_plus:annual" },
  },
  max: {
    month: { ios: "mapped_complete_monthly", android: "mapped_complete:monthly" },
    year: { ios: "mapped_complete_annual", android: "mapped_complete:annual" },
  },
};

/**
 * RevenueCat entitlements, and the tier each one grants.
 *
 * Attach every Plus product to "plus" and every Complete product to
 * "complete" in RevenueCat. Complete outranks Plus when both are somehow
 * active (an upgrade mid-period on Google, for example).
 */
export const TIER_ENTITLEMENTS: Record<string, PaidTier> = {
  plus: "mid",
  complete: "max",
};

/**
 * Oracle decks: one non-consumable in-app purchase per deck, same id on both
 * stores. Keyed by the deck id in lib/deckStore.ts.
 */
export const DECK_PRODUCTS: Record<string, string> = {
  "stitched-animal": "deck_stitched_animal",
  bird: "deck_bird",
};

/** The deck a store product id unlocks, if it is one. */
export function deckForProduct(productId: string): string | null {
  // Play can report a one-time product with a purchase-option suffix.
  const base = productId.split(":")[0];
  for (const [deckId, pid] of Object.entries(DECK_PRODUCTS)) {
    if (pid === base) return deckId;
  }
  return null;
}

/** Every subscription id a store may report, mapped to the tier it grants. */
export function tierForProduct(productId: string): PaidTier | null {
  for (const [tier, intervals] of Object.entries(PLAN_PRODUCTS) as [PaidTier, (typeof PLAN_PRODUCTS)[PaidTier]][]) {
    for (const ids of Object.values(intervals)) {
      if (productId === ids.ios || productId === ids.android || productId === ids.android.split(":")[0]) {
        return tier;
      }
    }
  }
  return null;
}

/**
 * The Mapped subscription this Google account already has, if any, so a plan
 * change replaces it instead of starting a second subscription. Apple does
 * this by itself: all four plans share one subscription group.
 */
export function replacedPlayProduct(activeSubscriptions: readonly string[], newProductId: string): string | null {
  for (const id of activeSubscriptions) {
    if (id !== newProductId && tierForProduct(id)) return id.split(":")[0];
  }
  return null;
}
