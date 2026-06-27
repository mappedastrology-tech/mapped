"use client";

import { useMemo, useState } from "react";

type Group = { name: string; accent?: string; items: string[] };

/**
 * Tap-to-sort categorisation (design frame P). Tap an item chip to lift it,
 * then tap the group it belongs to. Correct → it pops into the bucket; wrong →
 * the bucket shakes and a coach line nudges without giving the answer away.
 */
export default function SortBlock({ prompt, instructions, groups }: { prompt: string; instructions?: string; groups: Group[] }) {
  // Map each item → its correct group name (built once).
  const answer = useMemo(() => {
    const m = new Map<string, string>();
    groups.forEach((g) => g.items.forEach((it) => m.set(it, g.name)));
    return m;
  }, [groups]);

  // Shuffle the tray exactly once (useState initializer = one-time, render-pure).
  const [allItems] = useState<string[]>(() =>
    groups
      .flatMap((g) => g.items)
      .map((it) => ({ it, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map((x) => x.it),
  );

  const [placed, setPlaced] = useState<Record<string, string>>({}); // item → group
  const [sel, setSel] = useState<string | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const tray = allItems.filter((it) => !(it in placed));
  const placedCount = Object.keys(placed).length;
  const total = allItems.length;
  const cap = Math.max(...groups.map((g) => g.items.length));

  function tapGroup(name: string) {
    if (!sel || done) return;
    const correct = answer.get(sel) === name;
    if (correct) {
      const next = { ...placed, [sel]: name };
      setPlaced(next);
      const ns = streak + 1;
      setStreak(ns);
      setMsg(ns >= 3 ? `On fire — ${ns} in a row ✦` : null);
      setSel(null);
      if (Object.keys(next).length === total) {
        setDone(true);
        setMsg(null);
      }
    } else {
      setShake(name);
      setStreak(0);
      setMsg(`Not ${name} — feel for its true element.`);
      setTimeout(() => setShake((s) => (s === name ? null : s)), 450);
    }
  }

  function reset() {
    setPlaced({});
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
        <p className="text-[20px] font-medium" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>All {total} sorted</p>
        <p className="text-[13px] mt-2" style={{ color: "var(--foreground-secondary)" }}>{flawless ? "Flawless run — not a single misplacement." : "Nicely done — you’ve got the groupings."}</p>
        <button onClick={reset} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase active:scale-[0.98] transition-transform" style={{ background: "var(--brass)", color: "var(--btn-primary-text)", letterSpacing: "0.16em" }}>
          Sort again <span aria-hidden="true">↺</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--background-card)", border: "1px solid var(--border-card)", boxShadow: "var(--card-shadow)" }}>
      <style>{`@keyframes sb-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}@keyframes sb-pop{0%{transform:scale(.55);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}@keyframes lib-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>

      {/* progress */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--lib-track)" }}>
          <div className="h-full rounded-full" style={{ width: `${(placedCount / total) * 100}%`, background: "linear-gradient(90deg,#a88a40,#d4b878)", transition: "width 0.45s cubic-bezier(.34,1.56,.64,1)" }} />
        </div>
        <span className="text-[9px]" style={{ letterSpacing: "0.14em", color: "var(--foreground-muted)" }}>{placedCount}/{total}</span>
      </div>

      <p className="text-[9px] uppercase font-semibold text-center" style={{ letterSpacing: "0.2em", color: "var(--brass)" }}>Tap to sort</p>
      <p className="text-[17px] text-center mt-1.5" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{prompt}</p>
      <p className="text-[12px] text-center mt-2 min-h-[18px]" style={{ color: msg ? (streak >= 3 ? "var(--sage-light)" : "var(--oxblood-light)") : "var(--foreground-muted)" }}>
        {msg ?? (sel ? "Now tap its group" : instructions ?? "Tap an item, then tap where it belongs")}
      </p>

      {/* tray */}
      <div className="flex flex-wrap justify-center items-center gap-2 mt-4 min-h-[40px]">
        {tray.map((it) => {
          const lifted = sel === it;
          return (
            <button
              key={it}
              onClick={() => setSel(lifted ? null : it)}
              className="px-3.5 py-2 rounded-xl text-[13px] transition-transform"
              style={{
                background: lifted ? "var(--brass)" : "var(--background-elevated)",
                color: lifted ? "var(--btn-primary-text)" : "var(--foreground)",
                border: `1px solid ${lifted ? "var(--brass)" : "var(--border-card)"}`,
                transform: lifted ? "translateY(-3px) scale(1.07)" : "none",
                boxShadow: lifted ? "0 6px 16px -4px rgba(201,169,97,0.6)" : "none",
                fontWeight: lifted ? 600 : 400,
              }}
            >
              {it}
            </button>
          );
        })}
        {tray.length === 0 && <span className="text-[12px]" style={{ color: "var(--foreground-muted)" }}>—</span>}
      </div>

      {/* buckets */}
      <div className="grid grid-cols-2 gap-2.5 mt-4">
        {groups.map((g) => {
          const accent = g.accent ?? "var(--brass)";
          const chips = Object.entries(placed).filter(([, gn]) => gn === g.name).map(([it]) => it);
          const full = chips.length >= g.items.length;
          return (
            <button
              key={g.name}
              onClick={() => tapGroup(g.name)}
              className="text-left rounded-2xl p-3"
              style={{
                background: "var(--background-elevated)",
                border: `1px solid ${sel && !full ? accent : "var(--border-card)"}`,
                boxShadow: sel && !full ? `0 0 0 2px ${accent}33` : "none",
                animation: shake === g.name ? "sb-shake 0.45s" : undefined,
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ background: accent }} aria-hidden="true" />
                <span className="text-[9px] uppercase font-semibold" style={{ letterSpacing: "0.16em", color: accent }}>{g.name}</span>
                <span className="flex-1" />
                <span className="text-[9px]" style={{ color: "var(--foreground-muted)" }}>{chips.length}/{g.items.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5" style={{ minHeight: 28 }}>
                {chips.map((c) => (
                  <span key={c} className="px-2.5 py-1.5 rounded-lg text-[11px]" style={{ background: `${accent}26`, color: "var(--foreground)", animation: "sb-pop 0.3s" }}>{c}</span>
                ))}
                {chips.length === 0 && (
                  <span className="px-3 py-1.5 rounded-lg text-[11px]" style={{ border: "1px dashed rgba(201,169,97,0.4)", color: "var(--foreground-muted)" }}>drop here</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p className="sr-only">{cap} items per group.</p>
    </div>
  );
}
