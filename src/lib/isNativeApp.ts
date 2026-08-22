/**
 * isNativeApp — are we running inside the Capacitor shell (iOS / Android)?
 *
 * This exists because "desktop" and "large screen" are not the same thing. The
 * iOS target ships for iPhone *and* iPad (TARGETED_DEVICE_FAMILY = "1,2"), and
 * an iPad in landscape is 1024–1366pt — over the lg breakpoint. Without this
 * check, rotating an iPad inside the native app swaps the app UI for the
 * marketing website layout, footer and "back to home" links included. Beyond
 * looking broken, that is the exact shape App Review flags under Guideline 4.2.
 *
 * Detection, most to least authoritative:
 *   1. The Capacitor runtime's own answer, once its bridge has injected.
 *   2. The origin Capacitor serves from, which is set before any JS runs and so
 *      is already correct on the very first render.
 *   3. NEXT_PUBLIC_API_BASE, which scripts/build-app.mjs requires and only ever
 *      sets for an app build — a build-time backstop if the two above miss.
 */

import { API_BASE } from "@/lib/apiBase";

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
}

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;

  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  if (typeof cap?.isNativePlatform === "function") return cap.isNativePlatform();

  // iOS serves capacitor://localhost; Android uses https://localhost (see the
  // androidScheme in capacitor.config.ts). Requiring the exact "localhost" host
  // keeps a real https://localhost:3000 dev server from matching.
  const { protocol, hostname, port } = window.location;
  if (protocol === "capacitor:") return true;
  if (protocol === "https:" && hostname === "localhost" && port === "") return true;

  return API_BASE !== "";
}
