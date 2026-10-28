/**
 * The city lookup goes through our own origin.
 *
 * The bug this pins: CitySearch called nominatim.openstreetmap.org directly
 * and tried to identify itself with
 *   { headers: { "User-Agent": "Mapped-Astrology-App" } }
 * — which browsers SILENTLY DROP, because User-Agent is a forbidden header
 * name on fetch. Verified in a real browser: the header arrived as plain
 * Chrome. So every request to a donated service that asks callers to identify
 * themselves went out anonymous.
 *
 * Birth city is required to create a chart — the submit button stays disabled
 * until one is chosen — so if that service ever refused us, nobody could sign
 * up, and the UI told them to check their wifi.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Source with comments removed.
 *
 * Without this, a test matching on a phrase hits the comment that explains why
 * the phrase was removed — and passes or fails for the wrong reason.
 */
function stripComments(src: string): string {
  return src
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")  // JSX comment blocks
    .replace(/\/\*[\s\S]*?\*\//g, "")               // block comments
    .replace(/^\s*\/\/.*$/gm, "");                   // line comments
}

const CLIENT = stripComments(readFileSync("src/components/CitySearch.tsx", "utf8"));
const ROUTE = readFileSync("src/app/api/geocode/route.ts", "utf8");
const ROUTE_CODE = stripComments(ROUTE);

test("the browser never calls the geocoder directly", () => {
  assert.ok(
    !/nominatim\.openstreetmap\.org/.test(CLIENT),
    "CitySearch must go through /api/geocode, not the upstream geocoder",
  );
  assert.ok(CLIENT.includes("/api/geocode"), "CitySearch should call our own route");
});

test("no browser code tries to set a User-Agent, which is always dropped", () => {
  assert.ok(
    !/"User-Agent"/.test(CLIENT),
    "a User-Agent set on a browser fetch is silently discarded — it belongs on the server",
  );
  assert.ok(/User-Agent/.test(ROUTE_CODE), "the server route must identify the app");
});

test("the server route identifies the app with a contact URL", () => {
  const ua = ROUTE_CODE.match(/const USER_AGENT = "([^"]+)"/)?.[1] ?? "";
  assert.ok(ua.length > 0, "USER_AGENT must be set");
  assert.ok(/Mapped/i.test(ua), "it should name the app");
  assert.ok(/https?:\/\//.test(ua), "a donated service wants a way to reach the operator");
});

test("the route caps what an anonymous caller can do", () => {
  assert.ok(/query\.length\s*<\s*3/.test(ROUTE_CODE), "short queries must be refused without an upstream call");
  assert.ok(/checkRateLimitDurable/.test(ROUTE_CODE), "the route must rate limit");
  assert.ok(/CACHE_TTL_MS|cache\.set/.test(ROUTE_CODE), "answers must be cached — autocomplete repeats prefixes");
});

test("the failure message does not blame the reader's connection", () => {
  assert.ok(
    !/check your connection/i.test(CLIENT),
    'a geocoder 429 is not the reader\'s wifi; "Check your connection" sent people to reboot their router',
  );
});
