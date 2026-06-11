"use client";

/**
 * BottomNav — dark forest green constant navigation bar.
 *
 * 5 tabs: Today, Almanac, Practice, Chart, Places
 * Background is #1a2818 in both day and night modes — it's a constant.
 * Active item in brass with brass icon, inactive in muted cream.
 *
 * Practice combines the old Ritual + Tarot tabs under one roof.
 * Almanac is the forward-looking planner (day/week/month views).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  { name: "Practice", href: "/learn", glyph: "☽", also: ["/tarot"] },
  { name: "Maps", href: "/maps", glyph: "✦" },
  { name: "Dolly", href: "/dolly", glyph: "✺" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex-shrink-0"
      aria-label="Main navigation"
      style={{ backgroundColor: "#1a2818" }}
    >
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
              }}
              className="flex flex-col items-center gap-0.5 py-1.5 px-2 min-w-[44px] transition-all duration-200"
            >
              <span
                className="text-[18px] leading-none transition-all duration-200"
                style={{ color: isActive ? "#c9a961" : "rgba(240, 230, 210, 0.45)" }}
              >
                {tab.glyph}
              </span>
              <span
                className="text-[9px] tracking-[0.08em] font-medium transition-all duration-200"
                style={{ color: isActive ? "#c9a961" : "rgba(240, 230, 210, 0.45)" }}
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
