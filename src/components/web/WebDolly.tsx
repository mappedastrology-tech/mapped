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
import { parseDollyReply } from "@/lib/dollyReply";
import { useStickToBottom } from "@/lib/useStickToBottom";
import { detectCrisis, crisisAnnouncement } from "@/lib/crisis";
import CrisisCard from "@/components/CrisisCard";
import { useBigThree } from "./useLiveSky";
import { authedFetch } from "@/lib/authedFetch";
import { supabase } from "@/lib/supabase";
import { gatherCrossFeatureContext } from "@/lib/dollyCrossFeature";
import { chartSystemFromChart, chartSystemFromRow, transitParams } from "@/lib/astro/vedic/system";

// U+FE0E forces monochrome text (not color-emoji) rendering of zodiac glyphs.
const SIGN_GLYPH: Record<string, string> = {
  Aries: "♈︎", Taurus: "♉︎", Gemini: "♊︎", Cancer: "♋︎", Leo: "♌︎", Virgo: "♍︎",
  Libra: "♎︎", Scorpio: "♏︎", Sagittarius: "♐︎", Capricorn: "♑︎", Aquarius: "♒︎", Pisces: "♓︎",
};

const AVATAR = "/images/crystal-ball.webp";
/**
 * `notice` marks a rule rather than a reply — see the non-OK branch in
 * sendMsg. Desktop had no paid boundary at all: a free user's 402 was thrown
 * away and replaced with "I couldn't reach my full reading just now", in
 * Dolly's own first person, so they were told a permanent plan boundary was a
 * temporary glitch and invited to keep trying something that would never work.
 */
type Msg = { from: "dolly" | "you"; text: string; notice?: boolean; crisis?: boolean };
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
  /** What a screen reader hears when a reply lands. See the region below. */
  const [announcement, setAnnouncement] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Cross-feature context loaded for signed-in users so web Dolly knows the
  // same things the mobile Dolly does — chart, people, and live transits.
  const chartRef = useRef<unknown>(null);
  const userNameRef = useRef<string>("");
  const userIdRef = useRef<string | null>(null);
  const connectionsRef = useRef<unknown[]>([]);
  const transitsRef = useRef<unknown>(null);

  useEffect(() => () => { abortRef.current?.abort(); }, []);
  // Was an unconditional `scrollTop = scrollHeight` on every message change,
  // which dragged the reader back down every few tokens if they had scrolled
  // up to re-read something. Same hook the mobile thread uses: follow only
  // while already at the bottom.
  const { ref: scrollRef } = useStickToBottom<HTMLDivElement>(messages);

  // Connect Dolly to everything the app knows about the signed-in user —
  // their saved chart, the people in their life, and today's live transits —
  // even if they haven't opened those pages this session. Mirrors the mobile
  // Dolly tab so web users aren't told "I can't see your chart".
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Resolve the chart: sessionStorage first, else the saved chart in Supabase.
        let chart: {
          bigThree?: unknown; planets?: unknown[]; houses?: unknown[]; specialPoints?: unknown[];
          birthDate?: string; birthTime?: string; ascendant?: unknown; midheaven?: unknown;
          zodiacSystem?: string; ayanamsa?: string; houseSystem?: string; nodeType?: string;
        } | null = null;
        try { const s = sessionStorage.getItem("chartResult"); if (s) chart = JSON.parse(s); } catch { /* */ }

        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id ?? null;
        userIdRef.current = userId;

        if (!chart && userId) {
          const { data: c } = await supabase
            .from("charts")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
          if (c) {
            chart = {
              bigThree: c.big_three,
              planets: c.planets || [],
              houses: c.houses || [],
              specialPoints: c.special_points || [],
              birthDate: c.birth_date,
              birthTime: c.birth_time,
              ascendant: c.ascendant || null,
              midheaven: c.midheaven || null,
              ...chartSystemFromRow(c),
            };
            userNameRef.current = c.name || "";
            try { sessionStorage.setItem("chartResult", JSON.stringify(chart)); } catch { /* */ }
          }
        }
        if (cancelled) return;
        if (chart) chartRef.current = chart;
        if (!userId) return;

        // People in their life (connections) for relationship questions.
        try {
          const { data: conns } = await supabase
            .from("connections")
            .select("name, relationship, category, big_three, planets, houses")
            .eq("user_id", userId);
          if (!cancelled && Array.isArray(conns)) {
            connectionsRef.current = conns.map((c) => ({
              name: c.name, relationship: c.relationship, category: c.category,
              bigThree: c.big_three, planets: c.planets, houses: c.houses,
            }));
          }
        } catch { /* connections optional */ }

        // Today's transits so timing answers are current, not stale.
        try {
          const planets = (chart?.planets ?? []) as unknown[];
          if (planets.length) {
            const today = new Date().toISOString().split("T")[0];
            const res = await fetch("/api/transits", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                natalPlanets: planets,
                natalHouses: chart?.houses ?? [],
                transitDate: today,
                // The chart's own zodiac — never assume tropical.
                ...transitParams(chartSystemFromChart(chart)),
              }),
            });
            if (!cancelled && res.ok) transitsRef.current = await res.json();
          }
        } catch { /* transits optional */ }
      } catch { /* not signed in or no saved chart — Dolly will say so honestly */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const knows = bt ? `Knows: Sun ${SIGN_GLYPH[bt.sun] ?? ""} · Moon ${SIGN_GLYPH[bt.moon] ?? ""} · ${bt.rising} rising` : "Reading your sky";

  const sendMsg = async (userText: string) => {
    if (typing) return;

    /**
     * Ahead of every gate, exactly as on mobile — see lib/crisis.ts. The
     * paywall, the daily cap, the monthly ceiling and a dead network can all
     * answer before the model is reached, and none of them is an acceptable
     * reply to this.
     */
    const crisis = detectCrisis(userText);
    if (crisis) {
      setMessages((m) => [...m, { from: "you", text: userText }, { from: "dolly", text: "", crisis: true }]);
      setInput("");
      setAnnouncement(crisisAnnouncement());
      // Still sent, so a paid reader also gets Dolly's own careful answer
      // under the card; if a gate refuses it the server answers with the
      // crisis branch rather than a limit.
    }

    // History is the conversation so far (before this turn). Notices and
    // support cards are the app talking, not the conversation — and a crisis
    // card has no text at all, which the API rejects as an empty turn.
    const history = messages
      .filter((m) => !m.notice && !m.crisis && m.text.trim())
      .map((m) => ({ role: m.from === "dolly" ? "assistant" : "user", content: m.text }));
    if (!crisis) setMessages((m) => [...m, { from: "you", text: userText }]);
    setInput("");
    setTyping(true);

    let chart: unknown = chartRef.current, transits: unknown = transitsRef.current;
    try { const c = sessionStorage.getItem("chartResult"); if (c) chart = JSON.parse(c); } catch { /* */ }
    try { const t = sessionStorage.getItem("mapped:transits"); if (t) transits = JSON.parse(t); } catch { /* */ }
    // Journal + latest tarot/oracle pull (same source as the mobile Dolly).
    const { journalContext, tarotContext } = gatherCrossFeatureContext(userIdRef.current);

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
        body: JSON.stringify({ message: userText, history: history.slice(-20), chart, transits, connections: connectionsRef.current, userName: userNameRef.current, journalContext, tarotContext }),
        signal: controller.signal,
      });
      if (!res.ok) {
        // Policy and outage come with words worth showing; anything else is
        // ours to explain generically.
        const body = await res.json().catch(() => ({ error: "" }));
        if (res.status === 402 || res.status === 429 || res.status === 503) {
          setTyping(false);
          // A card is already on screen for this turn; a plan limit stacked
          // under it would undo the whole point.
          if (crisis) return;
          const text = typeof body.error === "string" && body.error.trim()
            ? body.error
            : "Dolly isn't available on your plan right now.";
          setMessages((m) => [...m, { from: "dolly" as const, text, notice: true }]);
          return;
        }
        throw new Error(`status ${res.status}`);
      }
      // The server refused a gate but saw crisis language, so it answered 200
      // with this rather than a limit.
      if (res.headers.get("content-type")?.includes("application/json")) {
        const ok = await res.json().catch(() => null);
        if (ok?.crisis) {
          setTyping(false);
          setMessages((m) => (m.some((x) => x.crisis) ? m : [...m, { from: "dolly" as const, text: "", crisis: true }]));
          setAnnouncement(crisisAnnouncement());
          return;
        }
      }
      if (!res.body) throw new Error("no stream");
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
      if (!started && !crisis) fail("I couldn’t finish that answer just now — try again in a moment.");
      // The prose only — the meta line is not something to read aloud.
      else setAnnouncement(parseDollyReply(full).body || full);
    } catch (err) {
      if ((err as Error).name !== "AbortError" && !crisis) {
        // Offline with a crisis message: the card is already up from the local
        // check, which is exactly what it is for. A network error under it
        // would be noise.
        fail("I couldn’t finish that answer just now — try again in a moment.");
      }
    } finally {
      setTyping(false);
      // Focus was left on the send button (or nowhere at all) after every
      // send, so the next question meant hunting for the field again.
      inputRef.current?.focus();
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
            <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: "50%", background: `url('${AVATAR}') center/cover`, flex: "0 0 auto" }} />
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
              <p style={{ fontSize: 14.5, fontWeight: 700, color: "var(--fg)", margin: 0 }}>Dolly</p>
              {/*
                This was a green dot and the words "reading your sky",
                permanently — the presence indicator every messaging app uses
                to mean a person is at the other end, shown next to a portrait,
                next to a name, whether or not anything was happening. Nobody
                is at the other end. Replaced with the thing worth saying.
              */}
              <span
                aria-label="Dolly is an AI assistant"
                style={{
                  fontFamily: "var(--font-ui)", fontSize: 9.5, fontWeight: 700,
                  letterSpacing: "0.12em", padding: "2px 6px", borderRadius: 4,
                  background: "var(--soft)", color: "var(--fg2)", border: "1px solid var(--hair)",
                }}
              >
                AI
              </span>
            </div>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--faint)" }}>{knows}</span>
          </div>

          {/*
            tabIndex={0}: nothing inside a reply is focusable, so without it
            Tab skipped the whole conversation and a keyboard-only user could
            not scroll back through it at all.
            role="log" with aria-live="off" for the semantics without the
            noise — the sr-only region below announces the finished reply once,
            instead of every streamed token interrupting the last.
          */}
          <div
            ref={scrollRef}
            tabIndex={0}
            role="log"
            aria-live="off"
            aria-label="Conversation with Dolly"
            style={{ minHeight: 280, maxHeight: 460, overflowY: "auto" }}
          >
          <div style={{ padding: "26px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((m, i) => {
              // A rule, not a reply: no avatar, no bubble, no first person —
              // and a way to act on it when it is about the plan.
              if (m.notice) {
                return (
                  <div key={i} style={{ alignSelf: "center", width: "100%" }}>
                    <p
                      role="status"
                      style={{
                        textAlign: "center", fontFamily: "var(--font-ui)", fontSize: 13,
                        lineHeight: 1.6, color: "var(--fg2)", background: "var(--card2)",
                        border: "1px solid var(--hair)", borderRadius: 14, padding: "12px 16px", margin: 0,
                      }}
                    >
                      {m.text}
                      {/* The upsell needs somewhere to go. Desktop had no
                          route to plans from this screen at all. */}
                      {/Mapped\+|plan/i.test(m.text) && (
                        <>
                          {" "}
                          <a href="/account" style={{ color: "var(--go)", textDecoration: "underline" }}>See plans</a>
                        </>
                      )}
                    </p>
                  </div>
                );
              }

              // Before anything that reads m.text — a crisis card has none.
              if (m.crisis) {
                return (
                  <div key={i} style={{ alignSelf: "stretch", width: "100%" }}>
                    <CrisisCard />
                  </div>
                );
              }

              const dolly = m.from === "dolly";

              /**
                 Dolly opens every reply with one line of compact JSON carrying
                 her chips, headline and follow-ups. This bubble printed
                 `m.text` straight out, so desktop showed
                 `{"lead":"…","tags":[…]}` at the top of every single answer —
                 and with no `pre-wrap`, the prose below it collapsed into one
                 unbroken paragraph with numbered lists running inline.
                 parseDollyReply is the same parser the mobile thread uses, and
                 it degrades to plain prose if the line is malformed, so raw
                 JSON cannot reach the screen either way. */
              const { meta, body, metaPending } = dolly
                ? parseDollyReply(m.text)
                : { meta: null, body: m.text, metaPending: false };

              // The meta line is still arriving: there is nothing to show yet,
              // and the typing row below is already saying so.
              if (dolly && metaPending && !body) return null;

              return (
                <div key={i} role="article" style={{ display: "flex", gap: 10, alignItems: "flex-end", justifyContent: dolly ? "flex-start" : "flex-end", animation: "mp-pop .3s ease" }}>
                  {dolly && <span aria-hidden="true" style={{ width: 30, height: 30, flex: "0 0 auto", borderRadius: "50%", background: `url('${AVATAR}') center/cover`, alignSelf: "flex-end" }} />}
                  <div style={dolly
                    ? { maxWidth: "78%", padding: "14px 18px", borderRadius: "16px 16px 16px 4px", background: "var(--card2)", border: "1px solid var(--hair)", fontSize: 14.5, lineHeight: 1.6, color: "var(--fg2)", textWrap: "pretty" }
                    : { maxWidth: "76%", padding: "13px 18px", borderRadius: "16px 16px 4px 16px", background: "var(--bubble-you)", border: "1px solid var(--hair)", fontSize: 14.5, lineHeight: 1.55, color: "var(--fg)" }}>
                    {/* Who is speaking. Read aloud, every turn ran together
                        into one voice. */}
                    <span className="sr-only">{dolly ? "Dolly said: " : "You said: "}</span>
                    {!!meta?.tags.length && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 11 }}>
                        {meta.tags.map((tag) => (
                          <span key={tag.label} style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: "var(--soft)", border: "1px solid var(--hair)", color: "var(--fg2)" }}>
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    )}
                    {meta?.lead && (
                      <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 500, fontSize: 16, lineHeight: 1.45, color: "var(--fg)", margin: "0 0 9px" }}>
                        {meta.lead}
                      </p>
                    )}
                    {/* pre-wrap, or Dolly's paragraphs and numbered lists all
                        run together into one block. */}
                    <span style={{ whiteSpace: "pre-wrap" }}>{body}</span>
                  </div>
                </div>
              );
            })}
            {typing && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <span aria-hidden="true" style={{ width: 30, height: 30, flex: "0 0 auto", borderRadius: "50%", background: `url('${AVATAR}') center/cover` }} />
                <div style={{ padding: "14px 18px", borderRadius: "16px 16px 16px 4px", background: "var(--card2)", border: "1px solid var(--hair)", color: "var(--muted)", fontSize: 14 }}>Dolly is looking at your chart…</div>
              </div>
            )}
          </div>
          </div>

          {/* Announced once, when the reply is finished — see the log region
              above for why not on every token. */}
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {typing ? "Dolly is writing…" : announcement}
          </div>

          {/* suggestions */}
          <div style={{ padding: "4px 20px 14px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {QA.map((x) => (
              <button key={x.q} onClick={() => sendMsg(x.q)} className="mp-chip2" style={{ fontFamily: "var(--wbody)", fontSize: 12.5, fontWeight: 500, padding: "8px 14px", borderRadius: 999, cursor: "pointer", background: "var(--soft)", border: "1px solid var(--hair)", color: "var(--fg2)" }}>{x.q}</button>
            ))}
          </div>

          {/* input */}
          <div style={{ padding: "14px 20px 20px", borderTop: "1px solid var(--line)", display: "flex", gap: 12 }}>
            {/* A placeholder is not a label: it disappears on the first
                keystroke, and a screen reader announced this only as "edit
                text". */}
            <label htmlFor="web-dolly-input" className="sr-only">Ask Dolly a question about your chart</label>
            <input
              id="web-dolly-input"
              ref={inputRef}
              value={input}
              // isComposing: without this, Enter while an IME candidate window
              // is open sends the half-built word instead of accepting it, so
              // Japanese, Chinese and Korean input was unusable here.
              onKeyDown={(e) => {
                if (e.key === "Enter" && !(e.nativeEvent as unknown as KeyboardEvent).isComposing) send();
              }}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Dolly anything about your chart…"
              style={{ flex: 1, background: "var(--soft)", border: "1px solid var(--hair)", borderRadius: 999, padding: "13px 20px", color: "var(--fg)", fontFamily: "var(--wbody)", fontSize: 14.5, outline: "none" }}
            />
            <button onClick={send} aria-label="Send message" style={{ width: 48, height: 48, flex: "0 0 auto", borderRadius: "50%", border: "none", cursor: "pointer", background: "var(--brass)", color: "var(--btn-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            </button>
          </div>
        </div>
        <p style={{ textAlign: "center", fontFamily: "var(--font-ui)", fontSize: 12, lineHeight: 1.6, color: "var(--faint)", margin: "16px auto 0", maxWidth: 540 }}>
          Dolly is an AI, not a person. She reads your real birth chart when you&rsquo;re signed in &mdash; the more complete your chart, the more specific her answers.
        </p>

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
