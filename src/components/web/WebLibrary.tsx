"use client";

/**
 * WebLibrary — learn astrology (design_handoff_mapped_web "Library").
 * A live drag-to-sort element game: drag each of the twelve sign chips into
 * Fire / Earth / Air / Water. Correct drops lock into the bucket; wrong drops
 * shake it. Progress persists to localStorage['mapped:web-elements'].
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WebShell, { useWebTheme } from "./WebShell";

// U+FE0E forces monochrome text (not color-emoji) rendering of zodiac glyphs.
const VS = "\uFE0E";

type El = "fire" | "earth" | "air" | "water";
const SIGNS: { id: string; glyph: string; name: string; el: El }[] = [
  { id: "aries", glyph: "♈", name: "Aries", el: "fire" },
  { id: "taurus", glyph: "♉", name: "Taurus", el: "earth" },
  { id: "gemini", glyph: "♊", name: "Gemini", el: "air" },
  { id: "cancer", glyph: "♋", name: "Cancer", el: "water" },
  { id: "leo", glyph: "♌", name: "Leo", el: "fire" },
  { id: "virgo", glyph: "♍", name: "Virgo", el: "earth" },
  { id: "libra", glyph: "♎", name: "Libra", el: "air" },
  { id: "scorpio", glyph: "♏", name: "Scorpio", el: "water" },
  { id: "sagittarius", glyph: "♐", name: "Sagittarius", el: "fire" },
  { id: "capricorn", glyph: "♑", name: "Capricorn", el: "earth" },
  { id: "aquarius", glyph: "♒", name: "Aquarius", el: "air" },
  { id: "pisces", glyph: "♓", name: "Pisces", el: "water" },
];
const BUCKETS: { el: El; name: string; icon: string; note: string; accent: string }[] = [
  { el: "fire", name: "Fire", icon: "▲", note: "Spark, drive, instinct.", accent: "#c97a4a" },
  { el: "earth", name: "Earth", icon: "◼", note: "Body, patience, form.", accent: "#8a9a5b" },
  { el: "air", name: "Air", icon: "○", note: "Mind, words, connection.", accent: "#7d9cc0" },
  { el: "water", name: "Water", icon: "▽", note: "Feeling, depth, tides.", accent: "#6f8fb0" },
];
const TOPICS = [
  { glyph: "♈", title: "The Signs", desc: "All twelve, their elements, modes, rulers and the season each one belongs to.", count: "12 entries" },
  { glyph: "⌂", title: "The Houses", desc: "The twelve stages of life a chart is divided into, from self to the collective.", count: "12 entries" },
  { glyph: "☉", title: "The Planets", desc: "Sun through Pluto, plus the nodes and Chiron — what each one governs in you.", count: "13 entries" },
  { glyph: "△", title: "Aspects", desc: "The angles planets make to one another, and the tension or ease they create.", count: "8 entries" },
  { glyph: "☽", title: "Moon Phases", desc: "From new to full and back — what each phase asks of you and when to act.", count: "8 entries" },
  { glyph: "☄", title: "Transits", desc: "How today’s sky touches your birth chart, and the timing behind the mood.", count: "20+ entries" },
];

function panelStars(seed: number, n = 26): React.CSSProperties[] {
  let s = seed;
  const rand = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return Array.from({ length: n }, () => ({
    position: "absolute", left: `${(rand() * 100).toFixed(1)}%`, top: `${(rand() * 100).toFixed(1)}%`,
    width: `${(rand() * 1.6 + 0.5).toFixed(1)}px`, height: `${(rand() * 1.6 + 0.5).toFixed(1)}px`,
    borderRadius: "50%", background: "#e8dfc4", opacity: Number((rand() * 0.5 + 0.2).toFixed(2)),
    animation: `mp-tw ${(rand() * 3 + 2).toFixed(1)}s ease-in-out infinite`,
  }));
}

export default function WebLibrary() {
  const { theme, toggle } = useWebTheme();
  const [placed, setPlaced] = useState<Record<string, El>>({});
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<El | null>(null);
  const [wrong, setWrong] = useState<El | null>(null);
  const stars = useMemo(() => panelStars(51221), []);

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("mapped:web-elements") || "null");
      if (p && typeof p === "object") setPlaced(p);
    } catch { /* ignore */ }
  }, []);
  const save = (p: Record<string, El>) => { try { localStorage.setItem("mapped:web-elements", JSON.stringify(p)); } catch { /* */ } };

  const pool = SIGNS.filter((s) => !placed[s.id]);
  const placedCount = Object.keys(placed).length;

  const dropOn = (el: El, e: React.DragEvent) => {
    e.preventDefault();
    let id = drag;
    try { const d = e.dataTransfer.getData("text/plain"); if (d) id = d; } catch { /* */ }
    const sign = SIGNS.find((s) => s.id === id);
    if (!sign) { setOver(null); setDrag(null); return; }
    if (sign.el === el) {
      const np = { ...placed, [sign.id]: el };
      setPlaced(np); setOver(null); setDrag(null); setWrong(null); save(np);
    } else {
      setOver(null); setDrag(null); setWrong(el);
      setTimeout(() => setWrong((w) => (w === el ? null : w)), 450);
    }
  };
  const reset = () => { setPlaced({}); setDrag(null); setOver(null); setWrong(null); save({}); };

  return (
    <WebShell current="library" theme={theme} onToggleTheme={toggle} footerTagline="Learn it by heart.">
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "52px 32px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 40px" }}>
          <p style={{ fontFamily: "var(--script)", fontSize: 34, color: "var(--brass)", margin: "0 0 4px" }}>learn it by heart</p>
          <h1 style={{ fontFamily: "var(--deco)", fontWeight: 400, fontSize: 54, lineHeight: 1.05, margin: "0 0 14px", color: "var(--fg)" }}>The Library</h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--fg2)", margin: 0 }}>Astrology, explained plainly — every sign, house, planet and aspect. Start with the game below: drag each sign into its element.</p>
        </div>

        {/* ELEMENT GAME */}
        <div style={{ borderRadius: 26, overflow: "hidden", border: "1px solid var(--hair)", background: "linear-gradient(165deg, #3a2233, var(--card))", boxShadow: "0 20px 60px var(--shadow)", position: "relative" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>{stars.map((st, i) => <span key={i} style={st} />)}</div>
          <div style={{ position: "relative", padding: "34px 40px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass-hi)", margin: "0 0 8px" }}>The four elements · a game</p>
              <h2 style={{ fontFamily: "var(--deco)", fontWeight: 400, fontSize: 32, margin: 0, color: "#f3ecd8" }}>Sort every sign into its element</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "var(--deco)", fontSize: 30, fontWeight: 600, lineHeight: 1, margin: 0, color: "var(--brass)" }}>{placedCount}<span style={{ color: "var(--faint)", fontSize: 18 }}>/12</span></p>
                <p style={{ fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--faint)", margin: "2px 0 0" }}>placed</p>
              </div>
              <button onClick={reset} style={{ fontFamily: "var(--wbody)", fontSize: 12.5, fontWeight: 600, padding: "9px 17px", borderRadius: 999, cursor: "pointer", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", color: "#f3ecd8" }}>Reset</button>
            </div>
          </div>

          {/* pool */}
          <div style={{ position: "relative", margin: "8px 40px 4px", padding: "16px 16px 10px", borderRadius: 16, background: "rgba(0,0,0,0.22)", border: "1px dashed var(--hair)", minHeight: 76 }}>
            <p style={{ fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, color: "var(--faint)", margin: "0 0 12px" }}>Drag from here</p>
            {pool.length === 0 && <p style={{ fontFamily: "var(--deco)", fontStyle: "italic", fontSize: 18, color: "var(--go)", margin: "2px 0 8px" }}>✦ All twelve placed — beautifully done.</p>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {pool.map((c) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={(e) => { try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", c.id); } catch { /* */ } setDrag(c.id); }}
                  onDragEnd={() => setDrag(null)}
                  className={`mp-chip${drag === c.id ? " drag" : ""}`}
                  style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 15px 10px 12px", borderRadius: 13, cursor: "grab", background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "0 3px 10px rgba(0,0,0,0.3)", userSelect: "none" }}
                >
                  <span style={{ fontSize: 20, lineHeight: 1, color: "var(--brass)" }}>{c.glyph + VS}</span>
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: "var(--fg)" }}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* buckets */}
          <div style={{ position: "relative", padding: "16px 40px 40px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {BUCKETS.map((b) => {
              const chips = SIGNS.filter((s) => placed[s.id] === b.el);
              const cls = `mp-bucket${over === b.el ? " over" : ""}${wrong === b.el ? " wrong" : ""}`;
              return (
                <div
                  key={b.el}
                  onDragEnter={(e) => { e.preventDefault(); setOver(b.el); }}
                  onDragOver={(e) => { e.preventDefault(); try { e.dataTransfer.dropEffect = "move"; } catch { /* */ } if (over !== b.el) setOver(b.el); }}
                  onDragLeave={() => { if (over === b.el) setOver(null); }}
                  onDrop={(e) => dropOn(b.el, e)}
                  className={cls}
                  style={{ borderRadius: 18, padding: "16px 15px 18px", minHeight: 190, background: `color-mix(in srgb, ${b.accent} 7%, var(--card))`, border: `1px solid color-mix(in srgb, ${b.accent} 22%, transparent)`, transition: "box-shadow .2s ease, transform .12s ease" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: b.accent, background: `color-mix(in srgb, ${b.accent} 16%, transparent)`, fontSize: 15 }}>{b.icon}</span>
                    <span style={{ fontFamily: "var(--deco)", fontSize: 20, fontWeight: 600, color: "var(--fg)" }}>{b.name}</span>
                  </div>
                  <p style={{ fontSize: 11, lineHeight: 1.4, color: "var(--muted)", margin: "0 0 12px" }}>{b.note}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {chips.map((pc) => (
                      <div key={pc.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 11px", borderRadius: 11, background: `color-mix(in srgb, ${b.accent} 12%, var(--card))`, border: `1px solid color-mix(in srgb, ${b.accent} 26%, transparent)`, animation: "mp-pop .2s ease" }}>
                        <span style={{ fontSize: 16, color: b.accent }}>{pc.glyph + VS}</span>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg)", flex: 1 }}>{pc.name}</span>
                        <span style={{ color: b.accent, fontSize: 12 }}>✓</span>
                      </div>
                    ))}
                    {chips.length === 0 && (
                      <div style={{ padding: 12, borderRadius: 11, border: `1px dashed color-mix(in srgb, ${b.accent} 34%, transparent)`, textAlign: "center", fontSize: 11.5, color: "var(--faint)" }}>drop signs here</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BROWSE */}
        <div style={{ margin: "64px 0 20px" }}>
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 40px" }}>
            <h2 style={{ fontFamily: "var(--deco)", fontWeight: 400, fontSize: 40, margin: "0 0 12px", color: "var(--fg)" }}>Browse the whole library</h2>
            <p style={{ fontSize: 16, color: "var(--fg2)", margin: 0 }}>Plain-language entries on every building block of the chart.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {TOPICS.map((t) => (
              <Link key={t.title} href="/library" className="mp-card-lift" style={{ display: "block", borderRadius: 18, padding: "24px 24px 26px", background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "0 4px 16px var(--shadow)", color: "inherit" }}>
                <span style={{ display: "inline-flex", width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", fontSize: 22, color: "var(--brass)", background: "color-mix(in srgb, var(--brass) 14%, transparent)", marginBottom: 14 }}>{t.glyph + VS}</span>
                <h3 style={{ fontFamily: "var(--deco)", fontSize: 23, fontWeight: 500, margin: "0 0 6px", color: "var(--fg)" }}>{t.title}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--muted)", margin: "0 0 12px", textWrap: "pretty" }}>{t.desc}</p>
                <span style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, color: "var(--faint)" }}>{t.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </WebShell>
  );
}
