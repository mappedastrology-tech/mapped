import test from "node:test";
import assert from "node:assert/strict";

import { personalKeys, DEVICE_ONLY_KEYS } from "../src/lib/accountIsolation";

/**
 * These pin the inversion. The previous cleanup was an allowlist, so the way
 * it failed was by omission — a new feature's key simply never got added, and
 * nobody found out until someone read another person's journal on a shared
 * laptop. A denylist fails the other way, which is recoverable, so the tests
 * assert that real personal keys ARE cleared and that only appearance stays.
 */

test("the personal keys the old allowlist missed are now cleared", () => {
  // Every one of these is real data written by the app and absent from the
  // allowlist that shipped before this.
  const missed = [
    "mapped:journal-entries",
    "mapped:chart-bigthree",
    "mapped:profile-photo",
    "mapped:numerology-fullname",
    "mapped:numerology-marriedname",
    "mapped:custom-rituals",
    "mapped:saved-rituals",
    "mapped:journal_patterns",
    "mapped:web-journal-draft",
    "mapped:transits",
    "mapped:learn:goal",
    "mapped:garden-zip",
    "mapped:fishing-location",
    "mapped:theme-coords",
    "mapped:oracle-deck",
    "mapped:belief-stance",
    "mapped:dolly-summaries:v2",
    "mapped:paywall-dismissed",
  ];
  const cleared = personalKeys(missed);
  assert.deepEqual(cleared.sort(), missed.sort());
});

test("appearance survives an account switch, because it describes the device", () => {
  assert.deepEqual(personalKeys(["mapped:theme"]), []);
  assert.ok(DEVICE_ONLY_KEYS.has("mapped:theme"));
});

test("coordinates are treated as personal, not as a device setting", () => {
  // They say where someone lives. The automatic theme falls back to the
  // device's timezone without them, so clearing costs nothing.
  assert.deepEqual(personalKeys(["mapped:theme-coords"]), ["mapped:theme-coords"]);
  assert.ok(!DEVICE_ONLY_KEYS.has("mapped:theme-coords"));
});

test("both key spellings are covered", () => {
  // mapped_connections and mapped_timeline predate the colon convention.
  assert.deepEqual(
    personalKeys(["mapped_connections", "mapped_timeline"]).sort(),
    ["mapped_connections", "mapped_timeline"],
  );
});

test("keys carrying a user id are cleared whatever they are called", () => {
  assert.deepEqual(
    personalKeys(["sb-abc-auth-token", "someCache:6c59fa37-4865-4f79-8191-1e0c44cf43d5"]),
    ["someCache:6c59fa37-4865-4f79-8191-1e0c44cf43d5"],
  );
});

test("other sites' keys in the same origin are left alone", () => {
  // Only what this app wrote is ours to delete.
  const foreign = ["theme", "token", "next-auth.state", "debug"];
  assert.deepEqual(personalKeys(foreign), []);
});

test("a new feature's key is cleaned up without anyone remembering to add it", () => {
  // The whole point of inverting the list.
  assert.deepEqual(
    personalKeys(["mapped:some-feature-invented-next-year"]),
    ["mapped:some-feature-invented-next-year"],
  );
});

/* ─── Where the check is wired in ─── */

import { readFileSync } from "node:fs";

test("the isolation check is mounted in the ROOT layout, not a route group", () => {
  // This is how it failed the first time. It was hooked into the (tabs) layout,
  // but /account — where signing in actually happens — and /onboarding,
  // /library, /chart and /rectification all sit outside that group, so on those
  // routes it never ran and the previous account's cache survived. Moving it
  // back into a route group would silently reintroduce that, so the mount point
  // is asserted here rather than left to memory.
  const root = readFileSync("src/app/layout.tsx", "utf8");
  assert.match(root, /<AccountIsolation\s*\/>/, "AccountIsolation missing from the root layout");
  assert.match(root, /from "@\/components\/AccountIsolation"/);
});

test("the check runs at module scope, before React renders", () => {
  // Effects run child-first and promises resolve later still, so a check that
  // waits for either has already lost: the page has read the cache by then.
  const src = readFileSync("src/components/AccountIsolation.tsx", "utf8");
  const moduleScope = src.slice(0, src.indexOf("export default function"));
  assert.match(moduleScope, /isolateFromStoredSession\(\)/,
    "the synchronous pre-render check is gone from module scope");
});

test("a switch also gives up the device's push subscription", () => {
  // push_subscriptions is unique per endpoint and carries a user id, so a row
  // left behind keeps sending the previous account's notifications to a phone
  // that now belongs to someone else.
  const src = readFileSync("src/components/AccountIsolation.tsx", "utf8");
  assert.match(src, /revokeDevicePush/);
  const signOut = readFileSync("src/app/account/page.tsx", "utf8");
  assert.match(signOut, /unsubscribeFromPush/, "sign-out no longer releases the push subscription");
});
