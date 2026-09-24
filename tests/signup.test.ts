import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { friendlyAuthError } from "../src/lib/authErrors";
import { getSectLight } from "../src/lib/rulers";
import { TRIAL_DAYS } from "../src/lib/tier";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/* ─── Never assert a fact the chart cannot support ─── */

test("sect is unknown without a birth time, not 'night'", () => {
  // calculateChart deliberately sets every planet.house to null when the time
  // is unknown so that nothing downstream invents one. getSectLight undid
  // that: `sunHouseNum >= 7` is false for null, so it fell through to "night"
  // and onboarding told every unknown-time reader, as bare fact, that they
  // were born at night. For about half of them that was untrue.
  const noHouses = [
    { name: "Sun", sign: "Leo", position: 130, house: null, retrograde: false },
    { name: "Moon", sign: "Pisces", position: 340, house: null, retrograde: false },
  ];
  assert.equal(getSectLight(noHouses, []), null);
});

test("sect still works when the houses ARE known", () => {
  // The fix must not silently disable a real feature.
  // parseHouse reads the word form ("Tenth"), which is what calculateChart
  // emits — "10th" parses to null and would make this pass for the wrong
  // reason.
  const withHouses = [
    { name: "Sun", sign: "Leo", position: 130, house: "Tenth", retrograde: false },
    { name: "Moon", sign: "Pisces", position: 340, house: "Third", retrograde: false },
  ];
  const houses = Array.from({ length: 12 }, (_, i) => ({ number: i + 1, sign: "Aries" }));
  const out = getSectLight(withHouses, houses);
  assert.ok(out, "a chart with houses should still get a sect");
  assert.equal(out.sect, "day", "Sun in the 10th is above the horizon");
});

test("the reveal screen has a third state for an unknown sect", () => {
  const src = read("src/app/onboarding/page.tsx");
  assert.match(src, /\{!sectInfo \? \(/, "the screen still assumes sect is always known");
  assert.match(src, /can&rsquo;t say yet|cannot say yet/, "no copy for the unknown case");
});

test("the headline screen doesn't promise three things it may not have", () => {
  // Chart ruler and lord of the year both need houses, so an unknown-time
  // reader saw "Three things to know" above an empty space.
  const src = read("src/app/onboarding/page.tsx");
  assert.match(src, /headlineCards\.length === 0/, "no empty state");
  assert.doesNotMatch(
    strip(src),
    />\s*Three things to know\s*</,
    "the heading is still hardcoded to three",
  );
});

/* ─── Say what a new account gets ─── */

test("the trial is mentioned before an account is created", () => {
  // Every new account silently gets TRIAL_DAYS of Mapped+, and it was named
  // in three files a stranger never sees. What people resent is not the trial
  // ending; it is not having been told it would.
  for (const file of ["src/app/welcome/page.tsx", "src/app/onboarding/page.tsx"]) {
    assert.match(read(file), /TRIAL_DAYS/, `${file} never mentions the trial`);
  }
  assert.ok(TRIAL_DAYS >= 7);
});

test("onboarding no longer says Dolly answers anything", () => {
  // The absolute lib/ai/dailyLimits exists to retire. There is a real daily
  // cap, and this was the last screen still promising otherwise.
  const src = strip(read("src/app/onboarding/page.tsx"));
  assert.doesNotMatch(src, /Ask her anything/i);
  assert.doesNotMatch(src, /tells you the truth/i, "nobody can promise that of a language model");
});

test("signup no longer claims birth details are never shared", () => {
  // The city goes to OpenStreetMap as it is typed, and the chart goes to
  // Anthropic whenever Dolly answers — both of which the privacy page
  // describes in detail two links away.
  const src = strip(read("src/app/onboarding/page.tsx"));
  assert.doesNotMatch(src, /never shared/i);
});

/* ─── Don't strand someone mid-signup ─── */

test("email confirmation stops the flow instead of advancing", () => {
  // Advancing meant six more screens signed out, every write silently doing
  // nothing, and a bounce back to /welcome at the end with all of it lost.
  const src = read("src/app/onboarding/page.tsx");
  const branch = src.slice(src.indexOf("data.user && !data.session"));
  const body = branch.slice(0, 1400);
  assert.match(body, /setAwaitingConfirm\(/, "it does not stop to tell them");
  assert.doesNotMatch(strip(body).slice(0, 600), /goNext\(\)/, "it still advances");
});

test("there is a way to get another confirmation link", () => {
  // There was none anywhere in the app, so a lost email was a dead end:
  // signing in said "confirm first", and nothing could issue a new one.
  const src = read("src/app/onboarding/page.tsx");
  assert.match(src, /auth\.resend\(\{\s*type: "signup"/);
  assert.match(src, /Resend the link/);
});

/* ─── Errors people can act on ─── */

test("a flaky connection does not print 'Failed to fetch'", () => {
  // The most likely error on a phone, and the least explicable.
  const out = friendlyAuthError(new TypeError("Failed to fetch"));
  assert.doesNotMatch(out, /fetch/i);
  assert.match(out, /connection/i);
  assert.match(out, /nothing you've typed is lost/i, "reassure them their work is safe");
});

test("the raw Supabase strings people actually hit are all translated", () => {
  const cases: [string, RegExp][] = [
    ["Password is known to be weak and easy to guess", /easy to guess/i],
    ["For security purposes, you can only request this after 21 seconds.", /quick succession/i],
    ["Signups not allowed for this instance", /paused/i],
    ["Error sending confirmation email", /didn't go out/i],
    ["User already registered", /already have an account/i],
    ["Invalid login credentials", /don't match/i],
    ["Email not confirmed", /confirmation link/i],
  ];
  for (const [raw, expected] of cases) {
    const out = friendlyAuthError(new Error(raw));
    assert.match(out, expected, `"${raw}" was not translated`);
    assert.notEqual(out, raw);
  }
});

test("an unrecognised error still reads like a person wrote it", () => {
  const out = friendlyAuthError(new Error("PGRST301 jwt expired"));
  assert.doesNotMatch(out, /PGRST|jwt/i);
  assert.match(out, /still here/i);
});

test("no auth screen prints a raw error message any more", () => {
  for (const file of ["src/app/welcome/page.tsx", "src/app/onboarding/page.tsx"]) {
    const src = strip(read(file));
    assert.doesNotMatch(src, /setError\(err\.message\)/, `${file} leaks a raw message`);
    // The shape that matters: a raw message reaching setError. Extracting it
    // to match on is fine, so long as what is SHOWN goes through the mapper.
    assert.doesNotMatch(src, /setError\([^)]*err\.message/, `${file} leaks a raw message`);
  }
});
