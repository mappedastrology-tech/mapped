import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  computeStoreEntitlements,
  nextTierAfterStoreChange,
  stripeTierWithStore,
} from "../src/lib/storeEntitlements";
import {
  DECK_PRODUCTS,
  PLAN_PRODUCTS,
  deckForProduct,
  replacedPlayProduct,
  tierForProduct,
} from "../src/lib/storeProducts";
import { STORE_DECKS } from "../src/lib/deckStore";

/**
 * In-app purchase through the App Store and Google Play (lib/iap.ts).
 *
 * None of this can run end to end without the stores, so these pin the
 * decisions that cost money when they slip: what a RevenueCat record grants,
 * that a store and a web plan never knock each other down, and that a comp
 * survives the stores never having been involved.
 */

const NOW = new Date("2026-11-18T12:00:00Z");
const FUTURE = "2026-12-18T12:00:00Z";
const PAST = "2026-10-18T12:00:00Z";

/* ─── Product ids ─── */

test("every plan has an id on both stores, and each maps back to its tier", () => {
  for (const [tier, intervals] of Object.entries(PLAN_PRODUCTS)) {
    for (const ids of Object.values(intervals)) {
      assert.equal(tierForProduct(ids.ios), tier);
      assert.equal(tierForProduct(ids.android), tier);
      // Google can report the subscription without its base plan.
      assert.equal(tierForProduct(ids.android.split(":")[0]), tier);
    }
  }
  assert.equal(tierForProduct("deck_bird"), null);
});

test("every deck on sale has a store product, and the ids round-trip", () => {
  for (const deck of STORE_DECKS.filter((d) => d.status === "available")) {
    assert.ok(DECK_PRODUCTS[deck.id], `${deck.id} is sold on the web but not in the apps`);
  }
  for (const [deckId, pid] of Object.entries(DECK_PRODUCTS)) {
    assert.equal(deckForProduct(pid), deckId);
    assert.equal(deckForProduct(`${pid}:buy`), deckId);
  }
  assert.equal(deckForProduct("mapped_plus_monthly"), null);
});

/* ─── What a RevenueCat record grants ─── */

test("an active Plus entitlement grants mid, Complete outranks it", () => {
  const plus = computeStoreEntitlements({
    entitlements: { plus: { expires_date: FUTURE, product_identifier: "mapped_plus_monthly" } },
    subscriptions: { mapped_plus_monthly: { expires_date: FUTURE, store: "app_store" } },
  }, NOW);
  assert.equal(plus.tier, "mid");
  assert.equal(plus.platform, "app_store");
  assert.equal(plus.willRenew, true);

  const both = computeStoreEntitlements({
    entitlements: {
      plus: { expires_date: FUTURE, product_identifier: "mapped_plus:monthly" },
      complete: { expires_date: FUTURE, product_identifier: "mapped_complete:annual" },
    },
  }, NOW);
  assert.equal(both.tier, "max");
});

test("an expired or refunded subscription grants nothing", () => {
  assert.equal(computeStoreEntitlements({
    entitlements: { plus: { expires_date: PAST } },
    subscriptions: { mapped_plus_monthly: { expires_date: PAST } },
  }, NOW).tier, "free");

  assert.equal(computeStoreEntitlements({
    subscriptions: { mapped_complete_annual: { expires_date: FUTURE, refunded_at: PAST } },
  }, NOW).tier, "free");
});

test("a product not yet attached to an entitlement still unlocks what was paid for", () => {
  const e = computeStoreEntitlements({
    subscriptions: { "mapped_complete:monthly": { expires_date: FUTURE, store: "play_store", unsubscribe_detected_at: PAST } },
  }, NOW);
  assert.equal(e.tier, "max");
  assert.equal(e.platform, "play_store");
  assert.equal(e.willRenew, false, "a cancelled store plan runs to its end and then stops");
});

test("decks bought in the stores are owned, unknown products are ignored", () => {
  const e = computeStoreEntitlements({
    non_subscriptions: {
      deck_bird: [{ id: "rc1", store_transaction_id: "tx1" }],
      something_else: [{ id: "rc2" }],
    },
  }, NOW);
  assert.deepEqual(e.decks, [{ deckId: "bird", transactionId: "tx1" }]);
  assert.equal(computeStoreEntitlements(null, NOW).tier, "free");
});

/* ─── Combining with Stripe and comps ─── */

test("the stores never touch a tier they have never granted", () => {
  // A comp, a promo or a tester: no store record, nothing to change.
  assert.equal(nextTierAfterStoreChange({ storeTier: "free", previousStoreTier: "free", stripeTier: "free", currentTier: "max" }), undefined);
  assert.equal(nextTierAfterStoreChange({ storeTier: "free", previousStoreTier: null, stripeTier: "free", currentTier: "mid" }), undefined);
});

test("a first store purchase never lowers a higher tier held elsewhere", () => {
  assert.equal(nextTierAfterStoreChange({ storeTier: "mid", previousStoreTier: "free", stripeTier: "free", currentTier: "max" }), "max");
  assert.equal(nextTierAfterStoreChange({ storeTier: "mid", previousStoreTier: "free", stripeTier: "free", currentTier: "free" }), "mid");
});

test("a lapsed store plan falls back to a live web plan, not to free", () => {
  assert.equal(nextTierAfterStoreChange({ storeTier: "free", previousStoreTier: "max", stripeTier: "mid", currentTier: "max" }), "mid");
  assert.equal(nextTierAfterStoreChange({ storeTier: "free", previousStoreTier: "mid", stripeTier: "free", currentTier: "mid" }), "free");
});

test("a downgrade inside the store follows the store", () => {
  assert.equal(nextTierAfterStoreChange({ storeTier: "mid", previousStoreTier: "max", stripeTier: "free", currentTier: "max" }), "mid");
});

test("a lapsed web plan falls back to an active store plan", () => {
  assert.equal(stripeTierWithStore("free", "mid"), "mid");
  assert.equal(stripeTierWithStore("max", "mid"), "max");
  assert.equal(stripeTierWithStore("free", null), "free");
});

/* ─── Google plan changes ─── */

test("a Play plan change replaces the current Mapped subscription", () => {
  assert.equal(replacedPlayProduct(["mapped_plus:monthly"], "mapped_complete:monthly"), "mapped_plus");
  assert.equal(replacedPlayProduct(["mapped_plus:monthly"], "mapped_plus:annual"), "mapped_plus");
  assert.equal(replacedPlayProduct(["mapped_plus:monthly"], "mapped_plus:monthly"), null);
  assert.equal(replacedPlayProduct(["someone_elses_sub"], "mapped_plus:monthly"), null);
  assert.equal(replacedPlayProduct([], "mapped_plus:monthly"), null);
});

/* ─── Wiring ─── */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

test("every Stripe tier write respects an active store plan", () => {
  const webhook = read("src/app/api/stripe/webhook/route.ts");
  const writes = webhook.match(/\btier:\s*\S+/g) ?? [];
  assert.ok(writes.length >= 5, "expected the webhook's tier writes");
  for (const w of writes) {
    assert.match(w, /^tier:\s*stripeTierWithStore\(/, `webhook: "${w}" would overwrite a store plan`);
  }
  assert.match(read("src/app/api/stripe/sync/route.ts"), /stripeTierWithStore\(stripeTier, await readStoreTier\(/);
});

test("the RevenueCat webhook checks its secret before doing anything", () => {
  const src = read("src/app/api/revenuecat/webhook/route.ts");
  const auth = src.indexOf("REVENUECAT_WEBHOOK_AUTH");
  const sync = src.indexOf("syncStoreEntitlements(");
  assert.ok(auth > -1 && sync > -1 && auth < sync, "the auth check must come first");
  assert.match(src, /timingSafeEqual/);
});

test("the store SDK only ever loads inside the apps", () => {
  const src = read("src/lib/iap.ts");
  assert.doesNotMatch(src, /^import[^;]*from "@revenuecat\/purchases-capacitor"/m, "a static import puts it in the web bundle");
  assert.match(src, /import\("@revenuecat\/purchases-capacitor"\)/);
});
