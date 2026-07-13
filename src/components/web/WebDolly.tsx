"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * WebDolly — the AI guide chat (design_handoff_mapped_web "Dolly").
 * Streams real answers from /api/dolly with the user's cached chart in context;
 * the suggested-question chips just prefill the same real send. Falls back to a
 * gentle error line if the endpoint can't be reached.
 */

import { useEffect, useRef, useState } from "react";
import WebShell, { useWebTheme } from "./WebShell";
import { useBigThree } from "./useLiveSky";
import { authedFetch } from "@/lib/authedFetch";

// U+FE0E forces monochrome text (not color-emoji) rendering of zodiac glyphs.
const SIGN_GLYPH: Record<string, string> = {
  Aries: "♈︎", Taurus: "♉︎", Gemini: "♊︎", Cancer: "♋︎", Leo: "♌︎", Virgo: "♍︎",
  Libra: "♎︎", Scorpio: "♏︎", Sagittarius: "♐︎", Capricorn: "♑︎", Aquarius: "♒︎", Pisces: "♓︎",
};

const AVATAR = "/images/crystal-ball.png";
type Msg = { from: "dolly" | "you"; text: string };
const QA: { q: string; a: string }[] = [
  { q: "What does my Cancer sun mean?", a: "Your Cancer Sun is the tender, protective core of you — you lead with feeling and you look after people almost by instinct. It means home, memory, and belonging matter deeply. Your gift is emotional intelligence; your work is learning that softness is strength, not a leak." },
  { q: "What's my Saturn return about?", a: "Saturn returns to where it sat at your birth around age 29 — for you, in the 5th house. It’s a rite of passage: the universe asks which joys, creative risks, and self-expressions are truly yours to keep. It can feel heavy, but it’s building the adult foundation you’ll stand on for decades." },
  { q: "Why do I feel so restless lately?", a: "Right now transiting Mars is lighting your 10th house of direction and ambition, while the Scorpio Moon stirs everything underneath. That combination reads exactly as restlessness — energy with nowhere obvious to go. It usually means a decision is forming. Give it a week; don’t force it under the void Moon." },
  { q: "Are my partner and I compatible?", a: "Compatibility isn’t a yes-or-no — it’s a texture. Your Moons in water and their Venus in earth is a genuinely nourishing mix: you feel deeply, they make it feel safe. The friction to watch is your Cancer need for reassurance meeting their steadier pace. Name it kindly and it becomes easy." },
];
const GREET: Msg = { from: "dolly", text: "Hi — I’m Dolly, your astrological guide. I read your birth chart and the live sky to answer in plain, kind language. Ask me anything, or tap a question below to begin." };
const ABILITIES = [
  { glyph: "☉", title: "Read your chart", desc: "Ask what any placement means and get a plain-language answer rooted in your actual birth chart." },
  { glyph: "☄", title: "Time your moves", desc: "When to launch, rest, or wait. Dolly watches your transits and tells you what the timing favors." },
  { glyph: "♡", title: "Understand people", desc: "Bring in a partner, friend, or colleague and explore the real texture of your connection." },
];

export default function WebDolly() {
  const { theme, toggle } = useWebTheme();
  const bt = useBigThree();
  const [messages, setMessages] = useState<Msg[]>([GREET]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => { abortRef.current?.abort(); }, []);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, typing]);

  const knows = bt ? `Knows: Sun ${SIGN_GLYPH[bt.sun] ?? ""} · Moon ${SIGN_GLYPH[bt.moon] ?? ""} · ${bt.rising} rising` : "Reading your sky";

  const sendMsg = async (userText: string) => {
    if (typing) return;
    // History is the conversation so far (before this turn).
    const history = messages.map((m) => ({ role: m.from === "dolly" ? "assistant" : "user", content: m.text }));
    setMessages((m) => [...m, { from: "you", text: userText }]);
    setInput("");
    setTyping(true);

    let chart: unknown = null, transits: unknown = null;
    try { const c = sessionStorage.getItem("chartResult"); if (c) chart = JSON.parse(c); } catch { /* */ }
    try { const t = sessionStorage.getItem("mapped:transits"); if (t) transits = JSON.parse(t); } catch { /* */ }

    const controller = new AbortController();
    abortRef.current = controller;
    const fail = (text: string) => {
      setMessages((m) => {
        const last = m[m.length - 1];
        if (last?.from === "dolly" && last.text === "") return [...m.slice(0, -1), { from: "dolly" as const, text }];
        return [...m, { from: "dolly" as const, text }];
      });
    };

    try {
      const res = await authedFetch("/api/dolly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history: history.slice(-20), chart, transits, connections: [], userName: "" }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error(`status ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "", started = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const p = JSON.parse(data);
            if (typeof p.text === "string" && p.text) {
              full += p.text;
              if (!started) { started = true; setTyping(false); setMessages((m) => [...m, { from: "dolly", text: full }]); }
              else setMessages((m) => { const c = m.slice(); c[c.length - 1] = { from: "dolly", text: full }; return c; });
            }
          } catch { /* skip malformed chunk */ }
        }
      }
      if (!started) fail("I couldn’t reach my full reading just now — try again in a moment.");
    } catch (err) {
      if ((err as Error).name !== "AbortError") fail("I couldn’t reach my full reading just now — try again in a moment.");
    } finally {
      setTyping(false);
    }
  };
  const send = () => { const t = input.trim(); if (t) sendMsg(t); };

  return (
    <WebShell current="dolly" theme={theme} onToggleTheme={toggle} footerTagline="A guide who knows your chart.">
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "52px 32px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 34px" }}>
          <div style={{ position: "relative", width: 110, height: 110, margin: "0 auto 18px" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, color-mix(in srgb, var(--brass) 32%, transparent), transparent 66%)" }} />
            <img src={AVATAR} alt="Dolly" style={{ position: "relative", width: 110, height: 110, objectFit: "contain", animation: "mp-glow 5s ease-in-out infinite" }} />
          </div>
          <p style={{ fontFamily: "var(--script)", fontSize: 34, color: "var(--brass)", margin: "0 0 2px" }}>meet your guide</p>
          <h1 style={{ fontFamily: "var(--deco)", fontWeight: 400, fontSize: 52, lineHeight: 1.05, margin: "0 0 14px", color: "var(--fg)" }}>Ask Dolly</h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--fg2)", margin: 0 }}>A warm astrological guide who knows your whole chart. Ask anything — placements, timing, relationships — and get an answer in plain, kind language. Try a question below.</p>
        </div>

        {/* CHAT */}
        <div style={{ maxWidth: 760, margin: "0 auto", borderRadius: 24, border: "1px solid var(--hair)", background: "var(--card)", boxShadow: "0 16px 50px var(--shadow)", overflow: "hidden" }}>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12, background: "var(--card2)" }}>
            <span style={{ width: 34, height: 34, borderRadius: "50%", background: `url('${AVATAR}') center/cover`, flex: "0 0 auto" }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14.5, fontWeight: 700, color: "var(--fg)", margin: 0 }}>Dolly</p>
              <p style={{ fontSize: 11.5, color: "var(--go)", margin: 0, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--go)" }} />reading your sky</p>
            </div>
            <span style={{ fontSize: 11, color: "var(--faint)" }}>{knows}</span>
          </div>

          <div ref={scrollRef} style={{ padding: "26px 24px", display: "flex", flexDirection: "column", gap: 16, minHeight: 280, maxHeight: 460, overflowY: "auto" }}>
            {messages.map((m, i) => {
              const dolly = m.from === "dolly";
              return (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-end", justifyContent: dolly ? "flex-start" : "flex-end", animation: "mp-pop .3s ease" }}>
                  {dolly && <span style={{ width: 30, height: 30, flex: "0 0 auto", borderRadius: "50%", background: `url('${AVATAR}') center/cover`, alignSelf: "flex-end" }} />}
                  <div style={dolly
                    ? { maxWidth: "78%", padding: "14px 18px", borderRadius: "16px 16px 16px 4px", background: "var(--card2)", border: "1px solid var(--hair)", fontSize: 14.5, lineHeight: 1.6, color: "var(--fg2)", textWrap: "pretty" }
                    : { maxWidth: "76%", padding: "13px 18px", borderRadius: "16px 16px 4px 16px", background: "var(--bubble-you)", border: "1px solid var(--hair)", fontSize: 14.5, lineHeight: 1.55, color: "var(--fg)" }}>
                    {m.text}
                  </div>
                </div>
              );
            })}
            {typing && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <span style={{ width: 30, height: 30, flex: "0 0 auto", borderRadius: "50%", background: `url('${AVATAR}') center/cover` }} />
                <div style={{ padding: "14px 18px", borderRadius: "16px 16px 16px 4px", background: "var(--card2)", border: "1px solid var(--hair)", color: "var(--muted)", fontSize: 14 }}>Dolly is looking at your chart…</div>
              </div>
            )}
          </div>

          {/* suggestions */}
          <div style={{ padding: "4px 20px 14px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {QA.map((x) => (
              <button key={x.q} onClick={() => sendMsg(x.q)} className="mp-chip2" style={{ fontFamily: "var(--wbody)", fontSize: 12.5, fontWeight: 500, padding: "8px 14px", borderRadius: 999, cursor: "pointer", background: "var(--soft)", border: "1px solid var(--hair)", color: "var(--fg2)" }}>{x.q}</button>
            ))}
          </div>

          {/* input */}
          <div style={{ padding: "14px 20px 20px", borderTop: "1px solid var(--line)", display: "flex", gap: 12 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="Ask Dolly anything about your chart…"
              style={{ flex: 1, background: "var(--soft)", border: "1px solid var(--hair)", borderRadius: 999, padding: "13px 20px", color: "var(--fg)", fontFamily: "var(--wbody)", fontSize: 14.5, outline: "none" }}
            />
            <button onClick={send} aria-label="Send" style={{ width: 48, height: 48, flex: "0 0 auto", borderRadius: "50%", border: "none", cursor: "pointer", background: "var(--brass)", color: "var(--btn-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            </button>
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--faint)", margin: "16px auto 0", maxWidth: 540 }}>Dolly reads your real birth chart when you&rsquo;re signed in — the more complete your chart, the more specific her answers.</p>

        {/* WHAT DOLLY KNOWS */}
        <div style={{ margin: "64px 0 20px" }}>
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 40px" }}>
            <h2 style={{ fontFamily: "var(--deco)", fontWeight: 400, fontSize: 40, margin: "0 0 12px", color: "var(--fg)" }}>What Dolly can do</h2>
            <p style={{ fontSize: 16, color: "var(--fg2)", margin: 0 }}>Not horoscopes — real answers, grounded in your chart.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {ABILITIES.map((a) => (
              <div key={a.title} style={{ borderRadius: 18, padding: 24, background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "0 4px 16px var(--shadow)" }}>
                <span style={{ fontSize: 24, color: "var(--brass)" }}>{a.glyph}</span>
                <h3 style={{ fontFamily: "var(--deco)", fontSize: 21, fontWeight: 500, margin: "12px 0 6px", color: "var(--fg)" }}>{a.title}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--muted)", margin: 0, textWrap: "pretty" }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WebShell>
  );
}
