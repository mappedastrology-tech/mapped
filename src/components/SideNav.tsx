"use client";

/**
 * SideNav — the desktop-only left navigation rail (lg+ screens).
 *
 * Replaces the mobile BottomNav + TopBar chrome on wide screens: the logo,
 * the six primary tabs, the "more" destinations that live in the mobile
 * hamburger menu, and a footer with the profile link + theme toggle. Hidden
 * below lg (where BottomNav/TopBar take over).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

interface Item { name: string; href: string; glyph: string; also?: string[] }

const PRIMARY: Item[] = [
  { name: "Home", href: "/home", glyph: "☉" },
  { name: "Almanac", href: "/almanac", glyph: "◇" },
  { name: "Chart", href: "/you", glyph: "◉" },
  { name: "Tarot", href: "/tarot", glyph: "✸" },
  { name: "Maps", href: "/maps", glyph: "✦" },
  { name: "Dolly", href: "/dolly", glyph: "✺" },
];

const MORE: Item[] = [
  { name: "Rituals", href: "/learn", glyph: "☾" },
  { name: "Journal", href: "/journal", glyph: "✎" },
  { name: "Library", href: "/library/reference", glyph: "❉" },
  { name: "Learn", href: "/library", glyph: "❦" },
  { name: "Palmistry", href: "/palmistry", glyph: "✋︎" },
  { name: "Human Design", href: "/human-design", glyph: "⬡" },
  { name: "Numerology", href: "/numerology", glyph: "№" },
];

function NavItem({ item, active }: { item: Item; active: boolean }) {
  return (
    <Link
      href={item.href}
      onClick={() => window.dispatchEvent(new CustomEvent("nav:tab-tap", { detail: item.href }))}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
      style={active
        ? { background: "color-mix(in srgb, var(--brass) 14%, transparent)", color: "var(--brass)" }
        : { color: "var(--foreground-muted)" }}
    >
      <span className="w-5 text-center text-[16px] leading-none">{item.glyph}</span>
      <span className="text-[13.5px] font-medium">{item.name}</span>
    </Link>
  );
}

export default function SideNav() {
  const pathname = usePathname();
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    const read = () => { try { setPhoto(localStorage.getItem("mapped:profile-photo")); } catch { /* ignore */ } };
    read();
    window.addEventListener("mapped:profile-photo", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("mapped:profile-photo", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  // Most-specific match wins, so /library/reference lights "Library" not "Learn".
  const allHrefs = [...PRIMARY, ...MORE].map((i) => i.href);
  const activeHref = allHrefs
    .filter((h) => pathname === h || pathname.startsWith(h + "/"))
    .sort((a, b) => b.length - a.length)[0] ?? "";

  const toggleTheme = () => {
    const html = document.documentElement;
    const next = html.getAttribute("data-theme") === "light" ? "dark" : "light";
    html.setAttribute("data-theme", next);
    try { localStorage.setItem("mapped:theme", next); } catch { /* ignore */ }
  };

  return (
    <aside
      className="hidden lg:flex flex-col shrink-0 w-64 h-dvh sticky top-0"
      style={{ background: "var(--background-card)", borderRight: "1px solid var(--border-card)" }}
      aria-label="Main navigation"
    >
      <div className="px-6 pt-6 pb-4">
        <Link href="/home" aria-label="Go to home page" className="inline-flex active:scale-95 transition-transform">
          <Logo size="sm" />
        </Link>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-3 pb-2">
        {PRIMARY.map((t) => <NavItem key={t.href} item={t} active={t.href === activeHref} />)}
        <div className="my-3 mx-3 h-px" style={{ background: "var(--border-card)" }} />
        <p className="px-3 mb-1 text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color: "var(--foreground-faint)" }}>More</p>
        {MORE.map((t) => <NavItem key={t.href} item={t} active={t.href === activeHref} />)}
      </nav>

      <div className="px-3 py-3 flex items-center gap-1" style={{ borderTop: "1px solid var(--border-card)" }}>
        <Link href="/profile" className="flex items-center gap-2.5 flex-1 px-3 py-2 rounded-xl transition-colors" style={{ color: "var(--foreground)" }} aria-label="Your profile">
          <span className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ border: "1.5px solid var(--brass)", background: "var(--card)" }}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="3.5" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
              </svg>
            )}
          </span>
          <span className="text-[13px] font-medium">Profile</span>
        </Link>
        <button onClick={toggleTheme} aria-label="Toggle theme" className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ color: "var(--brass)" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
