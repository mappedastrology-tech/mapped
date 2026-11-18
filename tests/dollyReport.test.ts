/**
 * Reporting one Dolly reply.
 *
 * Pins: the row fits the table's CHECK limits, the reasons offered are the
 * ones the table accepts, the question attached is the person's own last
 * message, both chat screens offer the control, and the table is locked to
 * its owner and deleted with the account.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildReportRow, promptBefore, DOLLY_REPORT_REASONS, LIMITS } from "../src/lib/dollyReport";

const MIGRATION = readFileSync("supabase/migrations/20261118_dolly_reply_reports.sql", "utf8");

test("the row is clipped to the table's limits", () => {
  const row = buildReportRow(
    {
      messageId: "a-1",
      replyText: "x".repeat(LIMITS.reply + 50),
      promptText: "y".repeat(LIMITS.prompt + 50),
      note: "z".repeat(LIMITS.note + 50),
      reason: "wrong",
      day: "2026-11-18",
      surface: "mobile",
    },
    "user-1",
  );
  assert.equal(row.reply_text.length, LIMITS.reply);
  assert.equal(row.prompt_text?.length, LIMITS.prompt);
  assert.equal(row.note?.length, LIMITS.note);
  assert.equal(row.user_id, "user-1");
  assert.equal(row.conversation_day, "2026-11-18");
});

test("empty extras are stored as null, and a malformed day is dropped", () => {
  const row = buildReportRow(
    { messageId: "a-2", replyText: "hi", promptText: "  ", note: "", reason: "other", day: "today", surface: "desktop" },
    "u",
  );
  assert.equal(row.prompt_text, null);
  assert.equal(row.note, null);
  assert.equal(row.conversation_day, null);
});

test("the reasons offered are exactly the ones the table accepts", () => {
  const allowed = MIGRATION.match(/reason IN \(([^)]+)\)/)?.[1] ?? "";
  const inSql = [...allowed.matchAll(/'([a-z]+)'/g)].map((m) => m[1]).sort();
  assert.deepEqual(DOLLY_REPORT_REASONS.map((r) => r.id).sort(), inSql);
});

test("the question attached is the nearest earlier message from the person", () => {
  const thread = [
    { who: "you", text: "first" },
    { who: "dolly", text: "a" },
    { who: "you", text: "second" },
    { who: "app", text: "notice" },
    { who: "dolly", text: "b" },
  ];
  const prompt = promptBefore(thread, 4, (m) => m.who === "you", (m) => m.text);
  assert.equal(prompt, "second");
  assert.equal(promptBefore(thread, 0, (m) => m.who === "you", (m) => m.text), null);
});

test("the table is locked to its owner and goes with the account", () => {
  assert.match(MIGRATION, /ENABLE ROW LEVEL SECURITY/);
  assert.match(MIGRATION, /REFERENCES auth\.users\(id\) ON DELETE CASCADE/);
  assert.match(MIGRATION, /FOR INSERT[\s\S]*?WITH CHECK \(auth\.uid\(\) = user_id/);
  assert.match(MIGRATION, /FOR SELECT[\s\S]*?USING \(auth\.uid\(\) = user_id\)/);
  // Nobody edits or deletes a report from the app.
  assert.doesNotMatch(MIGRATION, /FOR (UPDATE|DELETE|ALL)/);
});

test("both Dolly screens offer Report and open the sheet", () => {
  for (const f of ["src/app/(tabs)/dolly/page.tsx", "src/components/web/WebDolly.tsx"]) {
    const src = readFileSync(f, "utf8");
    assert.match(src, /aria-label="Report this reply"/, `${f} has no Report control`);
    assert.match(src, /<DollyReportSheet/, `${f} does not render the sheet`);
  }
});
