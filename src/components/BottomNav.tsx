"use client";

/**
 * BottomNav — dark forest green constant navigation bar.
 *
 * 6 tabs: Home, Almanac, Chart, Ritual, Maps, Dolly.
 * Background is #1a2818 in both day and night modes — it's a constant.
 * Active item in brass with brass icon, inactive in muted cream.
 *
 * "Ritual" (the old "Practice" tab) is the moon-work + tarot hub. The stats
 * page in the hamburger keeps the name "My Practice" — no more name collision.
 * On first run, a one-time tooltip introduces Dolly (the AI guide).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const DOLLY_TIP_KEY = "mapped:dolly-tip-seen";

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
  { name: "Ritual", href: "/learn", glyph: "☽", also: ["/tarot"] },
  { name: "Maps", href: "/maps", glyph: "✦" },
  { name: "Dolly", href: "/dolly", glyph: "✺" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [showDollyTip, setShowDollyTip] = useState(false);

  // One-time "meet Dolly" coachmark — only if they haven't seen it and aren't
  // already on the Dolly screen.
  useEffect(() => {
    try {
      if (localStorage.getItem(DOLLY_TIP_KEY) !== "1" && !pathname.startsWith("/dolly")) {
        setShowDollyTip(true);
      }
    } catch { /* localStorage unavailable */ }
  }, [pathname]);

  function dismissDollyTip() {
    setShowDollyTip(false);
    try { localStorage.setItem(DOLLY_TIP_KEY, "1"); } catch { /* ignore */ }
  }

  return (
    <nav
      className="flex-shrink-0 relative"
      aria-label="Main navigation"
      style={{ backgroundColor: "#1a2818" }}
    >
      {/* First-visit tooltip introducing Dolly, anchored above the Dolly tab */}
      {showDollyTip && (
        <div className="absolute right-2 z-50" style={{ bottom: "calc(100% + 10px)" }}>
          <button
            onClick={dismissDollyTip}
            className="relative block text-left rounded-2xl px-4 py-3 max-w-[240px] active:scale-[0.98] transition-transform"
            style={{ background: "var(--plum)", border: "1px solid rgba(201,169,97,0.45)", boxShadow: "0 10px 28px rgba(0,0,0,0.55)" }}
            aria-label="Dismiss Dolly tip"
          >
            <p className="text-[12px] font-semibold" style={{ color: "#f0e6d2" }}>✦ Meet Dolly</p>
            <p className="text-[11px] leading-snug mt-0.5" style={{ color: "rgba(240,230,210,0.8)" }}>
              Your AI astrology guide — ask her anything about your chart, love, or timing.
            </p>
            <p className="text-[10px] mt-1.5" style={{ color: "var(--brass-light)" }}>Tap to dismiss</p>
            {/* pointer */}
            <span
              className="absolute -bottom-1.5 w-3 h-3 rotate-45"
              style={{ right: 28, background: "var(--plum)", borderRight: "1px solid rgba(201,169,97,0.45)", borderBottom: "1px solid rgba(201,169,97,0.45)" }}
              aria-hidden="true"
            />
          </button>
        </div>
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
