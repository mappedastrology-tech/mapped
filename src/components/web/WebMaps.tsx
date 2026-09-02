"use client";

/**
 * WebMaps — the relationship constellation (design_handoff_mapped_web "Maps").
 * A pannable 2400×1600 sky: "You" at the center with eight people orbiting,
 * connected by lines whose weight scales with compatibility. Drag to roam
 * (pointer events, clamped to bounds); a 5px threshold separates pan from tap,
 * and tapping a person opens a detail panel. Sample data mirrors the prototype.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import WebShell, { useWebTheme } from "./WebShell";
import { useConstellation } from "./useConstellation";

const SKY_W = 2400, SKY_H = 1600, VH = 620;
const DEFAULT_PAN = { x: -612, y: -490 };

const SAMPLE_YOU = { id: "you", name: "You", initials: "Y", rel: "The center", x: 1200, y: 800, signs: "Sun Cancer · Moon Pisces · Leo rising", color: "#c9a961" };
type Person = { id: string; name: string; initials: string; rel: string; x: number; y: number; color: string; score: number; connLabel: string; harm: number; chall: number; fated: number; signs: string; summary: string };
const SAMPLE_PEOPLE: Person[] = [
  { id: "maya", name: "Maya", initials: "M", rel: "Partner", x: 770, y: 560, color: "#b5654a", score: 92, connLabel: "Deeply woven", harm: 8, chall: 2, fated: 3, signs: "Sun Taurus · Moon Cancer · Scorpio rising", summary: "Your water Moons meet her earth Sun — you feel everything, she makes it safe to. A rare, steadying love; the work is letting her slower pace soothe rather than worry you." },
  { id: "priya", name: "Priya", initials: "P", rel: "Closest friend", x: 1660, y: 1080, color: "#c9a961", score: 88, connLabel: "Easy & bright", harm: 7, chall: 1, fated: 2, signs: "Sun Libra · Moon Gemini · Libra rising", summary: "Air to your water — she lifts you out of your depths and into the light. Conversations that run for hours. The friendship that feels like weather you both just live in." },
  { id: "theo", name: "Theo", initials: "T", rel: "Best friend", x: 1720, y: 600, color: "#c9a961", score: 84, connLabel: "Adventurous", harm: 6, chall: 2, fated: 2, signs: "Sun Sagittarius · Moon Aries · Gemini rising", summary: "Fire to your water makes steam — he pushes you past your comfort, you soften his edges. Great for travel and big plans, trickier when you both need looking-after at once." },
  { id: "rosa", name: "Rosa", initials: "R", rel: "Mother", x: 620, y: 900, color: "#7ba055", score: 81, connLabel: "Rooted", harm: 6, chall: 3, fated: 4, signs: "Sun Virgo · Moon Capricorn · Taurus rising", summary: "Earth holds your water. She is the ground you grew from — practical where you are tidal. The fated markers run deep here; old patterns, and the chance to gently rewrite them." },
  { id: "nadia", name: "Nadia", initials: "N", rel: "Mentor", x: 1180, y: 420, color: "#7d9cc0", score: 79, connLabel: "Elevating", harm: 6, chall: 2, fated: 3, signs: "Sun Capricorn · Moon Virgo · Scorpio rising", summary: "Saturn between your charts — she asks more of you than you’d ask of yourself, and you rise to it. Not always comfortable, always worth it. The teacher your chart called in." },
  { id: "jonah", name: "Jonah", initials: "J", rel: "Brother", x: 760, y: 1060, color: "#7ba055", score: 71, connLabel: "Spirited", harm: 5, chall: 4, fated: 2, signs: "Sun Aries · Moon Leo · Aries rising", summary: "Two strong currents — his fire, your water. You spark and you clash in equal measure. The love is never in question; the timing of who leads sometimes is." },
  { id: "sam", name: "Sam", initials: "S", rel: "Colleague", x: 1820, y: 860, color: "#988b78", score: 66, connLabel: "Complementary", harm: 5, chall: 3, fated: 1, signs: "Sun Gemini · Moon Aquarius · Virgo rising", summary: "All air, all ideas — brilliant at work, where you supply the feeling and they supply the frame. Keep it in the studio; the emotional registers don’t always meet." },
  { id: "lena", name: "Lena", initials: "L", rel: "Old friend", x: 1080, y: 1180, color: "#c9a961", score: 74, connLabel: "Enduring", harm: 5, chall: 2, fated: 3, signs: "Sun Pisces · Moon Scorpio · Cancer rising", summary: "A mirror — three water placements between you. You understand each other without speaking, which is a gift and, on heavy days, a riptide. Space keeps this one healthy." },
];

function ava(color: string, size: number, fs: number, breathe = false): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", justifyContent: "center", width: size, height: size, flex: "0 0 auto",
    borderRadius: "50%", fontFamily: "var(--deco)", fontWeight: 600, fontSize: fs, color,
    background: `color-mix(in srgb, ${color} 18%, #14101c)`, border: `2px solid color-mix(in srgb, ${color} 55%, transparent)`,
    boxShadow: "0 6px 18px rgba(0,0,0,0.45)", ...(breathe ? { animation: "mp-breathe 5s ease-in-out infinite" } : {}),
  };
}

/** "Eight" for 8, etc. — falls back to digits beyond twelve. */
function countWord(n: number): string {
  const words = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
  return words[n] ?? String(n);
}

function starField(seed: number): React.CSSProperties[] {
  let s = seed;
  const rand = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return Array.from({ length: 90 }, () => ({
    position: "absolute", left: `${(rand() * SKY_W).toFixed(0)}px`, top: `${(rand() * SKY_H).toFixed(0)}px`,
    width: `${(rand() * 1.7 + 0.5).toFixed(1)}px`, height: `${(rand() * 1.7 + 0.5).toFixed(1)}px`,
    borderRadius: "50%", background: "#fff", opacity: Number((rand() * 0.55 + 0.15).toFixed(2)),
    animation: `mp-tw ${(rand() * 3 + 2).toFixed(1)}s ease-in-out infinite`,
  }));
}

export default function WebMaps() {
  const { theme, toggle } = useWebTheme();
  const [pan, setPan] = useState(DEFAULT_PAN);
  const [dragging, setDragging] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [vw, setVw] = useState(1176);
  const vpRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const movedRef = useRef(false);
  const field = useMemo(() => starField(24680), []);

  // Real connections when the user has any; otherwise the sample constellation.
  const live = useConstellation();
  const people = live?.people ?? SAMPLE_PEOPLE;
  const you = live ? { ...SAMPLE_YOU, signs: live.you.signs } : SAMPLE_YOU;

  useEffect(() => {
    const measure = () => { if (vpRef.current) { const w = vpRef.current.clientWidth; if (w) setVw(w); } };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const clamp = (p: { x: number; y: number }) => {
    const minX = Math.min(0, vw - SKY_W), minY = VH - SKY_H;
    return { x: Math.max(minX, Math.min(0, p.x)), y: Math.max(minY, Math.min(0, p.y)) };
  };

  const onDown = (e: React.PointerEvent) => {
    movedRef.current = false;
    startRef.current = { px: e.clientX, py: e.clientY, ox: pan.x, oy: pan.y };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* */ }
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging || !startRef.current) return;
    const dx = e.clientX - startRef.current.px, dy = e.clientY - startRef.current.py;
    if (Math.abs(dx) + Math.abs(dy) > 5) movedRef.current = true;
    setPan(clamp({ x: startRef.current.ox + dx, y: startRef.current.oy + dy }));
  };
  const onUp = () => { if (dragging) setDragging(false); startRef.current = null; };

  const selYou = sel === "you";
  const selPerson = sel && sel !== "you" ? people.find((p) => p.id === sel) : null;
  const orbit = [...people].sort((a, b) => b.score - a.score);

  const nodeName: React.CSSProperties = { fontFamily: "var(--deco)", fontWeight: 600, color: "#f3ecd8", whiteSpace: "nowrap" };

  return (
    <WebShell current="maps" theme={theme} onToggleTheme={toggle} footerTagline="The people in your orbit.">
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "52px 32px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 30px" }}>
          <p style={{ fontFamily: "var(--script)", fontSize: 34, color: "var(--brass)", margin: "0 0 4px" }}>the people in your orbit</p>
          <h1 style={{ fontFamily: "var(--deco)", fontWeight: 400, fontSize: 54, lineHeight: 1.05, margin: "0 0 14px", color: "var(--fg)" }}>Your Constellation</h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--fg2)", margin: 0 }}>Everyone you love, mapped around you as a living constellation. Drag to roam your orbit, then tap anyone to see how your charts fit together.</p>
        </div>

        {/* VIEWER */}
        <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", border: "1px solid var(--hair)", boxShadow: "0 20px 60px var(--shadow)", background: "radial-gradient(130% 90% at 50% 30%, #3a2233 0%, #1a0f1c 46%, #0a0710 82%)" }}>
          <div
            ref={vpRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
            style={{ position: "relative", width: "100%", height: VH, overflow: "hidden", touchAction: "none", cursor: dragging ? "grabbing" : "grab" }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, width: SKY_W, height: SKY_H, transform: `translate(${pan.x}px, ${pan.y}px)`, transition: dragging ? undefined : "transform .5s cubic-bezier(.22,1,.36,1)" }}>
              <svg width={SKY_W} height={SKY_H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
                {people.map((p) => (
                  <line key={p.id} x1={you.x} y1={you.y} x2={p.x} y2={p.y} stroke="var(--brass)" strokeWidth={p.score >= 85 ? 1.6 : 1} strokeOpacity={(0.14 + p.score / 400).toFixed(2)} />
                ))}
              </svg>
              {field.map((st, i) => <span key={i} style={st} />)}
              {[{ ...you, isYou: true } as const, ...people.map((p) => ({ ...p, isYou: false }))].map((p) => {
                const size = p.isYou ? 78 : 58, fs = p.isYou ? 26 : 20;
                return (
                  <div
                    key={p.id}
                    className="mp-person"
                    onClick={() => { if (!movedRef.current) setSel(p.id); }}
                    style={{ position: "absolute", left: p.x, top: p.y, transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}
                  >
                    <span style={ava(p.color, size, fs, p.isYou)}>{p.initials}</span>
                    <span style={{ ...nodeName, fontSize: p.isYou ? 16 : 14 }}>{p.name}</span>
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: p.color, whiteSpace: "nowrap" }}>{p.rel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* hint */}
          <div style={{ position: "absolute", left: "50%", bottom: 18, transform: "translateX(-50%)", zIndex: 6, display: "flex", alignItems: "center", gap: 9, padding: "9px 16px", borderRadius: 999, background: "rgba(11,7,18,0.66)", backdropFilter: "blur(8px)", border: "1px solid var(--hair)", pointerEvents: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" /></svg>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "#d8c9a8", letterSpacing: "0.02em" }}>Drag to roam your orbit · tap a person</span>
          </div>
          <button onClick={() => setPan(DEFAULT_PAN)} aria-label="Recenter" style={{ position: "absolute", right: 18, bottom: 18, zIndex: 6, width: 44, height: 44, borderRadius: "50%", background: "rgba(11,7,18,0.66)", backdropFilter: "blur(8px)", border: "1px solid var(--hair)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brass)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>
          </button>

          {/* detail panel */}
          {(selYou || selPerson) && (
            <div style={{ position: "absolute", left: 18, top: 18, zIndex: 7, width: 308, padding: "24px 24px 26px", borderRadius: 18, background: "rgba(16,11,24,0.92)", backdropFilter: "blur(12px)", border: "1px solid var(--hair)", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
              <button onClick={() => setSel(null)} aria-label="Close" style={{ position: "absolute", top: 14, right: 14, width: 26, height: 26, borderRadius: "50%", border: "1px solid var(--hair)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>✕</button>
              <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
                <span style={ava(selYou ? you.color : selPerson!.color, 46, 18)}>{selYou ? "Y" : selPerson!.initials}</span>
                <div>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass)", margin: "0 0 2px" }}>{selYou ? you.rel : selPerson!.rel}</p>
                  <h3 style={{ fontFamily: "var(--deco)", fontSize: 24, fontWeight: 500, margin: 0, color: "#f3ecd8" }}>{selYou ? you.name : selPerson!.name}</h3>
                </div>
              </div>
              {selYou ? (
                <>
                  <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#d8cdb2", margin: "0 0 4px" }}>{you.signs}</p>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--muted)", margin: "8px 0 0", textWrap: "pretty" }}>This is you — the center of your constellation. Every connection here is measured against your chart.</p>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 62, height: 62, flex: "0 0 auto", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "color-mix(in srgb, var(--go) 14%, transparent)", border: "2px solid color-mix(in srgb, var(--go) 42%, transparent)" }}>
                      <span style={{ fontFamily: "var(--deco)", fontSize: 22, fontWeight: 600, lineHeight: 1, color: "var(--go)" }}>{selPerson!.score}</span>
                    </div>
                    <div>
                      <p style={{ fontFamily: "var(--deco)", fontStyle: "italic", fontSize: 18, color: "var(--go)", margin: "0 0 2px" }}>{selPerson!.connLabel}</p>
                      <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--muted)", margin: 0 }}>{selPerson!.signs}</p>
                    </div>
                  </div>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, margin: "0 0 14px" }}>
                    <span style={{ color: "var(--go)" }}>{selPerson!.harm} harmonious</span> · <span style={{ color: "var(--terra)" }}>{selPerson!.chall} challenging</span> · <span style={{ color: "var(--brass)" }}>{selPerson!.fated} fated</span>
                  </p>
                  <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "#d8cdb2", margin: 0, textWrap: "pretty" }}>{selPerson!.summary}</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* ORBIT LIST */}
        <div style={{ margin: "46px 0 20px" }}>
          <h2 style={{ fontFamily: "var(--deco)", fontWeight: 400, fontSize: 32, margin: "0 0 6px", color: "var(--fg)" }}>Your orbit</h2>
          <p style={{ fontSize: 14.5, color: "var(--muted)", margin: "0 0 22px" }}>{countWord(people.length)} {people.length === 1 ? "person" : "people"} mapped · sorted by how closely your charts weave together</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {orbit.map((o) => (
              <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", borderRadius: 16, background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "0 4px 14px var(--shadow)" }}>
                <span style={ava(o.color, 44, 17)}>{o.initials}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                    <span style={{ fontFamily: "var(--deco)", fontSize: 18, fontWeight: 500, color: "var(--fg)" }}>{o.name}</span>
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--faint)" }}>{o.rel}</span>
                  </div>
                  <div style={{ marginTop: 8, height: 6, borderRadius: 999, background: "var(--soft)", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: `${o.score}%`, borderRadius: 999, background: `linear-gradient(90deg, color-mix(in srgb, ${o.color} 60%, transparent), ${o.color})` }} />
                  </div>
                </div>
                <span style={{ fontFamily: "var(--deco)", fontSize: 22, fontWeight: 600, color: "var(--brass)", flex: "0 0 auto" }}>{o.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WebShell>
  );
}
