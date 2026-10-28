/**
 * Files reach the person on all four platforms, or the app says so.
 *
 * The bug this pins: "Download my data" built a Blob and clicked a synthetic
 * `<a download>`. WKWebView has no download handling for a `blob:` URL, so in
 * the iOS app nothing happened — and because the click resolves without
 * throwing, the catch never fired, the button returned to its resting label,
 * and the person believed their GDPR export had succeeded. The certificate
 * download had the same shape with a `data:` URL, and failed soft on top.
 *
 * Everything now goes through saveOrShareFile, which offers the share sheet
 * first and throws where neither path can work.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** The helper itself is allowed to do this; it is the one place that should. */
const ALLOWED = new Set(["src/lib/saveFile.ts"]);

/** ShareCard already tries navigator.share first and falls back deliberately. */
const DELIBERATE_FALLBACK = new Set(["src/components/ShareCard.tsx"]);

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) sourceFiles(p, out);
    else if (/\.tsx?$/.test(p)) out.push(p);
  }
  return out;
}

test("no file download bypasses saveOrShareFile", () => {
  const offenders: string[] = [];

  for (const file of sourceFiles("src")) {
    if (ALLOWED.has(file) || DELIBERATE_FALLBACK.has(file)) continue;
    const src = readFileSync(file, "utf8");
    // A synthetic anchor carrying a download attribute is the pattern that
    // silently does nothing inside the native shell.
    if (/\.download\s*=/.test(src)) {
      offenders.push(`${file} sets .download on an anchor — use saveOrShareFile from @/lib/saveFile`);
    }
  }

  assert.deepEqual(offenders, [], offenders.join("\n  "));
});

test("saveOrShareFile refuses silently-failing saves in the native shell", async () => {
  const { FileSaveUnsupportedError } = await import("../src/lib/saveFile");
  const err = new FileSaveUnsupportedError();
  assert.ok(err.message.length > 0, "the error must carry something a person can read");
  assert.ok(
    !/try again/i.test(err.message),
    "retrying cannot help when the platform has no download path — do not suggest it",
  );
});
