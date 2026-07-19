// Loads distilled knowledge passages into the kb_passages table.
// Usage: node --env-file=.env.local scripts/ingest/loadPassages.mjs <dir-with-*.passages.json>
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
if (!dir) { console.error("Pass the directory containing *.passages.json"); process.exit(1); }

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing Supabase env vars"); process.exit(1); }

const supabase = createClient(url, key, { auth: { persistSession: false } });

const files = readdirSync(dir).filter((f) => f.endsWith(".passages.json"));
let rows = [];
for (const f of files) {
  const arr = JSON.parse(readFileSync(join(dir, f), "utf8"));
  for (const p of arr) {
    if (!p.domain || !p.title || !p.body) continue;
    rows.push({
      domain: String(p.domain),
      topic: p.topic ?? null,
      title: String(p.title),
      body: String(p.body),
      summary: p.summary ?? null,
      keywords: Array.isArray(p.keywords) ? p.keywords : [],
      entities: Array.isArray(p.entities) ? p.entities : [],
      source_title: p.source_title ?? null,
      source_author: p.source_author ?? null,
      source_year: Number.isFinite(p.source_year) ? p.source_year : null,
      public_domain: !!p.public_domain,
    });
  }
}
console.log(`Prepared ${rows.length} rows from ${files.length} files.`);

// Fresh load: clear existing reference passages, then insert in batches.
const del = await supabase.from("kb_passages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
if (del.error) { console.error("Delete failed:", del.error.message); process.exit(1); }

let inserted = 0;
for (let i = 0; i < rows.length; i += 200) {
  const batch = rows.slice(i, i + 200);
  const { error } = await supabase.from("kb_passages").insert(batch);
  if (error) { console.error(`Batch ${i} failed:`, error.message); process.exit(1); }
  inserted += batch.length;
  process.stdout.write(`\rInserted ${inserted}/${rows.length}`);
}
console.log(`\nDone. ${inserted} passages loaded.`);
