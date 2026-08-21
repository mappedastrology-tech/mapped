#!/usr/bin/env node
/**
 * Static-export build for the Capacitor (iOS/Android) apps.
 *
 * Next.js static export refuses to build route handlers that read `Request`,
 * and every route under src/app/api does. The apps don't need them — they call
 * the deployed API over HTTPS instead — so this moves the api directory aside
 * for the duration of the build and always puts it back.
 *
 * Usage:
 *   NEXT_PUBLIC_API_BASE=https://mapped-astrology.netlify.app npm run build:app
 *
 * Output: .next-app/  →  copied into the Capacitor shells by `npx cap sync`.
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = process.cwd();

/**
 * Server-only routes, excluded from the app bundle.
 *
 *  - src/app/api          — the 28 route handlers; the app calls the deployed
 *                           ones over HTTPS instead.
 *  - src/app/auth/callback — Supabase email-link redirect handler. Native apps
 *                           receive these via deep link, not an HTTP route.
 */
const SERVER_ONLY = ["src/app/api", "src/app/auth/callback"];
const PARK_ROOT = resolve(root, ".app-build-parked");

const apiBase = process.env.NEXT_PUBLIC_API_BASE;
if (!apiBase) {
  console.error(
    "\n  NEXT_PUBLIC_API_BASE is required for an app build.\n" +
      "  The bundled app has no server of its own, so it needs the absolute\n" +
      "  origin of the deployed API. Example:\n\n" +
      "    NEXT_PUBLIC_API_BASE=https://mapped-astrology.netlify.app npm run build:app\n",
  );
  process.exit(1);
}

const parkPathFor = (rel) => resolve(PARK_ROOT, rel.replace(/\//g, "__"));

// A previous run may have died before restoring. Recover rather than
// overwriting a parked copy with a half-built one.
for (const rel of SERVER_ONLY) {
  const live = resolve(root, rel);
  const parkedPath = parkPathFor(rel);
  if (existsSync(parkedPath) && !existsSync(live)) {
    console.log(`Recovering ${rel} parked by an earlier run…`);
    mkdirSync(dirname(live), { recursive: true });
    renameSync(parkedPath, live);
  }
}

const parked = [];
const restore = () => {
  while (parked.length) {
    const rel = parked.pop();
    const parkedPath = parkPathFor(rel);
    if (existsSync(parkedPath)) {
      mkdirSync(dirname(resolve(root, rel)), { recursive: true });
      renameSync(parkedPath, resolve(root, rel));
      console.log(`Restored ${rel}`);
    }
  }
  rmSync(PARK_ROOT, { recursive: true, force: true });
};

// Restore on crash or Ctrl-C as well as normal exit — losing the api directory
// would be a nasty surprise.
process.on("exit", restore);
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sig, () => { restore(); process.exit(1); });
}

try {
  mkdirSync(PARK_ROOT, { recursive: true });
  for (const rel of SERVER_ONLY) {
    const live = resolve(root, rel);
    if (existsSync(live)) {
      renameSync(live, parkPathFor(rel));
      parked.push(rel);
      console.log(`Parked ${rel} (excluded from the static export)`);
    }
  }

  rmSync(resolve(root, ".next-app"), { recursive: true, force: true });

  console.log(`Building static export against ${apiBase} …\n`);
  execSync("npx next build", {
    stdio: "inherit",
    env: { ...process.env, APP_BUILD: "1", NEXT_PUBLIC_API_BASE: apiBase },
  });

  console.log("\n  Static export ready in .next-app/");
  console.log("  Next: npx cap sync\n");
} catch (err) {
  console.error("\nApp build failed:", err?.message || err);
  process.exitCode = 1;
} finally {
  restore();
}
