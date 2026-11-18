import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../src/app/sitemap";
import { signedOutHref } from "../src/lib/returnPath";

/**
 * /delete-account — Google Play's required account-deletion web page.
 *
 * Play asks for a page that works without the app, names the app as listed,
 * says how to request deletion and what is deleted. What it says about
 * subscriptions has to stay true to api/account/delete, so the route's
 * behaviour is checked here alongside the page's words.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const page = read("src/app/delete-account/page.tsx");
const panel = read("src/app/delete-account/DeleteAccountPanel.tsx");
const route = read("src/app/api/account/delete/route.ts");

test("the page names the app as it is listed", () => {
  assert.match(page, /title: "Delete your Mapped account"/);
  assert.match(page, /<LegalShell title="Delete your Mapped account"/);
});

test("it gives the in-app path, the web path and an email fallback", () => {
  assert.match(page, /<strong>Account<\/strong>[\s\S]*<strong>Delete account<\/strong>/);
  assert.match(page, /<DeleteAccountPanel \/>/);
  assert.match(page, /mailto:mappedastrology@gmail\.com/);
});

test("deleting here uses the same route and confirmation as the Account screen", () => {
  assert.match(panel, /^"use client";/);
  assert.match(panel, /authedFetch\("\/api\/account\/delete", \{ method: "DELETE" \}\)/);
  assert.match(panel, /<ConfirmDialog/);
  assert.match(read("src/app/account/page.tsx"), /import ConfirmDialog from "@\/components\/ConfirmDialog"/);
  // Signing in comes back here afterwards.
  assert.match(panel, /next=\$\{encodeURIComponent\("\/delete-account"\)\}/);
});

test("what it says about subscriptions matches what the route does", () => {
  // The page promises a website subscription is cancelled by deleting...
  assert.match(page, /deleting your account cancels that subscription for you/);
  assert.match(route, /stripe\.subscriptions\.cancel\(billing\.stripe_subscription_id\)/);
  // ...and that deletion stops rather than strand one it could not cancel.
  assert.match(route, /left your account alone/);
  // An App Store / Play subscription is not cancelled, and the page says so.
  assert.match(page, /deleting your account\s+does\s+not cancel it/);
});

test("nothing in it breaks the static export", () => {
  for (const src of [page, panel]) {
    assert.doesNotMatch(src, /from "next\/headers"|cookies\(\)|headers\(\)|"use server"/);
  }
});

test("it is public, linked from the privacy policy and listed for search", () => {
  assert.equal(signedOutHref("/delete-account"), "/delete-account");
  assert.match(read("src/app/privacy/page.tsx"), /href="\/delete-account"/);
  assert.match(read("src/components/web/WebShell.tsx"), /href="\/delete-account"/);
  assert.ok(sitemap().some((e) => e.url.endsWith("/delete-account")));
  assert.match(read("src/app/robots.ts"), /allow: \[[^\]]*"\/delete-account"/);
});
