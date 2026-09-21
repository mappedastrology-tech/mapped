/**
 * Signed-out routing: an app never shows its own marketing website.
 *
 * The bug this pins: signing out of the Home Screen app landed on the
 * marketing page, because the only "are we an app?" check looked for the
 * Capacitor shell, and a Home Screen web app isn't one.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isInstalledApp } from "../src/lib/isNativeApp";

type G = { window?: unknown; navigator?: unknown };
const g = globalThis as unknown as G;

function withBrowser(opts: { standaloneMedia?: boolean; iosStandalone?: boolean }, fn: () => void) {
  const prevWindow = g.window;
  const prevNav = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  g.window = {
    location: { protocol: "https:", hostname: "mapped-astrology.netlify.app", port: "" },
    matchMedia: (q: string) => ({ matches: q === "(display-mode: standalone)" && !!opts.standaloneMedia }),
  };
  Object.defineProperty(globalThis, "navigator", { value: { standalone: opts.iosStandalone }, configurable: true });
  try { fn(); } finally {
    g.window = prevWindow;
    if (prevNav) Object.defineProperty(globalThis, "navigator", prevNav);
  }
}

test("on the server there is no app", () => {
  assert.equal(isInstalledApp(), false);
});

test("a website tab in a browser is not the app", () => {
  withBrowser({}, () => assert.equal(isInstalledApp(), false));
});

test("opened from the Home Screen, it is the app", () => {
  withBrowser({ standaloneMedia: true }, () => assert.equal(isInstalledApp(), true));
});

test("iOS's own standalone flag counts too", () => {
  withBrowser({ iosStandalone: true }, () => assert.equal(isInstalledApp(), true));
});

test("signing out goes to the sign-in screen, not the website", () => {
  const src = readFileSync("src/app/account/page.tsx", "utf8");
  const signOut = src.slice(src.indexOf("async function handleSignOut"), src.indexOf("const inputClass"));
  assert.match(signOut, /router\.replace\("\/welcome"\)/);
  assert.doesNotMatch(signOut, /router\.(push|replace)\("\/"\)/);
});

test("the app's signed-out routes never send people to the marketing page", () => {
  const root = readFileSync("src/app/page.tsx", "utf8");
  assert.match(root, /isInstalledApp\(\)\) router\.replace\("\/welcome"\)/);
  const tabs = readFileSync("src/app/(tabs)/layout.tsx", "utf8");
  assert.match(tabs, /router\.replace\(isInstalledApp\(\) \? "\/welcome" : "\/"\)/);
});
