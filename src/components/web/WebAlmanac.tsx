"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * WebAlmanac — the day in depth (design_handoff_mapped_web "Almanac").
 * Plum hero, good-for / hold-off columns, an "Explore the day" 2×2 grid, and a
 * sticky sidebar (coming up · panchang · born-on-this-day).
 *
 * Everything is computed for today from the same libraries the mobile almanac
 * uses. This page used to fall back to the design prototype's sample day (July
 * 1, a Scorpio Moon, "planting 8/10", Antares) until the live values arrived,
 * and kept some of it for good. Now a section shows a short loading line, or
 * is left out when there is nothing real to put in it.
 *
 * Known gap: sunrise/sunset come from getTodaySky without coordinates, so they
 * are for the library's default location, not the viewer's (useLiveSky).
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PanchangGrid from "@/components/PanchangGrid";
import WebShell, { useWebTheme } from "./WebShell";
import HappeningNow from "@/components/almanac/HappeningNow";
import { useLiveSky } from "./useLiveSky";
import { getOnThisDay } from "@/lib/onThisDay";
import { getMoonPhase } from "@/lib/celestialCalendar";
import { getPlantingCalendar } from "@/lib/gardeningAlmanac";
import { getUniversalBiteForecast } from "@/lib/fishingForecast";

const VS = "\uFE0E";

const SIGN_GLYPH: Record<string, string> = {
  Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A", Cancer: "\u264B", Leo: "\u264C", Virgo: "\u264D",
  Libra: "\u264E", Scorpio: "\u264F", Sagittarius: "\u2650", Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
};

const LOADING = "Reading today’s sky…";

/** The zone the mobile almanac saved on this device, else its own default. */
function savedGardenZone(): string {
  try { return localStorage.getItem("mapped:garden-zone") || "8b"; } catch { return "8b"; }
}

/** Short per-item reason for the live good-for list, from the day's Moon sign + phase. */
function liveGoodReason(moonSign: string, moonLabel: string, i: number): string {
  const t = [
    `The ${moonSign} Moon leans this way — the ${moonLabel.toLowerCase()} phase gives it momentum.`,
    `Well-timed under a ${moonLabel.toLowerCase()} Moon in ${moonSign}.`,
    `${moonSign} energy favors it; today's sky adds follow-through.`,
    `A natural fit while the Moon moves through ${moonSign}.`,
    `The ${moonLabel.toLowerCase()} Moon builds quiet support for this all day.`,
  ];
  return t[i % t.length];
}

/** Short per-item reason for the live hold-off list. */
function liveHoldReason(moonSign: string, moonLabel: string, i: number): string {
  const t = [
    `The ${moonSign} Moon pulls the other way — give it a day or two.`,
    `Poorly timed under a ${moonLabel.toLowerCase()} Moon in ${moonSign}; it tends to unravel.`,
    `${moonSign} energy works against this today — wait for a friendlier sky.`,
  ];
  return t[i % t.length];
}

/** Muted sub-line for a live coming-up event, derived from its title. */
function upcomingSub(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("new moon")) return "A reset — set one intention for the cycle ahead.";
  if (t.includes("moon")) return "A culmination — what you tend now ripens.";
  if (t.includes("season")) return "The sky changes sign — a shift in the day's tone.";
  if (t.includes("equinox")) return "Day and night in balance — a seasonal hinge.";
  if (t.includes("solstice")) return "The year turns — light at its extreme.";
  if (t.includes("meteor") || t.includes("shower")) return "Look up after midnight for the best of it.";
  return "One to mark on the calendar.";
}

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
  // Set after mount: this page is prerendered, and the panchang depends on the
  // viewer's clock and timezone.
  const [panchangAt, setPanchangAt] = useState<Date | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPanchangAt(new Date()); }, []);
  const { theme, toggle } = useWebTheme();
  const stars = useMemo(() => heroStars(90210), []);
  const sky = useLiveSky();

  const sunTimes = sky
    ? [{ label: "Sunrise", val: sky.sunrise }, { label: "Sunset", val: sky.sunset }, { label: "Daylight", val: sky.daylight }]
    : [{ label: "Sunrise", val: "—" }, { label: "Sunset", val: "—" }, { label: "Daylight", val: "—" }];
  const goodCol = sky
    ? { sub: sky.goodFor.why, items: sky.goodFor.activities.map((a, i) => ({ activity: a, reason: liveGoodReason(sky.moonSign, sky.moonLabel, i) })) }
    : { sub: LOADING, items: [] };
  const holdCol = sky
    ? { sub: sky.holdOff.reason, items: sky.holdOff.activities.map((a, i) => ({ activity: a, reason: liveHoldReason(sky.moonSign, sky.moonLabel, i) })) }
    : { sub: LOADING, items: [] };
  const comingUp = sky ? sky.comingUp.map((u) => ({ day: u.day, mon: u.mon, title: u.title, sub: upcomingSub(u.title) })) : [];

  // "Explore the day" — only what the mobile almanac actually computes: the
  // planting verdict (lib/gardeningAlmanac) and the solunar bite windows
  // (lib/fishingForecast). The old "In your body" and "Visible tonight" cards
  // were fixed text with nothing behind them, so they are gone.
  const explore = useMemo(() => {
    if (!sky) return [];
    const cards: { glyph: string; title: string; sub: string; body: string }[] = [];
    try {
      const phase = getMoonPhase(sky.date).phase;
      const cal = getPlantingCalendar(sky.date, sky.moonSign, phase, undefined, savedGardenZone());
      const v = cal.todayVerdict;
      cards.push({ glyph: "⚘", title: "In the garden", sub: `${v.crop} · ${v.score}/10 · zone ${cal.zone}`, body: v.bestFor });
    } catch { /* leave the card out */ }
    try {
      const bite = getUniversalBiteForecast(sky.date);
      const windows = bite.biteWindows.slice(0, 2).map((w) => `${w.type === "major" ? "Major" : "Minor"} ${w.start}–${w.end} (${w.label.toLowerCase()})`);
      if (windows.length > 0) {
        cards.push({ glyph: "♒", title: "On the water", sub: `${bite.moonPhaseLabel} · Moon in ${bite.moonSign}`, body: `Solunar bite windows today: ${windows.join("; ")}.` });
      }
    } catch { /* leave the card out */ }
    return cards;
  }, [sky]);

  // "Born on this day" — birth entries from the on-this-day archive. The card
  // is left out when there are none, rather than showing somebody else's day.
  const liveBirths = useMemo(() => {
    if (!sky) return [];
    return getOnThisDay(sky.date)
      .filter((e) => e.event.includes(" is born"))
      .slice(0, 4)
      .map((e) => {
        const name = e.event.split(" is born")[0];
        const words = name.split(/\s+/).filter(Boolean);
        const initials = (words.length > 1 ? words[0][0] + words[words.length - 1][0] : name.slice(0, 2)).toUpperCase();
        return { initials, name, note: e.astroNote, year: String(e.year) };
      });
  }, [sky]);
  const born = sky && liveBirths.length > 0
    ? { head: `Born on ${sky.date.toLocaleDateString("en-US", { month: "long", day: "numeric" })} · ${sky.sabian.sign} ${(SIGN_GLYPH[sky.sabian.sign] ?? "") + VS}`, rows: liveBirths }
    : null;

  return (
    <WebShell current="almanac" theme={theme} onToggleTheme={toggle} footerTagline="Read the sky, then trust yourself.">
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "44px 32px 20px" }}>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--muted)", margin: "0 0 18px" }}><Link href="/home" style={{ color: "var(--muted)" }}>Home</Link> &nbsp;/&nbsp; Almanac</p>

        {/* Whatever the sky is in the middle of, for as long as it lasts. The
            home banner can be dismissed; the almanac keeps it. Desktop needs
            its own mount because WebAlmanac is a separate page from the mobile
            AlmanacPageContent. */}
        <HappeningNow />

        {/* HERO */}
        <div className="mp-night" style={{ position: "relative", overflow: "hidden", borderRadius: 26, border: "1px solid var(--hair)", background: "radial-gradient(120% 100% at 78% 0%, #3a2233 0%, #17111f 62%)", boxShadow: "0 20px 60px var(--shadow)", padding: "46px 48px", display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "center" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{stars.map((st, i) => <span key={i} style={st} />)}</div>
          <div style={{ position: "relative" }}>
            <p style={{ fontFamily: "var(--script)", fontSize: 32, color: "var(--brass-hi)", margin: "0 0 2px" }}>{sky?.weekday ?? " "}</p>
            <h1 style={{ fontFamily: "var(--deco)", fontWeight: 400, fontSize: 52, letterSpacing: "0.02em", lineHeight: 1, margin: "0 0 8px", color: "#f3ecd8" }}>{sky?.longDate ?? "Today"}</h1>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, color: "#d8c285", margin: "14px 0 8px" }}>{sky ? `${sky.moonLabel} · ${sky.illumination}% · Moon in ${sky.moonSign}` : LOADING}</p>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: "#cdc1a8", margin: "0 0 24px", maxWidth: 440, textWrap: "pretty" }}>{sky?.moonSignTheme ?? " "}</p>
            <div style={{ display: "flex", maxWidth: 420, borderTop: "0.5px solid rgba(201,169,97,0.24)", paddingTop: 18 }}>
              {sunTimes.map((t, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? "0.5px solid rgba(201,169,97,0.18)" : "none" }}>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a89a7e", margin: "0 0 4px" }}>{t.label}</p>
                  <p style={{ fontFamily: "var(--deco)", fontSize: 19, color: "#f3ecd8", margin: 0 }}>{t.val}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative", width: 250, height: 250 }}>
            <div style={{ position: "absolute", inset: -20, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,223,196,0.28), transparent 66%)" }} />
            {sky && <img src={sky.moonImg} alt={sky.moonLabel} style={{ position: "relative", width: 250, height: 250, objectFit: "contain", filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.5))", animation: "mp-floaty 8s ease-in-out infinite" }} />}
          </div>
        </div>

        {/* V/C — only when the Moon is actually void of course today */}
        {/* (It used to render while loading too, with a made-up "2:32 pm".) */}
        {sky?.vocSummary && (
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 14, padding: "13px 18px", borderRadius: 14, background: "color-mix(in srgb, var(--terra) 9%, var(--card))", border: "1px solid color-mix(in srgb, var(--terra) 22%, transparent)" }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 6, background: "color-mix(in srgb, var(--brass) 18%, transparent)", color: "var(--brass)" }}>V/C</span>
            <span style={{ fontSize: 14, color: "var(--fg2)" }}>{sky.vocSummary} — traditionally a pause before it enters {sky.vocNextSign}.</span>
          </div>
        )}

        {/* BODY GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, marginTop: 36, alignItems: "start" }}>
          {/* MAIN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Degree image (written for Mapped; not the Sabian set) */}
            <div style={{ ...card, padding: "30px 32px" }}>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass)", margin: "0 0 14px" }}>{sky ? `${sky.sabian.sign} ${sky.sabian.degree}° · Today’s degree image` : "Today’s degree image"}</p>
              <p style={{ fontFamily: "var(--deco)", fontStyle: "italic", fontSize: 26, lineHeight: 1.35, color: "var(--fg)", margin: "0 0 14px", textWrap: "pretty" }}>{sky ? `“${sky.sabian.symbol}”` : LOADING}</p>
              {sky && <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--muted)", margin: 0, textWrap: "pretty" }}>{sky.sabian.keynote}</p>}
            </div>

            {/* good / hold */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {[{ h: "Good for today", sub: goodCol.sub, list: goodCol.items, dot: "var(--go)", fg: "var(--fg)" },
                { h: "Hold off on", sub: holdCol.sub, list: holdCol.items, dot: "var(--terra)", fg: "var(--fg2)" }].map((col) => (
                <div key={col.h} style={{ ...card, padding: "26px 26px 8px" }}>
                  <h2 style={{ fontFamily: "var(--deco)", fontSize: 24, fontWeight: 500, letterSpacing: "0.02em", margin: "0 0 4px", color: "var(--fg)" }}>{col.h}</h2>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--faint)", margin: "0 0 12px", textWrap: "pretty" }}>{col.sub}</p>
                  {col.list.map((it) => (
                    <div key={it.activity} style={{ padding: "14px 0", borderTop: "0.5px solid var(--line)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 5 }}>
                        <span style={{ width: 7, height: 7, flex: "0 0 auto", borderRadius: "50%", background: col.dot, boxShadow: `0 0 0 4px color-mix(in srgb, ${col.dot} 18%, transparent)` }} />
                        <span style={{ fontSize: 15.5, fontWeight: 600, color: col.fg }}>{it.activity}</span>
                      </div>
                      <p style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, lineHeight: 1.55, color: "var(--muted)", margin: "0 0 0 18px", textWrap: "pretty" }}>{it.reason}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* explore — only the cards that could be computed */}
            {explore.length > 0 && <div>
              <h2 style={{ fontFamily: "var(--deco)", fontSize: 30, fontWeight: 400, margin: "6px 0 18px", color: "var(--fg)" }}>Explore the day</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {explore.map((e) => (
                  <div key={e.title} style={{ ...card, boxShadow: "0 4px 16px var(--shadow)", padding: "24px 24px 26px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
                      <span style={{ width: 38, height: 38, borderRadius: 10, background: "color-mix(in srgb, var(--brass) 14%, transparent)", border: "1px solid var(--hair)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brass)", fontSize: 19 }}>{e.glyph + VS}</span>
                      <div>
                        <p style={{ fontFamily: "var(--deco)", fontSize: 19, fontWeight: 500, margin: 0, color: "var(--fg)" }}>{e.title}</p>
                        <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--faint)", margin: "1px 0 0" }}>{e.sub}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--fg2)", margin: 0, textWrap: "pretty" }}>{e.body}</p>
                  </div>
                ))}
              </div>
            </div>}
          </div>

          {/* SIDEBAR */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 22, position: "sticky", top: 96 }}>
            <div style={{ ...card, boxShadow: "0 4px 16px var(--shadow)", padding: 24 }}>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass)", margin: "0 0 16px" }}>Coming up</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {comingUp.length === 0 && (
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--muted)", margin: 0 }}>{sky ? "Nothing marked in the next few days." : LOADING}</p>
                )}
                {comingUp.map((u, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <span style={{ flex: "0 0 auto", width: 42, textAlign: "center" }}>
                      <span style={{ display: "block", fontFamily: "var(--deco)", fontSize: 19, fontWeight: 600, lineHeight: 1, color: "var(--brass)" }}>{u.day}</span>
                      <span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--faint)" }}>{u.mon}</span>
                    </span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)", margin: "0 0 2px" }}>{u.title}</p>
                      {u.sub && <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, lineHeight: 1.45, color: "var(--muted)", margin: 0 }}>{u.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...card, boxShadow: "0 4px 16px var(--shadow)", padding: 24 }}>
              {panchangAt
                ? <PanchangGrid at={panchangAt} tone="web" />
                : <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass)", margin: 0 }}>Panchang today</p>}
            </div>
            {born && <div style={{ ...card, boxShadow: "0 4px 16px var(--shadow)", padding: 24 }}>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass)", margin: "0 0 4px" }}>{born.head}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                {born.rows.map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 32, height: 32, flex: "0 0 auto", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--deco)", fontSize: 13, fontWeight: 600, background: "color-mix(in srgb, var(--brass) 14%, transparent)", color: "var(--brass)" }}>{b.initials}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg)", margin: 0 }}>{b.name}</p>
                      <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--muted)", margin: 0 }}>{b.note}</p>
                    </div>
                    <span style={{ fontFamily: "var(--deco)", fontSize: 13, color: "var(--faint)" }}>{b.year}</span>
                  </div>
                ))}
              </div>
            </div>}
            {/* No sign-up card: this page only renders for a signed-in person
                (the (tabs) layout sends everyone else to /welcome). */}
          </aside>
        </div>

        <p style={{ fontSize: 13, lineHeight: 1.6, margin: "44px auto 0", maxWidth: 520, textAlign: "center", color: "var(--faint)", textWrap: "pretty" }}>An almanac is a companion, not a rulebook. Read the sky, then trust yourself.</p>
      </div>
    </WebShell>
  );
}
