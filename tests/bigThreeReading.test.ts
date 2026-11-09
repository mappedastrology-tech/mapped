/**
 * The Big 3 reading never reaches an AI before there is an account and a yes.
 *
 * The bug this pins: /api/chart/interpret was the one AI route with no
 * consent check, and it deliberately served signed-out people — chart/result
 * sent a stranger's first name and Sun/Moon/Rising to Anthropic before signup.
 * Guideline 5.1.2(i) needs permission first. Now the route refuses without an
 * account or a current consent, and the page shows a reading assembled from
 * text Mapped already ships.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { composeBigThreeReading } from "../src/lib/bigThreeReading";
import { RISING_DESCRIPTIONS } from "../src/lib/risingDescriptions";
import { astrologyReference } from "../src/lib/learn/reference/astrology";

function stripComments(src: string): string {
  return src
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

const SIGNS = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"];

test("every Sun, Moon and Rising sign gets a written reading", () => {
  for (const s of SIGNS) {
    const r = composeBigThreeReading({ sun: s, moon: s, rising: s });
    for (const part of [r.sun, r.moon, r.rising]) {
      assert.ok(part.length > 80, `${s}: reading too thin: ${part}`);
      assert.doesNotMatch(part, /undefined|\bnull\b|NaN/, `${s}: placeholder leaked into ${part}`);
    }
  }
});

test("the reading is the library's own words, not new copy", () => {
  const r = composeBigThreeReading({ sun: "Gem", moon: "Sco", rising: "Cap" });
  const gemini = astrologyReference.find((e) => e.id === "sign-gemini")!;
  assert.ok(r.sun.includes(gemini.summary), "Sun should quote the Learn library's Gemini entry");
  assert.ok(r.moon.includes("Scorpio"), "Moon should name the sign");
  assert.equal(r.rising, RISING_DESCRIPTIONS.Cap.summary, "Rising should be the You tab's description");
});

test("a Sun and Moon in the same sign do not read the same paragraph twice", () => {
  const r = composeBigThreeReading({ sun: "Leo", moon: "Leo", rising: "Leo" });
  assert.notEqual(r.sun, r.moon);
  const leo = astrologyReference.find((e) => e.id === "sign-leo")!;
  assert.ok(!r.moon.includes(leo.summary));
});

test("no birth time means no Rising, said plainly", () => {
  const r = composeBigThreeReading({ sun: "Ari", moon: "Cap", rising: null });
  assert.match(r.rising, /birth time/i);
});

test("the in-house reading makes no predictions", () => {
  for (const s of SIGNS) {
    const r = composeBigThreeReading({ sun: s, moon: s, rising: s });
    assert.doesNotMatch(`${r.sun} ${r.moon} ${r.rising}`, /\bwill (happen|meet|find|lose|get)\b|\bthis year\b|\bdestined\b/i);
  }
});

const COMPONENT = stripComments(readFileSync("src/components/Interpretations.tsx", "utf8"));

test("Interpretations only calls the AI route when signed in and consented", () => {
  assert.ok(COMPONENT.includes("composeBigThreeReading"), "must have the non-AI reading to fall back on");
  assert.ok(COMPONENT.includes("readAiConsent"), "must check consent before asking the AI");
  // The fetch to the AI route sits behind the consent check, in the same function.
  const call = COMPONENT.indexOf("/api/chart/interpret");
  const gate = COMPONENT.indexOf('!== "granted"');
  assert.ok(call > 0 && gate > 0 && gate < call, "the consent gate must come before the AI call");
  assert.ok(COMPONENT.includes("authedFetch"), "the AI call must carry the session token");
});

const ROUTE = stripComments(readFileSync("src/app/api/chart/interpret/route.ts", "utf8"));

test("the interpret route refuses signed-out callers and checks consent before the SDK", () => {
  const auth = ROUTE.indexOf("getAuthedUserId(request)");
  const refuse = ROUTE.indexOf("status: 401");
  const consent = ROUTE.indexOf("guardAiConsent(uid)");
  const sdk = ROUTE.indexOf("new Anthropic(");
  assert.ok(auth > 0 && refuse > auth, "no account must be refused");
  assert.ok(consent > refuse, "consent must be checked");
  assert.ok(sdk > consent, "both checks must come before the Anthropic client exists");
});

/* ── Behavioural: run the route with every outbound request intercepted ── */

type Handler = (url: string, init?: RequestInit) => Response | Promise<Response>;

async function withFetch<T>(handler: Handler, fn: (calls: string[]) => Promise<T>): Promise<T> {
  const real = globalThis.fetch;
  const calls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    calls.push(url);
    return handler(url, init);
  }) as typeof fetch;
  try {
    return await fn(calls);
  } finally {
    globalThis.fetch = real;
  }
}

// A fake project, so even a leak could never reach production.
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-project.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-test";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-test";
process.env.ANTHROPIC_API_KEY = "sk-test";

function req(body: unknown, token?: string): Request {
  return new Request("http://localhost/api/chart/interpret", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
}

const BODY = { name: "Sam", bigThree: { sun: "Gem", moon: "Sco", rising: "Cap" } };

test("signed out: refused with 401 and nothing leaves the server", async () => {
  const { POST } = await import("../src/app/api/chart/interpret/route");
  await withFetch(() => new Response("{}", { status: 500 }), async (calls) => {
    const res = await POST(req(BODY) as never);
    assert.equal(res.status, 401);
    assert.deepEqual(calls, [], "no request of any kind before the refusal");
  });
});

test("signed in without consent: 403 ai_consent_required, Anthropic never called", async () => {
  const { POST } = await import("../src/app/api/chart/interpret/route");
  await withFetch((url) => {
    if (url.includes("/auth/v1/user")) {
      return Response.json({ id: "user-1", aud: "authenticated", role: "authenticated", email: "t@example.com" });
    }
    if (url.includes("/rest/v1/user_settings")) return Response.json([]);
    return new Response("unexpected", { status: 500 });
  }, async (calls) => {
    const res = await POST(req(BODY, "token-1") as never);
    assert.equal(res.status, 403);
    assert.equal((await res.json()).code, "ai_consent_required");
    assert.ok(!calls.some((u) => /anthropic/i.test(u)), `Anthropic was called: ${calls.join(", ")}`);
  });
});
