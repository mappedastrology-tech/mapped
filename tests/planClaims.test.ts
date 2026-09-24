import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { FEATURES, USAGE_LIMITS, getFeatureInfo, getMinTier, TIERS, TRIAL_DAYS } from "../src/lib/tier";
import { DAILY_AI_LIMITS, AI_TIER_MULTIPLIER, AI_MULTIPLIER_WORD, dailyLimit } from "../src/lib/ai/dailyLimits";

/**
 * What the plan promises has to be what the product does.
 *
 * "Unlimited Dolly — ask Dolly as much as you like, subject to fair use" was
 * sold against a hard cap of 30 messages a day. Three separate places
 * disagreed: the route enforced 30, USAGE_LIMITS claimed Infinity, and the
 * copy claimed no limit at all. Nobody was lying on purpose — the numbers were
 * just written three times and drifted. These tests make drift fail.
 */

test("the tiers do not contradict each other", () => {
  // Mapped+ said "Dolly, whenever you want her" while Mapped Complete was
  // sold on having three times as much of her. A plan cannot offer unlimited
  // and then charge more for extra.
  const paywall = readFileSync(join(process.cwd(), "src/components/Paywall.tsx"), "utf8");
  const start = paywall.indexOf("const PLUS_FEATURES");
  const list = paywall.slice(start, paywall.indexOf("];", start));
  assert.doesNotMatch(
    list.replace(/\/\/.*$/gm, ""),
    /whenever you (want|need)|as much as you like|unlimited dolly/i,
    "the middle tier implies unlimited Dolly",
  );
});

test("no plan copy promises something unlimited that is capped", () => {
  const capped = new Set(["unlimited_dolly", "unlimited_wizard"]);
  const offenders = FEATURES
    .filter((f) => capped.has(f.key))
    .filter((f) => /unlimited|as much as you like|as many .* as you want|no limit/i.test(`${f.label} ${f.description}`))
    .map((f) => `${f.key}: "${f.label}" — "${f.description}"`);
  assert.deepEqual(offenders, [], `capped features described as unlimited:\n${offenders.join("\n")}`);
});

test("'fair use' is not used to stand in for a hard number", () => {
  // It reads as "be reasonable and you'll be fine", which is not what a fixed
  // daily cap is. If there is a number, say the number.
  const offenders = FEATURES
    .filter((f) => /fair use/i.test(f.description))
    .map((f) => f.key);
  assert.deepEqual(offenders, []);
});

test("plan copy does NOT quote a message count", () => {
  // The first fix for the "Unlimited Dolly" overclaim was to print the exact
  // daily figure on the pricing card. That trades one problem for another: no
  // subscription quotes a message count, and a number there reads as a ration
  // rather than an allowance — it invites a comparison that helps nobody and
  // makes a generous limit sound mean. Non-absolute language on the card, the
  // figures in the Terms, and a plain message at the moment someone reaches
  // one.
  for (const f of FEATURES) {
    assert.doesNotMatch(
      f.description,
      /\b\d+\s*(messages?|rituals?|requests?|chats?)\b/i,
      `${f.key} quotes a count: "${f.description}"`,
    );
  }
});

test("the limits are disclosed somewhere a reader can find them", () => {
  // Not naming a number on the pricing card is only acceptable because the
  // limits are documented and linked. Vague-by-omission would be the original
  // "subject to fair use" problem again.
  const terms = readFileSync(join(process.cwd(), "src/app/terms/page.tsx"), "utf8");
  assert.match(terms, /Limits on AI features/, "the Terms have no limits section");
  assert.match(terms, /per-day cap/i);
  assert.match(terms, /monthly ceiling/i);

  // And the surfaces that used to carry the claim now point at it.
  for (const file of ["src/components/Paywall.tsx", "src/app/account/page.tsx"]) {
    const src = readFileSync(join(process.cwd(), file), "utf8");
    assert.match(src, /AI features have usage limits/, `${file} does not mention limits`);
    assert.match(src, /href="\/terms"/, `${file} does not link the Terms`);
  }
});

test("the private monthly spend ceilings are still not disclosed anywhere", () => {
  // The per-day caps are a product limit and fair to document. The monthly
  // DOLLAR ceilings are not: they are a cost control, and naming them tells
  // people how much AI they can extract for their subscription.
  const terms = readFileSync(join(process.cwd(), "src/app/terms/page.tsx"), "utf8");
  // Scoped to the AI section: the liability cap elsewhere names a figure, and
  // is supposed to.
  const from = terms.indexOf("Limits on AI features");
  const section = terms.slice(from, terms.indexOf("Acceptable use", from));
  assert.ok(section.length > 200, "the AI limits section was not found — this test is stale");
  assert.doesNotMatch(section, /\$\s*\d/, "the AI limits section names a dollar figure");
  assert.doesNotMatch(section, /\b\d+\s*(messages?|rituals?)\b/i, "the AI limits section quotes a count");
});

test("the UI's idea of the Dolly limit matches the server's, per tier", () => {
  // USAGE_LIMITS said Infinity, so nothing in the app could ever warn someone
  // they were near the cap, or explain the refusal when they hit it. Now the
  // cap differs by tier, so the UI has to agree per tier — not just agree
  // that a number exists.
  assert.equal(USAGE_LIMITS.mid.dollyMessagesPerDay, dailyLimit("dolly", "mid"));
  assert.equal(USAGE_LIMITS.max.dollyMessagesPerDay, dailyLimit("dolly", "max"));
  assert.ok(
    USAGE_LIMITS.max.dollyMessagesPerDay > USAGE_LIMITS.mid.dollyMessagesPerDay,
    "the UI thinks both paid tiers get the same daily allowance",
  );
});

test("the routes read the shared cap instead of their own literal", () => {
  // The whole point of the constant. A route that hardcodes its number again
  // can drift from the copy without any test noticing.
  for (const [file, key] of [
    ["src/app/api/dolly/route.ts", "dolly"],
    ["src/app/api/wizard/route.ts", "wizard"],
  ] as const) {
    const src = readFileSync(join(process.cwd(), file), "utf8");
    // Via dailyLimit(), which reads the same constants and then scales them
    // by tier — a bare literal, or the unscaled base, would make the cap flat.
    assert.match(src, new RegExp(`dailyLimit\\("${key}"`), `${file} should use dailyLimit("${key}", tier)`);
  }
});

/* ─── Mapped Complete: what it promises vs what it delivers ─── */

test("the top tier's value is Dolly, and the plan card says so first", () => {
  // It used to list only "Every oracle deck" and "New decks the day they
  // arrive". Someone paying double saw nothing but the throw-in, and the
  // thing they were actually buying was mentioned nowhere in the app.
  const paywall = readFileSync(join(process.cwd(), "src/components/Paywall.tsx"), "utf8");
  const start = paywall.indexOf("const COMPLETE_FEATURES");
  const list = paywall.slice(start, paywall.indexOf("];", start));
  const firstBullet = list.indexOf("`") >= 0 ? list.indexOf("`") : list.indexOf('"');
  assert.ok(
    list.slice(firstBullet, firstBullet + 120).includes("Dolly"),
    "the decks still lead the Complete card",
  );
});

test("the multiple in the copy is the multiple that is enforced", () => {
  // The promise and the delivery come from one constant. Written separately
  // they drift, and the drift is the app quietly not delivering what it sold
  // — which is the exact shape of the "Unlimited Dolly" bug.
  const info = getFeatureInfo("more_dolly");
  assert.ok(info, "the top tier has no Dolly feature");
  const word = AI_MULTIPLIER_WORD[AI_TIER_MULTIPLIER.max];
  assert.ok(word, `no word for a ${AI_TIER_MULTIPLIER.max}x multiplier`);
  assert.match(info.label, new RegExp(word, "i"), `label should say "${word}": "${info.label}"`);
});

test("the daily cap actually scales with the tier", () => {
  // This is where the promise was untrue in the one place a reader would
  // notice: the cap was a flat 30 for everybody, so a Complete subscriber
  // could send exactly as many messages in a day as a Mapped+ one and only
  // pulled ahead by sustaining heavy use for weeks.
  assert.equal(dailyLimit("dolly", "free"), 0);
  assert.equal(
    dailyLimit("dolly", "max"),
    dailyLimit("dolly", "mid") * AI_TIER_MULTIPLIER.max,
    "Complete's daily cap is not the promised multiple of Mapped+'s",
  );
  assert.ok(dailyLimit("wizard", "max") > dailyLimit("wizard", "mid"));
});

test("the routes resolve the tier BEFORE applying a daily cap", () => {
  // Order matters: the cap cannot scale with a tier the route has not
  // resolved yet. Both routes used to rate-limit first, which is what made
  // the cap flat.
  for (const [file, budgetCall] of [
    ["src/app/api/dolly/route.ts", "await checkAiBudget(uid)"],
    ["src/app/api/wizard/route.ts", 'await guardAiTiered(uid, "wizard")'],
  ] as const) {
    const src = readFileSync(join(process.cwd(), file), "utf8");
    const tierAt = src.indexOf(budgetCall);
    const capAt = src.indexOf("checkRateLimitDurable(");
    assert.ok(tierAt >= 0 && capAt >= 0, `${file}: anchors missing — this test is stale`);
    assert.ok(tierAt < capAt, `${file} rate-limits before it knows the tier`);
    assert.match(src, /dailyLimit\(/, `${file} still uses a flat cap`);
  }
});

/* ─── Annual billing ─── */

test("annual is offered, and is genuinely cheaper than twelve months", () => {
  for (const tier of ["mid", "max"] as const) {
    const t = TIERS[tier];
    assert.ok(t.annualPrice > 0, `${tier} has no annual price`);
    assert.ok(
      t.annualPrice < t.price * 12,
      `${tier}: $${t.annualPrice}/yr is not cheaper than $${(t.price * 12).toFixed(2)} of months`,
    );
  }
});

test("both tiers discount annual by the same proportion", () => {
  // Different discounts per tier make the comparison between them harder to
  // read, and there is no reason for one here.
  const pct = (t: (typeof TIERS)["mid"]) => 1 - t.annualPrice / (t.price * 12);
  assert.ok(Math.abs(pct(TIERS.mid) - pct(TIERS.max)) < 0.01);
});

test("checkout has a configured price for every plan and interval", () => {
  // Four Stripe Price objects, four env vars. A missing annual one must
  // refuse rather than quietly charge a month for a button that said a year.
  const src = readFileSync(join(process.cwd(), "src/app/api/stripe/checkout/route.ts"), "utf8");
  for (const v of ["STRIPE_PRICE_ID", "STRIPE_PRICE_ID_ANNUAL", "STRIPE_PRICE_ID_MAX", "STRIPE_PRICE_ID_MAX_ANNUAL"]) {
    assert.match(src, new RegExp(v), `checkout never reads ${v}`);
  }
  assert.match(src, /Stripe price not configured/, "a missing price should refuse, not fall back");
});

test("the renewal terms follow the interval being bought", () => {
  // Telling someone buying a year that it "renews every month" is the kind of
  // mismatch an app store reviewer looks for.
  const src = readFileSync(join(process.cwd(), "src/components/Paywall.tsx"), "utf8");
  assert.match(src, /renew every \{billing === "month" \? "month" : "year"\}/);
});

test("the trial is long enough to cover a week", () => {
  // Five days never covered a weekend, on a product whose value compounds
  // daily.
  assert.ok(TRIAL_DAYS >= 7, `trial is ${TRIAL_DAYS} days`);
});

/* ─── The map: one person on Mapped+, everyone on Complete ─── */

test("adding people to the map is a Complete feature", () => {
  assert.equal(getMinTier("multiple_synastry"), "max");
  assert.equal(getMinTier("unlimited_family"), "max");
});

test("Mapped+ is capped at one person on the map", () => {
  // The map gate used to read `tier === "free"`, which handed every paid plan
  // an unlimited map — so the thing Complete is now sold on was already
  // included in Mapped+.
  assert.equal(USAGE_LIMITS.mid.synastryPartners, 1);
  assert.equal(USAGE_LIMITS.max.synastryPartners, Infinity);
});

test("the map gate reads the limit, not a tier name", () => {
  // A hardcoded tier comparison is how it drifted the first time: the limits
  // table said one thing and the gate did another, and nothing connected them.
  const src = readFileSync(join(process.cwd(), "src/app/(tabs)/maps/page.tsx"), "utf8");
  assert.match(src, /connections\.length >= limits\.synastryPartners/);
  assert.doesNotMatch(
    src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, ""),
    /tier === "free" && connections\.length/,
    "the old hardcoded gate is still there",
  );
});

test("Mapped+ no longer claims every connection", () => {
  const paywall = readFileSync(join(process.cwd(), "src/components/Paywall.tsx"), "utf8");
  const start = paywall.indexOf("const PLUS_FEATURES");
  const list = paywall.slice(start, paywall.indexOf("];", start)).replace(/^\s*\/\/.*$/gm, "");
  assert.doesNotMatch(list, /every connection/i, "Mapped+ still promises the whole map");
});
