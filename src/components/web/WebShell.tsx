"use client";

/**
 * WebShell — the shared desktop/web chrome from design_handoff_mapped_web.
 * Sticky top-nav header, background texture + starfield, and footer
 * (full four-column on the marketing Home, compact one-row on feature pages).
 *
 * Theme (night|day) is unified with the app's single light/dark ThemeProvider:
 * app "dark" → web "night", "light" → "day". So the header toggle, the .mp-web
 * web tokens, and any wrapped mobile page (which reads the app's --background/
 * --foreground via the html data-theme) all stay in lockstep — one preference.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

export type WebNavKey =
  | "home" | "today" | "almanac" | "maps" | "library" | "journal" | "tarot" | "dolly";

const NAV: { label: string; href: string; key: WebNavKey }[] = [
  { label: "Today", href: "/home", key: "today" },
  { label: "Almanac", href: "/almanac", key: "almanac" },
  { label: "Maps", href: "/maps", key: "maps" },
  { label: "Library", href: "/library", key: "library" },
  { label: "Journal", href: "/journal", key: "journal" },
  { label: "Tarot", href: "/tarot", key: "tarot" },
  { label: "Ask Dolly", href: "/dolly", key: "dolly" },
];

// Deterministic PRNG so SSR and client render the same starfield (no hydration
// mismatch and no post-mount flash).
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeStars(n: number, seed: number) {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, () => {
    const x = (rand() * 100).toFixed(2);
    const y = (rand() * 100).toFixed(2);
    const s = (rand() * 1.6 + 0.6).toFixed(1);
    const o = (rand() * 0.5 + 0.2).toFixed(2);
    const d = (rand() * 3 + 2.4).toFixed(1);
    return {
      left: `${x}%`, top: `${y}%`, width: `${s}px`, height: `${s}px`,
      opacity: Number(o), animation: `mp-tw ${d}s ease-in-out infinite`,
    } as React.CSSProperties;
  });
}

/** Web night/day derived from the app's single light/dark theme. */
export function useWebTheme() {
  const { theme: appTheme, toggleTheme } = useTheme();
  return { theme: appTheme === "light" ? ("day" as const) : ("night" as const), toggle: toggleTheme };
}

function ThemeToggle({ theme, onToggle }: { theme: "night" | "day"; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      style={{
        width: 42, height: 42, borderRadius: "50%", border: "1px solid var(--hair)",
        background: "var(--soft)", cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "center", color: "var(--brass)", flex: "0 0 auto",
      }}
    >
      {theme === "night" ? (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

// The extra "self" tools that aren't part of the seven-item top nav live under
// the profile avatar's dropdown.
const PROFILE_LINKS = [
  { label: "Your chart", href: "/you" },
  { label: "Numerology", href: "/numerology" },
  { label: "Human Design", href: "/human-design" },
  { label: "Palmistry", href: "/palmistry" },
  { label: "Rituals", href: "/learn" },
];

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative", flex: "0 0 auto" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Your profile & tools"
        aria-expanded={open}
        style={{ width: 42, height: 42, borderRadius: "50%", border: "1px solid var(--hair)", background: "var(--soft)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brass)" }}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" /></svg>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 70 }} aria-hidden="true" />
          <div style={{ position: "absolute", right: 0, top: 50, zIndex: 71, minWidth: 200, padding: 8, borderRadius: 14, background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "0 16px 40px var(--shadow)" }}>
            {PROFILE_LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ display: "block", padding: "10px 12px", borderRadius: 9, fontSize: 14, fontWeight: 500, color: "var(--fg2)" }}>
                {l.label}
              </Link>
            ))}
            <div style={{ height: 1, background: "var(--line)", margin: "6px 4px" }} />
            <Link href="/profile" onClick={() => setOpen(false)} style={{ display: "block", padding: "10px 12px", borderRadius: 9, fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>
              Profile &amp; settings
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function Wordmark({ size = 30 }: { size?: number }) {
  return (
    <Link href="/" style={{ fontFamily: "var(--deco)", fontSize: size, letterSpacing: "-0.01em", color: "var(--fg)", flex: "0 0 auto" }}>
      <span style={{ fontStyle: "italic", fontWeight: 400 }}>mapp</span>
      <span style={{ fontWeight: 700 }}>ed.</span>
    </Link>
  );
}

export default function WebShell({
  current,
  variant = "app",
  theme,
  onToggleTheme,
  footerTagline,
  children,
}: {
  current: WebNavKey;
  variant?: "marketing" | "app";
  theme: "night" | "day";
  onToggleTheme: () => void;
  footerTagline?: string;
  children: React.ReactNode;
}) {
  const stars = useMemo(() => makeStars(40, 20260710), []);

  return (
    <div
      className="mp-web"
      data-theme={theme}
      style={{
        fontFamily: "var(--wbody)", background: "var(--bg)", color: "var(--fg)",
        minHeight: "100vh", position: "relative", overflowX: "hidden",
      }}
    >
      {/* texture + starfield */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: "var(--felt)", backgroundSize: "340px", opacity: "var(--felt-op)", mixBlendMode: "soft-light" }} />
      <div aria-hidden="true" style={{ position: "absolute", inset: "0 0 auto 0", height: 1200, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {stars.map((st, i) => (
          <span key={i} style={{ position: "absolute", borderRadius: "50%", background: "var(--brass-hi)", ...st }} />
        ))}
      </div>

      {/* ===== HEADER ===== */}
      <header style={{ position: "sticky", top: 0, zIndex: 60, backdropFilter: "blur(14px)", background: "var(--topbar)", borderBottom: "1px solid var(--hair)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", height: 76, display: "flex", alignItems: "center", gap: 28 }}>
          <Wordmark />
          <nav style={{ display: "flex", alignItems: "center", gap: 26, marginLeft: 14, flex: 1 }}>
            {NAV.map((n) => (
              <Link key={n.key} href={n.href} className="mp-nav-link" style={{ fontSize: 14.5, fontWeight: 500, color: n.key === current ? "var(--fg)" : "var(--fg2)" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          {variant === "marketing" ? (
            <>
              <Link href="/onboarding" style={{ fontSize: 14, fontWeight: 600, color: "var(--fg2)", flex: "0 0 auto" }}>Log in</Link>
              <Link href="/onboarding" style={{ flex: "0 0 auto", fontSize: 14, fontWeight: 700, letterSpacing: "0.01em", padding: "11px 20px", borderRadius: 999, background: "var(--brass)", color: "var(--btn-ink)" }}>Start free</Link>
            </>
          ) : (
            <ProfileMenu />
          )}
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 10 }}>{children}</main>

      {/* ===== FOOTER ===== */}
      {variant === "marketing" ? <FullFooter /> : <CompactFooter tagline={footerTagline} />}
    </div>
  );
}

const FOOT_COLS = [
  { head: "Explore", links: [ { label: "Almanac", href: "/almanac" }, { label: "Maps", href: "/maps" }, { label: "Library", href: "/library" }, { label: "Tarot", href: "/tarot" } ] },
  { head: "Practice", links: [ { label: "Journal", href: "/journal" }, { label: "Ask Dolly", href: "/dolly" }, { label: "Rituals", href: "/learn" }, { label: "Numerology", href: "/numerology" } ] },
  { head: "Company", links: [ { label: "The app", href: "/" }, { label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "Log in", href: "/onboarding" } ] },
];

function FullFooter() {
  return (
    <footer style={{ position: "relative", zIndex: 10, borderTop: "1px solid var(--hair)", background: "var(--bg2)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "60px 32px 30px", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 36 }}>
        <div>
          <div style={{ fontFamily: "var(--deco)", fontSize: 28, color: "var(--fg)", marginBottom: 12 }}>
            <span style={{ fontStyle: "italic" }}>mapp</span><span style={{ fontWeight: 700 }}>ed.</span>
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--muted)", maxWidth: 260, margin: 0 }}>
            An almanac for the modern sky-watcher. Read the sky, then trust yourself.
          </p>
        </div>
        {FOOT_COLS.map((fc) => (
          <div key={fc.head}>
            <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "var(--faint)", margin: "0 0 16px" }}>{fc.head}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {fc.links.map((l) => (
                <Link key={l.label} href={l.href} style={{ fontSize: 13.5, color: "var(--fg2)" }}>{l.label}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "22px 32px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12.5, color: "var(--faint)" }}>© 2026 Mapped. Made under a waxing gibbous moon.</span>
        <div style={{ display: "flex", gap: 22 }}>
          <Link href="/privacy" style={{ fontSize: 12.5, color: "var(--faint)" }}>Privacy</Link>
          <Link href="/terms" style={{ fontSize: 12.5, color: "var(--faint)" }}>Terms</Link>
          <Link href="/" style={{ fontSize: 12.5, color: "var(--faint)" }}>Contact</Link>
        </div>
      </div>
    </footer>
  );
}

export function CompactFooter({ tagline = "Read the sky, then trust yourself." }: { tagline?: string }) {
  return (
    <footer style={{ position: "relative", zIndex: 10, borderTop: "1px solid var(--hair)", background: "var(--bg2)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "34px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12.5, color: "var(--faint)" }}>© 2026 Mapped · {tagline}</span>
        <Link href="/" style={{ fontSize: 13, fontWeight: 600, color: "var(--fg2)" }}>← Back to home</Link>
      </div>
    </footer>
  );
}
