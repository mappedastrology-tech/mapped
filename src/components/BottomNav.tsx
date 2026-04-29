"use client";

/**
 * BottomNav — the main navigation bar at the bottom of every screen.
 *
 * 5 tabs: Home, You, Maps, Tarot, Dolly
 * Highlights the active tab based on the current URL.
 * Fixed to the bottom of the screen on mobile.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    name: "Home",
    href: "/home",
    // Sun icon — represents daily energy
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.5"
           stroke={active ? "var(--terracotta)" : "var(--foreground-muted)"} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  {
    name: "You",
    href: "/you",
    // Chart/circle icon — represents your birth chart
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.5"
           stroke={active ? "var(--terracotta)" : "var(--foreground-muted)"} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="8" />
        <line x1="12" y1="16" x2="12" y2="22" />
        <line x1="2" y1="12" x2="8" y2="12" />
        <line x1="16" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    name: "Ritual",
    href: "/learn",
    // Moon/ritual icon — represents celestial calendar & rituals
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.5"
           stroke={active ? "var(--terracotta)" : "var(--foreground-muted)"} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        <path d="M12 17l-1.5-3H8l2.5-2L9 9l3 2 3-2-1.5 3 2.5 2h-2.5L12 17z" />
      </svg>
    ),
  },
  {
    name: "Maps",
    href: "/maps",
    // Connected nodes icon — represents family/relationship mapping
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.5"
           stroke={active ? "var(--terracotta)" : "var(--foreground-muted)"} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="3" />
        <circle cx="5" cy="19" r="3" />
        <circle cx="19" cy="19" r="3" />
        <line x1="12" y1="8" x2="5" y2="16" />
        <line x1="12" y1="8" x2="19" y2="16" />
      </svg>
    ),
  },
  {
    name: "Tarot",
    href: "/tarot",
    // Card icon — represents tarot cards
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.5"
           stroke={active ? "var(--terracotta)" : "var(--foreground-muted)"} strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <circle cx="12" cy="10" r="3" />
        <path d="M12 7l.7-2.1M12 13l-.7 2.1M9.1 9.3L7 8.6M14.9 10.7l2.1.7M9.1 10.7L7 11.4M14.9 9.3l2.1-.7" />
      </svg>
    ),
  },
  {
    name: "Dolly",
    href: "/dolly",
    // Sparkle/chat icon — represents AI life coach
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.5"
           stroke={active ? "var(--terracotta)" : "var(--foreground-muted)"} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
        <path d="M18 14l.75 2.25L21 17l-2.25.75L18 20l-.75-2.25L15 17l2.25-.75L18 14z" />
        <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-sm"
         style={{ backgroundColor: "var(--background)", opacity: 0.97, borderTop: "0.5px solid var(--border)" }}>
      {/* Safe area padding for phones with gesture bars (iPhone etc.) */}
      <div
        className="flex items-center justify-around max-w-lg mx-auto px-2 pt-2"
        style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      >
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="flex flex-col items-center gap-1 py-1 px-2 min-w-[44px]
                         transition-all duration-200"
            >
              {tab.icon(isActive)}
              <span
                className="text-[10px] tracking-wide transition-all duration-200 font-medium"
                style={{ color: isActive ? "var(--terracotta)" : "var(--foreground-muted)" }}
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
