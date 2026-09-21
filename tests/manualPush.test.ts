/**
 * The send page's rules, and who is allowed to use it.
 *
 * The admin check is the lock on a page that can put text on every subscriber's
 * lock screen, so it is pinned here rather than trusted to a list nobody reads.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { isAdmin, ADMIN_USER_IDS } from "../src/lib/admin";
import { validateManualPush, localHour } from "../src/lib/notifications/manualPush";
import { MAX_TITLE, MAX_BODY } from "../src/lib/notifications/copy";

const good = { title: "Full moon in Aries", body: "Whatever has been building for two weeks gets obvious tonight.", url: "/home", audience: "everyone" };

test("exactly the two chosen accounts are admins", () => {
  assert.equal(ADMIN_USER_IDS.size, 2);
  assert.ok(isAdmin("9239cff5-0089-4f9d-aa69-c9092e0512ff"));
  assert.ok(isAdmin("616f8ba6-92dd-4aa0-a7ec-3505252084ac"));
});

test("nobody else is — including the account deliberately left out", () => {
  assert.equal(isAdmin("48169b65-78a7-4618-99f3-d232bbd3543b"), false);
  assert.equal(isAdmin(null), false);
  assert.equal(isAdmin(undefined), false);
  assert.equal(isAdmin(""), false);
  // Not a prefix match, not case-folded into a match.
  assert.equal(isAdmin("9239cff5-0089-4f9d-aa69-c9092e0512f"), false);
  assert.equal(isAdmin("9239CFF5-0089-4F9D-AA69-C9092E0512FF"), false);
});

test("a good draft passes and comes back trimmed", () => {
  const r = validateManualPush({ ...good, title: `  ${good.title}  ` });
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.push.title, good.title);
});

test("the title can't just be the app's name — the phone already prints it", () => {
  for (const title of ["Mapped", "mapped", "MAPPED!", "Reminder", "Update"]) {
    const r = validateManualPush({ ...good, title });
    assert.equal(r.ok, false, title);
  }
});

test("the same length limits as every other push", () => {
  assert.equal(validateManualPush({ ...good, title: "x".repeat(MAX_TITLE) }).ok, true);
  assert.equal(validateManualPush({ ...good, title: "x".repeat(MAX_TITLE + 1) }).ok, false);
  assert.equal(validateManualPush({ ...good, body: "x".repeat(MAX_BODY) }).ok, true);
  assert.equal(validateManualPush({ ...good, body: "x".repeat(MAX_BODY + 1) }).ok, false);
});

test("no emoji and no urgency, same as the SOP", () => {
  assert.equal(validateManualPush({ ...good, body: "Full moon tonight 🌕" }).ok, false);
  assert.equal(validateManualPush({ ...good, body: "Don't miss tonight's full moon." }).ok, false);
  assert.equal(validateManualPush({ ...good, title: "Last chance" }).ok, false);
});

test("it can only open a page inside the app", () => {
  for (const url of ["https://example.com", "//example.com", "javascript:alert(1)", "/admin/push", "/api/cron/notifications"]) {
    assert.equal(validateManualPush({ ...good, url }).ok, false, url);
  }
  assert.equal(validateManualPush({ ...good, url: "/journal" }).ok, true);
});

test("the audience must be one of the two", () => {
  assert.equal(validateManualPush({ ...good, audience: "me" }).ok, true);
  assert.equal(validateManualPush({ ...good, audience: "all" }).ok, false);
  assert.equal(validateManualPush({ ...good, audience: undefined }).ok, false);
});

test("garbage in is refused, not thrown", () => {
  assert.equal(validateManualPush(null).ok, false);
  assert.equal(validateManualPush("hello").ok, false);
  assert.equal(validateManualPush({ title: 5, body: [] }).ok, false);
});

test("quiet hours are read in the person's own timezone", () => {
  const at = new Date("2026-09-21T03:30:00Z");       // 10:30 PM in Texas the night before
  assert.equal(localHour(at, "America/Chicago"), 22);
  assert.equal(localHour(at, null), 3);               // unknown falls back to UTC
  assert.equal(localHour(at, "Not/AZone"), 3);         // nonsense falls back too
});
