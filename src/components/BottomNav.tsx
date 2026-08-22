"use client";

/**
 * BottomNav — dark forest green constant navigation bar.
 *
 * 6 tabs: Home, Almanac, Chart, Tarot, Maps, Dolly.
 * Background is #1a2818 in both day and night modes — it's a constant.
 * Active item in brass with brass icon, inactive in muted cream.
 *
 * Tarot lives here in the bottom nav. Ritual (the moon-work hub at /learn)
 * lives on its own in the hamburger menu — the two are separate.
 * On first run, a one-time strip above the tabs introduces Dolly (the AI guide).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const DOLLY_TIP_KEY = "mapped:dolly-tip-seen";
// Long enough to read two short lines, short enough that a user who is busy
// tapping the onboarding list gets the nav back to normal almost immediately.
const DOLLY_TIP_MS = 6000;

interface NavTab {
  name: string;
  href: string;
  glyph: string;
  also?: string[];  // additional route prefixes that highlight this tab
}

const tabs: NavTab[] = [
  { name: "Home", href: "/home", glyph: "☉" },
  { name: "Almanac", href: "/almanac", glyph: "◇" },
  { name: "Chart", href: "/you", glyph: "◉" },
  { name: "Tarot", href: "/tarot", glyph: "✸" },
  { name: "Maps", href: "/maps", glyph: "✦" },
  { name: "Dolly", href: "/dolly", glyph: "✺" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [showDollyTip, setShowDollyTip] = useState(false);

  // One-time "meet Dolly" coachmark — home only.
  //
  // It used to be an absolutely positioned bubble floating above the nav, which
  // meant it covered whatever was beneath it and swallowed taps there: on Home
  // that is the "Start with these" onboarding card, the one list a brand-new
  // user is meant to tap. Home's content runs all the way down to the nav, so
  // there is no free space to float into — the tip is now an in-flow strip
  // inside the nav instead. It takes its own height, the scrolling content area
  // shrinks to fit, and nothing is ever underneath it.
  useEffect(() => {
    try {
      if (localStorage.getItem(DOLLY_TIP_KEY) !== "1" && pathname === "/home") {
        setShowDollyTip(true);
      } else {
        setShowDollyTip(false);
      }
    } catch { /* localStorage unavailable */ }
  }, [pathname]);

  const dismissDollyTip = useCallback(() => {
    setShowDollyTip(false);
    try { localStorage.setItem(DOLLY_TIP_KEY, "1"); } catch { /* ignore */ }
  }, []);

  // Auto-dismiss: an introduction the user ignores should retire itself rather
  // than eat a nav-height strip for the whole session. Persisting on the way out
  // (same key as a tap) keeps it a genuinely one-time greeting. The cleanup
  // covers unmount and route changes, so the timer can never fire into a gone
  // component.
  useEffect(() => {
    if (!showDollyTip) return;
    // The nav is `lg:hidden`, but it still mounts on desktop (the app forces the
    // mobile layout everywhere — see lib/useIsDesktop). Without this check the
    // timer would quietly spend the one-time greeting on a user who never saw
    // it, and it would be gone by the time they opened the app on a phone.
    // offsetParent is null precisely when an ancestor is display:none.
    if (navRef.current && navRef.current.offsetParent === null) return;
    const timer = setTimeout(dismissDollyTip, DOLLY_TIP_MS);
    return () => clearTimeout(timer);
  }, [showDollyTip, dismissDollyTip]);

  return (
    <nav
      ref={navRef}
      className="lg:hidden flex-shrink-0 relative"
      aria-label="Main navigation"
      style={{ backgroundColor: "#1a2818" }}
    >
      {/* First-visit strip introducing Dolly. In flow above the tabs — never an
          overlay — with a pointer sitting in the tab row's top padding so it
          still reads as belonging to the Dolly tab. */}
      {showDollyTip && (
        <button
          onClick={dismissDollyTip}
          className="relative flex w-full items-center gap-2 px-4 py-2 text-left active:opacity-80 transition-opacity"
          style={{ background: "var(--plum)", borderTop: "1px solid rgba(201,169,97,0.35)", borderBottom: "1px solid rgba(201,169,97,0.35)" }}
          aria-label="Dismiss Dolly tip"
        >
          <span className="text-[13px] leading-none" style={{ color: "var(--brass-light)" }} aria-hidden="true">✦</span>
          <span className="flex-1 text-[11px] leading-snug" style={{ color: "rgba(240,230,210,0.85)" }}>
            <span className="font-semibold" style={{ color: "#f0e6d2" }}>Meet Dolly</span>
            {" — your AI astrology guide. Ask her about your chart, love, or timing."}
          </span>
          <span className="text-[10px] shrink-0" style={{ color: "var(--brass-light)" }}>Dismiss</span>
          {/* pointer — decorative only, so a tap near the Dolly tab still opens it */}
          <span
            className="absolute w-2 h-2 rotate-45 pointer-events-none"
            style={{ bottom: -5, right: 35, background: "var(--plum)", borderRight: "1px solid rgba(201,169,97,0.35)", borderBottom: "1px solid rgba(201,169,97,0.35)" }}
            aria-hidden="true"
          />
        </button>
      )}

      <div
        className="flex items-center justify-around max-w-lg mx-auto px-2 pt-2"
        style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      >
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href) ||
            (tab.also?.some(r => pathname.startsWith(r)) ?? false);

          return (
            <Link
              key={tab.name}
              href={tab.href}
              onClick={() => {
                // Dispatch reset event so pages can clear their sub-view state
                window.dispatchEvent(new CustomEvent("nav:tab-tap", { detail: tab.href }));
                if (tab.href === "/dolly") dismissDollyTip();
              }}
              className="flex flex-col items-center gap-0.5 py-1.5 px-2 min-w-[44px] transition-all duration-200"
            >
              <span
                className="text-[18px] leading-none transition-all duration-200"
                style={{ color: isActive ? "#c9a961" : "rgba(240, 230, 210, 0.62)" }}
              >
                {tab.glyph}
              </span>
              <span
                className="text-[9px] tracking-[0.08em] font-medium transition-all duration-200"
                style={{ color: isActive ? "#c9a961" : "rgba(240, 230, 210, 0.62)" }}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
