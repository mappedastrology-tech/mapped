/**
 * When consent stops counting, the app asks again — it does not just fail.
 *
 * This is the bug behind "Dolly isn't working", and it was not in the consent
 * machinery, which worked exactly as designed. Bumping AI_CONSENT_VERSION
 * invalidates every older "yes" on purpose, so the server starts refusing with
 * 403 `ai_consent_required` until the person agrees to the new list.
 *
 * The Dolly tab reads consent ONCE, when it mounts. A tab that was already
 * open therefore kept sending, kept getting 403 — and 403 was not among the
 * statuses it handled, so it fell through to a thrown error and came back as
 * "Dolly couldn't finish that answer. Try asking again?". Which is an
 * invitation, so people did: production logs show three sends in six seconds,
 * all 403, with nothing on screen ever saying the word permission and no route
 * back to the one screen that would have fixed it.
 *
 * The desktop screen already recovered. These pin that both do, and that the
 * server still says which refusal it is.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

import { aiConsentRequired } from "../src/lib/ai/consent";

const SCREENS = [
  "src/app/(tabs)/dolly/page.tsx",
  "src/components/web/WebDolly.tsx",
];

const read = (f: string) => readFileSync(f, "utf8");

/**
 * The file's code with its comments removed.
 *
 * This codebase explains itself at length, and several of those comments
 * discuss consent refusals by name — so a grep over the raw source would be
 * satisfied by a paragraph describing the bug rather than by the code that
 * fixes it. Transpiling with removeComments leaves only what runs.
 */
function code(file: string): string {
  return ts.transpileModule(read(file), {
    compilerOptions: {
      removeComments: true,
      target: ts.ScriptTarget.ESNext,
      jsx: ts.JsxEmit.Preserve,
    },
  }).outputText;
}

test("the server names the refusal, so a client can tell it apart from a limit", () => {
  const res = aiConsentRequired();
  assert.equal(res.status, 403, "consent refusals must not share a status with the paywall");
});

test("the server's consent refusal carries a machine-readable code", async () => {
  const body = await aiConsentRequired().json();
  assert.equal(body.code, "ai_consent_required");
  assert.match(body.error, /permission/i, "the sentence does not mention permission");
});

test("every Dolly screen turns a consent refusal back into the consent screen", () => {
  for (const file of SCREENS) {
    const src = code(file);
    assert.match(
      src,
      /403[\s\S]{0,120}ai_consent_required/,
      `${file} does not recognise a 403 consent refusal — it will read as "something went wrong"`,
    );
    // Recognising it is not enough: it has to put the screen up. Both screens
    // do that by setting the consent state back to "unknown", which is what
    // their mount-time read would have produced.
    const at = src.search(/403[\s\S]{0,120}ai_consent_required/);
    assert.match(
      src.slice(at, at + 400),
      /setAiConsent\(\s*"unknown"\s*\)/,
      `${file} spots the refusal but never reopens the consent screen`,
    );
  }
});

test("a consent refusal is not mistaken for a plan limit", () => {
  // 402/429/503 are answered in the server's own words as a notice. If 403
  // were folded in there, someone who simply has to agree again would be told
  // their plan had run out.
  for (const file of SCREENS) {
    const src = code(file);
    assert.doesNotMatch(
      src,
      /status === 402 \|\| [^\n]*403/,
      `${file} lumps the consent refusal in with the paywall statuses`,
    );
  }
});

test("the consent screen names the account the answer applies to", () => {
  // Permission is stored per account. With two accounts and nothing on screen
  // saying which one is being answered for, "Allow" can be tapped on the wrong
  // one — twice in a row, as it was — while the account that is actually
  // blocked carries on being refused and the app carries on looking broken.
  const src = code("src/components/AiConsentScreen.tsx");
  assert.match(src, /getSession/, "the screen never looks up who is signed in");
  assert.match(
    src,
    /setAccount\([\s\S]{0,80}email/,
    "the screen looks up the session but does not take the email from it",
  );
  const raw = read("src/components/AiConsentScreen.tsx");
  assert.match(raw, /\{account\}/, "the email is read but never rendered");
  assert.match(
    raw,
    /saved per account/i,
    "the screen does not explain that the answer only covers this account",
  );
});

test("the version bump that causes all this is still wired to both halves", () => {
  // The refusal only happens because a "yes" to an older list stops counting.
  // If the shared version ever drifted from what the client writes, the app
  // would ask forever and never be satisfied.
  const shared = read("src/lib/aiConsentShared.ts");
  assert.match(shared, /export const AI_CONSENT_VERSION = (\d+)/);
  assert.match(shared, /consentValue/, "nothing writes the version into a stored yes");
  assert.match(
    shared,
    /yes\.version >= AI_CONSENT_VERSION \? "granted" : "unknown"/,
    "an old consent no longer reads as unknown, so nobody would ever be re-asked",
  );
});
