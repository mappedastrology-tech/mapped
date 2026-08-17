"use client";

/**
 * useIsDesktop — the single source of truth for the web-vs-mobile layout switch.
 * True on lg+ (>= 1024px), false below. Resolved after mount so SSR/first paint
 * always render the mobile component (no hydration mismatch).
 *
 * KILL SWITCH: set NEXT_PUBLIC_FORCE_MOBILE=1 (e.g. in Vercel env vars) to force
 * the mobile layout everywhere regardless of viewport — used for mobile QA /
 * simulation runs on desktop browsers. Unset it to restore the desktop layout;
 * no code change needed.
 */

import { useEffect, useState } from "react";

const FORCE_MOBILE = process.env.NEXT_PUBLIC_FORCE_MOBILE === "1";

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
