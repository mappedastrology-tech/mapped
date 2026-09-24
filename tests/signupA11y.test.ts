import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The signup flow's accessibility invariants.
 *
 * Verified in a browser when they were fixed; these exist because each one is
 * a single attribute that silently reverts the moment someone refactors the
 * markup, and none of them fails loudly.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

test("the signup button is never `disabled`", () => {
  // A disabled button leaves the tab order. Nobody could select a city
  // without a mouse (see the combobox test), so the control that creates the
  // account simply did not exist for a keyboard user — no error, no
  // explanation, no account.
  const src = strip(read("src/app/onboarding/page.tsx"));
  const at = src.indexOf("onClick={handleBirthSubmit}");
  assert.ok(at > 0, "the submit handler moved — this test is stale");
  const block = src.slice(at, at + 400);
  assert.doesNotMatch(block, /\sdisabled=\{/, "the submit button is disabled again");
  assert.match(block, /aria-disabled=\{/, "it should still report itself as unavailable");
});

test("pressing submit with gaps names the field and focuses it", () => {
  const src = read("src/app/onboarding/page.tsx");
  assert.match(src, /Please choose your birth city from the list/, "the city case is unhandled");
  assert.match(src, /getElementById\(missing\.id\)\?\.focus\(\)/, "focus is not moved to the problem");
});

test("the city search is a real combobox", () => {
  // It had no combobox semantics whatsoever, and selecting a suggestion is
  // what sets `location` — which the submit button requires.
  const src = read("src/components/CitySearch.tsx");
  for (const attr of ['role="combobox"', "aria-expanded", "aria-controls", 'aria-autocomplete="list"', "aria-activedescendant"]) {
    assert.match(src, new RegExp(attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing ${attr}`);
  }
  assert.match(src, /role="listbox"/);
  assert.match(src, /role="option"/);
  for (const key of ["ArrowDown", "ArrowUp", "Enter", "Escape"]) {
    assert.match(src, new RegExp(`"${key}"`), `no handling for ${key}`);
  }
});

test("finding cities is announced, not just failing to find them", () => {
  // "No results" and "lookup failed" were both announced; success was not, so
  // a blind user typed a city, heard nothing, and never knew there was a list.
  const src = read("src/components/CitySearch.tsx");
  assert.match(src, /\$\{results\.length\}[\s\S]{0,40}(city|cities)/);
});

test("the signup error is announced and is not brand gold", () => {
  const src = read("src/app/onboarding/page.tsx");
  const at = src.indexOf('id="signup-error"');
  assert.ok(at > 0, "the error element lost its id");
  const block = src.slice(at, at + 300);
  assert.match(block, /role="alert"/);
  assert.match(block, /--danger-text/, "an error the same colour as the links beside it");
});

test("signup inputs carry autocomplete, so a password manager can help", () => {
  const src = read("src/app/onboarding/page.tsx");
  for (const token of ['autoComplete="name"', 'autoComplete="bday"', 'autoComplete="email"', "new-password"]) {
    assert.match(src, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing ${token}`);
  }
});

test("the ten-step funnel reports where you are", () => {
  const src = read("src/app/onboarding/page.tsx");
  assert.match(src, /role="progressbar"/);
  assert.match(src, /aria-valuetext=\{`Step \$\{step\} of/);
  // And focus moves to the new screen rather than falling to <body>.
  assert.match(src, /querySelector<HTMLElement>\("h1, h2"\)/);
});

test("there is a way back that isn't a swipe", () => {
  // A horizontal swipe was the only way, which is a path-based gesture
  // (WCAG 2.5.1) — and on desktop there was no way back at all.
  const src = read("src/app/onboarding/page.tsx");
  assert.match(src, /aria-label="Go back a step"/);
});

test("the checkbox-shaped buttons report their state", () => {
  // One of them decides whether the flow signs you up or signs you in.
  const src = read("src/app/onboarding/page.tsx");
  const count = (src.match(/role="checkbox"/g) ?? []).length;
  assert.equal(count, 2, `expected both fake checkboxes to be fixed, found ${count}`);
  assert.equal((src.match(/aria-checked=\{/g) ?? []).length >= 2, true);
});

test("the account button is readable in dark mode", () => {
  // text-cream on brass measured 1.82:1 — pale cream on pale gold, on the
  // button that creates the account. --on-brass is 8.01:1 and both other auth
  // screens already used it.
  const src = read("src/components/AuthModal.tsx");
  assert.doesNotMatch(strip(src), /bg-terracotta text-cream/, "still cream on gold");
  assert.match(src, /var\(--on-brass\)/);
});

test("the password rule exists whenever it is referenced", () => {
  // The input declared aria-describedby="password-hint" permanently, but the
  // hint only rendered while the password was short — so on an empty field it
  // pointed at nothing, which is exactly when the rule is needed.
  const src = read("src/app/onboarding/page.tsx");
  assert.match(src, /\{password\.length < 6 && \(/);
  assert.doesNotMatch(src, /password\.length > 0 && password\.length < 6/);
});
