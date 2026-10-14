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

/* ─── The chart comes before the account ─── */

test("step 1 asks for birth details only", () => {
  // A stranger had to hand over an email and a password before seeing a
  // single thing the app does, behind a button that said "Calculate & save my
  // chart" rather than admitting it made an account. chart/result already had
  // the better pattern: show the chart, then offer to keep it.
  const src = read("src/app/onboarding/page.tsx");
  const s1 = src.slice(src.indexOf("Screen 1: Birth Data"), src.indexOf("Screen 4: Keep this"));
  assert.doesNotMatch(s1, /id="signup-email"/, "the email field is still on the birth screen");
  assert.doesNotMatch(s1, /id="signup-password"/, "the password field is still on the birth screen");
  assert.match(src, /"Build my chart"/, "the button still hides what it does");
});

test("the chart is calculated with no account at all", () => {
  const src = read("src/app/onboarding/page.tsx");
  const fn = src.slice(src.indexOf("async function handleBirthSubmit"), src.indexOf("async function handleAccountSubmit"));
  assert.doesNotMatch(fn, /auth\.signUp|signInWithPassword/, "building a chart still signs you up");
  assert.match(fn, /api\/chart\/calculate/);
});

test("the account step exists and names the trial", () => {
  const src = read("src/app/onboarding/page.tsx");
  assert.match(src, /step === 4 &&/);
  assert.match(src, /Keep this/);
  assert.match(src, /handleAccountSubmit/);
});

/* ─── No asserted precision nobody claimed ─── */

test("birth time is not pre-filled, and no precision is pre-selected", () => {
  // The field defaulted to "12:00" with the "Exact" tab pre-selected, and
  // birthValid only checked the time was truthy — so noon could be submitted
  // AS EXACT, producing a rising sign, houses and a sect reading built on it,
  // with unknownTime false so nothing downstream hedged.
  const src = read("src/app/onboarding/page.tsx");
  assert.match(src, /const \[birthTime, setBirthTime\] = useState\(""\)/);
  assert.match(src, /useState<"exact" \| "approximate" \| "unknown" \| null>\(null\)/);
  assert.match(src, /birthValid = [\s\S]{0,200}timePrecision !== null/, "a precision choice is not required");
});

test("the precision choice is a real group", () => {
  const src = read("src/app/onboarding/page.tsx");
  assert.match(src, /role="radiogroup"/);
  assert.match(src, /<legend className=\{labelClass\}>Birth time<\/legend>/);
});

/* ─── Promises that match the switches ─── */

test("notifications default to what the screen promises", () => {
  // The copy said "a few per week" and "moments that matter" while switching
  // on eleven categories including re_engagement — a retention ping is not a
  // moment that matters.
  const src = read("src/app/onboarding/page.tsx");
  assert.doesNotMatch(strip(src), /re_engagement: true/, "re-engagement still defaults on");
  assert.doesNotMatch(strip(src), /practice_reminders: true/, "practice nags still default on");
  assert.doesNotMatch(strip(src), /Max a few per week/);
});

test("the demographics screen says who reads it", () => {
  // It asks about divorce, bereavement, pregnancy and being out of work,
  // justified by five words, and never said the answers go to Dolly.
  const src = read("src/app/onboarding/page.tsx");
  assert.match(src, /Dolly reads this when she answers/);
  assert.doesNotMatch(strip(src), /All optional\. Helps us personalize what you see\./);
  // And the group asking about breakups now has an opt-out, like the other one.
  // Searched forward from the label: "Professional" also appears much
  // earlier as a state name, so a plain indexOf gives a backwards slice and
  // an empty string, which would pass or fail for the wrong reason.
  const from = src.indexOf("Where you are in life");
  const lifeStage = src.slice(from, src.indexOf("Professional", from));
  assert.match(lifeStage, /Prefer not to say/);
});

/* ─── Guideline 4.8: Sign in with Apple, wherever Google is ─── */

test("Apple sign-in is offered everywhere Google is", () => {
  // handleSocialLogin accepted "apple" and AppleIcon was defined, but only
  // the account screen ever rendered the button. The two surfaces where
  // accounts are actually created — the sign-up modal and the app's front
  // door inside the native shell — offered Google alone, which is the exact
  // shape of a 4.8 rejection.
  for (const file of [
    "src/components/AuthModal.tsx",
    "src/app/welcome/page.tsx",
    "src/app/account/page.tsx",
  ]) {
    const src = read(file);
    assert.match(src, /Continue with Apple/, `${file} does not offer Apple`);
    assert.match(src, /Continue with Google/, `${file} lost Google`);
    // Apple first is the iOS convention, and reviewers look for it.
    assert.ok(
      src.indexOf("Continue with Apple") < src.indexOf("Continue with Google"),
      `${file} puts Google above Apple`,
    );
  }
});

test("both providers go through the same call", () => {
  // Two code paths would let one drift — a different redirectTo on Apple is
  // how the callback silently breaks for half the users.
  const welcome = read("src/app/welcome/page.tsx");
  assert.match(welcome, /function social\(provider: "google" \| "apple"\)/);
  assert.doesNotMatch(strip(welcome), /provider: "google",/, "google is still hardcoded");
});

/* ─── Guideline 5.1.2(i): permission before data reaches an AI company ─── */

test("every route that sends data to the AI provider checks consent first", () => {
  // Four of the seven did not even check the AI budget, so hanging consent
  // off that check would have left three routes sending birth charts and
  // journal text with nobody's permission.
  const routes = [
    "src/app/api/dolly/route.ts",
    "src/app/api/dolly/summarize/route.ts",
    "src/app/api/dolly/memory/route.ts",
    "src/app/api/dolly/notes/route.ts",
    "src/app/api/wizard/route.ts",
    "src/app/api/journal/reflect/route.ts",
    "src/app/api/journal/prompt/route.ts",
    "src/app/api/horoscope/route.ts",
  ];
  for (const r of routes) {
    const src = read(r);
    assert.match(src, /guardAiConsent\(/, `${r} sends data without checking consent`);
    assert.match(src, /if \(consentRefusal\) return consentRefusal;/, `${r} ignores the refusal`);
  }
});

test("consent is enforced on the server, not only in the UI", () => {
  // A screen the client can skip is a disclosure, not a permission.
  const src = read("src/lib/ai/consent.ts");
  assert.match(src, /SUPABASE_SERVICE_ROLE_KEY/, "not a server-side check");
  assert.match(src, /status: 403/);
  assert.match(src, /ai_consent_required/, "the client cannot tell this from a paywall");
  // A failed read must refuse, not wave it through.
  assert.match(src, /console\.error\("\[ai-consent\][\s\S]{0,80}return false/);
});

test("the consent screen names the company and what leaves", () => {
  const src = read("src/components/AiConsentScreen.tsx");
  assert.match(src, /AI_PROVIDER_NAME/);
  assert.match(src, /AI_SHARED_ITEMS/);
  const lib = read("src/lib/aiConsent.ts");
  assert.match(lib, /AI_PROVIDER_NAME = "Anthropic"/, "the provider is not named");
  assert.match(lib, /birth date, time and place/i);
  // The timestamp requirement: the stored value is the moment they agreed.
  assert.match(lib, /saveSetting\(uid, AI_CONSENT_KEY, new Date\(\)\.toISOString\(\)\)/);
});

test("declining is a real answer, and does not disable the rest of the app", () => {
  const dolly = read("src/app/(tabs)/dolly/page.tsx");
  assert.match(dolly, /aiConsent === "declined"/, "declining just re-shows the screen");
  assert.match(dolly, /Dolly is switched off/);
  assert.match(read("src/lib/aiConsent.ts"), /AI_DECLINED_KEY/);
});

/* ─── Guideline 5.1.1(v): deleting an account is not cancelling a plan ─── */

test("the delete dialog says who to cancel the subscription with", () => {
  // Inside the app that is Apple, and only iPhone Settings can stop it, so
  // "manage it here" would tell somebody their billing had stopped when it
  // had not.
  const src = read("src/app/account/page.tsx");
  assert.match(src, /iPhone Settings/);
  assert.match(src, /isNativeApp\(\)/);
  assert.match(src, /billed through Stripe/, "web subscribers get no warning");
  assert.match(src, /Dolly conversations/, "the dialog does not say Dolly history goes too");
});
