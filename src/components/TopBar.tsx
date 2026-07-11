"use client";

/**
 * TopBar — appears at the top of every main tab screen.
 * Shows a hamburger menu on the left and the Mapped logo centered/right.
 * The menu drawer slides in from the left with: Journal, Store, Account Settings.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { fetchSetting } from "@/lib/syncedSettings";

const MENU_ITEMS = [
  {
    label: "Learn",
    href: "/library",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    description: "Courses, lessons & certificates",
  },
  {
    label: "Library",
    href: "/library/reference",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    description: "Look up cards, signs, crystals & herbs",
  },
  {
    label: "Journal",
    href: "/journal",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        <path d="M8 7h6M8 11h4" />
      </svg>
    ),
    description: "Daily pulls & reflections",
  },
  {
    label: "Rituals",
    href: "/learn",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13.5 3a7 7 0 1 0 7.5 10.5A6 6 0 0 1 13.5 3z" />
      </svg>
    ),
    description: "Daily rituals & moon work",
  },
  {
    label: "Palmistry",
    href: "/palmistry",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 11V6a1.5 1.5 0 0 0-3 0M15 6V4.5a1.5 1.5 0 0 0-3 0V6M12 6V5a1.5 1.5 0 0 0-3 0v7" />
        <path d="M9 12V8.5a1.5 1.5 0 0 0-3 0V14c0 3.5 2.5 6.5 6 6.5s6-2.8 6-6.5v-3" />
      </svg>
    ),
    description: "Read your palm",
  },
  {
    label: "Human Design",
    href: "/human-design",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="5" r="2.5" />
        <circle cx="12" cy="19" r="2.5" />
        <rect x="9.5" y="10" width="5" height="4" rx="1" />
        <path d="M12 7.5V10M12 14v2.5M7 12H4M20 12h-3" />
      </svg>
    ),
    description: "Your BodyGraph, Type & Strategy",
  },
  {
    label: "Numerology",
    href: "/numerology",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
      </svg>
    ),
    description: "Your life path & core numbers",
  },
  {
    label: "Account",
    href: "/account",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
  // Highlight only the most specific menu item, so /library/reference lights up
  // "Library" — not also "Learn" (which lives at the shorter /library prefix).
  const activeHref = MENU_ITEMS
    .map((i) => i.href)
    .filter((h) => pathname === h || pathname.startsWith(h + "/"))
    .sort((a, b) => b.length - a.length)[0] ?? "";
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Profile photo (base64 in localStorage) — kept in sync with the profile page.
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(() => {
    const read = () => {
      try { setPhoto(localStorage.getItem("mapped:profile-photo")); } catch { /* ignore */ }
    };
    read();
    window.addEventListener("mapped:profile-photo", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("mapped:profile-photo", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  // Hydrate the avatar from the account so it appears on a fresh device
  // even before the user opens the profile page.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id;
        if (!uid || cancelled) return;
        const acct = await fetchSetting(uid, "profile-photo");
        if (acct && !cancelled) {
          setPhoto(acct);
          try { localStorage.setItem("mapped:profile-photo", acct); } catch { /* ignore */ }
        }
      } catch { /* signed out / offline */ }
    })();
    return () => { cancelled = true; };
  }, []);

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

  // Focus trap for drawer
  useEffect(() => {
    if (!menuOpen) return;
    const dialog = drawerRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeMenu(); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    first?.focus();
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [menuOpen, closeMenu]);

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-sm
                         border-b border-foreground/15">
        <div className="flex items-center justify-between max-w-lg mx-auto px-5 py-3">
          {/* Hamburger menu button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="w-9 h-9 min-w-[44px] min-h-[44px] rounded-full bg-card/50 border border-foreground/20
                       flex items-center justify-center
                       hover:bg-card/70 active:scale-95 transition-all"
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="var(--foreground)" strokeWidth="1.8" strokeLinecap="round"
                 style={{ opacity: 0.6 }} aria-hidden="true">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          {/* App logo — tappable to go home */}
          <Link href="/home" className="flex items-center px-2 py-1 -mx-2 -my-1 rounded-lg active:scale-95 transition-transform" aria-label="Go to home page">
            <Logo size="sm" />
          </Link>

          {/* Theme toggle + profile avatar */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => {
                const html = document.documentElement;
                const current = html.getAttribute("data-theme");
                const next = current === "light" ? "dark" : "light";
                html.setAttribute("data-theme", next);
                try { localStorage.setItem("mapped:theme", next); } catch {}
              }}
              className="w-9 h-9 min-w-[40px] min-h-[44px] flex items-center justify-center rounded-full
                         active:scale-90 transition-transform"
              aria-label="Toggle theme"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </button>

            {/* Profile avatar */}
            <Link
              href="/profile"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Your profile"
            >
              <span
                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center"
                style={{ border: "1.5px solid var(--brass)", backgroundColor: "var(--card)" }}
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brass)"
                       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                  </svg>
                )}
              </span>
            </Link>
          </div>
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
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed top-0 left-0 z-50 h-full w-72 bg-background shadow-2xl
                       flex flex-col animate-in slide-in-from-left duration-200"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/10">
              <Link href="/home" onClick={() => setMenuOpen(false)} aria-label="Go to home page">
                <Logo size="sm" />
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 min-w-[44px] min-h-[44px] rounded-full bg-foreground/5 flex items-center justify-center
                           active:bg-foreground/10 transition-colors"
                aria-label="Close menu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Menu items */}
            <nav className="flex-1 px-3 py-4" aria-label="Site navigation">
              {MENU_ITEMS.map((item) => {
                const isActive = item.href === activeHref;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3.5 px-3 py-3.5 rounded-xl transition-colors
                               ${isActive
                                 ? "bg-terracotta/10 text-terracotta"
                                 : "text-secondary hover:bg-foreground/5 active:bg-foreground/8"
                               }`}
                  >
                    {item.icon}
                    <div>
                      <p className="text-[14px] font-medium">{item.label}</p>
                      <p className={`text-[11px] ${isActive ? "text-terracotta/50" : "text-muted"}`}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-foreground/8">
              <p className="text-muted text-[10px] text-center">Mapped</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
