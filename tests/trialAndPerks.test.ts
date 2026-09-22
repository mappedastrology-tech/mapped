import test from "node:test";
import assert from "node:assert/strict";

import { effectiveTier, isTrialActive, trialDaysLeft, TRIAL_DAYS } from "../src/lib/tier";
import { describeRedemption } from "../src/lib/promoCodes";

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-09-22T12:00:00Z");
const iso = (offsetDays: number) => new Date(NOW.getTime() + offsetDays * DAY).toISOString();

/* ─── The opening trial ─── */

test("a brand new account is inside the trial", () => {
  assert.equal(isTrialActive(iso(0), NOW), true);
  assert.equal(effectiveTier("free", iso(0), NOW), "mid");
});

test("the trial ends after exactly TRIAL_DAYS", () => {
  // Just inside.
  assert.equal(isTrialActive(iso(-TRIAL_DAYS + 0.01), NOW), true);
  // Just outside — the boundary is the whole point of the feature.
  assert.equal(isTrialActive(iso(-TRIAL_DAYS), NOW), false);
  assert.equal(effectiveTier("free", iso(-TRIAL_DAYS), NOW), "free");
});

test("an account older than the trial is free again", () => {
  assert.equal(effectiveTier("free", iso(-30), NOW), "free");
  assert.equal(trialDaysLeft(iso(-30), NOW), 0);
});

test("paying beats the trial, never the other way round", () => {
  // Someone who buys Mapped Complete on day two must not be pushed back down
  // to Mapped+ for the rest of the trial.
  assert.equal(effectiveTier("max", iso(-2), NOW), "max");
  assert.equal(effectiveTier("mid", iso(-2), NOW), "mid");
  // And a paid tier survives the trial ending.
  assert.equal(effectiveTier("max", iso(-30), NOW), "max");
});

test("an unknown stored tier reads as free, trial or not", () => {
  // A stray value in the column must never buy access.
  assert.equal(effectiveTier("platinum", iso(-30), NOW), "free");
  // Inside the trial it still only gets what the trial grants.
  assert.equal(effectiveTier("platinum", iso(0), NOW), "mid");
});

test("a missing signup date grants nothing", () => {
  // An unknown created_at must not hand out paid access.
  assert.equal(isTrialActive(null, NOW), false);
  assert.equal(isTrialActive(undefined, NOW), false);
  assert.equal(isTrialActive("not-a-date", NOW), false);
  assert.equal(effectiveTier("free", null, NOW), "free");
});

test("days left counts down and never goes negative", () => {
  assert.equal(trialDaysLeft(iso(0), NOW), TRIAL_DAYS);
  assert.equal(trialDaysLeft(iso(-1), NOW), TRIAL_DAYS - 1);
  assert.equal(trialDaysLeft(iso(-TRIAL_DAYS - 5), NOW), 0);
});

/* ─── What the account screen lists ─── */

test("an expired redemption is not listed", () => {
  // The list is "active on your account" — showing a lapsed perk there would
  // be claiming the user has something they do not.
  assert.equal(describeRedemption({ type: "free_subscription", expires_at: iso(-1), discount_percent: null }, NOW), null);
});

test("an active free subscription is listed with its end date", () => {
  const perk = describeRedemption({ type: "free_subscription", expires_at: iso(20), discount_percent: null }, NOW);
  assert.ok(perk);
  assert.match(perk.label, /Mapped\+/);
  assert.match(perk.detail, /^Until /);
});

test("a century-long grant reads as lifetime, not a date in 2126", () => {
  const perk = describeRedemption({ type: "free_subscription", expires_at: iso(365 * 120), discount_percent: null }, NOW);
  assert.ok(perk);
  assert.equal(perk.detail, "Doesn't expire");
  assert.match(perk.label, /for good/);
});

test("a discount is listed with its percentage", () => {
  const perk = describeRedemption({ type: "discount_percent", expires_at: iso(10), discount_percent: 40 }, NOW);
  assert.ok(perk);
  assert.match(perk.label, /40% off/);
});

test("an unparseable expiry is dropped rather than shown as Invalid Date", () => {
  assert.equal(describeRedemption({ type: "free_subscription", expires_at: "nonsense", discount_percent: null }, NOW), null);
});
