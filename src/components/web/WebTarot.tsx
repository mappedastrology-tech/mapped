"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * WebTarot — drag-from-deck three-card spread (design_handoff_mapped_web "Tarot").
 * Drag the deck onto a slot to draw the next card from a shuffled order; the
 * card flips up and a plain-language reading builds below. State persists to
 * localStorage['mapped:web-tarot'].
 */

import { useEffect, useMemo, useState } from "react";
import WebShell, { useWebTheme } from "./WebShell";

type Card = [name: string, keyword: string, meaning: string];
const DECK: Card[] = [
  ["The Fool", "beginnings", "A leap of faith. Trust the open road even before you can see where it bends."],
  ["The Magician", "manifestation", "You have every tool you need. Focus your will and begin — the raw materials are already in your hands."],
  ["The High Priestess", "intuition", "The answer is beneath the surface. Go quiet and let what you already know rise up."],
  ["The Empress", "abundance", "Nurture what is growing. Creativity, comfort, and care are yours to give and to receive."],
  ["The Emperor", "structure", "Steady authority. Build the framework; discipline now buys freedom later."],
  ["The Hierophant", "tradition", "Lean on what is tested. A mentor, a system, or an old wisdom has something to teach you."],
  ["The Lovers", "union", "A meaningful choice about connection and values. Choose from the heart, with both eyes open."],
  ["The Chariot", "drive", "Willpower harnessed. Hold the reins of opposing forces and press forward with focus."],
  ["Strength", "courage", "Gentle power. You master the moment not by force but by patience and a steady heart."],
  ["The Hermit", "reflection", "Withdraw to hear yourself. The light you seek is the one you carry inward."],
  ["Wheel of Fortune", "change", "The cycle turns. What is down will rise; ride the momentum rather than resisting it."],
  ["Justice", "balance", "Truth and consequence. A fair reckoning arrives — act with integrity and it favors you."],
  ["The Hanged Man", "surrender", "A pause with purpose. Seeing things upside-down reveals the answer you kept missing."],
  ["Death", "transformation", "An ending that clears the way. Let the old form fall so the new one can arrive."],
  ["Temperance", "harmony", "Blend and moderate. The middle path, patiently walked, turns extremes into something whole."],
  ["The Devil", "attachment", "Notice the chain you could simply set down. What feels binding may be a habit, not a fate."],
  ["The Tower", "upheaval", "A sudden clearing of false ground. What collapses now was never built to last."],
  ["The Star", "hope", "Renewal after a hard stretch. Trust the quiet that is returning; you are being replenished."],
  ["The Moon", "mystery", "Not everything is as it seems. Move slowly through the fog and trust your instincts over your fears."],
  ["The Sun", "vitality", "Warmth, clarity, and joy. Step into the light — this is a season to be seen and to celebrate."],
  ["Judgement", "awakening", "A call you can finally answer. Rise to it; the past is settled and a truer chapter opens."],
  ["The World", "completion", "A cycle fulfilled. Stand in the accomplishment, then step through into the next whole."],
];
const LABELS = ["Where you've been", "Where you are", "Where you're headed"];
const BACK = "/tarot/classic/backside.webp";
const cardImg = (ci: number) => `/tarot/classic/major-${ci}.webp`;

function shuffle(): number[] {
  const a = Array.from({ length: DECK.length }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SPREADS = [
  { glyph: "✧", title: "Card of the Day", desc: "One card, every morning — a single image to carry with you through the hours ahead." },
  { glyph: "✣", title: "The Cross", desc: "A five-card spread for a real question: the heart of it, what crosses it, and what resolves it." },
  { glyph: "✦", title: "Year Ahead", desc: "Twelve cards, one per month — a season-by-season look at the road in front of you." },
];

function panelStars(seed: number, n = 30): React.CSSProperties[] {
  let s = seed;
  const rand = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return Array.from({ length: n }, () => ({
    position: "absolute", left: `${(rand() * 100).toFixed(1)}%`, top: `${(rand() * 100).toFixed(1)}%`,
    width: `${(rand() * 1.6 + 0.5).toFixed(1)}px`, height: `${(rand() * 1.6 + 0.5).toFixed(1)}px`,
    borderRadius: "50%", background: "var(--brass-hi)", opacity: Number((rand() * 0.5 + 0.2).toFixed(2)),
    animation: `mp-tw ${(rand() * 3 + 2).toFixed(1)}s ease-in-out infinite`,
  }));
}

export default function WebTarot() {
  const { theme, toggle } = useWebTheme();
  const [slots, setSlots] = useState<(number | null)[]>([null, null, null]);
  const [order, setOrder] = useState<number[]>(() => Array.from({ length: DECK.length }, (_, i) => i));
  const [over, setOver] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const stars = useMemo(() => panelStars(70417), []);

  useEffect(() => {
    try {
      const st = JSON.parse(localStorage.getItem("mapped:web-tarot") || "null");
      if (st && Array.isArray(st.slots) && st.slots.length === 3 && Array.isArray(st.order)) {
        setSlots(st.slots); setOrder(st.order); return;
      }
    } catch { /* ignore */ }
    setOrder(shuffle());
  }, []);

  const drawn = slots.filter((x) => x != null).length;
  const remaining = DECK.length - drawn;
  const save = (s: (number | null)[], o: number[]) => { try { localStorage.setItem("mapped:web-tarot", JSON.stringify({ slots: s, order: o })); } catch { /* */ } };

  const drawInto = (idx: number) => {
    if (slots[idx] != null || drawn >= DECK.length) { setOver(null); setDragging(false); return; }
    const next = slots.slice();
    next[idx] = order[drawn];
    setSlots(next); setOver(null); setDragging(false); save(next, order);
  };
  const reshuffle = () => { const o = shuffle(); const s: (number | null)[] = [null, null, null]; setSlots(s); setOrder(o); setOver(null); setDragging(false); save(s, o); };

  const reading = slots.map((ci, idx) => (ci == null ? null : { label: LABELS[idx], card: DECK[ci] })).filter(Boolean) as { label: string; card: Card }[];

  return (
    <WebShell current="tarot" theme={theme} onToggleTheme={toggle} footerTagline="The cards are a mirror, not a map.">
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "52px 32px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 36px" }}>
          <p style={{ fontFamily: "var(--script)", fontSize: 34, color: "var(--brass)", margin: "0 0 4px" }}>draw your day</p>
          <h1 style={{ fontFamily: "var(--deco)", fontWeight: 400, fontSize: 54, lineHeight: 1.05, margin: "0 0 14px", color: "var(--fg)" }}>Tarot</h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--fg2)", margin: 0 }}>Drag a card from the deck into each place in the spread. Past, present, and where you&rsquo;re headed — read in plain language.</p>
        </div>

        {/* SPREAD TABLE */}
        <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", border: "1px solid var(--hair)", background: "radial-gradient(120% 90% at 50% 0%, #3a2233 0%, #0d0814 66%)", boxShadow: "0 20px 60px var(--shadow)", padding: "38px 40px 44px" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{stars.map((st, i) => <span key={i} style={st} />)}</div>
          <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 26, flexWrap: "wrap" }}>
            {/* deck */}
            <div style={{ flex: "0 0 auto", textAlign: "center" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass-hi)", margin: "0 0 16px" }}>The deck · {remaining} left</p>
              <div style={{ position: "relative", width: 170, height: 290, margin: "0 auto" }}>
                {remaining > 0 ? (
                  <>
                    <span aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: 12, background: `url('${BACK}') center/cover`, transform: "rotate(4deg)", boxShadow: "0 10px 24px rgba(0,0,0,0.45)" }} />
                    <span aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: 12, background: `url('${BACK}') center/cover`, transform: "rotate(2deg)", boxShadow: "0 10px 24px rgba(0,0,0,0.45)" }} />
                    <div
                      draggable
                      onDragStart={(e) => { try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", "deck"); } catch { /* */ } setDragging(true); }}
                      onDragEnd={() => { setDragging(false); setOver(null); }}
                      className={`mp-deck${dragging ? " drag" : ""}`}
                      style={{ position: "absolute", inset: 0, borderRadius: 12, background: `url('${BACK}') center/cover`, cursor: "grab", boxShadow: "0 12px 30px rgba(0,0,0,0.5)", border: "1px solid rgba(201,169,97,0.25)", animation: "mp-deckfloat 5s ease-in-out infinite" }}
                    />
                  </>
                ) : (
                  <div style={{ position: "absolute", inset: 0, borderRadius: 12, border: "1px dashed var(--hair)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20, fontSize: 12.5, color: "var(--faint)" }}>The deck is spent. Reshuffle to draw again.</div>
                )}
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: "16px auto 0", maxWidth: 170 }}>Drag me onto a slot →</p>
              <button onClick={reshuffle} style={{ fontFamily: "var(--wbody)", fontSize: 12.5, fontWeight: 600, marginTop: 14, padding: "9px 18px", borderRadius: 999, cursor: "pointer", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "#f3ecd8" }}>Reshuffle</button>
            </div>

            {/* slots */}
            <div style={{ flex: "1 1 560px", display: "flex", gap: 18, justifyContent: "center" }}>
              {slots.map((ci, idx) => {
                const filled = ci != null;
                const card = filled ? DECK[ci as number] : null;
                return (
                  <div key={idx} style={{ flex: 1, maxWidth: 190, textAlign: "center" }}>
                    <p style={{ fontFamily: "var(--deco)", fontStyle: "italic", fontSize: 15, color: "var(--brass)", margin: "0 0 12px", minHeight: 20 }}>{LABELS[idx]}</p>
                    <div
                      onDragEnter={(e) => { e.preventDefault(); setOver(idx); }}
                      onDragOver={(e) => { e.preventDefault(); try { e.dataTransfer.dropEffect = "move"; } catch { /* */ } if (over !== idx) setOver(idx); }}
                      onDragLeave={() => { if (over === idx) setOver(null); }}
                      onDrop={(e) => { e.preventDefault(); drawInto(idx); }}
                      className={`mp-slot${over === idx ? " over" : ""}`}
                      style={{ position: "relative", width: "100%", aspectRatio: "0.57", borderRadius: 12, transition: "box-shadow .18s ease", ...(filled ? { background: "transparent" } : { background: "rgba(0,0,0,0.25)", border: "1px dashed var(--hair)" }) }}
                    >
                      {filled ? (
                        <img src={cardImg(ci as number)} alt={card![0]} className="mp-reveal" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 12, boxShadow: "0 12px 30px rgba(0,0,0,0.5)" }} />
                      ) : (
                        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--faint)", fontSize: 30 }}>✧</span>
                      )}
                    </div>
                    {filled && (
                      <>
                        <p style={{ fontFamily: "var(--deco)", fontSize: 17, fontWeight: 600, color: "#f3ecd8", margin: "12px 0 2px" }}>{card![0]}</p>
                        <p style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--brass)", margin: 0 }}>{card![1]}</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* reading */}
        {reading.length > 0 && (
          <div className="mp-reveal" style={{ marginTop: 22, borderRadius: 20, padding: "28px 30px 30px", background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "0 6px 22px var(--shadow)" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass)", margin: "0 0 16px" }}>Your reading</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {reading.map((r) => (
                <div key={r.label} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span style={{ flex: "0 0 auto", width: 80, fontFamily: "var(--deco)", fontStyle: "italic", fontSize: 14, color: "var(--brass)", paddingTop: 2 }}>{r.label}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "var(--fg)", margin: "0 0 4px" }}>{r.card[0]} · <span style={{ fontWeight: 500, color: "var(--muted)" }}>{r.card[1]}</span></p>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--fg2)", margin: 0, textWrap: "pretty" }}>{r.card[2]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* spreads */}
        <div style={{ margin: "64px 0 20px" }}>
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 40px" }}>
            <h2 style={{ fontFamily: "var(--deco)", fontWeight: 400, fontSize: 40, margin: "0 0 12px", color: "var(--fg)" }}>More ways to read</h2>
            <p style={{ fontSize: 16, color: "var(--fg2)", margin: 0 }}>Every card carries upright and reversed meanings — pull one, or lay a full spread.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {SPREADS.map((sp) => (
              <div key={sp.title} style={{ borderRadius: 18, padding: 24, background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "0 4px 16px var(--shadow)" }}>
                <span style={{ fontSize: 24 }}>{sp.glyph}</span>
                <h3 style={{ fontFamily: "var(--deco)", fontSize: 22, fontWeight: 500, margin: "12px 0 6px", color: "var(--fg)" }}>{sp.title}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--muted)", margin: 0, textWrap: "pretty" }}>{sp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WebShell>
  );
}
