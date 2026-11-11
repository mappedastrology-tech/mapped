/**
 * When a reply fails, the reader is told what the server actually said.
 *
 * The day this is named for: the AI key on one of the two deployments had
 * expired. Every Dolly reply failed with an authentication error. The route
 * logged it correctly and worded the refusal kindly — "Dolly is unavailable
 * right now — this one is on us, not you" — and nobody ever saw that sentence,
 * because the client only displayed the message for 402, 429 and 503. The 500
 * fell through to a thrown error and surfaced as "Dolly couldn't finish that
 * answer. Try asking again?", which is an invitation to retry something that
 * could not work. It sent the search in the wrong direction for a day.
 *
 * So the rule is now: if the server said something readable, say it.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const SCREENS = [
  "src/app/(tabs)/dolly/page.tsx",
  "src/components/web/WebDolly.tsx",
];

const read = (f: string) => readFileSync(f, "utf8");

/** Code with comments stripped — this file's prose must not satisfy a check. */
function code(file: string): string {
  return ts.transpileModule(read(file), {
    compilerOptions: {
      removeComments: true,
      target: ts.ScriptTarget.ESNext,
      jsx: ts.JsxEmit.Preserve,
    },
  }).outputText;
}

test("no Dolly screen decides which statuses deserve their message shown", () => {
  for (const file of SCREENS) {
    const src = code(file);
    assert.doesNotMatch(
      src,
      /status === 402 \|\| [^\n]*429/,
      `${file} still allow-lists statuses, so a 500 with a real sentence is thrown away`,
    );
  }
});

test("a refusal carrying a sentence is shown as a notice, not thrown", () => {
  for (const file of SCREENS) {
    const src = code(file);
    // The message is read off the body and shown, with no status condition
    // between the two.
    assert.match(
      src,
      /error === "string" \? [A-Za-z]+\.error\.trim\(\) : ""/,
      `${file} does not take the server's sentence unconditionally`,
    );
    assert.match(src, /if \(serverSaid\)/, `${file} does not branch on it`);
    assert.match(
      src,
      /serverSaid[\s\S]{0,200}notice: true/,
      `${file} has the sentence but does not render it as a notice`,
    );
  }
});

test("the Dolly route still writes a sentence worth showing for an upstream failure", () => {
  // The client now trusts this wording completely, so it has to stay reader-
  // facing. These two used to say "Add credits at console.anthropic.com" and
  // "Check your ANTHROPIC_API_KEY in .env.local" — our billing account and a
  // file on a server the reader will never see.
  const route = read("src/app/api/dolly/route.ts");
  const at = route.indexOf("let friendly");
  assert.ok(at > 0, "the route no longer composes a reader-facing failure");
  const block = route.slice(at, at + 900);
  assert.match(block, /credit balance is too low|authentication|api_key/, "auth failures are not special-cased");
  assert.doesNotMatch(block, /console\.anthropic\.com/, "the reader is pointed at our vendor's billing page");
  assert.doesNotMatch(block, /\.env/, "the reader is pointed at a server file");
  assert.doesNotMatch(block, /ANTHROPIC_API_KEY/, "the reader is shown our env var name");
});

test("the consent refusal is still handled before the generic path", () => {
  // It has its own recovery — reopening the consent screen — and must not be
  // swallowed by the new "just show the sentence" branch, which would leave
  // someone reading about permission with no way to give it.
  for (const file of SCREENS) {
    const src = code(file);
    const consentAt = src.search(/403[\s\S]{0,120}ai_consent_required/);
    const genericAt = src.search(/if \(serverSaid\)/);
    assert.ok(consentAt > 0, `${file} lost its consent handling`);
    assert.ok(genericAt > 0, `${file} lost its message handling`);
    assert.ok(
      consentAt < genericAt,
      `${file} shows the consent sentence instead of reopening the consent screen`,
    );
  }
});
