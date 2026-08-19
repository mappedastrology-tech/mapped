"use client";

/**
 * useIsDesktop — the single source of truth for the web-vs-mobile layout switch.
 * True on lg+ (>= 1024px), false below. Resolved after mount so SSR/first paint
 * always render the mobile component (no hydration mismatch).
 *
 * KILL SWITCH: FORCE_MOBILE forces the mobile layout everywhere regardless of
 * viewport — used for mobile QA / simulation runs on desktop browsers.
 *
 *   >>> CURRENTLY ON for the mobile simulation. <<<
 *   To restore the desktop layout, set FORCE_MOBILE_DEFAULT back to false
 *   (or set NEXT_PUBLIC_FORCE_MOBILE=0 in Vercel and redeploy).
 */

import { useEffect, useState } from "react";

// Env var wins if set ("1" on / "0" off); otherwise this default applies.
const FORCE_MOBILE_DEFAULT = true;
const envFlag = process.env.NEXT_PUBLIC_FORCE_MOBILE;
const FORCE_MOBILE = envFlag === "1" ? true : envFlag === "0" ? false : FORCE_MOBILE_DEFAULT;

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (FORCE_MOBILE) { setIsDesktop(false); return; }
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return isDesktop;
}
