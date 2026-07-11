"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * WebLanding — the public marketing landing (design_handoff_mapped_web "Home").
 * Hero, credibility strip, six feature cards, a live drag-to-reorder dashboard,
 * how-it-works, testimonials, pricing, and a CTA band, wrapped in the shared
 * marketing WebShell.
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WebShell, { useWebTheme } from "./WebShell";

// ─── Static content ─────────────────────────────────────────────────────────

const CRED = ["Featured in Sky & Telescope", "AASM Wellness Pick 2026", "“The almanac, reborn.”", "40,000+ daily readers", "Apple Design nominee"];

const GLOW = "drop-shadow(0 12px 30px rgba(0,0,0,0.45))";
const FEATURES = [
  { title: "The Almanac", tag: "Daily", href: "/almanac", cta: "Read the day",
    desc: "Moon phase, void-of-course windows, best days for planting, fishing, rest — timed to your sky.",
    render: () => <img src="/moons/full-moon.png" alt="" style={{ position: "absolute", left: "50%", top: "50%", width: 150, transform: "translate(-50%,-50%)", filter: GLOW }} /> },
  { title: "Maps", tag: "Live", href: "/maps", cta: "See your orbit",
    desc: "Your whole world, mapped as a constellation. Drag to roam the people in your orbit and tap anyone for your compatibility.",
    render: () => <img src="/images/cloud-sunset-pink.png" alt="" style={{ position: "absolute", left: "50%", top: "50%", width: 190, transform: "translate(-50%,-50%)", filter: GLOW }} /> },
  { title: "The Library", tag: "Learn", href: "/library", cta: "Start learning",
    desc: "Every sign, house, planet and aspect — explained plainly. Play the element-sorting game to make it stick.",
    render: () => <img src="/images/zodiac-wheel-fragment-1.png" alt="" style={{ position: "absolute", left: "50%", top: "50%", height: 150, transform: "translate(-50%,-50%)", filter: GLOW }} /> },
  { title: "Tarot", tag: "Draw", href: "/tarot", cta: "Draw a card",
    desc: "Pull a daily card or lay a full spread. Drag cards from the deck and read them in your own words.",
    render: () => (
      <>
        {[
          { src: "/tarot/classic/major-19.webp", rot: -15, dx: -52, dy: 8, z: 1 },
          { src: "/tarot/classic/major-21.webp", rot: 15, dx: 52, dy: 8, z: 1 },
          { src: "/tarot/classic/major-17.webp", rot: 0, dx: 0, dy: -6, z: 2 },
        ].map((c, i) => (
          <img key={i} src={c.src} alt="" style={{ position: "absolute", top: "50%", left: "50%", height: 140, marginTop: -70 + c.dy, marginLeft: -40 + c.dx, transform: `rotate(${c.rot}deg)`, transformOrigin: "bottom center", zIndex: c.z, borderRadius: 7, boxShadow: "0 10px 26px rgba(0,0,0,0.5)", border: "1px solid rgba(201,169,97,0.3)" }} />
        ))}
      </>
    ) },
  { title: "The Journal", tag: "Reflect", href: "/journal", cta: "Open the journal",
    desc: "Sky-timed prompts, ritual notes, and tarot reflections — a private record of your inner weather.",
    render: () => <img src="/images/dried-flower-bouquet.png" alt="" style={{ position: "absolute", left: "50%", top: "50%", height: 150, transform: "translate(-50%,-50%)", filter: GLOW }} /> },
  { title: "Ask Dolly", tag: "Guide", href: "/dolly", cta: "Meet Dolly",
    desc: "A warm astrological guide who knows your placements and answers in plain, kind language.",
    render: () => <img src="/images/crystal-ball.png" alt="" style={{ position: "absolute", left: "50%", top: "50%", width: 150, transform: "translate(-50%,-50%)", filter: GLOW }} /> },
];

type WidgetKey = "sky" | "chart" | "tarot" | "ritual" | "journal" | "numbers";
const DEFAULT_ORDER: WidgetKey[] = ["sky", "chart", "tarot", "ritual", "journal", "numbers"];
const WIDGETS: Record<WidgetKey, { glyph: string; tag: string; title: string; body: string }> = {
  sky: { glyph: "☽", tag: "Almanac", title: "Today's Sky", body: "Waxing Gibbous in Scorpio, 73%. Depth over noise — a day that rewards focus." },
  chart: { glyph: "☉", tag: "Your Chart", title: "Birth Chart", body: "Sun in Cancer, Moon in Pisces, Leo rising. Transiting Mars lights your 10th house." },
  tarot: { glyph: "✧", tag: "Daily Draw", title: "Today's Card", body: "The Star, upright. Renewal after a hard stretch — trust the quiet that is returning." },
  ritual: { glyph: "☾", tag: "Ritual", title: "Evening Reset", body: "A three-minute breath practice tuned to tonight’s Scorpio moon. Set something down." },
  journal: { glyph: "✎", tag: "Journal", title: "Today's Prompt", body: "Where are you carrying tension you could gently release before the week turns?" },
  numbers: { glyph: "✡", tag: "Numerology", title: "Personal Day 7", body: "A reflective, inward number. Step back before you decide — the answer is already forming." },
};

const STEPS = [
  { n: "i", title: "Enter your birth moment", body: "Date, time, and place. That’s all Mapped needs to draw your complete natal chart." },
  { n: "ii", title: "We read the live sky", body: "Every morning we compare today’s heavens to your chart — moon phase, transits, and timing." },
  { n: "iii", title: "Your day, translated", body: "Almanac, tarot, ritual and guidance, arranged the way you like and written in plain language." },
];
const QUOTES = [
  { text: "It’s the first astrology thing I’ve actually kept up with. The daily almanac is my new coffee ritual.", name: "Mara L.", role: "Portland, OR", initial: "M" },
  { text: "Dolly explained my Saturn return without a single confusing chart. I finally get it.", name: "Devon R.", role: "Austin, TX", initial: "D" },
  { text: "The sky map alone is worth it. I roam it every clear night and actually know what I’m looking at now.", name: "Priya S.", role: "Brooklyn, NY", initial: "P" },
];
const PLANS = [
  { name: "Free", price: "$0", per: "forever", tagline: "The daily basics, always free.", featured: false, btn: "Start free",
    perks: ["Daily almanac & moon phase", "Your full birth chart", "One tarot card a day", "Basic sky map"] },
  { name: "Premium", price: "$11.11", per: "/ month", tagline: "The whole sky, unlocked.", featured: true, btn: "Go Premium",
    perks: ["Everything in Free", "Unlimited tarot & full spreads", "Ask Dolly anything, anytime", "Weekly & monthly almanac", "Rituals, journal & synastry"] },
];

// ─── Starfield for the plum panels (deterministic) ──────────────────────────
function panelStars(seed: number, n = 24): React.CSSProperties[] {
  let s = seed;
  const rand = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return Array.from({ length: n }, () => ({
    position: "absolute", left: `${(rand() * 100).toFixed(2)}%`, top: `${(rand() * 100).toFixed(2)}%`,
    width: `${(rand() * 1.6 + 0.6).toFixed(1)}px`, height: `${(rand() * 1.6 + 0.6).toFixed(1)}px`,
    borderRadius: "50%", background: "var(--brass-hi)", opacity: Number((rand() * 0.5 + 0.2).toFixed(2)),
    animation: `mp-tw ${(rand() * 3 + 2.4).toFixed(1)}s ease-in-out infinite`,
  }));
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function WebLanding() {
  const { theme, toggle } = useWebTheme();

  // Drag-to-reorder dashboard
  const [order, setOrder] = useState<WidgetKey[]>(DEFAULT_ORDER);
  const [dragKey, setDragKey] = useState<WidgetKey | null>(null);
  const [overKey, setOverKey] = useState<WidgetKey | null>(null);
  useEffect(() => {
    try {
      const o = JSON.parse(localStorage.getItem("mapped:web-dash") || "null");
      if (Array.isArray(o) && o.length === 6) setOrder(o);
    } catch { /* ignore */ }
  }, []);
  const save = (o: WidgetKey[]) => { try { localStorage.setItem("mapped:web-dash", JSON.stringify(o)); } catch { /* ignore */ } };
  const reorderTo = (target: WidgetKey) => {
    setOrder((prev) => {
      if (!dragKey || dragKey === target) return prev;
      const next = prev.slice();
      const from = next.indexOf(dragKey);
      const to = next.indexOf(target);
      if (from === -1 || to === -1 || from === to) return prev;
      next.splice(to, 0, next.splice(from, 1)[0]);
      return next;
    });
    setOverKey(target);
  };
  const resetDash = () => { setOrder(DEFAULT_ORDER.slice()); setDragKey(null); setOverKey(null); save(DEFAULT_ORDER.slice()); };

  const pStars = useMemo(() => panelStars(77712), []);
  const cStars = useMemo(() => panelStars(31413), []);

  const eyebrow: React.CSSProperties = { fontFamily: "var(--script)", color: "var(--brass)", margin: "0 0 4px" };
  const sectionH2: React.CSSProperties = { fontFamily: "var(--deco)", fontWeight: 400, lineHeight: 1.08, color: "var(--fg)", margin: 0 };

  return (
    <WebShell current="home" variant="marketing" theme={theme} onToggleTheme={toggle}>
      {/* ===== HERO ===== */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "74px 32px 40px", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 40, alignItems: "center" }}>
        <div>
          <p style={{ ...eyebrow, fontSize: 38, lineHeight: 1, marginBottom: 6 }}>skeptic or witch, both welcome</p>
          <h1 style={{ fontFamily: "var(--deco)", fontWeight: 400, fontSize: 72, lineHeight: 1.02, letterSpacing: "-0.01em", margin: "0 0 22px", color: "var(--fg)", textWrap: "balance" }}>
            Your chart called.<br /><span style={{ fontStyle: "italic" }}>It has notes.</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--fg2)", maxWidth: 480, margin: "0 0 30px", textWrap: "pretty" }}>
            Astrology for your actual life — grounded, specific, and dialed to exactly how much you believe. Your chart, the moon, tarot, rituals, and a guide who actually knows your placements, all in one place.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Link href="/onboarding" style={{ fontSize: 16, fontWeight: 700, padding: "15px 30px", borderRadius: 999, background: "var(--brass)", color: "var(--btn-ink)", boxShadow: "0 8px 26px color-mix(in srgb, var(--brass) 32%, transparent)" }}>Start free — no card</Link>
            <a href="#features" style={{ fontSize: 16, fontWeight: 600, padding: "15px 26px", borderRadius: 999, background: "transparent", color: "var(--fg)", border: "1px solid var(--hair)", display: "inline-flex", alignItems: "center", gap: 9 }}>Explore features <span style={{ color: "var(--brass)" }}>→</span></a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 26 }}>
            <div style={{ display: "flex", gap: 2, color: "var(--brass)", fontSize: 15 }}>★★★★★</div>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Loved by <strong style={{ color: "var(--fg2)" }}>40,000+</strong> daily sky-watchers</span>
          </div>
        </div>
        <div style={{ position: "relative", height: 520 }}>
          <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "48%", transform: "translate(-50%,-50%)", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, color-mix(in srgb, var(--brass) 30%, transparent), transparent 62%)" }} />
          <img src="/moons/waxing-gibbous.png" alt="The moon tonight" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 360, height: 360, objectFit: "contain", filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.5))", animation: "mp-floaty 9s ease-in-out infinite" }} />
          <img src="/images/parchment-stars-pair.png" alt="" aria-hidden="true" style={{ position: "absolute", right: 6, top: 14, width: 120, opacity: 0.9, animation: "mp-floaty 7s ease-in-out infinite", filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.4))" }} />
          <div style={{ position: "absolute", left: 0, bottom: 24, padding: "16px 20px", borderRadius: 18, background: "color-mix(in srgb, var(--card) 88%, transparent)", backdropFilter: "blur(8px)", border: "1px solid var(--hair)", boxShadow: "0 10px 30px var(--shadow)", maxWidth: 230 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass)", margin: "0 0 5px" }}>Tonight</p>
            <p style={{ fontFamily: "var(--deco)", fontSize: 19, fontWeight: 500, margin: "0 0 4px", color: "var(--fg)" }}>Waxing Gibbous · 73%</p>
            <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--muted)", margin: 0 }}>Moon in Scorpio — depth over noise.</p>
          </div>
        </div>
      </section>

      {/* marquee */}
      <section style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", marginTop: 24 }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          {CRED.map((c, i) => (
            <span key={i} style={{ fontFamily: "var(--deco)", fontStyle: "italic", fontSize: 15, color: "var(--muted)", letterSpacing: "0.02em" }}>{c}</span>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" style={{ maxWidth: 1240, margin: "0 auto", padding: "88px 32px 20px", scrollMarginTop: 90 }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 60px" }}>
          <p style={{ ...eyebrow, fontSize: 30 }}>everything, in one sky</p>
          <h2 style={{ ...sectionH2, fontSize: 44, marginBottom: 16 }}>Six ways to read your days</h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.6, color: "var(--fg2)", margin: 0 }}>Each tool stands on its own — together they become a practice you&rsquo;ll actually keep.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
          {FEATURES.map((f) => (
            <Link key={f.title} href={f.href} className="mp-card-lift" style={{ display: "block", borderRadius: 22, overflow: "hidden", background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "0 4px 20px var(--shadow)", color: "inherit" }}>
              <div style={{ position: "relative", height: 186, overflow: "hidden", background: "radial-gradient(circle at 50% 46%, color-mix(in srgb, var(--brass) 9%, transparent), transparent 70%)" }}>
                {f.render()}
                <span style={{ position: "absolute", top: 14, left: 14, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass-hi)", padding: "6px 11px", borderRadius: 999, background: "rgba(11,7,18,0.5)", backdropFilter: "blur(6px)" }}>{f.tag}</span>
              </div>
              <div style={{ padding: "22px 22px 24px" }}>
                <h3 style={{ fontFamily: "var(--deco)", fontSize: 24, fontWeight: 500, margin: "0 0 8px", color: "var(--fg)" }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)", margin: "0 0 14px", textWrap: "pretty" }}>{f.desc}</p>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--brass)" }}>{f.cta} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== DRAG DASHBOARD ===== */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "96px 32px" }}>
        <div style={{ borderRadius: 30, overflow: "hidden", background: "linear-gradient(160deg, var(--hero-plum), var(--card2))", border: "1px solid var(--hair)", boxShadow: "0 20px 60px var(--shadow)", position: "relative" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            {pStars.map((st, i) => <span key={i} style={st} />)}
          </div>
          <div style={{ position: "relative", padding: "44px 48px 22px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 520 }}>
              <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass-hi)", margin: "0 0 10px" }}>Your dashboard, your way</p>
              <h2 style={{ fontFamily: "var(--deco)", fontWeight: 400, fontSize: 40, lineHeight: 1.08, margin: "0 0 12px", color: "#f3ecd8" }}>Drag to build your daily view</h2>
              <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "rgba(240,231,208,0.82)", margin: 0 }}>Grab any card and drop it where it belongs. Mapped remembers the order you like — the sky the way <em>you</em> read it.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Link href="/home" style={{ fontSize: 13, fontWeight: 700, padding: "9px 18px", borderRadius: 999, background: "var(--brass)", color: "var(--btn-ink)" }}>Open your Today page →</Link>
              <span style={{ fontSize: 12.5, color: "rgba(240,231,208,0.6)", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" /></svg>
                drag to reorder
              </span>
              <button onClick={resetDash} style={{ fontFamily: "var(--wbody)", fontSize: 12.5, fontWeight: 600, padding: "8px 16px", borderRadius: 999, cursor: "pointer", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", color: "#f3ecd8" }}>Reset</button>
            </div>
          </div>
          <div style={{ position: "relative", padding: "14px 40px 48px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {order.map((key) => {
                const w = WIDGETS[key];
                const cls = `mp-widget${dragKey === key ? " dragging" : ""}${overKey === key && dragKey !== key ? " over" : ""}`;
                return (
                  <div
                    key={key}
                    draggable
                    onDragStart={(e) => { try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", key); } catch { /* */ } setDragKey(key); }}
                    onDragEnter={(e) => { e.preventDefault(); if (dragKey && dragKey !== key) reorderTo(key); }}
                    onDragOver={(e) => { e.preventDefault(); try { e.dataTransfer.dropEffect = "move"; } catch { /* */ } setOverKey(key); }}
                    onDrop={(e) => { e.preventDefault(); reorderTo(key); setDragKey(null); setOverKey(null); setOrder((o) => { save(o); return o; }); }}
                    onDragEnd={() => { setDragKey(null); setOverKey(null); setOrder((o) => { save(o); return o; }); }}
                    className={cls}
                    style={{ cursor: "grab", borderRadius: 18, padding: "18px 18px 20px", background: "color-mix(in srgb, var(--card) 82%, transparent)", backdropFilter: "blur(6px)", border: "1px solid var(--hair)", boxShadow: "0 6px 20px rgba(0,0,0,0.3)", userSelect: "none" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
                      <span style={{ width: 38, height: 38, flex: "0 0 auto", borderRadius: 11, background: "color-mix(in srgb, var(--brass) 16%, transparent)", border: "1px solid var(--hair)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brass)", fontSize: 18 }}>{w.glyph}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass)", margin: "0 0 2px" }}>{w.tag}</p>
                        <p style={{ fontFamily: "var(--deco)", fontSize: 17, fontWeight: 600, color: "var(--fg)", margin: 0, lineHeight: 1.1 }}>{w.title}</p>
                      </div>
                      <span style={{ color: "var(--faint)", fontSize: 15, lineHeight: 1 }}>⠿</span>
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--fg2)", margin: 0, textWrap: "pretty" }}>{w.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 32px 96px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ ...sectionH2, fontSize: 42, marginBottom: 12 }}>Set it once. It follows the sky.</h2>
          <p style={{ fontSize: 16, color: "var(--fg2)", margin: 0 }}>Three minutes to set up. Then it just knows.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 34 }}>
          {STEPS.map((st) => (
            <div key={st.n} style={{ textAlign: "center" }}>
              <div style={{ width: 66, height: 66, margin: "0 auto 18px", borderRadius: "50%", border: "1px solid var(--hair)", background: "var(--card)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--deco)", fontSize: 26, fontStyle: "italic", color: "var(--brass)", boxShadow: "0 6px 20px var(--shadow)" }}>{st.n}</div>
              <h3 style={{ fontFamily: "var(--deco)", fontSize: 22, fontWeight: 500, margin: "0 0 8px", color: "var(--fg)" }}>{st.title}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--muted)", margin: 0, textWrap: "pretty" }}>{st.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "var(--soft)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "80px 32px" }}>
          <h2 style={{ ...sectionH2, fontSize: 38, textAlign: "center", marginBottom: 46 }}>A daily habit that stuck</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
            {QUOTES.map((q) => (
              <div key={q.name} style={{ borderRadius: 20, padding: "28px 26px", background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "0 4px 18px var(--shadow)" }}>
                <div style={{ color: "var(--brass)", fontSize: 14, marginBottom: 14 }}>★★★★★</div>
                <p style={{ fontFamily: "var(--deco)", fontSize: 18, fontStyle: "italic", lineHeight: 1.5, color: "var(--fg)", margin: "0 0 20px", textWrap: "pretty" }}>“{q.text}”</p>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <span style={{ width: 38, height: 38, borderRadius: "50%", background: "color-mix(in srgb, var(--brass) 18%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--deco)", fontWeight: 600, color: "var(--brass)" }}>{q.initial}</span>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)", margin: 0 }}>{q.name}</p>
                    <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>{q.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "96px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{ ...eyebrow, fontSize: 30 }}>start free, stay for the depth</p>
          <h2 style={{ ...sectionH2, fontSize: 44, marginBottom: 12 }}>Simple, honest pricing</h2>
          <p style={{ fontSize: 16, color: "var(--fg2)", margin: 0 }}>Free forever for the daily basics. Go deeper whenever you&rsquo;re ready.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "stretch" }}>
          {PLANS.map((p) => (
            <div key={p.name} style={{
              position: "relative", borderRadius: 24, padding: "36px 32px", display: "flex", flexDirection: "column",
              background: p.featured ? "linear-gradient(165deg, var(--card2), var(--card))" : "var(--card)",
              border: p.featured ? "1.5px solid var(--brass)" : "1px solid var(--hair)",
              boxShadow: p.featured ? "0 16px 44px color-mix(in srgb, var(--brass) 22%, var(--shadow))" : "0 6px 24px var(--shadow)",
            }}>
              {p.featured && <span style={{ position: "absolute", top: 20, right: 20, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, padding: "6px 12px", borderRadius: 999, background: "var(--brass)", color: "var(--btn-ink)" }}>Most loved</span>}
              <p style={{ fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass)", margin: "0 0 12px" }}>{p.name}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--deco)", fontSize: 52, fontWeight: 500, color: "var(--fg)", lineHeight: 1 }}>{p.price}</span>
                <span style={{ fontSize: 15, color: "var(--muted)" }}>{p.per}</span>
              </div>
              <p style={{ fontSize: 14, color: "var(--fg2)", margin: "0 0 22px" }}>{p.tagline}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 26 }}>
                {p.perks.map((pk) => (
                  <div key={pk} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: "var(--go)", flex: "0 0 auto", marginTop: 1 }}>✦</span>
                    <span style={{ fontSize: 14, lineHeight: 1.45, color: "var(--fg2)" }}>{pk}</span>
                  </div>
                ))}
              </div>
              <Link href="/onboarding" style={{
                marginTop: "auto", textAlign: "center", fontSize: 15, fontWeight: 700, padding: 14, borderRadius: 999,
                background: p.featured ? "var(--brass)" : "var(--soft)",
                border: p.featured ? "none" : "1px solid var(--hair)",
                color: p.featured ? "var(--btn-ink)" : "var(--fg)",
              }}>{p.btn}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA BAND ===== */}
      <section style={{ maxWidth: 1240, margin: "0 auto 96px", padding: "0 32px" }}>
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 30, padding: "70px 48px", textAlign: "center", background: "linear-gradient(160deg, var(--hero-plum), #1a1426)", border: "1px solid var(--hair)", boxShadow: "0 20px 60px var(--shadow)" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {cStars.map((st, i) => <span key={i} style={st} />)}
          </div>
          <img src="/images/cosmic-eye.png" alt="" aria-hidden="true" style={{ position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)", width: 150, opacity: 0.5 }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontFamily: "var(--deco)", fontWeight: 400, fontSize: 46, lineHeight: 1.08, margin: "0 0 16px", color: "#f3ecd8" }}>
              The sky is already talking.<br /><span style={{ fontStyle: "italic" }}>Start listening today.</span>
            </h2>
            <p style={{ fontSize: 17, color: "rgba(240,231,208,0.8)", margin: "0 0 30px" }}>Free to begin. Two minutes to your first reading.</p>
            <Link href="/onboarding" style={{ display: "inline-block", fontSize: 16, fontWeight: 700, padding: "16px 38px", borderRadius: 999, background: "var(--brass)", color: "var(--btn-ink)", boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>Start free — no card needed</Link>
          </div>
        </div>
      </section>
    </WebShell>
  );
}
