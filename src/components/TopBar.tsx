"use client";

/**
 * TopBar — appears at the top of every main tab screen.
 * Shows a hamburger menu on the left and the Mapped logo centered/right.
 * The menu drawer slides in from the left with: Journal, Store, Account Settings.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
  {
    label: "Journal",
    href: "/journal",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        <path d="M8 7h6M8 11h4" />
      </svg>
    ),
    description: "Daily pulls & reflections",
  },
  {
    label: "Almanac",
    href: "/almanac",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
    description: "Sky, moon & garden",
  },
  {
    label: "My Practice",
    href: "/practice",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    description: "Streaks, stats & patterns",
  },
  {
    label: "Account",
    href: "/account",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 1 0-16 0" />
      </svg>
    ),
    description: "Settings & profile",
  },
];

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm
                         border-b border-foreground/15">
        <div className="flex items-center justify-between max-w-lg mx-auto px-5 py-3">
          {/* Hamburger menu button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="w-9 h-9 rounded-full bg-card/50 border border-foreground/20
                       flex items-center justify-center
                       hover:bg-card/70 active:scale-95 transition-all"
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="var(--foreground)" strokeWidth="1.8" strokeLinecap="round"
                 style={{ opacity: 0.6 }}>
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          {/* App logo */}
          <Link href="/home" className="flex items-center">
            <Image
              src="/logo-terracotta-cropped.png"
              alt="Mapped"
              width={3789}
              height={1362}
              className="h-7 w-auto"
              priority
            />
          </Link>

          {/* Spacer to balance the hamburger on the left */}
          <div className="w-9" />
        </div>
      </header>

      {/* ─── Slide-out menu drawer ─── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 backdrop-blur-[2px] transition-opacity"
            style={{ backgroundColor: "var(--modal-overlay)" }}
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer panel */}
          <div
            className="fixed top-0 left-0 z-50 h-full w-72 bg-background shadow-2xl
                       flex flex-col animate-in slide-in-from-left duration-200"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/10">
              <Image
                src="/logo-terracotta-cropped.png"
                alt="Mapped"
                width={3789}
                height={1362}
                className="h-6 w-auto"
              />
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center
                           active:bg-foreground/10 transition-colors"
                aria-label="Close menu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Menu items */}
            <nav className="flex-1 px-3 py-4">
              {MENU_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3.5 px-3 py-3.5 rounded-xl transition-colors
                               ${isActive
                                 ? "bg-terracotta/10 text-terracotta"
                                 : "text-foreground/60 hover:bg-foreground/5 active:bg-foreground/8"
                               }`}
                  >
                    {item.icon}
                    <div>
                      <p className="text-[14px] font-medium">{item.label}</p>
                      <p className={`text-[11px] ${isActive ? "text-terracotta/50" : "text-foreground/30"}`}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-foreground/8">
              <p className="text-foreground/20 text-[10px] text-center">Mapped</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
