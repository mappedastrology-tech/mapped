import test from "node:test";
import assert from "node:assert/strict";

import { physicalKey, logicalKey } from "../src/lib/scopedStorage";
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
