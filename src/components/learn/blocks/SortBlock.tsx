"use client";

import { useMemo, useState } from "react";
import { PrimaryPill } from "../LessonChrome";

type Group = { name: string; accent?: string; items: string[] };

/** A small deterministic PRNG, so a seed always yields the same order. */
function seededShuffle(items: readonly string[], seed: string): string[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Fisher-Yates. Only ever called from an event handler, never during render. */
function shuffle(items: readonly string[]): string[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Tap-to-sort categorisation (design frame P).
 *
 * Tap an item chip to lift it, then tap the group it belongs to. Correct pops
 * into the bucket; wrong shakes the bucket and nudges without giving the
 * answer away — the chip stays lifted so the next tap is a second guess rather
 * than a fresh start.
 *
 * Deliberately tap-to-place rather than HTML5 drag: drag events are unreliable
 * on touch, and a drag gesture inside a vertically scrolling lesson fights the
 * scroll.
 *
 * Misses are counted rather than inferred. The old code decided "flawless"
 * from whether the streak had reached the total, which happens to be right but
 * says nothing about HOW MANY were missed — and the design asks for that
 * number in both the footnote and the closing line.
 */
export default function SortBlock({ prompt, instructions, groups }: { prompt: string; instructions?: string; groups: Group[] }) {
  // Map each item → its correct group name (built once).
  const answer = useMemo(() => {
    const m = new Map<string, string>();
    groups.forEach((g) => g.items.forEach((it) => m.set(it, g.name)));
    return m;
  }, [groups]);

  /**
   * The tray order.
   *
   * This used to be a Math.random() shuffle in a useState initializer, which
   * is NOT render-pure however it looks: the initializer runs on the server
   * and again on the client, so the two produced different orders and React
   * reported a hydration mismatch on every lesson with a sort block. The
   * server would render "Capricorn" first and the client "Aquarius", and the
   * whole tree was thrown away and re-rendered.
   *
   * So the first order is derived from the prompt instead — mixed relative to
   * the answer order, but identical everywhere. Reshuffling on "Sort again"
   * is a user interaction, long after hydration, so it can use Math.random.
   */
  const [allItems, setAllItems] = useState<string[]>(() => seededShuffle(groups.flatMap((g) => g.items), prompt));

  const [placed, setPlaced] = useState<Record<string, string>>({}); // item → group
  const [sel, setSel] = useState<string | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [wrong, setWrong] = useState(0);
  /** Which hint to show. Drives the line's wording AND its colour. */
  const [tone, setTone] = useState<"idle" | "correct" | "wrong">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const tray = allItems.filter((it) => !(it in placed));
  const placedCount = Object.keys(placed).length;
  const total = allItems.length;
  const perGroup = groups[0]?.items.length ?? 0;
  /** True when every group holds the same number — lets the footnote be specific. */
  const evenGroups = groups.every((g) => g.items.length === perGroup);

  function tapGroup(name: string) {
    if (!sel || done) return;
    if (answer.get(sel) === name) {
      const next = { ...placed, [sel]: name };
      const ns = streak + 1;
      setPlaced(next);
      setStreak(ns);
      setSel(null);
      if (Object.keys(next).length === total) {
        setDone(true);
        setMsg(null);
        setTone("idle");
      } else {
        setTone("correct");
        setMsg(ns >= 3 ? `On fire — ${ns} in a row ✦` : "Nice ✦ keep going.");
      }
    } else {
      setShake(name);
      setStreak(0);
      setWrong((n) => n + 1);
      setTone("wrong");
      setMsg(`Not ${name} — feel for its true element.`);
      // Cleared just after the animation so a second wrong tap re-triggers it.
      setTimeout(() => setShake((s) => (s === name ? null : s)), 420);
    }
  }

  function reset() {
    // Safe here: this is a tap, not a render.
    setAllItems((prev) => shuffle(prev));
    setPlaced({});
    setSel(null);
    setStreak(0);
    setWrong(0);
    setMsg(null);
    setTone("idle");
    setDone(false);
  }

  if (done) {
    return (
      <div
        className="text-center"
        style={{
          borderRadius: 18, padding: "32px 24px",
          background: "var(--lib-card)", border: "1px solid var(--lib-card-border)",
        }}
      >
        <div className="lib-floaty" style={{ fontSize: 40, marginBottom: 8 }} aria-hidden="true">✦</div>
        <p
          className="uppercase"
          style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, letterSpacing: "0.07em", color: "var(--lib-ink)" }}
        >
          All {total} sorted
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--lib-body)", marginTop: 8, lineHeight: 1.55 }}>
          {wrong === 0
            ? "Flawless run — not a single miss."
            : `Sorted with ${wrong} ${wrong === 1 ? "miss" : "misses"}. Go for a clean sweep.`}
        </p>
        <div className="mt-5 flex justify-center">
          <PrimaryPill onClick={reset} arrow={false}>Sort again ↺</PrimaryPill>
        </div>
      </div>
    );
  }

  const hintColor =
    tone === "correct" ? "var(--sage-bright)"
    : tone === "wrong" ? "#c98a7a"
    : sel ? "var(--brass-light)"
    : "var(--lib-muted)";

  return (
    <div style={{ borderRadius: 18, padding: 16, background: "var(--lib-card)", border: "1px solid var(--lib-card-border)", boxShadow: "var(--lib-card-shadow)" }}>
      {/* progress */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 overflow-hidden" style={{ height: 6, borderRadius: 999, background: "var(--lib-track)" }}>
          <div
            style={{
              height: "100%", borderRadius: 999, width: `${(placedCount / total) * 100}%`,
              background: "linear-gradient(90deg,#a88a40,#d4b878)",
              transition: "width .45s cubic-bezier(.34,1.56,.64,1)",
            }}
          />
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "0.14em", color: "var(--lib-muted)" }}>
          {placedCount} / {total}
        </span>
      </div>

      <p className="uppercase text-center" style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "var(--brass)" }}>
        Tap to sort
      </p>
      <p className="text-center" style={{ fontFamily: "var(--font-serif-lib)", fontSize: 17, color: "var(--lib-ink)", marginTop: 6 }}>
        {prompt}
      </p>

      {/* The hint line carries four states, and its colour is part of the
          message — green for a run, warm red for a miss, brass while lifted. */}
      <p
        role="status"
        className="text-center"
        style={{ fontSize: 12, marginTop: 8, minHeight: 18, color: hintColor, transition: "color .2s ease", fontFamily: "var(--font-body)" }}
      >
        {msg ?? (sel ? `Now tap ${sel}'s group.` : instructions ?? "Tap an item, then tap where it belongs.")}
      </p>

      {/* tray */}
      <div className="flex flex-wrap justify-center items-center gap-2 mt-4" style={{ minHeight: 40 }}>
        {tray.map((it) => {
          const lifted = sel === it;
          return (
            <button
              key={it}
              onClick={() => setSel(lifted ? null : it)}
              aria-pressed={lifted}
              style={{
                fontFamily: "var(--font-serif-lib)", fontSize: 14,
                padding: "8px 13px", borderRadius: 11, minHeight: 44,
                background: "var(--lib-card)",
                color: "var(--lib-ink)",
                border: `1px solid color-mix(in srgb, var(--brass) ${lifted ? 60 : 25}%, transparent)`,
                transform: lifted ? "translateY(-3px) scale(1.07)" : "none",
                boxShadow: lifted ? "0 14px 26px -8px rgba(0,0,0,.7), 0 0 18px -2px rgba(201,169,97,.5)" : "none",
                transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
              }}
            >
              {it}
            </button>
          );
        })}
        {tray.length === 0 && <span style={{ fontSize: 12, color: "var(--lib-muted)" }}>—</span>}
      </div>

      {/* buckets */}
      <div className="grid grid-cols-2 gap-[11px] mt-4">
        {groups.map((g) => {
          const accent = g.accent ?? "var(--brass)";
          const chips = Object.entries(placed).filter(([, gn]) => gn === g.name).map(([it]) => it);
          const full = chips.length >= g.items.length;
          const armed = !!sel && !full;
          return (
            <button
              key={g.name}
              onClick={() => tapGroup(g.name)}
              className="text-left"
              style={{
                padding: 13, borderRadius: 16, minHeight: 96,
                background: "var(--lib-card)",
                border: armed ? `1.5px dashed ${accent}` : `1px solid var(--lib-card-border)`,
                boxShadow: shake === g.name
                  ? `0 0 0 1.5px var(--oxblood-light)`
                  : armed ? `0 0 16px -4px ${accent}` : "none",
                animation: shake === g.name ? "dsshake .42s" : undefined,
                transition: "border-color .2s ease, box-shadow .2s ease",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} aria-hidden="true" />
                <span className="uppercase" style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", color: accent }}>
                  {g.name}
                </span>
                <span className="flex-1" />
                <span style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--lib-muted)" }}>
                  {chips.length}/{g.items.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5" style={{ minHeight: 28 }}>
                {chips.map((c) => (
                  <span
                    key={c}
                    style={{
                      fontFamily: "var(--font-serif-lib)", fontSize: 13,
                      padding: "5px 10px", borderRadius: 9,
                      background: `color-mix(in srgb, ${accent} 13%, transparent)`,
                      border: `0.5px solid color-mix(in srgb, ${accent} 60%, transparent)`,
                      color: "var(--lib-ink)",
                      animation: "dspop .4s cubic-bezier(.34,1.56,.64,1)",
                    }}
                  >
                    {c}
                  </span>
                ))}
                {chips.length === 0 && (
                  <span
                    style={{
                      fontSize: 11, padding: "6px 12px", borderRadius: 9,
                      border: "1px dashed color-mix(in srgb, var(--brass) 40%, transparent)",
                      color: "var(--lib-muted)",
                    }}
                  >
                    {armed ? "drop here" : " "}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footnote: the structural hint, which becomes a running miss count. */}
      <p className="text-center" style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--lib-muted)", marginTop: 12 }}>
        {wrong > 0 && `${wrong} ${wrong === 1 ? "miss" : "misses"} so far · `}
        {evenGroups && perGroup > 0
          ? `${perGroup} in every group`
          : "each group has a fixed number"}
      </p>
    </div>
  );
}
