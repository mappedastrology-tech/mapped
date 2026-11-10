/**
 * What the consent screen says is sent, is what is sent — and taking it back works.
 *
 * The bugs this pins:
 *  - AI_SHARED_ITEMS said journal entries went "when you ask for a reflection
 *    or a prompt" and connections "when a question is about them". In fact
 *    every Dolly message carries excerpts of the five latest journal entries
 *    with their moods, and up to twelve saved people with their charts. A
 *    "yes" to an inaccurate list is not consent to the accurate one, so the
 *    version is bumped and everyone is asked again.
 *  - The screen said "you can change your mind in Settings" and no setting
 *    existed; and a "no" after a "yes" left the "yes" row in place, which is
 *    what the server read.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  AI_SHARED_ITEMS,
  AI_CONSENT_VERSION,
  AI_CONSENT_KEY,
  AI_DECLINED_KEY,
  consentValue,
  decideAiConsent,
} from "../src/lib/aiConsentShared";
import * as serverConsent from "../src/lib/ai/consent";
import * as clientConsent from "../src/lib/aiConsent";
import { PROMPT_LIMITS } from "../src/lib/ai/promptLimits";
import { buildJournalContext } from "../src/lib/dollyCrossFeature";

const items = AI_SHARED_ITEMS.join("\n").toLowerCase();

test("the list says the whole journal goes with every Dolly message", () => {
  const line = AI_SHARED_ITEMS.find((i) => /journal/i.test(i) && /every message/i.test(i));
  assert.ok(line, "no item says journal entries travel with every message");
  // "in full", because they are. The list used to say "short excerpts from
  // your five most recent", which was true of the old 160-character sample
  // and became an understatement the day Dolly was given the journal itself.
  assert.match(line!, /in full/i);
  assert.match(line!, /mood/i);
  assert.doesNotMatch(line!, /excerpt/i, "the list still calls them excerpts");
  assert.doesNotMatch(line!, /five most recent/i, "the list still says five");
  assert.doesNotMatch(items, /when you ask for a reflection or a prompt/);
});

test("the list promises, where someone is reading it, that burned entries do not go", () => {
  // The journal's own ceremony says "your words have left no trace". The
  // consent screen is where that promise is load-bearing.
  const line = AI_SHARED_ITEMS.find((i) => /journal/i.test(i) && /every message/i.test(i))!;
  assert.match(line, /burn[\s\S]*never/i);
});

test("the list says up to twelve people go with every Dolly message", () => {
  const line = AI_SHARED_ITEMS.find((i) => /people on your map/i.test(i));
  assert.ok(line, "no item names the people on the map");
  assert.match(line!, /every message/i);
  assert.match(line!, /twelve/i);
  assert.match(line!, /names/i);
  assert.match(line!, /charts/i);
  assert.doesNotMatch(items, /when a question is about them/);
});

test("'twelve' is the number the Dolly route actually sends", () => {
  assert.equal(PROMPT_LIMITS.connections, 12, "the disclosure says twelve — change both together");
  const route = readFileSync("src/app/api/dolly/route.ts", "utf8");
  assert.match(route, /connections\.slice\(0, PROMPT_LIMITS\.connections\)/);
});

test("\"in full\" is what the client actually sends", () => {
  // Run rather than grepped: the disclosure is a promise about behaviour, and
  // the only honest way to check a promise about behaviour is to watch it.
  const entries = Array.from({ length: 9 }, (_, i) => ({
    text: `Entry number ${i} and the rest of what was written that day.`,
    date: `2026-0${(i % 9) + 1}-01`,
    created_at: `2026-0${(i % 9) + 1}-01T09:00:00.000Z`,
    mood: "tired",
    is_burn: false,
  }));
  const out = buildJournalContext(entries);
  for (let i = 0; i < 9; i += 1) {
    assert.match(out, new RegExp(`Entry number ${i} and the rest`), `entry ${i} was not sent`);
  }
  assert.match(out, /9 journal entries in total/, "the count is not stated");
  assert.match(out, /tired/, "the disclosure says moods go — they do not");
});

test("burned entries are not sent, as the list promises", () => {
  const out = buildJournalContext([
    { text: "Kept.", created_at: "2026-11-06T09:00:00.000Z", is_burn: false },
    { text: "BURNED.", created_at: "2026-11-05T09:00:00.000Z", is_burn: true },
  ]);
  assert.doesNotMatch(out, /BURNED/);
});

test("the tarot pull and Dolly's memory note are disclosed too", () => {
  assert.match(items, /tarot/);
  assert.match(items, /note she keeps/);
  assert.match(items, /palm/);
  assert.match(items, /first name/);
});

test("the version was bumped, and server and browser read the same one", () => {
  assert.ok(AI_CONSENT_VERSION >= 2, "the list changed materially; v1 consents must be re-asked");
  assert.equal(serverConsent.AI_CONSENT_VERSION, AI_CONSENT_VERSION);
  assert.equal(clientConsent.AI_CONSENT_VERSION, AI_CONSENT_VERSION);
  assert.equal(serverConsent.AI_CONSENT_KEY, clientConsent.AI_CONSENT_KEY);
  assert.equal(serverConsent.AI_DECLINED_KEY, clientConsent.AI_DECLINED_KEY);
  // Neither half may define its own copy and drift.
  for (const f of ["src/lib/ai/consent.ts", "src/lib/aiConsent.ts"]) {
    assert.doesNotMatch(readFileSync(f, "utf8"), /AI_CONSENT_VERSION\s*=/, `${f} defines its own version`);
  }
});

test("a yes to the old list counts as no answer, so the screen comes back", () => {
  const v1 = "2026-10-01T12:00:00.000Z"; // how v1 stored a yes: a bare timestamp
  assert.equal(decideAiConsent(v1, undefined), "unknown");
  assert.equal(decideAiConsent(`v1:${v1}`, undefined), "unknown");
  assert.equal(decideAiConsent(consentValue(new Date()), undefined), "granted");
});

test("the latest answer wins, whichever row is left behind", () => {
  const yes = consentValue(new Date("2026-11-01T00:00:00Z"));
  assert.equal(decideAiConsent(yes, "2026-11-02T00:00:00Z"), "declined", "a later no must hold");
  assert.equal(decideAiConsent(consentValue(new Date("2026-11-03T00:00:00Z")), "2026-11-02T00:00:00Z"), "granted");
  assert.equal(decideAiConsent(undefined, "2026-11-02T00:00:00Z"), "declined");
  assert.equal(decideAiConsent(undefined, undefined), "unknown");
  assert.equal(decideAiConsent("garbage", undefined), "unknown");
});

/* ── The withdraw path end to end: browser writes, then the server's check ── */

/** user_settings for one user, with just enough of the query builder for hasAiConsent. */
function fakeSettings(rows: Map<string, unknown>) {
  return {
    from(table: string) {
      assert.equal(table, "user_settings");
      const q = {
        select: () => q,
        eq: () => q,
        in: (_col: string, keys: string[]) =>
          Promise.resolve({
            data: keys.filter((k) => rows.has(k)).map((k) => ({ key: k, value: rows.get(k) })),
            error: null,
          }),
      };
      return q;
    },
  } as never;
}

function apply(rows: Map<string, unknown>, agree: boolean, at: Date) {
  const { save, remove } = clientConsent.consentWrites(agree, at);
  rows.set(save.key, save.value);
  rows.delete(remove);
}

test("turning AI off records a decline and the server refuses", async () => {
  const rows = new Map<string, unknown>();
  apply(rows, true, new Date("2026-11-09T10:00:00Z"));
  assert.equal(await serverConsent.hasAiConsent("u1", fakeSettings(rows)), true);

  apply(rows, false, new Date("2026-11-09T11:00:00Z"));
  assert.ok(rows.has(AI_DECLINED_KEY), "the decline is recorded, as 'Not now' records it");
  assert.ok(!rows.has(AI_CONSENT_KEY), "the old yes is removed");
  assert.equal(await serverConsent.hasAiConsent("u1", fakeSettings(rows)), false);

  const refusal = await serverConsent.guardAiConsent("u1", fakeSettings(rows));
  assert.equal(refusal?.status, 403);
  assert.equal((await refusal!.json()).code, "ai_consent_required");
});

test("even if removing the old yes fails, the newer no still holds on the server", async () => {
  const rows = new Map<string, unknown>([
    [AI_CONSENT_KEY, consentValue(new Date("2026-11-09T10:00:00Z"))],
    [AI_DECLINED_KEY, "2026-11-09T11:00:00.000Z"],
  ]);
  assert.equal(await serverConsent.hasAiConsent("u1", fakeSettings(rows)), false);
});

test("turning it back on works, and is refused for a v1 yes", async () => {
  const rows = new Map<string, unknown>();
  apply(rows, false, new Date("2026-11-09T11:00:00Z"));
  apply(rows, true, new Date("2026-11-09T12:00:00Z"));
  assert.equal(await serverConsent.hasAiConsent("u1", fakeSettings(rows)), true);

  const legacy = new Map<string, unknown>([[AI_CONSENT_KEY, "2026-10-01T12:00:00.000Z"]]);
  assert.equal(await serverConsent.hasAiConsent("u1", fakeSettings(legacy)), false);
});

test("Account settings has the AI control, and the consent screen points to it", () => {
  const account = readFileSync("src/app/account/page.tsx", "utf8");
  assert.match(account, /AI features \(Dolly\)/);
  assert.match(account, /declineAiConsent\(\)/, "turning off must record a decline");
  assert.match(account, /<AiConsentScreen/, "turning on must re-show the consent screen");
  const screen = readFileSync("src/components/AiConsentScreen.tsx", "utf8");
  assert.match(screen, /AI\s+features \(Dolly\)/, "the screen must say where the setting is");
});
