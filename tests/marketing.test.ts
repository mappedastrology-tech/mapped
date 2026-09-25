import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { TIERS } from "../src/lib/tier";

/**
 * The public landing page.
 *
 * Everything here is a claim made to strangers before they have an account,
 * which makes it both the first thing an app store reviewer reads and the
 * only page where a false sentence is straightforwardly false advertising.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const landing = () => strip(read("src/components/web/WebLanding.tsx"));

/* ─── Claims nobody can stand behind ─── */

test("no invented press, awards or readership", () => {
  // The strip read "Featured in Sky & Telescope", "AASM Wellness Pick 2026",
  // "40,000+ daily readers" and "Apple Design nominee". None of it happened;
  // two borrow somebody else's trademark, and the Apple one would be read by
  // the reviewer deciding whether to approve the app.
  const src = landing();
  for (const claim of [/Sky & Telescope/i, /AASM/i, /40,000/, /Apple Design/i, /Featured in/i]) {
    assert.doesNotMatch(src, claim, `an invented credential is back: ${claim}`);
  }
});

test("no invented testimonials", () => {
  // Three quotes with names, cities, initials and five stars. Nobody said any
  // of them.
  const src = landing();
  assert.doesNotMatch(src, /Mara L\.|Devon R\.|Priya S\./);
  assert.match(src, /const QUOTES: \{[^}]*\}\[\] = \[\]/, "the quotes array is populated again");
});

test("no star ratings for an app with no ratings", () => {
  assert.doesNotMatch(landing(), /★★★★★/, "a rating nobody gave");
});

test("no superlative nobody has earned", () => {
  // "Most loved" on a plan that has never been bought.
  assert.doesNotMatch(landing(), /Most loved/i);
});

/* ─── Pricing that matches what Stripe will charge ─── */

test("all three plans are on the page, named as they are named", () => {
  const src = landing();
  assert.match(src, /TIERS\.mid\.name/, "plan names are typed by hand");
  assert.match(src, /TIERS\.max\.name/, "Mapped Complete is missing from the page");
  assert.doesNotMatch(src, /name: "Premium"/, '"Premium" is not a plan this app sells');
});

test("prices come from TIERS, not from a designer's draft", () => {
  const src = landing();
  assert.match(src, /TIERS\.mid\.price/);
  assert.match(src, /TIERS\.max\.price/);
  assert.match(src, /TIERS\.mid\.annualPrice/, "annual is not offered on the pricing page");
  assert.match(src, /TIERS\.max\.annualPrice/);
  // And nothing hardcoded that could drift away from them.
  assert.doesNotMatch(src, /price: "\$11\.11"|price: "\$22\.22"/);
  assert.ok(TIERS.mid.annualPrice < TIERS.mid.price * 12, "annual should be the cheaper way to pay");
});

test("the renewal terms and the trial are stated where the buttons are", () => {
  // A pricing table with subscribe buttons and no renewal terms is the first
  // thing a store reviewer looks for, and "Start free" under a paid plan reads
  // as a free plan unless the trial is named.
  const src = landing();
  assert.match(src, /TRIAL_DAYS/, "the trial is named nowhere on the page");
  assert.match(src, /renew at the price shown until you cancel/);
  assert.match(src, /Prices in USD/);
});

test("the free-trial label is not put on the plan the trial does not cover", () => {
  // The opening trial is Mapped+. "Start free" on Mapped Complete promises
  // something that is not on offer.
  const src = read("src/components/web/WebLanding.tsx");
  const complete = src.slice(src.indexOf("TIERS.max.name"));
  const btn = complete.slice(complete.indexOf("btn:"), complete.indexOf("perks:"));
  assert.doesNotMatch(btn, /btn: "Start free",/, "the dearest plan is labelled as a free trial");
});
