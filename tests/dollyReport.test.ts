import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildReportRow,
  REPORT_REASONS,
  REPORT_REASON_LABELS,
  REPORT_REPLY_MAX,
  REPORT_THANKS,
} from "../src/lib/dollyReport";

/**
 * "Report this reply" on Dolly.
 *
 * Google Play's AI-Generated Content policy requires an AI chat app to let
 * people flag offensive output from inside the app; Apple 1.2 / 4.7 ask the
 * same. These tests hold the pieces together: the reasons the sheet offers,
 * the ones the route accepts and the ones the database allows are the same
 * four, both Dolly screens carry the control, and the table ships with RLS.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

test("the four reasons are the ones the store review asked for", () => {
  assert.deepEqual(Object.values(REPORT_REASON_LABELS), [
    "Harmful or unsafe",
    "Offensive",
    "Inaccurate or made up",
    "Something else",
  ]);
});

test("the database allows exactly the reasons the app sends", () => {
  for (const file of ["supabase/dolly_reports_schema.sql", "supabase/migrations/20261118_dolly_reports.sql"]) {
    const sql = read(file);
    const list = REPORT_REASONS.map((r) => `'${r}'`).join(", ");
    assert.ok(sql.includes(`check (reason in (${list}))`), `${file} does not constrain reason to ${list}`);
  }
});

test("the table ships with RLS on and only insert-own and select-own policies", () => {
  const sql = read("supabase/dolly_reports_schema.sql");
  assert.match(sql, /alter table public\.dolly_reports enable row level security/);
  assert.match(sql, /for insert to authenticated with check \(auth\.uid\(\) = user_id\)/);
  assert.match(sql, /for select to authenticated using \(auth\.uid\(\) = user_id\)/);
  assert.doesNotMatch(sql, /for (update|delete)/, "a report should not be editable or deletable by its author");
  // Account deletion relies on this cascade — see api/account/delete.
  assert.match(sql, /references auth\.users\(id\) on delete cascade/);
});

test("the root schema file and the dated migration say the same thing", () => {
  const root = read("supabase/dolly_reports_schema.sql");
  const migration = read("supabase/migrations/20261118_dolly_reports.sql");
  assert.ok(migration.endsWith(root), "the migration has drifted from supabase/dolly_reports_schema.sql");
});

test("a report is built from the body, but never its user id", () => {
  const built = buildReportRow({ reason: "offensive", replyText: "  some reply  ", note: " why ", user_id: "someone-else" });
  assert.ok(built.ok);
  if (!built.ok) return;
  assert.equal(built.row.reason, "offensive");
  assert.equal(built.row.reply_text, "some reply");
  assert.equal(built.row.note, "why");
  assert.equal(built.row.source, "dolly");
  assert.ok(!("user_id" in built.row), "user_id must come from the session, not the request");
});

test("a report needs a known reason and a reply", () => {
  assert.equal(buildReportRow({ reason: "rude", replyText: "x" }).ok, false);
  assert.equal(buildReportRow({ reason: "harmful", replyText: "   " }).ok, false);
  assert.equal(buildReportRow(null).ok, false);
});

test("a long reply is cut to the limit, and a local conversation id is dropped", () => {
  const built = buildReportRow({
    reason: "inaccurate",
    replyText: "a".repeat(REPORT_REPLY_MAX + 500),
    conversationId: "local-2026-11-18",
  });
  assert.ok(built.ok);
  if (!built.ok) return;
  assert.equal(built.row.reply_text.length, REPORT_REPLY_MAX);
  assert.equal(built.row.conversation_id, null);

  const real = buildReportRow({ reason: "other", replyText: "x", conversationId: "0b5f3c1e-8a0e-4a8e-9a3c-2d6f1b7e9c10" });
  assert.ok(real.ok && real.row.conversation_id === "0b5f3c1e-8a0e-4a8e-9a3c-2d6f1b7e9c10");
});

test("both Dolly screens put the report control on her replies", () => {
  for (const file of ["src/app/(tabs)/dolly/page.tsx", "src/components/web/WebDolly.tsx"]) {
    assert.match(read(file), /<ReportReplyButton/, `${file} has no way to report a reply`);
  }
});

test("the control is labelled and says thank you in the agreed words", () => {
  const src = read("src/components/ReportReplyButton.tsx");
  assert.match(src, /"Report this reply"/);
  assert.match(src, /REPORT_THANKS/);
  assert.equal(REPORT_THANKS, "Thanks, this reply has been reported. We review every report.");
  // Must work from the native app, where /api is a different host.
  assert.match(src, /authedFetch\("\/api\/dolly\/report"/);
});

test("the report route authenticates, rate-limits and never uses the service role", () => {
  const src = read("src/app/api/dolly/report/route.ts");
  assert.match(src, /getAuthedContext\(request\)/);
  assert.match(src, /checkRateLimitDurable\(`dolly-report:\$\{userId\}`/);
  assert.match(src, /user_id: userId/);
  assert.doesNotMatch(src, /SERVICE_ROLE/);
  // The maintainer email says a report came in; it does not carry the reply.
  assert.doesNotMatch(src, /reply_text[^\n]*text:/);
  assert.match(src, /export const OPTIONS = corsPreflight/);
});
