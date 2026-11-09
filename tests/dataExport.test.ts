/**
 * "Download my data" contains every table that holds the person's data.
 *
 * The bug this pins: the export left out palm readings, journal reflections,
 * Learn progress and certificates, user_settings (which holds the AI consent
 * record and the profile photo) and push_subscriptions. The list is checked
 * against the schema and the code, so a new user-keyed table cannot ship
 * without either joining the export or being exempted here with a reason.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const EXPORT_SRC = readFileSync("src/lib/exportUserData.ts", "utf8");
const block = EXPORT_SRC.match(/export const USER_TABLES[^{]*\{([\s\S]*?)\n\};/)?.[1] ?? "";
const USER_TABLES = new Set([...block.matchAll(/^\s*([a-z_]+):\s*"/gm)].map((m) => m[1]));

/** Keyed by user_id but not the person's data, with the reason. */
const EXEMPT: Record<string, string> = {};

function walk(dir: string, exts: string[], out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e.startsWith(".")) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, exts, out);
    else if (exts.some((x) => e.endsWith(x))) out.push(p);
  }
  return out;
}

function userKeyedTables(): Set<string> {
  const found = new Set<string>();
  // Schema: any created table with a user_id column.
  for (const f of walk("supabase", [".sql"])) {
    const sql = readFileSync(f, "utf8");
    for (const m of sql.matchAll(/create table(?: if not exists)?\s+(?:public\.)?([a-z_]+)\s*\(([\s\S]*?)\n\s*\);/gi)) {
      if (/\buser_id\b/.test(m[2])) found.add(m[1].toLowerCase());
    }
  }
  // Code: any table read or written scoped by user_id.
  for (const f of walk("src", [".ts", ".tsx"])) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/from\("([a-z_]+)"\)([\s\S]{0,400})/g)) {
      if (/(eq|in)\("user_id"|user_id:/.test(m[2].split(/from\("/)[0])) found.add(m[1]);
    }
  }
  return found;
}

test("the export reads every table keyed to the person", () => {
  const missing = [...userKeyedTables()].filter((t) => !USER_TABLES.has(t) && !EXEMPT[t]);
  assert.deepEqual(missing, [], `not in the export: ${missing.join(", ")}`);
});

test("the specific gaps found in the audit are closed", () => {
  for (const t of [
    "palm_readings", "journal_reflections",
    "course_progress", "certificates", "quiz_attempts", "lesson_reviews", "learning_activity",
    "user_settings", "push_subscriptions",
  ]) {
    assert.ok(USER_TABLES.has(t), `${t} is missing from the export`);
  }
  // Already there; must stay.
  for (const t of ["profiles", "charts", "connections", "journal_entries", "dolly_conversations", "dolly_memory"]) {
    assert.ok(USER_TABLES.has(t), `${t} dropped out of the export`);
  }
});

test("a table that can't be read is named in the file, not silently dropped", () => {
  assert.match(EXPORT_SRC, /out\.notIncluded = unavailable/);
});

test("the export button's accessible label describes what is actually in it", () => {
  const btn = readFileSync("src/components/DataExportButton.tsx", "utf8");
  const label = btn.match(/aria-label="([^"]+)"/)?.[1] ?? "";
  assert.doesNotMatch(label, /all your Mapped data/, "it was never all of it — device-only prefs are not included");
  for (const word of ["readings", "Learn", "settings", "notification"]) {
    assert.match(label, new RegExp(word, "i"), `label does not mention ${word}`);
  }
  assert.match(label, /only on this device are not included/);
});
