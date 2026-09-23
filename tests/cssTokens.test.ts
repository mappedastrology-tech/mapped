import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Every custom property the app reads must actually be defined somewhere.
 *
 * This is a whole class of bug that ships silently. `var(--card)` with no
 * fallback resolves to nothing, and a background of nothing is transparent —
 * which is how the "Save this reading?" dialog came to render as a ghost with
 * the thread showing through its own text, in both themes, with no error
 * anywhere. `--soft` did the same to the composer. `--rose` was referenced by
 * the reply chips and defined nowhere at all, so it always fell through to a
 * hardcoded pink from no palette in Mapped.
 *
 * None of those are catchable by TypeScript, by lint, or by looking at the
 * dark theme — which is where all three were written.
 */

const CSS = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

/**
 * Everything `--x: …` anywhere in the stylesheet, whatever the selector —
 * plus properties a component assigns to an element inline, which is a
 * perfectly good way to drive a keyframe from a per-item value (the confetti
 * pieces each get their own `--drift`).
 */
function definedTokens(): Set<string> {
  const out = new Set<string>();
  for (const m of CSS.matchAll(/(--[a-z0-9-]+)\s*:/gi)) out.add(m[1]);

  const walkSrc = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walkSrc(p);
      else if (/\.tsx?$/.test(name)) {
        const src = readFileSync(p, "utf8");
        // style={{ "--drift": … }} and style={{ ["--lc-from" as string]: … }}
        for (const m of src.matchAll(/\[?\s*["'](--[a-z0-9-]+)["'](?:\s+as\s+string)?\s*\]?\s*:/gi)) {
          out.add(m[1]);
        }
      }
    }
  };
  walkSrc(join(process.cwd(), "src"));
  return out;
}

/** Every `var(--x)` used WITHOUT a fallback, in source and in the stylesheet. */
function usedTokens(): Map<string, Set<string>> {
  const used = new Map<string, Set<string>>();
  const roots = ["src"];
  const files: string[] = [];

  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(tsx?|css)$/.test(name)) files.push(p);
    }
  };
  for (const r of roots) walk(join(process.cwd(), r));

  for (const file of files) {
    const src = readFileSync(file, "utf8");
    // `var(--x)` or `var(--x )` — but NOT `var(--x, fallback)`, which is a
    // deliberate default and cannot render as nothing.
    for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)\s*\)/gi)) {
      const rel = file.replace(process.cwd() + "/", "");
      if (!used.has(m[1])) used.set(m[1], new Set());
      used.get(m[1])!.add(rel);
    }
  }
  return used;
}

test("no component reads a custom property that is never defined", () => {
  const defined = definedTokens();
  const missing: string[] = [];
  for (const [token, files] of usedTokens()) {
    if (defined.has(token)) continue;
    // Tailwind writes these itself at runtime.
    if (token.startsWith("--tw-")) continue;
    missing.push(`${token} — used in ${[...files].slice(0, 4).join(", ")}`);
  }
  assert.deepEqual(
    missing,
    [],
    `these resolve to nothing at runtime (a transparent background, no colour):\n${missing.join("\n")}`,
  );
});

test("tokens the app uses are defined for BOTH themes, not just dark", () => {
  // The specific trap this codebase keeps falling into: a token written in
  // the dark block and forgotten in the light one still "exists", so the test
  // above passes, and the screen is only broken for half the users.
  const lightBlock = CSS.slice(CSS.indexOf('[data-theme="light"] {'));
  const lightEnd = lightBlock.indexOf("\n}");
  const light = new Set(
    [...lightBlock.slice(0, lightEnd).matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]),
  );

  const darkBlock = CSS.slice(CSS.indexOf('[data-theme="dark"] {'));
  const darkEnd = darkBlock.indexOf("\n}");
  const dark = new Set(
    [...darkBlock.slice(0, darkEnd).matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]),
  );

  assert.ok(dark.size > 20, "the dark theme block was not found — this test is stale");
  const onlyDark = [...dark].filter((t) => !light.has(t));
  assert.deepEqual(
    onlyDark,
    [],
    `defined for dark but not light, so light falls back to the :root (dark) value:\n${onlyDark.join("\n")}`,
  );
});
