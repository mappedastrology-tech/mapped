import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { returnBaseUrl } from "../src/lib/siteUrl";

/**
 * The money paths.
 *
 * Nothing here can be exercised end to end without live Stripe, so these pin
 * the two decisions that are easy to undo by accident and expensive when
 * they are: that a failed card does not cost someone their subscription, and
 * that checkout leaves the app rather than happening inside it.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/* ─── A failed renewal must not cancel someone ─── */

test("past_due keeps its tier — Stripe is still retrying the card", () => {
  // This was the bug: anything outside active/trialing was demoted to free,
  // and past_due is what Stripe sets while it spends ~3 weeks retrying. A
  // subscriber lost everything the instant a card blipped.
  const src = read("src/app/api/stripe/webhook/route.ts");
  assert.match(src, /ENTITLED_STATUSES[\s\S]{0,200}"past_due"/, "past_due is not an entitled status");
  assert.doesNotMatch(
    strip(src),
    /status === "active" \|\| \w+\.status === "trialing"/,
    "the old two-status check is still deciding entitlement",
  );
});

test("unpaid does NOT keep its tier — that is Stripe giving up", () => {
  const src = read("src/app/api/stripe/webhook/route.ts");
  const start = src.indexOf("ENTITLED_STATUSES");
  const set = src.slice(start, src.indexOf("]", start));
  assert.doesNotMatch(set, /"unpaid"/, "unpaid should end access; retries are exhausted");
  assert.doesNotMatch(set, /"canceled"/);
});

test("both payment-failure events are handled", () => {
  // Neither existed, so the app never learned a payment had failed OR that a
  // retry had succeeded.
  const src = read("src/app/api/stripe/webhook/route.ts");
  assert.match(src, /case "invoice\.payment_failed"/);
  assert.match(src, /case "invoice\.paid"/);
});

test("a failed payment is visible to the person it affects", () => {
  // subscription_status was written to the profile and read nowhere in the
  // app, so the warning existed only in the database.
  const src = read("src/app/account/page.tsx");
  assert.match(src, /subscription_status|subStatus/, "account settings never reads the status");
  assert.match(src, /past_due/, "nothing checks for a failed payment");
  assert.match(src, /didn&rsquo;t go through|didn't go through/, "there is no message");
  assert.match(src, /role="alert"/, "the warning is not announced");
});

/* ─── Checkout must leave the app ─── */

test("no call site navigates the app's own WebView to Stripe", () => {
  // Inside Capacitor, window.location.href = checkoutUrl keeps the purchase
  // inside the app — which is the most common App Store 3.1.1 rejection.
  for (const file of [
    "src/components/Paywall.tsx",
    "src/components/tarot/DeckStore.tsx",
    "src/app/account/page.tsx",
  ]) {
    assert.doesNotMatch(
      strip(read(file)),
      /window\.location\.href\s*=\s*data\.url/,
      `${file} navigates in-app to a Stripe URL`,
    );
    assert.match(read(file), /openCheckout\(/, `${file} does not use the compliant opener`);
  }
});

test("the opener sends native to the system browser, web to a redirect", () => {
  const src = read("src/lib/openCheckout.ts");
  assert.match(src, /isNativeApp\(\)/);
  assert.match(src, /window\.open\(url, "_blank"/, "native should hand off to the system browser");
  // And must NOT quietly fall back to an in-app navigation when that fails.
  const afterOpen = src.slice(src.indexOf("const opened"));
  assert.doesNotMatch(strip(afterOpen), /location\.href/, "falls back to paying inside the app");
});

/* ─── Return URLs have to be reachable from outside the app ─── */

test("the app's internal origin is never used as a Stripe return URL", () => {
  // Checkout now opens in Safari. A success_url of https://localhost/... is a
  // page the browser cannot load, so the person pays and lands on an error.
  for (const origin of ["https://localhost", "http://localhost:3000", "https://127.0.0.1", "capacitor://localhost"]) {
    const base = returnBaseUrl(origin);
    assert.doesNotMatch(base, /localhost|127\.0\.0\.1/, `${origin} was used verbatim`);
    assert.match(base, /^https?:\/\/.+\..+/, `${origin} produced an unreachable base: ${base}`);
  }
});

test("a real public origin is kept, so previews return to themselves", () => {
  assert.equal(returnBaseUrl("https://mapped-olive.vercel.app"), "https://mapped-olive.vercel.app");
  assert.equal(returnBaseUrl("https://deploy-preview-12--mapped.netlify.app"), "https://deploy-preview-12--mapped.netlify.app");
});

test("a missing, empty or malformed origin still yields a usable URL", () => {
  for (const origin of [null, undefined, "", "not a url", "javascript:alert(1)"]) {
    assert.match(returnBaseUrl(origin), /^https?:\/\/.+\..+/);
  }
});

test("both Stripe routes build their return URLs through it", () => {
  for (const file of ["src/app/api/stripe/checkout/route.ts", "src/app/api/stripe/portal/route.ts"]) {
    const src = read(file);
    assert.match(src, /returnBaseUrl\(/, `${file} builds return URLs by hand`);
    assert.doesNotMatch(
      strip(src),
      /headers\.get\("origin"\)\s*\|\|/,
      `${file} still falls back to a hardcoded origin`,
    );
  }
});
