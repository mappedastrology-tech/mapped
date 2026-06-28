"use client";

import { useMemo, useState } from "react";

type Pair = { cue: string; img?: string; match: string };

/**
 * Tap-to-match retrieval. Tap a cue card (image or glyph), then tap the meaning
 * that belongs to it — correct pairs lock with a ✓, a wrong meaning shakes and a
 * coach line nudges. Active recall instead of passive flip-to-reveal.
 */
export default function MatchBlock({ prompt, instructions, pairs }: { prompt: string; instructions?: string; pairs: Pair[] }) {
  const total = pairs.length;

  const matchByCue = useMemo(() => {
    const m = new Map<string, string>();
    pairs.forEach((p) => m.set(p.cue, p.match));
    return m;
  }, [pairs]);

  // Shuffle the meaning chips exactly once.
  const [meanings] = useState<string[]>(() =>
    pairs
      .map((p) => ({ m: p.match, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map((x) => x.m),
  );

  const [matched, setMatched] = useState<Record<string, true>>({}); // cue → matched
  const [sel, setSel] = useState<string | null>(null); // selected cue
  const [shake, setShake] = useState<string | null>(null); // meaning being shaken
  const [streak, setStreak] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const matchedMeanings = useMemo(
    () => new Set(Object.keys(matched).map((c) => matchByCue.get(c))),
    [matched, matchByCue],
  );
  const matchedCount = Object.keys(matched).length;
  const hasImg = pairs.some((p) => p.img);

  function tapMeaning(m: string) {
    if (!sel || done || matchedMeanings.has(m)) return;
    if (matchByCue.get(sel) === m) {
      const next = { ...matched, [sel]: true as const };
      setMatched(next);
      const ns = streak + 1;
      setStreak(ns);
      setMsg(ns >= 3 ? `On a roll — ${ns} in a row ✦` : null);
      setSel(null);
      if (Object.keys(next).length === total) {
        setDone(true);
        setMsg(null);
      }
    } else {
      setShake(m);
      setStreak(0);
      setMsg("Not a match — try again.");
      setTimeout(() => setShake((s) => (s === m ? null : s)), 450);
    }
  }

  function reset() {
    setMatched({});
    setSel(null);
    setStreak(0);
    setMsg(null);
    setDone(false);
  }

  if (done) {
    const flawless = streak >= total;
    return (
      <div className="rounded-2xl px-6 py-8 text-center" style={{ background: "linear-gradient(150deg, rgba(201,169,97,0.14), var(--background-card) 80%)", border: "1px solid rgba(201,169,97,0.4)" }}>
        <div className="text-[40px] mb-2" style={{ animation: "lib-floaty 3.4s ease-in-out infinite" }} aria-hidden="true">✦</div>
        <p className="text-[20px] font-medium" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>All {total} matched</p>
        <p className="text-[13px] mt-2" style={{ color: "var(--foreground-secondary)" }}>{flawless ? "Flawless — every pair on the first try." : "Nicely done — you’ve linked them all."}</p>
        <button onClick={reset} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase active:scale-[0.98] transition-transform" style={{ background: "var(--brass)", color: "var(--btn-primary-text)", letterSpacing: "0.16em" }}>
          Match again <span aria-hidden="true">↺</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--background-card)", border: "1px solid var(--border-card)", boxShadow: "var(--card-shadow)" }}>
      <style>{`@keyframes mb-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}@keyframes mb-pop{0%{transform:scale(.55);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}@keyframes lib-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>

      {/* progress */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--lib-track)" }}>
          <div className="h-full rounded-full" style={{ width: `${(matchedCount / total) * 100}%`, background: "linear-gradient(90deg,#a88a40,#d4b878)", transition: "width 0.45s cubic-bezier(.34,1.56,.64,1)" }} />
        </div>
        <span className="text-[9px]" style={{ letterSpacing: "0.14em", color: "var(--foreground-muted)" }}>{matchedCount}/{total}</span>
      </div>

      <p className="text-[9px] uppercase font-semibold text-center" style={{ letterSpacing: "0.2em", color: "var(--brass)" }}>Tap to match</p>
      <p className="text-[17px] text-center mt-1.5" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{prompt}</p>
      <p className="text-[12px] text-center mt-2 min-h-[18px]" style={{ color: msg ? (streak >= 3 ? "var(--sage-light)" : "var(--oxblood-light)") : "var(--foreground-muted)" }}>
        {msg ?? (sel ? "Now tap its meaning" : instructions ?? "Tap a card, then tap its meaning")}
      </p>

      {/* cues */}
      <div className={hasImg ? "grid grid-cols-3 gap-2 mt-4" : "flex flex-wrap justify-center gap-2 mt-4"}>
        {pairs.map((p) => {
          const isMatched = !!matched[p.cue];
          const lifted = sel === p.cue;
          return (
            <button
              key={p.cue}
              onClick={() => !isMatched && setSel(lifted ? null : p.cue)}
              disabled={isMatched}
              className="rounded-xl transition-transform"
              style={{
                background: lifted ? "var(--brass)" : "var(--background-elevated)",
                color: lifted ? "var(--btn-primary-text)" : "var(--foreground)",
                border: `1px solid ${lifted ? "var(--brass)" : isMatched ? "rgba(106,154,74,0.5)" : "var(--border-card)"}`,
                opacity: isMatched ? 0.45 : 1,
                transform: lifted ? "translateY(-3px) scale(1.05)" : "none",
                boxShadow: lifted ? "0 6px 16px -4px rgba(201,169,97,0.6)" : "none",
                padding: hasImg ? 6 : "8px 14px",
                fontWeight: lifted ? 600 : 400,
              }}
            >
              {p.img ? (
                <span className="flex flex-col items-center gap-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.img} alt="" aria-hidden="true" loading="lazy" style={{ width: "100%", height: 72, objectFit: "contain", borderRadius: 6 }} />
                  <span className="text-[11px] leading-tight">{isMatched ? "✓ " : ""}{p.cue}</span>
                </span>
              ) : (
                <span className="text-[14px]">{isMatched ? "✓ " : ""}{p.cue}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* meanings */}
      <div className="flex flex-col gap-1.5 mt-4">
        {meanings.map((m) => {
          const isMatched = matchedMeanings.has(m);
          return (
            <button
              key={m}
              onClick={() => tapMeaning(m)}
              disabled={isMatched}
              className="text-left rounded-xl px-3.5 py-2.5 text-[13px]"
              style={{
                background: "var(--background-elevated)",
                color: "var(--foreground)",
                border: `1px solid ${isMatched ? "rgba(106,154,74,0.5)" : sel ? "rgba(201,169,97,0.4)" : "var(--border-card)"}`,
                opacity: isMatched ? 0.5 : 1,
                animation: shake === m ? "mb-shake 0.45s" : isMatched ? "mb-pop 0.3s" : undefined,
              }}
            >
              {isMatched ? "✓ " : ""}{m}
            </button>
          );
        })}
      </div>
    </div>
  );
}
