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

/* ─── Every screen that asks "what am I paying?" must be able to answer ─── */

test("tier is provided at the root, not only inside the tab group", () => {
  // This was the bug behind everything below it. TierProvider was mounted in
  // src/app/(tabs)/layout.tsx, which covers the five tab screens and nothing
  // else — and /account and /rectification live outside that group. useTier()
  // there fell back to the context default, tier "free", so account settings
  // showed the Free plan card to every paying subscriber: no renewal date, no
  // Manage Subscription, and an "Upgrade to Mapped+" button offered to
  // somebody already paying for Mapped+.
  //
  // Pinned structurally rather than behaviourally because the failure mode is
  // a file's location, which no unit test of the page itself can see.
  assert.match(read("src/app/layout.tsx"), /<TierProvider>/, "the root layout does not mount it");
  assert.doesNotMatch(
    read("src/app/(tabs)/layout.tsx"),
    /<TierProvider>/,
    "still nested inside (tabs) — two providers means two profile reads",
  );
});

test("an annual subscriber is not quoted a monthly price", () => {
  // TIERS[tier].price is the monthly figure, and it was shown to everyone.
  // Someone on $100/year was told "$11.11/month" on the one screen where
  // money is discussed.
  const src = read("src/app/account/page.tsx");
  assert.match(src, /subInterval === "year"/, "the billing interval is not consulted");
  assert.match(src, /annualPrice\}\/year/, "no annual price is ever shown");
});

/* ─── Cancelled is not the same as renewing ─── */

test("both Stripe routes record cancel_at_period_end", () => {
  // Cancelling in the portal does not delete the subscription — it leaves the
  // status "active" until the period runs out. Without this flag, "active
  // with a future period end" reads identically to a renewal.
  for (const file of ["src/app/api/stripe/webhook/route.ts", "src/app/api/stripe/sync/route.ts"]) {
    assert.match(
      read(file),
      /subscription_cancel_at_period_end/,
      `${file} never persists the cancellation flag`,
    );
  }
});

test("the new billing column is pinned to the server like the others", () => {
  // profiles' "Users can update own profile" policy has no WITH CHECK, so a
  // billing column that the lock trigger does not pin can be PATCHed by any
  // authenticated client against its own row.
  const sql = read("supabase/migrations/20260925b_subscription_cancel_at_period_end.sql");
  assert.match(sql, /add column if not exists subscription_cancel_at_period_end/);
  assert.match(
    sql,
    /new\.subscription_cancel_at_period_end := old\.subscription_cancel_at_period_end/,
    "the trigger does not pin it on UPDATE",
  );
  assert.match(sql, /new\.subscription_cancel_at_period_end := false/, "not reset on INSERT");
});

test("someone who cancelled is not told their plan renews", () => {
  const src = read("src/app/account/page.tsx");
  assert.match(src, /cancelling\s*\n?\s*\?/, "the renewal line never branches on it");
  assert.match(src, /is yours until \$\{renewalDate\}/, "no copy for the cancelled case");
});

/* ─── The plan ladder must not run backwards ─── */

test("no limit shrinks as the tier goes up", async () => {
  // free.familyMembers was 10 against mid's 1, so read literally, paying for
  // Mapped+ shrank your map from ten people to one. Nothing consumes that key
  // yet, which is precisely why it was free to drift.
  const { USAGE_LIMITS } = await import("../src/lib/tier");
  const keys = Object.keys(USAGE_LIMITS.free) as (keyof typeof USAGE_LIMITS.free)[];
  for (const key of keys) {
    const free = USAGE_LIMITS.free[key] as number;
    const mid = USAGE_LIMITS.mid[key] as number;
    const max = USAGE_LIMITS.max[key] as number;
    assert.ok(mid >= free, `${key}: Mapped+ (${mid}) is worse than free (${free})`);
    assert.ok(max >= mid, `${key}: Complete (${max}) is worse than Mapped+ (${mid})`);
  }
});

/* ─── One account, one subscription ─── */

test("an existing subscriber cannot be sold a second subscription", () => {
  // Checkout creates a NEW subscription every time. Account settings offers a
  // Mapped+ subscriber "Compare with Mapped Complete", and the plans sheet put
  // a Subscribe button under it — so one tap billed them for Complete without
  // ending Mapped+: $33.33 a month for one account, and nothing about it looks
  // like an error to Stripe.
  const src = read("src/app/api/stripe/checkout/route.ts");
  const guard = src.slice(0, src.indexOf("const sessionParams"));
  assert.match(guard, /subscriptions\.list/, "checkout never looks for an existing subscription");
  assert.match(guard, /billingPortal\.sessions\.create/, "no plan-change path");
  assert.match(guard, /subscription_update/, "not sent to Stripe's plan-change flow");
  // And the fallback when that flow is not configured must not be "sell anyway".
  const fallback = guard.slice(guard.indexOf("catch (err)"));
  assert.doesNotMatch(strip(fallback), /checkout\.sessions\.create/, "falls through to a second sale");
});

test("the plans sheet opens on the interval they are actually billed", () => {
  // An annual subscriber saw Monthly selected and monthly prices, and could
  // move from a $100 year to a $22.22 month without the screen mentioning
  // that the interval had changed too.
  const src = read("src/components/Paywall.tsx");
  assert.match(src, /useState<"month" \| "year">\(currentInterval \?\? "month"\)/);
  assert.match(src, /hasSubscription \? \(\s*`Switch to \$\{title\}`/, "a plan change still says Subscribe");
});

/* ─── Copy that renders as written ─── */

test("the renewal terms do not render as 'every monthat the price shown'", () => {
  // JSX drops the space between an expression and text that wraps to the next
  // line. This was on the subscribe screen — the paragraph a store reviewer
  // reads word for word.
  const src = read("src/components/Paywall.tsx");
  assert.doesNotMatch(
    src,
    /\{billing === "month" \? "month" : "year"\} at the price shown\n/,
    "the space is implicit again and will be dropped",
  );
  assert.match(src, /\{billing === "month" \? "month" : "year"\}\{" "\}/);
});

/* ─── Don't decide who pays before you know who pays ─── */

test("a gate asked before the tier resolves refuses to answer", () => {
  // TierProvider starts at "free" and resolves a moment later. Any gate asked
  // in that window said no to everybody, subscribers included — and once the
  // paywall is up, the tier arriving does not take it back down.
  const src = read("src/hooks/usePaywall.ts");
  assert.match(src, /loading: tierLoading/, "the hook never looks at whether the tier is known");
  const fn = src.slice(src.indexOf("const gateWithReason"), src.indexOf("const gate ="));
  assert.match(fn, /if \(tierLoading\) return "pending"/);
  // And the pending branch must come BEFORE anything that shows a paywall.
  assert.ok(
    fn.indexOf('return "pending"') < fn.indexOf("setActiveFeature"),
    "the paywall can still fire before the tier is known",
  );
});

test("a pending gate is never silent", () => {
  // A tap that does nothing at all reads as broken software — the failure this
  // hook already exists to avoid.
  const gateSrc = read("src/hooks/usePaywall.ts");
  assert.match(gateSrc, /reason === "pending"[\s\S]{0,200}toast\.info/);
  const dolly = read("src/app/(tabs)/dolly/page.tsx");
  assert.match(dolly, /reason === "pending"[\s\S]{0,200}setAnnouncement/);
});

test("rectification asks the gate from an effect, and uses the answer", () => {
  // `const blocked = gate(...)` sat in the render body: setState during
  // render, the result assigned and never read, so the whole seven-step flow
  // rendered underneath the paywall — and it ran before the tier was known,
  // which meant it locked out subscribers most reliably of all.
  const src = read("src/app/rectification/page.tsx");
  assert.doesNotMatch(strip(src), /const blocked = gate\(/, "still gating during render");
  assert.match(src, /useEffect\(\(\) => \{\s*if \(tierLoading\) return;/);
  assert.match(src, /!tierLoading && allowed/, "the answer is still not used to gate the flow");
});
