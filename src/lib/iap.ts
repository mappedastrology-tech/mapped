/**
 * In-app purchase inside the iOS and Android apps, through RevenueCat.
 *
 * Why this exists: Apple (Guideline 3.1.1) and Google Play (Payments policy)
 * require their own billing for digital subscriptions and digital goods sold
 * inside an app in every storefront outside the United States. The web keeps
 * selling through Stripe; the apps sell through StoreKit and Play Billing.
 * RevenueCat sits in front of both stores so there is one SDK here and one
 * server-side record per Mapped account (see lib/storeEntitlements.ts).
 *
 * Degrades gracefully, per AGENTS.md:
 *   - On the web, nothing in this file runs: storeBillingAvailable() is false
 *     and callers keep using Stripe.
 *   - In an app build without a RevenueCat key (NEXT_PUBLIC_REVENUECAT_IOS_KEY
 *     / NEXT_PUBLIC_REVENUECAT_ANDROID_KEY), storeBillingAvailable() is also
 *     false and the app behaves exactly as it did before: the Stripe link-out.
 *
 * Security: nothing here decides what anyone owns. After a purchase or a
 * restore the app asks /api/iap/sync, which reads RevenueCat with the secret
 * key and writes the tier on the server.
 *
 * The plugin is imported dynamically so the web bundle never loads it.
 */

import { API_BASE } from "@/lib/apiBase";
import { isNativeApp } from "@/lib/isNativeApp";
import { supabase } from "@/lib/supabase";
import { DECK_PRODUCTS, PLAN_PRODUCTS, replacedPlayProduct, type BillingInterval, type PaidTier } from "@/lib/storeProducts";
import type { TierLevel } from "@/lib/tier";

type PurchasesModule = typeof import("@revenuecat/purchases-capacitor");
type StoreProduct = import("@revenuecat/purchases-capacitor").PurchasesStoreProduct;

export type StorePlatform = "ios" | "android";

interface CapacitorGlobal { getPlatform?: () => string }

export function storePlatform(): StorePlatform | null {
  if (!isNativeApp() || typeof window === "undefined") return null;
  const p = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor?.getPlatform?.();
  return p === "ios" || p === "android" ? p : null;
}

function apiKeyFor(platform: StorePlatform): string | undefined {
  // Read literally so Next inlines them at build time.
  const key = platform === "ios"
    ? process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY
    : process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY;
  return key || undefined;
}

/** True when purchases inside this app go through the App Store / Google Play. */
export function storeBillingAvailable(): boolean {
  const platform = storePlatform();
  return !!platform && !!apiKeyFor(platform);
}

let modPromise: Promise<PurchasesModule> | null = null;
let configuredFor: string | null = null;

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Configure RevenueCat for the signed-in Mapped account. The Supabase user id
 * is the RevenueCat app user id, so a purchase is tied to the account rather
 * than the device, and the server can look it up by the same id.
 */
async function ready(): Promise<PurchasesModule["Purchases"]> {
  const platform = storePlatform();
  const apiKey = platform ? apiKeyFor(platform) : undefined;
  if (!platform || !apiKey) throw new Error("Store billing is not available here");

  const userId = await currentUserId();
  if (!userId) throw new NotSignedInError();

  modPromise ??= import("@revenuecat/purchases-capacitor");
  const { Purchases } = await modPromise;

  const { isConfigured } = await Purchases.isConfigured();
  if (!isConfigured) {
    await Purchases.configure({ apiKey, appUserID: userId });
  } else if (configuredFor !== userId) {
    await Purchases.logIn({ appUserID: userId });
  }
  configuredFor = userId;
  return Purchases;
}

export class NotSignedInError extends Error {
  constructor() { super("Sign in to purchase"); this.name = "NotSignedInError"; }
}

/** The person backed out of the store sheet. Not an error worth showing. */
export function isPurchaseCancelled(err: unknown): boolean {
  const e = err as { userCancelled?: boolean; code?: string | number } | null;
  return !!e && (e.userCancelled === true || e.code === "1" || e.code === 1 || e.code === "PURCHASE_CANCELLED");
}

function planProductId(platform: StorePlatform, tier: PaidTier, interval: BillingInterval): string {
  return PLAN_PRODUCTS[tier][interval][platform];
}

/**
 * Fetch the store products for the given ids.
 *
 * Google reports subscriptions as "product:baseplan" but is queried by the
 * product id alone, so Android subscription ids are queried by their base and
 * matched on the full id.
 */
async function fetchProducts(ids: string[], kind: "subscription" | "deck"): Promise<Map<string, StoreProduct>> {
  const Purchases = await ready();
  const { PRODUCT_CATEGORY } = await (modPromise as Promise<PurchasesModule>);
  const query = Array.from(new Set(ids.map((id) => id.split(":")[0])));
  const { products } = await Purchases.getProducts({
    productIdentifiers: query,
    type: kind === "subscription" ? PRODUCT_CATEGORY.SUBSCRIPTION : PRODUCT_CATEGORY.NON_SUBSCRIPTION,
  });
  const byId = new Map<string, StoreProduct>();
  for (const p of products) byId.set(p.identifier, p);
  return byId;
}

/**
 * Localized prices for every plan, as the store will charge them in this
 * person's storefront ("£9.99", "€10,99"). Missing entries mean the store did
 * not return that product yet; callers fall back to the USD price list.
 */
export async function getPlanPrices(): Promise<Partial<Record<`${PaidTier}:${BillingInterval}`, string>>> {
  const platform = storePlatform();
  if (!platform || !storeBillingAvailable()) return {};
  try {
    const wanted: Array<[`${PaidTier}:${BillingInterval}`, string]> = [];
    for (const tier of ["mid", "max"] as const) {
      for (const interval of ["month", "year"] as const) {
        wanted.push([`${tier}:${interval}`, planProductId(platform, tier, interval)]);
      }
    }
    const products = await fetchProducts(wanted.map(([, id]) => id), "subscription");
    const out: Partial<Record<`${PaidTier}:${BillingInterval}`, string>> = {};
    for (const [key, id] of wanted) {
      const p = products.get(id);
      if (p) out[key] = p.priceString;
    }
    return out;
  } catch {
    return {};
  }
}

/** Localized prices for the oracle decks, keyed by deck id. */
export async function getDeckPrices(): Promise<Record<string, string>> {
  if (!storeBillingAvailable()) return {};
  try {
    const products = await fetchProducts(Object.values(DECK_PRODUCTS), "deck");
    const out: Record<string, string> = {};
    for (const [deckId, pid] of Object.entries(DECK_PRODUCTS)) {
      const p = products.get(pid);
      if (p) out[deckId] = p.priceString;
    }
    return out;
  } catch {
    return {};
  }
}

export interface StoreSyncResult {
  tier: TierLevel;
  decks: string[];
}

/**
 * Ask the server to read RevenueCat and update this account. The tier the
 * app shows comes from here, never from the purchase result on the device.
 */
export async function syncStorePurchases(): Promise<StoreSyncResult | null> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return null;
    const res = await fetch(`${API_BASE}/api/iap/sync`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const body = await res.json().catch(() => null);
    if (!body?.configured) return null;
    return { tier: body.tier, decks: Array.isArray(body.decks) ? body.decks : [] };
  } catch {
    return null;
  }
}

export type StorePurchaseOutcome = "purchased" | "cancelled";

async function purchase(productId: string, kind: "subscription" | "deck"): Promise<StorePurchaseOutcome> {
  const Purchases = await ready();
  const products = await fetchProducts([productId], kind);
  const product = products.get(productId);
  if (!product) throw new Error(`The store did not return ${productId}`);
  let googleProductChangeInfo: { oldProductIdentifier: string } | null = null;
  if (kind === "subscription" && storePlatform() === "android") {
    const { customerInfo } = await Purchases.getCustomerInfo();
    const old = replacedPlayProduct(customerInfo.activeSubscriptions, productId);
    // Play's default replacement mode applies the change now and credits the
    // unused time, which matches what the plans screen says.
    if (old) googleProductChangeInfo = { oldProductIdentifier: old };
  }
  try {
    await Purchases.purchaseStoreProduct({ product, googleProductChangeInfo });
  } catch (err) {
    if (isPurchaseCancelled(err)) return "cancelled";
    throw err;
  }
  await syncStorePurchases();
  return "purchased";
}

/** Buy a plan through the App Store or Google Play. */
export async function buyPlanInStore(tier: PaidTier, interval: BillingInterval): Promise<StorePurchaseOutcome> {
  const platform = storePlatform();
  if (!platform) throw new Error("Store billing is not available here");
  return purchase(planProductId(platform, tier, interval), "subscription");
}

/** Buy an oracle deck through the App Store or Google Play. */
export async function buyDeckInStore(deckId: string): Promise<StorePurchaseOutcome> {
  const pid = DECK_PRODUCTS[deckId];
  if (!pid) throw new Error(`No store product for deck ${deckId}`);
  return purchase(pid, "deck");
}

/**
 * Restore Purchases. Both stores' review guidelines expect this button
 * wherever purchases are sold; it re-links anything bought with this Apple ID
 * or Google account to the signed-in Mapped account, then syncs.
 */
export async function restoreStorePurchases(): Promise<StoreSyncResult | null> {
  const Purchases = await ready();
  await Purchases.restorePurchases();
  return syncStorePurchases();
}

/**
 * Where to manage or cancel a store subscription: the App Store or Google
 * Play subscriptions page RevenueCat reports for this customer. Null when
 * there is no store subscription.
 */
export async function storeManagementUrl(): Promise<string | null> {
  try {
    const Purchases = await ready();
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo.managementURL ?? null;
  } catch {
    return null;
  }
}
