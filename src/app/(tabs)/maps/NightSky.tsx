"use client";

/**
 * NightSky — the "Your Map" landing for the Maps tab.
 *
 * The people in your orbit are grouped into labelled constellations (Partner,
 * Origin Family, Friends) of stars around a central "You", over the app's
 * night-sky image. Drag (one finger) to roam, pinch (two fingers) to zoom,
 * tap a star to open its reading.
 *
 * Presentational only — data + navigation live in the Maps page.
 */

import { useEffect, useMemo, useRef, useState } from "react";

export interface SkyPerson {
  id: string;
  name: string;
  group: string; // "circle" | "origin" | "friend"
  sun: string | null;
}

const GROUP_META: Record<string, { label: string; color: string; angle: number }> = {
  circle: { label: "Partner", color: "#c98a7a", angle: -90 },       // top
  origin: { label: "Origin Family", color: "#B8A0D2", angle: 148 }, // lower-left
  friend: { label: "Friends", color: "#6a9a4a", angle: 32 },        // lower-right
};
const GROUP_ORDER = ["circle", "origin", "friend"];

const ADD_OPTIONS: { cat: string; label: string; hint: string }[] = [
  { cat: "circle", label: "Your Home", hint: "Partner & children" },
  { cat: "origin", label: "Origin Family", hint: "Parents, siblings…" },
  { cat: "friend", label: "Friend", hint: "Anyone else" },
];

const CLAMP = 380;
const MIN_SCALE = 0.6;
const MAX_SCALE = 2.6;

type LaidNode = SkyPerson & { x: number; y: number; color: string };
type Cluster = { group: string; label: string; color: string; cx: number; cy: number; lx: number; ly: number };

// Group people into labelled clusters around You (0,0).
function layout(people: SkyPerson[]): { nodes: LaidNode[]; clusters: Cluster[] } {
  const groups: Record<string, SkyPerson[]> = { circle: [], origin: [], friend: [] };
  people.forEach((p) => { (groups[p.group] || groups.friend).push(p); });
  const present = GROUP_ORDER.filter((g) => groups[g].length > 0);
  const nodes: LaidNode[] = [];
  const clusters: Cluster[] = [];
  present.forEach((g) => {
    const meta = GROUP_META[g];
    const ang = (meta.angle * Math.PI) / 180;
    const R = 122;
    const cx = Math.cos(ang) * R;
    const cy = Math.sin(ang) * R;
    const arr = groups[g];
    clusters.push({
      group: g, label: meta.label, color: meta.color, cx, cy,
      // sit the label just above the cluster, clamped horizontally to stay on-screen
      lx: Math.max(-130, Math.min(130, cx)),
      ly: cy - 54,
    });
    const n = arr.length;
    const cols = Math.min(n, 3);
    arr.forEach((p, i) => {
      let x = cx, y = cy;
      if (n > 1) {
        const row = Math.floor(i / cols);
        const colsInRow = Math.min(n - row * cols, cols);
        const col = i % cols;
        x = cx + (col - (colsInRow - 1) / 2) * 82; // wider gap so name labels never collide
        y = cy + row * 76;
      }
      nodes.push({ ...p, x, y, color: meta.color });
    });
  });
  return { nodes, clusters };
}

export default function NightSky({
  people,
  userSun,
  hasChart,
  onSelectPerson,
  onSelectSelf,
  onSelectGroup,
  onAdd,
  onOpenPlaces,
}: {
  people: SkyPerson[];
  userSun: string | null;
  hasChart: boolean;
  onSelectPerson: (id: string) => void;
  onSelectSelf: () => void;
  onSelectGroup: (group: string) => void;
  onAdd: (category: string) => void;
  onOpenPlaces: () => void;
}) {
  const skyRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const pan = useRef({ x: 0, y: 0 });
  const scale = useRef(1);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const dragStart = useRef<{ px: number; py: number; bx: number; by: number } | null>(null);
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const moved = useRef(0);
  const [addOpen, setAddOpen] = useState(false);

  const { nodes, clusters } = useMemo(() => layout(people), [people]);

  const apply = () => {
    if (midRef.current) {
      midRef.current.style.transform = `translate(calc(-50% + ${pan.current.x}px), calc(-50% + ${pan.current.y}px)) scale(${scale.current})`;
    }
  };

  // One-finger drag to pan, two-finger pinch to zoom (pointer events, window-level
  // move/up so a gesture keeps working even if the finger leaves the element).
  useEffect(() => {
    const sky = skyRef.current;
    if (!sky) return;
    const down = (e: PointerEvent) => {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved.current = 0;
      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()];
        pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: scale.current };
        dragStart.current = null;
      } else if (pointers.current.size === 1) {
        dragStart.current = { px: e.clientX, py: e.clientY, bx: pan.current.x, by: pan.current.y };
      }
      try { sky.setPointerCapture(e.pointerId); } catch { /* noop */ }
    };
    const move = (e: PointerEvent) => {
      if (!pointers.current.has(e.pointerId)) return;
      const prev = pointers.current.get(e.pointerId)!;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.current.size >= 2 && pinchStart.current) {
        const [a, b] = [...pointers.current.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        scale.current = Math.max(MIN_SCALE, Math.min(MAX_SCALE, pinchStart.current.scale * (dist / pinchStart.current.dist)));
        apply();
      } else if (dragStart.current) {
        moved.current += Math.abs(e.clientX - prev.x) + Math.abs(e.clientY - prev.y);
        const dx = e.clientX - dragStart.current.px;
        const dy = e.clientY - dragStart.current.py;
        pan.current = {
          x: Math.max(-CLAMP, Math.min(CLAMP, dragStart.current.bx + dx)),
          y: Math.max(-CLAMP, Math.min(CLAMP, dragStart.current.by + dy)),
        };
        apply();
      }
    };
    const up = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) pinchStart.current = null;
      if (pointers.current.size === 1) {
        const [p] = [...pointers.current.values()];
        dragStart.current = { px: p.x, py: p.y, bx: pan.current.x, by: pan.current.y };
      } else if (pointers.current.size === 0) {
        dragStart.current = null;
      }
    };
    sky.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    apply();
    return () => {
      sky.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  const animate = () => {
    const m = midRef.current;
    if (!m) return;
    m.style.transition = "transform 0.45s cubic-bezier(.22,1,.36,1)";
    apply();
    window.setTimeout(() => { if (m) m.style.transition = ""; }, 480);
  };
  const recenter = () => { pan.current = { x: 0, y: 0 }; scale.current = 1; animate(); };
  const zoomBy = (f: number) => { scale.current = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale.current * f)); animate(); };

  // A tap (not a drag) on a star selects it. A little drift is forgiven so an
  // imperfect tap on the pannable map still registers.
  const tap = (fn: () => void) => () => { if (moved.current <= 14) fn(); };

  const fabBtn: React.CSSProperties = {
    width: 46, height: 46, borderRadius: 999, background: "rgba(20,16,28,.6)", border: "1px solid rgba(201,169,97,.25)",
    backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 6px 18px rgba(0,0,0,.4)", color: "#c9a961",
  };

  return (
    <div
      style={{
        position: "relative", width: "100%", height: "calc(100dvh - 131px)", minHeight: 440,
        overflow: "hidden", color: "#e8dfc4", background: "#0a0710", touchAction: "none",
      }}
    >
      <style>{`@keyframes ns-drift{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}`}</style>

      {/* Backdrop: the app's original night-sky image */}
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

      {/* Draggable / pinch-zoom sky */}
      <div ref={skyRef} style={{ position: "absolute", inset: 0, cursor: "grab", touchAction: "none" }}>
        <div ref={midRef} style={{ position: "absolute", top: "50%", left: "50%", willChange: "transform" }}>
          {/* constellation lines: You → cluster centroid → each star */}
          <svg width="1100" height="1100" viewBox="0 0 1100 1100" style={{ position: "absolute", left: -550, top: -550, overflow: "visible", pointerEvents: "none" }}>
            {clusters.map((c) => (
              <line key={`c-${c.group}`} x1={550} y1={550} x2={550 + c.cx} y2={550 + c.cy} stroke={c.color} strokeOpacity="0.28" strokeWidth="1" strokeDasharray="3 4" />
            ))}
            {/* You → Your places (astrocartography star) */}
            <line x1={550} y1={550} x2={550} y2={682} stroke="#c9a961" strokeOpacity="0.28" strokeWidth="1" strokeDasharray="3 4" />
            {nodes.map((n) => {
              const cl = clusters.find((c) => c.group === n.group)!;
              return <line key={`n-${n.id}`} x1={550 + cl.cx} y1={550 + cl.cy} x2={550 + n.x} y2={550 + n.y} stroke={n.color} strokeOpacity="0.3" strokeWidth="1" />;
            })}
          </svg>

          {/* cluster labels — Origin Family is a tappable pill that opens the family panel */}
          {clusters.map((c) => (
            c.group === "origin" ? (
              <button key={`l-${c.group}`} onClick={tap(() => onSelectGroup("origin"))} aria-label="Origin Family — view traits & curses" style={{
                position: "absolute", left: c.lx, top: c.ly, transform: "translate(-50%,-50%)", whiteSpace: "nowrap",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 1, fontFamily: "inherit",
                color: c.color, padding: "8px 15px", borderRadius: 16, background: "rgba(184,160,210,.22)",
                border: `1px solid ${c.color}`, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,.55)",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>
                  {c.label} <span aria-hidden="true" style={{ opacity: 0.85, fontSize: 13 }}>›</span>
                </span>
                <span style={{ fontSize: 8.5, fontWeight: 500, letterSpacing: ".06em", textTransform: "none", opacity: 0.8 }}>tap for traits &amp; curses</span>
              </button>
            ) : (
              <span key={`l-${c.group}`} style={{
                position: "absolute", left: c.lx, top: c.ly, transform: "translate(-50%,-50%)", whiteSpace: "nowrap",
                fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: c.color,
                textShadow: "0 1px 6px rgba(0,0,0,.9)", pointerEvents: "none",
              }}>{c.label}</span>
            )
          ))}

          {/* You — centre */}
          <button onClick={tap(onSelectSelf)} style={{ position: "absolute", left: 0, top: 0, transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
            <span style={{ position: "relative", width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", animation: "ns-drift 6s ease-in-out infinite" }}>
              <span style={{ position: "absolute", inset: -10, borderRadius: 999, background: "radial-gradient(circle, rgba(201,169,97,.55), rgba(201,169,97,.12) 60%, transparent 75%)" }} />
              <span style={{ position: "relative", fontSize: 26, color: "#f3e6c4", textShadow: "0 0 14px rgba(201,169,97,.9)" }} aria-hidden="true">{"☉"}</span>
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#f0e6d2", textShadow: "0 1px 6px rgba(0,0,0,.9)" }}>You</span>
            {hasChart && userSun && <span style={{ fontSize: 9, color: "#cdbfa6", textShadow: "0 1px 6px rgba(0,0,0,.9)" }}>{userSun}</span>}
          </button>

          {/* people — stars */}
          {nodes.map((person, i) => (
            <button key={person.id} onClick={tap(() => onSelectPerson(person.id))} style={{ position: "absolute", left: person.x, top: person.y, transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "inherit", animation: `ns-drift ${5 + (i % 4)}s ease-in-out infinite` }}>
              <span style={{ position: "relative", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ position: "absolute", inset: -6, borderRadius: 999, background: `radial-gradient(circle, ${person.color}99, ${person.color}22 60%, transparent 74%)` }} />
                <span style={{ position: "relative", width: 30, height: 30, borderRadius: 999, background: "rgba(10,7,16,.6)", border: `1px solid ${person.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: person.color }}>
                  {person.name.charAt(0).toUpperCase()}
                </span>
              </span>
              <span style={{ fontSize: 9.5, color: "#e8dfc4", maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textShadow: "0 1px 6px rgba(0,0,0,.9)" }}>{person.name.split(" ")[0]}</span>
            </button>
          ))}

          {/* Astrocartography — your places, as a star on the map */}
          <button onClick={tap(onOpenPlaces)} style={{ position: "absolute", left: 0, top: 132, transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "inherit", animation: "ns-drift 7s ease-in-out infinite" }}>
            <span style={{ position: "relative", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ position: "absolute", inset: -7, borderRadius: 999, background: "radial-gradient(circle, rgba(201,169,97,.6), rgba(201,169,97,.18) 60%, transparent 74%)" }} />
              <span style={{ position: "relative", width: 32, height: 32, borderRadius: 999, background: "rgba(10,7,16,.6)", border: "1px solid #c9a961", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a961" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" /></svg>
              </span>
            </span>
            <span style={{ fontSize: 9.5, color: "#e8dfc4", whiteSpace: "nowrap", textShadow: "0 1px 6px rgba(0,0,0,.9)" }}>Your places</span>
          </button>
        </div>
      </div>

      {/* Empty hint */}
      {people.length === 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "58%", textAlign: "center", zIndex: 20, pointerEvents: "none", padding: "0 40px" }}>
          <p style={{ fontSize: 13, color: "#cdbfa6", lineHeight: 1.6, margin: 0, textShadow: "0 1px 6px rgba(0,0,0,.9)" }}>
            Add the people in your life and they&rsquo;ll join your sky as stars.
          </p>
        </div>
      )}

      {/* Zoom + recenter — top-right, clear of the clusters */}
      <div style={{ position: "absolute", right: 14, top: 74, zIndex: 35, display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => zoomBy(1.35)} aria-label="Zoom in" style={fabBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="6" x2="12" y2="18" /><line x1="6" y1="12" x2="18" y2="12" /></svg>
        </button>
        <button onClick={() => zoomBy(1 / 1.35)} aria-label="Zoom out" style={fabBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="12" x2="18" y2="12" /></svg>
        </button>
        <button onClick={recenter} aria-label="Recenter" style={fabBtn}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="currentColor" stroke="none" /></svg>
        </button>
      </div>

      {/* Add person (with category menu) */}
      <div style={{ position: "absolute", right: 16, bottom: 84, zIndex: 36 }}>
        {addOpen && (
          <div style={{ position: "absolute", right: 0, bottom: 60, width: 210, borderRadius: 16, background: "rgba(18,12,28,.96)", border: "1px solid rgba(201,169,97,.22)", boxShadow: "0 14px 40px rgba(0,0,0,.5)", overflow: "hidden" }}>
            {ADD_OPTIONS.map((o) => (
              <button key={o.cat} onClick={() => { setAddOpen(false); onAdd(o.cat); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 14px", background: "none", border: "none", borderBottom: "1px solid rgba(232,223,196,.08)", cursor: "pointer", color: "#e8dfc4" }}>
                <span style={{ fontSize: 13, fontWeight: 600, display: "block" }}>{o.label}</span>
                <span style={{ fontSize: 11, color: "#9a8662" }}>{o.hint}</span>
              </button>
            ))}
          </div>
        )}
        <button onClick={() => setAddOpen((v) => !v)} aria-label="Add a person" style={{ width: 52, height: 52, borderRadius: 999, background: "var(--brass, #c9a961)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 8px 22px rgba(201,169,97,.45)", transition: "transform .2s", transform: addOpen ? "rotate(45deg)" : "none" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2a1a10" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
      </div>

      {/* Hint pill */}
      <div style={{ position: "absolute", left: "50%", bottom: 24, transform: "translateX(-50%)", zIndex: 34, display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 999, background: "rgba(20,16,28,.55)", border: "1px solid rgba(232,223,196,.12)", backdropFilter: "blur(8px)", pointerEvents: "none" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9a8662" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" /></svg>
        <span style={{ fontSize: 11, color: "#b8a886", letterSpacing: ".02em" }}>Drag to roam · pinch to zoom · tap a star</span>
      </div>
    </div>
  );
}
