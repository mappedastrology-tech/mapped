"use client";

/**
 * NightSky — the "Your Constellation" landing for the Maps tab.
 *
 * The people in your orbit are rendered as stars in a draggable night sky:
 * You at the centre, connections spiralling out on a golden-angle scatter,
 * faint parallax stars behind. Drag to roam; tap a star to open its reading.
 *
 * Presentational only — all data + navigation is owned by the Maps page and
 * passed in via props, so the existing detail / self / astro views are reused.
 */

import { useEffect, useMemo, useRef, useState } from "react";

export interface SkyPerson {
  id: string;
  name: string;
  category: string; // "circle" | "origin" | "friend" | other
  sun: string | null;
}

const CAT_COLOR: Record<string, string> = {
  circle: "#c98a7a", // home / partner — warm rose
  origin: "#B8A0D2", // origin family — lavender
  friend: "#6a9a4a", // friends — sage
};
const colorFor = (cat: string) => CAT_COLOR[cat] || "#c9a961";

const ADD_OPTIONS: { cat: string; label: string; hint: string }[] = [
  { cat: "circle", label: "Your Home", hint: "Partner & children" },
  { cat: "origin", label: "Origin Family", hint: "Parents, siblings…" },
  { cat: "friend", label: "Friend", hint: "Anyone else" },
];

// Golden-angle spiral places people in a balanced, organic scatter around You.
function constellation(n: number): { x: number; y: number }[] {
  const GA = Math.PI * (3 - Math.sqrt(5));
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const r = 78 + 50 * Math.sqrt(i + 1);
    const a = i * GA - Math.PI / 2;
    pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  return pts;
}

const CLAMP = 300;

export default function NightSky({
  people,
  userSun,
  hasChart,
  onSelectPerson,
  onSelectSelf,
  onAdd,
}: {
  people: SkyPerson[];
  userSun: string | null;
  hasChart: boolean;
  onSelectPerson: (id: string) => void;
  onSelectSelf: () => void;
  onAdd: (category: string) => void;
}) {
  const skyRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const pan = useRef({ x: 0, y: 0 });
  const drag = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const base = useRef({ x: 0, y: 0 });
  const moved = useRef(0);
  const [addOpen, setAddOpen] = useState(false);

  const positions = useMemo(() => constellation(people.length), [people.length]);

  const apply = () => {
    const { x, y } = pan.current;
    if (midRef.current) midRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  };

  useEffect(() => {
    apply();
  }, []);

  const onDown = (cx: number, cy: number, el?: HTMLElement, id?: number) => {
    drag.current = true;
    start.current = { x: cx, y: cy };
    base.current = { ...pan.current };
    moved.current = 0;
    if (el && id !== undefined) {
      try { el.setPointerCapture(id); } catch { /* noop */ }
    }
  };
  const onMove = (cx: number, cy: number) => {
    if (!drag.current) return;
    const dx = cx - start.current.x;
    const dy = cy - start.current.y;
    moved.current += Math.abs(dx) + Math.abs(dy);
    pan.current = {
      x: Math.max(-CLAMP, Math.min(CLAMP, base.current.x + dx)),
      y: Math.max(-CLAMP, Math.min(CLAMP, base.current.y + dy)),
    };
    apply();
  };
  const onUp = () => { drag.current = false; };

  const recenter = () => {
    const layers = [midRef.current];
    layers.forEach((l) => l && (l.style.transition = "transform 0.5s cubic-bezier(.22,1,.36,1)"));
    pan.current = { x: 0, y: 0 };
    apply();
    window.setTimeout(() => layers.forEach((l) => l && (l.style.transition = "")), 520);
  };

  // A tap (not a drag) on a star selects it.
  const tap = (fn: () => void) => () => { if (moved.current <= 8) fn(); };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "calc(100dvh - 172px)",
        minHeight: 440,
        overflow: "hidden",
        borderRadius: 24,
        color: "#e8dfc4",
        background: "#0a0710",
        touchAction: "none",
      }}
    >
      <style>{`@keyframes ns-drift{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}`}</style>

      {/* Backdrop: the app's original night-sky image (same one used elsewhere) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/night-sky.png" alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,5,15,0.25) 0%, rgba(5,5,15,0.45) 55%, rgba(5,5,15,0.72) 100%)" }} />

      {/* Header overlay */}
      <div style={{ position: "absolute", top: 18, left: 0, right: 0, zIndex: 30, textAlign: "center", pointerEvents: "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginBottom: 5 }}>
          <span style={{ width: 18, height: 1, background: "rgba(201,169,97,.5)" }} />
          <span style={{ fontSize: 9, letterSpacing: ".24em", textTransform: "uppercase", color: "#9a8662", fontWeight: 600 }}>The people in your orbit</span>
          <span style={{ width: 18, height: 1, background: "rgba(201,169,97,.5)" }} />
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 600, margin: 0, color: "#f0e6d2" }}>Your Map</h1>
      </div>

      {/* Draggable sky */}
      <div
        ref={skyRef}
        style={{ position: "absolute", inset: 0, cursor: "grab", touchAction: "none" }}
        onPointerDown={(e) => onDown(e.clientX, e.clientY, e.currentTarget, e.pointerId)}
        onPointerMove={(e) => onMove(e.clientX, e.clientY)}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {/* Mid layer: constellation lines + person nodes + You */}
        <div ref={midRef} style={{ position: "absolute", top: "50%", left: "50%", willChange: "transform" }}>
          <svg width="1100" height="1100" viewBox="0 0 1100 1100" style={{ position: "absolute", left: -550, top: -550, overflow: "visible", pointerEvents: "none" }}>
            {positions.map((p, i) => (
              <line
                key={i}
                x1={550} y1={550} x2={550 + p.x} y2={550 + p.y}
                stroke={colorFor(people[i].category)} strokeOpacity="0.22" strokeWidth="1"
              />
            ))}
          </svg>

          {/* You — centre */}
          <button
            onClick={tap(onSelectSelf)}
            style={{
              position: "absolute", left: 0, top: 0, transform: "translate(-50%,-50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer", color: "inherit",
            }}
          >
            <span style={{ position: "relative", width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", animation: "ns-drift 6s ease-in-out infinite" }}>
              <span style={{ position: "absolute", inset: -10, borderRadius: 999, background: "radial-gradient(circle, rgba(201,169,97,.55), rgba(201,169,97,.12) 60%, transparent 75%)" }} />
              <span style={{ position: "relative", fontSize: 26, color: "#f3e6c4", textShadow: "0 0 14px rgba(201,169,97,.9)" }} aria-hidden="true">{"☉"}</span>
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#f0e6d2" }}>You</span>
            {hasChart && userSun && <span style={{ fontSize: 9, color: "#9a8662" }}>{userSun}</span>}
          </button>

          {/* People — stars */}
          {people.map((person, i) => {
            const p = positions[i];
            const c = colorFor(person.category);
            return (
              <button
                key={person.id}
                onClick={tap(() => onSelectPerson(person.id))}
                style={{
                  position: "absolute", left: p.x, top: p.y, transform: "translate(-50%,-50%)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                  background: "none", border: "none", cursor: "pointer", color: "inherit",
                  animation: `ns-drift ${5 + (i % 4)}s ease-in-out infinite`,
                }}
              >
                <span style={{ position: "relative", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ position: "absolute", inset: -6, borderRadius: 999, background: `radial-gradient(circle, ${c}99, ${c}22 60%, transparent 74%)` }} />
                  <span style={{ position: "relative", width: 30, height: 30, borderRadius: 999, background: "rgba(10,7,16,.6)", border: `1px solid ${c}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: c }}>
                    {person.name.charAt(0).toUpperCase()}
                  </span>
                </span>
                <span style={{ fontSize: 9.5, color: "#cdbfa6", maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {person.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty hint */}
      {people.length === 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "58%", textAlign: "center", zIndex: 20, pointerEvents: "none", padding: "0 40px" }}>
          <p style={{ fontSize: 13, color: "#b8a886", lineHeight: 1.6, margin: 0 }}>
            Add the people in your life and they&rsquo;ll join your sky as stars.
          </p>
        </div>
      )}

      {/* Recenter */}
      <button
        onClick={recenter}
        aria-label="Recenter the sky"
        style={{ position: "absolute", right: 16, bottom: 84, zIndex: 35, width: 46, height: 46, borderRadius: 999, background: "rgba(20,16,28,.6)", border: "1px solid rgba(201,169,97,.25)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 6px 18px rgba(0,0,0,.4)" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a961" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="#c9a961" stroke="none" /></svg>
      </button>

      {/* Add person (with category menu) */}
      <div style={{ position: "absolute", right: 16, bottom: 140, zIndex: 36 }}>
        {addOpen && (
          <div style={{ position: "absolute", right: 0, bottom: 58, width: 210, borderRadius: 16, background: "rgba(18,12,28,.96)", border: "1px solid rgba(201,169,97,.22)", boxShadow: "0 14px 40px rgba(0,0,0,.5)", overflow: "hidden" }}>
            {ADD_OPTIONS.map((o) => (
              <button
                key={o.cat}
                onClick={() => { setAddOpen(false); onAdd(o.cat); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 14px", background: "none", border: "none", borderBottom: "1px solid rgba(232,223,196,.08)", cursor: "pointer", color: "#e8dfc4" }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, display: "block" }}>{o.label}</span>
                <span style={{ fontSize: 11, color: "#9a8662" }}>{o.hint}</span>
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setAddOpen((v) => !v)}
          aria-label="Add a person"
          style={{ width: 52, height: 52, borderRadius: 999, background: "var(--brass, #c9a961)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 8px 22px rgba(201,169,97,.45)", transition: "transform .2s", transform: addOpen ? "rotate(45deg)" : "none" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2a1a10" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
      </div>

      {/* Hint pill */}
      <div style={{ position: "absolute", left: "50%", bottom: 24, transform: "translateX(-50%)", zIndex: 34, display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 999, background: "rgba(20,16,28,.55)", border: "1px solid rgba(232,223,196,.12)", backdropFilter: "blur(8px)", pointerEvents: "none" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9a8662" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" /></svg>
        <span style={{ fontSize: 11, color: "#b8a886", letterSpacing: ".02em" }}>Drag to roam the sky · tap a star</span>
      </div>
    </div>
  );
}
