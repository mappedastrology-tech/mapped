"use client";

/**
 * useIsDesktop — the single source of truth for the web-vs-mobile layout switch.
 * True on lg+ (>= 1024px), false below. Resolved after mount so SSR/first paint
 * always render the mobile component (no hydration mismatch).
 *
 * KILL SWITCH: FORCE_MOBILE forces the mobile layout everywhere regardless of
 * viewport — for mobile QA / simulation runs on a desktop browser.
 *
 *   >>> CURRENTLY OFF. Desktop browsers get the Web* screens. <<<
 *   Leaving it ON makes all of src/components/web/ unreachable at every
 *   viewport, which is silent — the app still works, it just serves the phone
 *   layout to everyone. Flip it back only for a QA run, and flip it back off.
 *   NEXT_PUBLIC_FORCE_MOBILE=1 does the same thing without a code change.
 */

import { useEffect, useState } from "react";
import { isNativeApp } from "@/lib/isNativeApp";

// Env var wins if set ("1" on / "0" off); otherwise this default applies.
const FORCE_MOBILE_DEFAULT = false;
const envFlag = process.env.NEXT_PUBLIC_FORCE_MOBILE;
const FORCE_MOBILE = envFlag === "1" ? true : envFlag === "0" ? false : FORCE_MOBILE_DEFAULT;

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    // The native shell always gets the app layout, whatever the screen measures
    // — see lib/isNativeApp for why an iPad makes this necessary.
    if (FORCE_MOBILE || isNativeApp()) { setIsDesktop(false); return; }
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return isDesktop;
}
