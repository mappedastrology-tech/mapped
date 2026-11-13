/**
 * Nobody gets stranded on the retired copy of the app.
 *
 * The repo built to Vercel as well as Netlify for months. That was cosmetic
 * until sign-in: Supabase OAuth uses PKCE, the one-time verifier lives in the
 * localStorage of the origin that STARTED the flow, and Supabase was still
 * configured to send people back to the vercel.app address. Start on Netlify,
 * finish on Vercel, and the exchange cannot succeed — on that host, ever. It
 * reads as "login is broken" and no amount of retrying helps.
 *
 * So the stale host hands the visitor back, carrying the URL. These pin the
 * two halves that matter: it fires on the stale host and nowhere near the
 * app's own shells, and it carries the parts of the URL the sign-in needs.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { canonicalUrlFor, isStaleHost, CANONICAL_ORIGIN } from "../src/components/CanonicalHost";

test("the canonical origin is the Netlify site the app builds against", () => {
  // scripts/build-app.mjs requires NEXT_PUBLIC_API_BASE and documents this
  // host; if the two drift, the phone app and the website talk to different
  // servers again.
  assert.equal(CANONICAL_ORIGIN, "https://mapped-astrology.netlify.app");
  assert.match(readFileSync("scripts/build-app.mjs", "utf8"), /mapped-astrology\.netlify\.app/);
});

test("the retired vercel.app copy is recognised", () => {
  assert.ok(isStaleHost("mapped-olive.vercel.app"));
  assert.ok(isStaleHost("mapped-git-main-something.vercel.app"));
  assert.ok(isStaleHost("vercel.app"));
});

test("nothing else is — above all, not the app's own shells", () => {
  // Redirecting the installed app to a website would be a far worse bug than
  // the one this fixes: Capacitor serves from localhost, and a bounce to the
  // public site would strand someone outside their own app.
  for (const host of [
    "mapped-astrology.netlify.app",
    "deploy-preview-12--mapped-astrology.netlify.app",
    "localhost",
    "127.0.0.1",
    "mapped.app",
  ]) {
    assert.equal(isStaleHost(host), false, `${host} must not be treated as stale`);
  }
});

test("the sign-in code and the session hash both survive the bounce", () => {
  // The query carries the OAuth `code` (PKCE); the hash carries the session on
  // the implicit flow. Dropping either turns a recoverable sign-in into a
  // silent sign-out — which is the whole failure being fixed.
  assert.equal(
    canonicalUrlFor("https://mapped-olive.vercel.app/auth/verify?code=abc123&next=%2Fhome"),
    "https://mapped-astrology.netlify.app/auth/verify?code=abc123&next=%2Fhome",
  );
  assert.equal(
    canonicalUrlFor("https://mapped-olive.vercel.app/auth/verify#access_token=xyz&type=bearer"),
    "https://mapped-astrology.netlify.app/auth/verify#access_token=xyz&type=bearer",
  );
  assert.equal(
    canonicalUrlFor("https://mapped-olive.vercel.app/dolly"),
    "https://mapped-astrology.netlify.app/dolly",
  );
});

test("a visitor already on the real site is left alone", () => {
  // Returning a URL here would be an infinite redirect.
  assert.equal(canonicalUrlFor("https://mapped-astrology.netlify.app/dolly?x=1#y"), null);
  assert.equal(canonicalUrlFor("http://localhost:3000/dolly"), null);
  assert.equal(canonicalUrlFor("capacitor://localhost/dolly"), null);
});

test("a URL that cannot be parsed is left alone rather than throwing", () => {
  // This runs in the root layout, before anything else renders. A throw here
  // would take the whole app down on every page.
  assert.equal(canonicalUrlFor("not a url"), null);
  assert.equal(canonicalUrlFor(""), null);
});

test("it runs in the root layout, ahead of everything else", () => {
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  assert.match(layout, /<CanonicalHost \/>/, "the guard is not mounted");
  const at = layout.indexOf("<CanonicalHost />");
  const body = layout.indexOf("<body");
  assert.ok(at > body, "the guard must be inside <body>");
  // Ahead of the auth bridge in particular: it must not spend a one-time
  // token on a host that cannot complete the exchange.
  const bridge = layout.indexOf("<NativeAuthBridge />");
  assert.ok(bridge === -1 || at < bridge, "the guard must run before the auth bridge");
});
