import test from "node:test";
import assert from "node:assert/strict";

import {
  physicalKey,
  logicalKey,
  installScopedStorage,
  migrateLegacyKeys,
  refreshScopedUser,
  __resetForTests,
} from "../src/lib/scopedStorage";
import { personalKeys } from "../src/lib/accountIsolation";

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";

test("two accounts never share a physical key", () => {
  // The whole point: not a rule that has to fire, a name that cannot collide.
  assert.notEqual(physicalKey(A, "mapped:journal-entries"), physicalKey(B, "mapped:journal-entries"));
});

test("a physical key round-trips back to its owner and logical name", () => {
  const p = physicalKey(A, "mapped:journal-entries");
  assert.deepEqual(logicalKey(p), { userId: A, key: "mapped:journal-entries" });
});

test("a logical key containing the separator still round-trips", () => {
  // mapped:dolly-summaries:v2 has colons in it; splitting naively on ':' would
  // hand back the wrong owner.
  const p = physicalKey(A, "mapped:dolly-summaries:v2");
  assert.deepEqual(logicalKey(p), { userId: A, key: "mapped:dolly-summaries:v2" });
});

test("an unnamespaced key reports no owner", () => {
  assert.equal(logicalKey("mapped:journal-entries"), null);
  assert.equal(logicalKey("sb-abc-auth-token"), null);
});

test("namespaced keys are still cleared by the sign-out wipe", () => {
  // Namespacing and wiping have to agree. If the wipe stopped recognising
  // these, signing out would leave every account's cache on the device.
  const keys = [physicalKey(A, "mapped:journal-entries"), physicalKey(B, "mapped:chart-bigthree")];
  assert.deepEqual(personalKeys(keys).sort(), keys.sort());
});

test("the device appearance setting is still spared", () => {
  assert.deepEqual(personalKeys(["mapped:theme"]), []);
});

/* ─── sessionStorage ─── */

/**
 * sessionStorage was the last store still relying on the wipe rather than on
 * keys that cannot collide. It is tab-scoped, which makes it look harmless,
 * but it holds the birth chart and the tab outlives a sign-out.
 *
 * These drive the real shim against a fake window, so the ownership rule, the
 * mapping and the migration under test are the shipped ones.
 */

function fakeStore(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    get length() { return map.size; },
  } as unknown as Storage;
}

/** Install the shim over a fresh pair of stores, signed in as `uid`. */
function install(uid: { current: string | null }) {
  __resetForTests();
  const local = fakeStore();
  const session = fakeStore();
  (globalThis as Record<string, unknown>).window = {
    localStorage: local,
    sessionStorage: session,
  };
  installScopedStorage(() => uid.current);
  const w = (globalThis as Record<string, unknown>).window as {
    localStorage: Storage;
    sessionStorage: Storage;
  };
  return { raw: { local, session }, view: w };
}

test("an unprefixed session key is still namespaced", async () => {
  // chartResult, dolly-context and pendingSave carry no mapped: prefix, so the
  // localStorage rule would have let every one of them through untouched.
  const uid = { current: A };
  const { raw, view } = install(uid);

  view.sessionStorage.setItem("chartResult", JSON.stringify({ owner: "A" }));

  assert.equal(raw.session.getItem("chartResult"), null, "written under its bare name");
  assert.equal(raw.session.getItem(physicalKey(A, "chartResult")), JSON.stringify({ owner: "A" }));
});

test("one account cannot read another's chart out of sessionStorage", async () => {
  const uid = { current: A };
  const { view } = install(uid);

  view.sessionStorage.setItem("chartResult", "A's chart");
  view.sessionStorage.setItem("dolly-context", "A's conversation");

  uid.current = B;
  refreshScopedUser(); // what the auth listener does on a switch
  assert.equal(view.sessionStorage.getItem("chartResult"), null);
  assert.equal(view.sessionStorage.getItem("dolly-context"), null);
});

test("a chart built before signing up follows the new account in", async () => {
  // THE REGRESSION RISK. Onboarding builds a chart while signed out, and the
  // account screen reads chartResult straight after sign-in to save it. If
  // migration skipped sessionStorage this would return null and signing up
  // from onboarding would silently lose the chart.
  const uid: { current: string | null } = { current: null };
  const { view } = install(uid);

  view.sessionStorage.setItem("chartResult", "built while signed out");

  uid.current = A;
  const moved = migrateLegacyKeys(A, null);
  refreshScopedUser();

  assert.ok(moved >= 1, "nothing was migrated");
  assert.equal(view.sessionStorage.getItem("chartResult"), "built while signed out");
});

test("a chart left by a different account is not adopted", async () => {
  // The other half of the same rule: raw keys sitting next to somebody else's
  // recorded id are theirs, and must not be inherited.
  const uid: { current: string | null } = { current: null };
  const { view } = install(uid);

  view.sessionStorage.setItem("chartResult", "B's chart");

  uid.current = A;
  migrateLegacyKeys(A, B); // B was last here, not A
  refreshScopedUser();

  assert.equal(view.sessionStorage.getItem("chartResult"), null);
});

test("framework and supabase session keys are left alone", async () => {
  // Namespacing the key that says who is signed in would be circular, and
  // Next's own scroll state belongs to the tab rather than the account.
  const uid = { current: A };
  const { raw, view } = install(uid);

  view.sessionStorage.setItem("sb-abc-auth-token", "session");
  view.sessionStorage.setItem("__next_scroll_0", "120");

  assert.equal(raw.session.getItem("sb-abc-auth-token"), "session");
  assert.equal(raw.session.getItem("__next_scroll_0"), "120");
});
