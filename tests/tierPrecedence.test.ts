/**
 * A promo may raise someone's tier. Nothing may ever lower what they pay for.
 *
 * The bugs this pins, all three of which shipped at once:
 *
 *  1. getActivePromoTier hard-returned "mid" for every active promo, throwing
 *     away the row's own tier_granted.
 *  2. TierProvider checked promos BEFORE the paid tier and returned early, so
 *     effectiveTier never ran — a paying Mapped Complete subscriber holding any
 *     promo was shown Mapped+: no oracle decks, map capped at one person, and a
 *     paywall on a feature they were being billed for.
 *  3. /api/promo/redeem guarded the hardcoded-code branch against downgrades
 *     but not the database-code branch 80 lines below it.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { higherTier, effectiveTier } from "../src/lib/tier";
import { getActivePromoTier } from "../src/lib/promoCodes";

const FUTURE = "2099-01-01T00:00:00.000Z";
const PAST = "2000-01-01T00:00:00.000Z";

const promo = (tier: string, expires = FUTURE) => ({
  id: "r1",
  user_id: "u1",
  promo_code_id: "p1",
  type: "free_subscription",
  tier_granted: tier,
  expires_at: expires,
  redeemed_at: PAST,
}) as never;

test("higherTier never lowers what someone is paying for", () => {
  assert.equal(higherTier("max", "mid"), "max", "a Mapped+ promo cannot demote a Complete subscriber");
  assert.equal(higherTier("mid", "max"), "max", "a Complete promo upgrades a Mapped+ subscriber");
  assert.equal(higherTier("free", "mid"), "mid");
  assert.equal(higherTier("max", null), "max");
  assert.equal(higherTier(null, null), "free");
});

test("a promo grants the tier its row actually says", () => {
  assert.equal(getActivePromoTier([promo("max")]), "max", "a Complete code must grant Complete");
  assert.equal(getActivePromoTier([promo("mid")]), "mid");
  assert.equal(getActivePromoTier([promo("mid"), promo("max")]), "max", "the best active promo wins");
  assert.equal(getActivePromoTier([promo("max", PAST)]), null, "an expired promo grants nothing");
  assert.equal(getActivePromoTier([]), null);
});

test("a paying Complete subscriber holding a Mapped+ promo stays on Complete", () => {
  // This is the exact combination that was broken: the user pays for max and
  // also holds an active mid promo.
  const paid = effectiveTier("max", "2020-01-01T00:00:00.000Z");
  const fromPromo = getActivePromoTier([promo("mid")]);
  assert.equal(paid, "max");
  assert.equal(fromPromo, "mid");
  assert.equal(higherTier(paid, fromPromo), "max");
});

test("a free account with an active promo gets the promo tier", () => {
  const paid = effectiveTier(null, "2020-01-01T00:00:00.000Z");  // long past any trial
  assert.equal(paid, "free");
  assert.equal(higherTier(paid, getActivePromoTier([promo("mid")])), "mid");
});
