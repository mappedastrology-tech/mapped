"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * WebToday — the signed-in "Today" dashboard (design_handoff_mapped_web "Daily").
 * Greeting + today's-sky banner + a live drag-to-reorder widget grid whose
 * order persists to localStorage['mapped:web-daily']. Content mirrors the
 * prototype's sample data (bind to the real almanac/chart backend later).
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WebShell, { useWebTheme } from "./WebShell";
import { useLiveSky, useBigThree } from "./useLiveSky";
import { ALL_CARDS, getCardImagePath, CARD_BACK_IMAGE } from "@/lib/tarot";
import { getCardSalt, mixDailySeed } from "@/lib/dailyCardSeed";

type Key = "sky" | "chart" | "tarot" | "ritual" | "journal" | "numbers";
const DEFAULT: Key[] = ["sky", "chart", "tarot", "ritual", "journal", "numbers"];

// U+FE0E forces monochrome text (not color-emoji) rendering of the widget glyphs.
const VS = "︎";

type BodyPart =
  | { kind: "text"; text: string }
  | { kind: "chips"; chips: string[] }
  | { kind: "rows"; rows: [string, string][] }
  | { kind: "card"; src: string; name: string; kw: string }
  | { kind: "quote"; quote: string }
  | { kind: "big"; big: string }
  | { kind: "tag2"; tag2: string };

const W: Record<Key, { glyph: string; tag: string; title: string; href: string; cta: string; body: BodyPart[] }> = {
  sky: { glyph: "☽", tag: "Almanac", title: "Today's Sky", href: "/almanac", cta: "Open almanac",
    body: [{ kind: "text", text: "Waxing Gibbous in Scorpio, 73% lit. The Moon turns attention inward — honest, private, deep." }, { kind: "chips", chips: ["Sunrise 5:58", "Sunset 8:31", "V/C 2:32 pm"] }] },
  chart: { glyph: "☉", tag: "Your Chart", title: "Birth Chart", href: "/maps", cta: "View chart",
    body: [{ kind: "text", text: "Sun Cancer · Moon Pisces · Leo rising. Transiting Mars is lighting your 10th house of direction all week." }, { kind: "rows", rows: [["Sun", "Cancer 10°"], ["Moon", "Pisces 24°"], ["Rising", "Leo 2°"]] }] },
  tarot: { glyph: "✧", tag: "Daily Draw", title: "Today's Card", href: "/tarot", cta: "Draw more",
    body: [{ kind: "card", src: "/tarot/classic/major-17.webp", name: "The Star", kw: "hope · renewal" }] },
  ritual: { glyph: "☾", tag: "Ritual", title: "Evening Reset", href: "/journal", cta: "Begin ritual",
    body: [{ kind: "text", text: "A three-minute breath practice tuned to tonight’s Scorpio Moon. Set one thing down before the week turns." }, { kind: "tag2", tag2: "3 min · breathwork" }] },
  journal: { glyph: "✎", tag: "Journal", title: "Today's Prompt", href: "/journal", cta: "Write entry",
    body: [{ kind: "quote", quote: "Where are you carrying tension you could gently set down before the week turns?" }, { kind: "tag2", tag2: "7-day streak" }] },
  numbers: { glyph: "✡", tag: "Numerology", title: "Personal Day 7", href: "/numerology", cta: "Learn more",
    body: [{ kind: "text", text: "A reflective, inward number. Step back before you decide — the answer is already forming quietly." }, { kind: "big", big: "7" }] },
};

function BodyNode({ parts }: { parts: BodyPart[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {parts.map((p, i) => {
        switch (p.kind) {
          case "text":
            return <p key={i} style={{ fontSize: 13, lineHeight: 1.6, color: "var(--fg2)", margin: 0 }}>{p.text}</p>;
          case "chips":
            return (
              <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {p.chips.map((c, j) => <span key={j} style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 8, background: "var(--soft)", border: "1px solid var(--hair)", color: "var(--muted)" }}>{c}</span>)}
              </div>
            );
          case "rows":
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {p.rows.map((r, j) => (
                  <div key={j} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, borderBottom: "0.5px solid var(--line)", paddingBottom: 6 }}>
                    <span style={{ color: "var(--muted)" }}>{r[0]}</span><span style={{ color: "var(--fg)", fontWeight: 600 }}>{r[1]}</span>
                  </div>
                ))}
              </div>
            );
          case "card":
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <img src={p.src} alt={p.name} style={{ height: 92, borderRadius: 7, border: "1px solid rgba(201,169,97,0.3)", boxShadow: "0 8px 20px rgba(0,0,0,0.45)" }} />
                <div>
                  <p style={{ fontFamily: "var(--deco)", fontSize: 20, fontWeight: 600, color: "var(--fg)", margin: "0 0 3px" }}>{p.name}</p>
                  <p style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--brass)", margin: 0 }}>{p.kw}</p>
                </div>
              </div>
            );
          case "quote":
            return <p key={i} style={{ fontFamily: "var(--deco)", fontStyle: "italic", fontSize: 16, lineHeight: 1.45, color: "var(--fg)", margin: 0 }}>“{p.quote}”</p>;
          case "big":
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 2 }}>
                <span style={{ fontFamily: "var(--deco)", fontSize: 40, fontWeight: 600, color: "var(--brass)", lineHeight: 1 }}>{p.big}</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>of a 9-day cycle</span>
              </div>
            );
          case "tag2":
            return <span key={i} style={{ alignSelf: "flex-start", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "5px 11px", borderRadius: 999, background: "color-mix(in srgb, var(--go) 14%, transparent)", color: "var(--go)" }}>{p.tag2}</span>;
        }
      })}
    </div>
  );
}

function bannerStars(seed: number, n = 18): React.CSSProperties[] {
  let s = seed;
  const rand = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return Array.from({ length: n }, () => ({
    position: "absolute", left: `${(rand() * 100).toFixed(1)}%`, top: `${(rand() * 100).toFixed(1)}%`,
    width: `${(rand() * 1.5 + 0.5).toFixed(1)}px`, height: `${(rand() * 1.5 + 0.5).toFixed(1)}px`,
    borderRadius: "50%", background: "#e8dfc4", opacity: Number((rand() * 0.5 + 0.2).toFixed(2)),
    animation: `mp-tw ${(rand() * 3 + 2).toFixed(1)}s ease-in-out infinite`,
  }));
}

export default function WebToday() {
  const { theme, toggle } = useWebTheme();

  const [order, setOrder] = useState<Key[]>(DEFAULT);
  const [dragKey, setDragKey] = useState<Key | null>(null);
  const [overKey, setOverKey] = useState<Key | null>(null);
  const [dateLabel, setDateLabel] = useState("");
  const [greeting, setGreeting] = useState("hello,");

  useEffect(() => {
    try {
      const o = JSON.parse(localStorage.getItem("mapped:web-daily") || "null");
      if (Array.isArray(o) && o.length === 6) setOrder(o);
    } catch { /* ignore */ }
    const now = new Date();
    setDateLabel(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
    const h = now.getHours();
    setGreeting(h < 12 ? "good morning," : h < 18 ? "good afternoon," : "good evening,");
  }, []);

  const save = (o: Key[]) => { try { localStorage.setItem("mapped:web-daily", JSON.stringify(o)); } catch { /* ignore */ } };
  const reorderTo = (target: Key) => {
    setOrder((prev) => {
      if (!dragKey || dragKey === target) return prev;
      const next = prev.slice();
      const from = next.indexOf(dragKey), to = next.indexOf(target);
      if (from === -1 || to === -1 || from === to) return prev;
      next.splice(to, 0, next.splice(from, 1)[0]);
      return next;
    });
    setOverKey(target);
  };
  const resetDash = () => { setOrder(DEFAULT.slice()); setDragKey(null); setOverKey(null); save(DEFAULT.slice()); };
  const stars = useMemo(() => bannerStars(48221), []);

  // Live sky + chart (falls back to the sample copy until computed client-side)
  const sky = useLiveSky();
  const bt = useBigThree();

  // Real daily tarot card — per (account, day) via the salted seed, replacing
  // the hardcoded sample ("The Star" for everyone).
  const [dailyCard, setDailyCard] = useState<{ src: string; name: string; kw: string } | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const salt = await getCardSalt().catch(() => 0);
      if (cancelled) return;
      const card = ALL_CARDS[mixDailySeed(new Date(), salt) % ALL_CARDS.length];
      setDailyCard({
        src: getCardImagePath(card.id) || CARD_BACK_IMAGE,
        name: card.name,
        kw: card.uprightKeywords.slice(0, 2).join(" · ").toLowerCase(),
      });
    })();
    return () => { cancelled = true; };
  }, []);
  const bannerEyebrow = sky ? `${sky.moonLabel} · ${sky.illumination}% · Moon in ${sky.moonSign}` : "Waxing Gibbous · 73% · Moon in Scorpio";
  const bannerTitle = sky ? `The Moon in ${sky.moonSign}` : "Depth over noise today";
  const bannerBody = sky
    ? `${sky.moonSignTheme}${sky.vocStart ? ` Void of course after ${sky.vocStart} — let new plans settle until tomorrow.` : ""}`
    : "A day that rewards focus, honesty, and finishing what you started. Void of course after 2:32 pm — let new plans settle until tomorrow.";
  const bannerMoon = sky?.moonImg ?? "/moons/waxing-gibbous.webp";

  // Per-widget live overrides for the dashboard cards
  const liveBody = (key: Key): BodyPart[] => {
    if (key === "sky" && sky) {
      return [
        { kind: "text", text: `${sky.moonLabel} in ${sky.moonSign}, ${sky.illumination}% lit. ${sky.moonSignTheme}` },
        { kind: "chips", chips: [`Sunrise ${sky.sunrise}`, `Sunset ${sky.sunset}`, ...(sky.vocStart ? [`V/C ${sky.vocStart}`] : [])] },
      ];
    }
    if (key === "chart" && bt) {
      return [
        { kind: "text", text: `Sun in ${bt.sun}, Moon in ${bt.moon}, ${bt.rising} rising — your core placements.` },
        { kind: "rows", rows: [["Sun", bt.sun], ["Moon", bt.moon], ["Rising", bt.rising]] },
      ];
    }
    if (key === "tarot" && dailyCard) {
      return [{ kind: "card", src: dailyCard.src, name: dailyCard.name, kw: dailyCard.kw }];
    }
    return W[key].body;
  };

  return (
    <WebShell current="today" theme={theme} onToggleTheme={toggle} footerTagline="Your day, arranged the way you read it.">
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "44px 32px 20px" }}>
        {/* greeting */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 26 }}>
          <div>
            <p style={{ fontFamily: "var(--script)", fontSize: 32, color: "var(--brass)", margin: "0 0 2px" }}>{greeting}</p>
            <h1 style={{ fontFamily: "var(--deco)", fontWeight: 400, fontSize: 44, lineHeight: 1, margin: 0, color: "var(--fg)" }}>{dateLabel || " "}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" /></svg>
              drag any card to rearrange your view
            </span>
            <button onClick={resetDash} style={{ fontFamily: "var(--wbody)", fontSize: 12.5, fontWeight: 600, padding: "9px 17px", borderRadius: 999, cursor: "pointer", background: "var(--soft)", border: "1px solid var(--hair)", color: "var(--fg)" }}>Reset layout</button>
          </div>
        </div>

        {/* today's sky banner */}
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 22, border: "1px solid var(--hair)", background: "radial-gradient(120% 100% at 82% 0%, #3a2233 0%, #17111f 62%)", boxShadow: "0 12px 40px var(--shadow)", padding: "26px 30px", display: "flex", alignItems: "center", gap: 24, marginBottom: 22 }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{stars.map((st, i) => <span key={i} style={st} />)}</div>
          <div style={{ position: "relative", width: 92, height: 92, flex: "0 0 auto" }}>
            <div style={{ position: "absolute", inset: -10, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,223,196,0.28), transparent 66%)" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bannerMoon} alt={sky?.moonLabel ?? "Moon"} style={{ position: "relative", width: 92, height: 92, objectFit: "contain", filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.5))", animation: "mp-floaty 8s ease-in-out infinite" }} />
          </div>
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: "#d8c285", margin: "0 0 5px" }}>{bannerEyebrow}</p>
            <p style={{ fontFamily: "var(--deco)", fontSize: 22, fontWeight: 500, color: "#f3ecd8", margin: "0 0 4px" }}>{bannerTitle}</p>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "#cdc1a8", margin: 0, maxWidth: 640 }}>{bannerBody}</p>
          </div>
          <Link href="/almanac" style={{ position: "relative", flex: "0 0 auto", fontSize: 13, fontWeight: 700, padding: "11px 20px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", color: "#f3ecd8" }}>Full almanac →</Link>
        </div>

        {/* widget grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, paddingBottom: 10 }}>
          {order.map((key) => {
            const w = W[key];
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
                style={{ borderRadius: 18, padding: "22px 22px 20px", background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "0 5px 18px var(--shadow)", userSelect: "none", display: "flex", flexDirection: "column", minHeight: 210, cursor: "grab" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
                  <span style={{ width: 40, height: 40, flex: "0 0 auto", borderRadius: 11, background: "color-mix(in srgb, var(--brass) 15%, transparent)", border: "1px solid var(--hair)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brass)", fontSize: 19 }}>{w.glyph + VS}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass)", margin: "0 0 2px" }}>{w.tag}</p>
                    <p style={{ fontFamily: "var(--deco)", fontSize: 19, fontWeight: 600, color: "var(--fg)", margin: 0, lineHeight: 1.1 }}>{w.title}</p>
                  </div>
                  <span style={{ color: "var(--faint)", fontSize: 17, lineHeight: 1 }}>⠿</span>
                </div>
                <BodyNode parts={liveBody(key)} />
                <Link href={w.href} style={{ marginTop: "auto", paddingTop: 14, fontSize: 12.5, fontWeight: 700, color: "var(--brass)" }}>{w.cta} →</Link>
              </div>
            );
          })}
        </div>
      </div>
    </WebShell>
  );
}
