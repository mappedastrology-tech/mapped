"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * WebAlmanac — the day in depth (design_handoff_mapped_web "Almanac").
 * Plum hero, good-for / hold-off columns, an "Explore the day" 2×2 grid, and a
 * sticky sidebar (coming up · born-on-this-day · email capture). Content mirrors
 * the prototype's sample data (bind to the real almanac backend later).
 */

import Link from "next/link";
import { useMemo } from "react";
import WebShell, { useWebTheme } from "./WebShell";
import { useLiveSky } from "./useLiveSky";

const VS = "\uFE0E";

const SUN_TIMES = [ { label: "Sunrise", val: "5:58" }, { label: "Sunset", val: "8:31" }, { label: "Daylight", val: "14h 33m" } ];
const GOOD_FOR = [
  { activity: "Deep conversations", reason: "The Scorpio Moon wants truth, not small talk. Words land deeper today." },
  { activity: "Research & investigation", reason: "Scorpio is the sign of what’s hidden. Follow a question past the obvious answer." },
  { activity: "Financial planning", reason: "Scorpio rules shared resources. Clear-eyed for budgets and debts — just don’t sign yet." },
  { activity: "Decluttering & releasing", reason: "The waxing-to-full arc makes this a strong day to clear what you’ve outgrown." },
  { activity: "Intimacy & repair", reason: "Emotional honesty comes easier now — a tender window to mend a rift." },
];
const HOLD_OFF = [
  { activity: "Big launches", reason: "With the Moon void this afternoon, fresh starts tend not to stick. Wait a day." },
  { activity: "Signing contracts", reason: "Void windows are traditionally poor for agreements — details get revised." },
  { activity: "Impulse purchases", reason: "Scorpio intensity plus a void Moon is a recipe for buyer’s remorse." },
];
const EXPLORE = [
  { glyph: "⚘", title: "In the garden", sub: "Strong planting day · 8/10", body: "The waxing gibbous Moon pulls energy into the leaves — ideal for above-ground, leafy crops. Water at dusk; hold heavy pruning until the Moon wanes." },
  { glyph: "♒", title: "On the water", sub: "Fishing good · best at dusk", body: "A water sign favors the bite. Major window 7:40–9:10 pm around moonrise; a minor window at dawn. Slow presentations near structure." },
  { glyph: "⚕", title: "In your body", sub: "Rest, replenish, reset", body: "A Scorpio Moon turns attention inward. Lean into long baths, early nights, and slow nourishing food; hold intense training for later in the week." },
  { glyph: "★", title: "Visible tonight", sub: "Antares · Saturn · the core", body: "Antares glows red just below the Moon after sunset. Saturn clears the east near midnight; the Milky Way core rises in the south after 11 pm." },
];
const UPCOMING = [
  { day: "9", mon: "Jul", title: "Full Moon in Capricorn", sub: "A culmination — what you tend now ripens." },
  { day: "12", mon: "Jul", title: "Mercury enters Leo", sub: "Bolder, warmer, more expressive words." },
  { day: "15", mon: "Jul", title: "Mars trine Jupiter", sub: "A lucky push for ambitious effort." },
];

function heroStars(seed: number, n = 26): React.CSSProperties[] {
  let s = seed;
  const rand = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return Array.from({ length: n }, () => ({
    position: "absolute", left: `${(rand() * 100).toFixed(1)}%`, top: `${(rand() * 100).toFixed(1)}%`,
    width: `${(rand() * 1.6 + 0.5).toFixed(1)}px`, height: `${(rand() * 1.6 + 0.5).toFixed(1)}px`,
    borderRadius: "50%", background: "#e8dfc4", opacity: Number((rand() * 0.5 + 0.2).toFixed(2)),
    animation: `mp-tw ${(rand() * 3 + 2).toFixed(1)}s ease-in-out infinite`,
  }));
}

const card: React.CSSProperties = { borderRadius: 20, background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "0 4px 18px var(--shadow)" };

export default function WebAlmanac() {
  const { theme, toggle } = useWebTheme();
  const stars = useMemo(() => heroStars(90210), []);
  const sky = useLiveSky();

  const sunTimes = sky
    ? [{ label: "Sunrise", val: sky.sunrise }, { label: "Sunset", val: sky.sunset }, { label: "Daylight", val: sky.daylight }]
    : SUN_TIMES;
  const goodCol = sky ? { sub: sky.goodFor.why, items: sky.goodFor.activities } : { sub: "Timed to the Moon's sign & phase.", items: GOOD_FOR.map((g) => g.activity) };
  const holdCol = sky ? { sub: sky.holdOff.reason, items: sky.holdOff.activities } : { sub: "The void Moon asks for patience.", items: HOLD_OFF.map((h) => h.activity) };
  const comingUp = sky && sky.comingUp.length > 0
    ? sky.comingUp.map((u) => ({ day: u.day, mon: u.mon, title: u.title, sub: "" }))
    : UPCOMING;
  const onThisDay = sky ? sky.onThisDay : [];

  return (
    <WebShell current="almanac" theme={theme} onToggleTheme={toggle} footerTagline="Read the sky, then trust yourself.">
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "44px 32px 20px" }}>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 18px" }}><Link href="/home" style={{ color: "var(--muted)" }}>Home</Link> &nbsp;/&nbsp; Almanac</p>

        {/* HERO */}
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 26, border: "1px solid var(--hair)", background: "radial-gradient(120% 100% at 78% 0%, #3a2233 0%, #17111f 62%)", boxShadow: "0 20px 60px var(--shadow)", padding: "46px 48px", display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "center" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{stars.map((st, i) => <span key={i} style={st} />)}</div>
          <div style={{ position: "relative" }}>
            <p style={{ fontFamily: "var(--script)", fontSize: 32, color: "var(--brass-hi)", margin: "0 0 2px" }}>{sky?.weekday ?? "Wednesday"}</p>
            <h1 style={{ fontFamily: "var(--deco)", fontWeight: 400, fontSize: 52, letterSpacing: "0.02em", lineHeight: 1, margin: "0 0 8px", color: "#f3ecd8" }}>{sky?.longDate ?? "July 1, 2026"}</h1>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, color: "#d8c285", margin: "14px 0 8px" }}>{sky ? `${sky.moonLabel} · ${sky.illumination}% · Moon in ${sky.moonSign}` : "Waxing Gibbous · 73% · Moon in Scorpio"}</p>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: "#cdc1a8", margin: "0 0 24px", maxWidth: 440, textWrap: "pretty" }}>{sky?.moonSignTheme ?? "Depth over noise. A day that rewards focus, honesty, and finishing what you started — the Moon pulls attention inward and asks for the real thing."}</p>
            <div style={{ display: "flex", maxWidth: 420, borderTop: "0.5px solid rgba(201,169,97,0.24)", paddingTop: 18 }}>
              {sunTimes.map((t, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? "0.5px solid rgba(201,169,97,0.18)" : "none" }}>
                  <p style={{ fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a89a7e", margin: "0 0 4px" }}>{t.label}</p>
                  <p style={{ fontFamily: "var(--deco)", fontSize: 19, color: "#f3ecd8", margin: 0 }}>{t.val}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative", width: 250, height: 250 }}>
            <div style={{ position: "absolute", inset: -20, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,223,196,0.28), transparent 66%)" }} />
            <img src={sky?.moonImg ?? "/moons/waxing-gibbous.png"} alt={sky?.moonLabel ?? "Moon tonight"} style={{ position: "relative", width: 250, height: 250, objectFit: "contain", filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.5))", animation: "mp-floaty 8s ease-in-out infinite" }} />
          </div>
        </div>

        {/* V/C — only when the Moon is actually void of course today */}
        {(!sky || sky.vocStart) && (
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 14, padding: "13px 18px", borderRadius: 14, background: "color-mix(in srgb, var(--terra) 9%, var(--card))", border: "1px solid color-mix(in srgb, var(--terra) 22%, transparent)" }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 6, background: "color-mix(in srgb, var(--brass) 18%, transparent)", color: "var(--brass)" }}>V/C</span>
            <span style={{ fontSize: 14, color: "var(--fg2)" }}>Moon void of course from {sky?.vocStart ?? "2:32 pm"} — let new plans settle until tomorrow. Soft-launch today; go public then.</span>
          </div>
        )}

        {/* BODY GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, marginTop: 36, alignItems: "start" }}>
          {/* MAIN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Sabian */}
            <div style={{ ...card, padding: "30px 32px" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass)", margin: "0 0 14px" }}>{sky ? `${sky.sabian.sign} ${sky.sabian.degree}° · Today’s Sabian symbol` : "Cancer 10° · Today’s Sabian symbol"}</p>
              <p style={{ fontFamily: "var(--deco)", fontStyle: "italic", fontSize: 26, lineHeight: 1.35, color: "var(--fg)", margin: "0 0 14px", textWrap: "pretty" }}>“{sky?.sabian.symbol ?? "A large diamond in the first stages of the cutting process."}”</p>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--muted)", margin: 0, textWrap: "pretty" }}>{sky?.sabian.keynote ?? "Latent worth, not yet revealed. What looks rough today is being shaped into something brilliant — patience is the craft."}</p>
            </div>

            {/* good / hold */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {[{ h: "Good for today", sub: goodCol.sub, list: goodCol.items, dot: "var(--go)", fg: "var(--fg)" },
                { h: "Hold off on", sub: holdCol.sub, list: holdCol.items, dot: "var(--terra)", fg: "var(--fg2)" }].map((col) => (
                <div key={col.h} style={{ ...card, padding: "26px 26px 20px" }}>
                  <h2 style={{ fontFamily: "var(--deco)", fontSize: 24, fontWeight: 500, letterSpacing: "0.02em", margin: "0 0 4px", color: "var(--fg)" }}>{col.h}</h2>
                  <p style={{ fontSize: 12.5, color: "var(--faint)", margin: "0 0 12px", textWrap: "pretty" }}>{col.sub}</p>
                  {col.list.map((activity) => (
                    <div key={activity} style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 0", borderTop: "0.5px solid var(--line)" }}>
                      <span style={{ width: 7, height: 7, flex: "0 0 auto", borderRadius: "50%", background: col.dot, boxShadow: `0 0 0 4px color-mix(in srgb, ${col.dot} 18%, transparent)` }} />
                      <span style={{ fontSize: 15.5, fontWeight: 600, color: col.fg }}>{activity}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* explore */}
            <div>
              <h2 style={{ fontFamily: "var(--deco)", fontSize: 30, fontWeight: 400, margin: "6px 0 18px", color: "var(--fg)" }}>Explore the day</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {EXPLORE.map((e) => (
                  <div key={e.title} style={{ ...card, boxShadow: "0 4px 16px var(--shadow)", padding: "24px 24px 26px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
                      <span style={{ width: 38, height: 38, borderRadius: 10, background: "color-mix(in srgb, var(--brass) 14%, transparent)", border: "1px solid var(--hair)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brass)", fontSize: 19 }}>{e.glyph + VS}</span>
                      <div>
                        <p style={{ fontFamily: "var(--deco)", fontSize: 19, fontWeight: 500, margin: 0, color: "var(--fg)" }}>{e.title}</p>
                        <p style={{ fontSize: 11, color: "var(--faint)", margin: "1px 0 0" }}>{e.sub}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--fg2)", margin: 0, textWrap: "pretty" }}>{e.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 22, position: "sticky", top: 96 }}>
            <div style={{ ...card, boxShadow: "0 4px 16px var(--shadow)", padding: 24 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass)", margin: "0 0 16px" }}>Coming up</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {comingUp.map((u, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <span style={{ flex: "0 0 auto", width: 42, textAlign: "center" }}>
                      <span style={{ display: "block", fontFamily: "var(--deco)", fontSize: 19, fontWeight: 600, lineHeight: 1, color: "var(--brass)" }}>{u.day}</span>
                      <span style={{ display: "block", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--faint)" }}>{u.mon}</span>
                    </span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)", margin: "0 0 2px" }}>{u.title}</p>
                      {u.sub && <p style={{ fontSize: 12, lineHeight: 1.45, color: "var(--muted)", margin: 0 }}>{u.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {onThisDay.length > 0 && (
              <div style={{ ...card, boxShadow: "0 4px 16px var(--shadow)", padding: 24 }}>
                <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass)", margin: "0 0 4px" }}>On this day</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
                  {onThisDay.map((e, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ flex: "0 0 auto", width: 40, fontFamily: "var(--deco)", fontSize: 15, fontWeight: 600, color: "var(--brass)", lineHeight: 1.1 }}>{e.year}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, lineHeight: 1.4, fontWeight: 600, color: "var(--fg)", margin: "0 0 2px" }}>{e.event}</p>
                        <p style={{ fontSize: 11, lineHeight: 1.4, color: "var(--muted)", margin: 0 }}>{e.astroNote}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ padding: "26px 24px", borderRadius: 18, background: "linear-gradient(160deg, var(--card2), var(--card))", border: "1px solid var(--brass)", boxShadow: "0 8px 26px color-mix(in srgb, var(--brass) 18%, var(--shadow))" }}>
              <p style={{ fontFamily: "var(--deco)", fontSize: 19, fontWeight: 500, color: "var(--fg)", margin: "0 0 8px" }}>Get the day, every morning</p>
              <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--muted)", margin: "0 0 16px" }}>Your personal almanac, timed to your chart and delivered before coffee.</p>
              <Link href="/onboarding" style={{ display: "block", textAlign: "center", fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 999, background: "var(--brass)", color: "var(--btn-ink)" }}>Start free</Link>
            </div>
          </aside>
        </div>

        <p style={{ fontSize: 13, lineHeight: 1.6, margin: "44px auto 0", maxWidth: 520, textAlign: "center", color: "var(--faint)", textWrap: "pretty" }}>An almanac is a companion, not a rulebook. Read the sky, then trust yourself.</p>
      </div>
    </WebShell>
  );
}
