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

/**
 * A place on the map, as a star.
 *
 * Places used to be a single fixed dot wired straight to the astrocartography
 * screen — one door, not a branch. But a place belongs in the constellation on
 * the same footing as a person: you at the centre, branching out to partner,
 * family, friends and the places you have lived. Somewhere you spent six years
 * is at least as much a part of your map as somebody you met once.
 */
export interface SkyPlace {
  id: string;
  name: string;
  /** Where the chart was cast, versus somewhere lived since. */
  kind: "born" | "lived";
}

const PLACES_GROUP = "places";

const GROUP_META: Record<string, { label: string; color: string; angle: number; r?: number }> = {
  circle: { label: "Partner", color: "#c98a7a", angle: -90 },       // top
  origin: { label: "Origin Family", color: "#B8A0D2", angle: 148 }, // lower-left
  friend: { label: "Friends", color: "#6a9a4a", angle: 32 },        // lower-right
  /**
   * Straight down, which is where the old single "Your places" star sat, so
   * the branch grows out of the spot people already know.
   *
   * Further out than the rest, because every cluster hangs its label above
   * itself and this is the only one directly beneath You — at the shared
   * radius the pill landed on top of "You / Gemini". Pushing the branch out
   * gives the label its own air without making it the one group that reads
   * bottom-up.
   */
  [PLACES_GROUP]: { label: "Places", color: "#c9a961", angle: 90, r: 178 },
};
const GROUP_ORDER = ["circle", "origin", "friend", PLACES_GROUP];

/**
 * How many stars the sky holds before a search appears.
 *
 * Below this you can see the whole constellation at a glance and a search box
 * would be furniture. Above it, names start to overlap and finding one person
 * means dragging around hunting for them — so the field appears, and only
 * then. Clusters lay out three to a row, so this is about the point where the
 * third row of the biggest group starts colliding with its neighbours.
 */
export const CROWDED_AT = 10;

const ADD_OPTIONS: { cat: string; label: string; hint: string }[] = [
  { cat: "circle", label: "Your Home", hint: "Partner & children" },
  { cat: "origin", label: "Origin Family", hint: "Parents, siblings…" },
  { cat: "friend", label: "Friend", hint: "Anyone else" },
];

const CLAMP = 380;
// Low enough that a map with a dozen people still fits a phone at a glance.
const MIN_SCALE = 0.45;
const MAX_SCALE = 2.6;

type SkyNode = { id: string; name: string; group: string; sun: string | null; kind?: "born" | "lived" };
type LaidNode = SkyNode & { x: number; y: number; color: string };
type Cluster = { group: string; label: string; color: string; cx: number; cy: number; lx: number; ly: number };

// Group people and places into labelled clusters around You (0,0).
function layout(people: SkyPerson[], places: SkyPlace[]): { nodes: LaidNode[]; clusters: Cluster[] } {
  const groups: Record<string, SkyNode[]> = { circle: [], origin: [], friend: [], [PLACES_GROUP]: [] };
  people.forEach((p) => { (groups[p.group] || groups.friend).push(p); });
  places.forEach((pl) => {
    groups[PLACES_GROUP].push({ id: pl.id, name: pl.name, group: PLACES_GROUP, sun: null, kind: pl.kind });
  });
  const present = GROUP_ORDER.filter((g) => groups[g].length > 0);
  const nodes: LaidNode[] = [];
  const clusters: Cluster[] = [];

  /**
   * The constellation opens out as it fills.
   *
   * Members stack three to a row, so a group of ten is four rows deep. At a
   * fixed radius those rows grew straight into the next group — names landing
   * on names, a friend sitting on top of a place — and the map stopped being
   * readable at exactly the point someone had bothered to fill it in. Pushing
   * every branch out by the depth of the deepest one keeps the gaps the layout
   * was designed around, whatever gets added.
   *
   * Every branch moves by the same amount, not just the full one, because the
   * shape is a constellation: branches of different lengths from one centre
   * would read as a lopsided diagram rather than a sky.
   */
  const deepestRows = Math.max(1, ...present.map((g) => Math.ceil(groups[g].length / 3)));
  const spread = (deepestRows - 1) * 72;

  present.forEach((g) => {
    const meta = GROUP_META[g];
    const ang = (meta.angle * Math.PI) / 180;
    const R = (meta.r ?? 122) + spread;
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
  places,
  userSun,
  hasChart,
  onSelectPerson,
  onSelectPlace,
  onSelectSelf,
  onSelectGroup,
  onAdd,
  onOpenPlaces,
}: {
  people: SkyPerson[];
  places: SkyPlace[];
  userSun: string | null;
  hasChart: boolean;
  onSelectPerson: (id: string) => void;
  onSelectPlace: (id: string) => void;
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
  const [query, setQuery] = useState("");

  const { nodes, clusters } = useMemo(() => layout(people, places), [people, places]);

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
    // Desktop: scroll wheel / trackpad-pinch zooms toward the cursor.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = sky.getBoundingClientRect();
      const px = e.clientX - (rect.left + rect.width / 2);
      const py = e.clientY - (rect.top + rect.height / 2);
      const s0 = scale.current;
      const s1 = Math.max(MIN_SCALE, Math.min(MAX_SCALE, s0 * Math.exp(-e.deltaY * 0.0015)));
      if (s1 === s0) return;
      const ratio = s1 / s0;
      pan.current = {
        x: Math.max(-CLAMP, Math.min(CLAMP, px - (px - pan.current.x) * ratio)),
        y: Math.max(-CLAMP, Math.min(CLAMP, py - (py - pan.current.y) * ratio)),
      };
      scale.current = s1;
      apply();
    };
    sky.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    sky.addEventListener("wheel", onWheel, { passive: false });
    apply();
    return () => {
      sky.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      sky.removeEventListener("wheel", onWheel);
    };
  }, []);

  const animate = () => {
    const m = midRef.current;
    if (!m) return;
    m.style.transition = "transform 0.45s cubic-bezier(.22,1,.36,1)";
    apply();
    window.setTimeout(() => { if (m) m.style.transition = ""; }, 480);
  };
  /**
   * The zoom that shows the whole constellation at once.
   *
   * Branches push outward as they fill (see `spread` in layout), which keeps
   * stars from landing on each other but means a full map no longer fits the
   * screen at 1:1 — people were arriving to a sky cropped at every edge, with
   * their places off the bottom. So the view backs off far enough to hold
   * whatever is there, down to MIN_SCALE, and never zooms past 1:1, because
   * magnifying three stars to fill a phone looks like a mistake.
   */
  const fitScale = () => {
    const el = skyRef.current;
    if (!el || nodes.length === 0) return 1;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return 1;
    /**
     * Measured per axis, not as one radius.
     *
     * A phone is far taller than it is wide, and the groups that overflow are
     * the ones that spread sideways. Fitting a radius against the smaller of
     * the two dimensions wastes the height and still clips the width, so each
     * axis gets its own answer and the tighter one wins. The margin covers the
     * star's halo and the name printed under it.
     */
    const halo = 72;
    const maxX = Math.max(...nodes.map((n) => Math.abs(n.x))) + halo;
    const maxY = Math.max(...nodes.map((n) => Math.abs(n.y))) + halo;
    const fit = Math.min(r.width / 2 / maxX, r.height / 2 / maxY);
    return Math.max(MIN_SCALE, Math.min(1, fit));
  };

  /**
   * Refit when the shape of the map changes — someone added, a place added —
   * and not otherwise, so it never yanks the view out from under somebody who
   * has zoomed in to read something.
   */
  const fittedFor = useRef(-1);
  useEffect(() => {
    if (fittedFor.current === nodes.length) return;
    fittedFor.current = nodes.length;
    pan.current = { x: 0, y: 0 };
    scale.current = fitScale();
    apply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length]);

  const recenter = () => { pan.current = { x: 0, y: 0 }; scale.current = fitScale(); animate(); };
  const zoomBy = (f: number) => { scale.current = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale.current * f)); animate(); };

  /**
   * Fly to a star and put it in the middle.
   *
   * Searching a map should move the map. Jumping straight into the reading
   * would answer the question but teach you nothing about where the star sits,
   * and next time you would search again instead of remembering. So this
   * travels there and leaves it centred under the viewer.
   */
  const focusNode = (node: LaidNode) => {
    // A step in from wherever the map currently sits, capped — not a jump to a
    // fixed zoom, which on a full map would mean flying from "whole sky" to
    // "one star filling the screen" with nothing recognisable in between.
    const s = Math.max(scale.current, Math.min(MAX_SCALE, fitScale() * 1.6));
    scale.current = s;
    pan.current = {
      x: Math.max(-CLAMP, Math.min(CLAMP, -node.x * s)),
      y: Math.max(-CLAMP, Math.min(CLAMP, -node.y * s)),
    };
    animate();
  };

  /**
   * The search only exists once the sky is too full to read.
   *
   * Three stars do not need a search field, and putting one there would be
   * furniture sitting on top of the thing it is meant to help you look at.
   * Past CROWDED_AT, names start to overlap and finding somebody means
   * dragging around hunting for them — so it appears, and only then.
   */
  const crowded = nodes.length > CROWDED_AT;
  const q = query.trim().toLowerCase();
  const matches = crowded && q
    ? nodes.filter((n) => n.name.toLowerCase().includes(q)).slice(0, 6)
    : [];

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
      <img
              width={1023}
              height={1537} src="/night-sky.webp" alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,5,15,0.25) 0%, rgba(5,5,15,0.45) 55%, rgba(5,5,15,0.72) 100%)" }} />

      {/* Header overlay */}
      <div style={{ position: "absolute", top: 18, left: 0, right: 0, zIndex: 30, textAlign: "center", pointerEvents: "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginBottom: 5 }}>
          <span style={{ width: 18, height: 1, background: "rgba(201,169,97,.5)" }} />
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, letterSpacing: ".24em", textTransform: "uppercase", color: "#9a8662", fontWeight: 600 }}>The people in your orbit</span>
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
            {nodes.map((n) => {
              const cl = clusters.find((c) => c.group === n.group)!;
              return <line key={`n-${n.id}`} x1={550 + cl.cx} y1={550 + cl.cy} x2={550 + n.x} y2={550 + n.y} stroke={n.color} strokeOpacity="0.3" strokeWidth="1" />;
            })}
          </svg>

          {/* cluster labels — Origin Family is a tappable pill that opens the family panel */}
          {clusters.map((c) => (
            c.group === "origin" || c.group === PLACES_GROUP ? (
              <button
                key={`l-${c.group}`}
                onClick={tap(() => (c.group === PLACES_GROUP ? onOpenPlaces() : onSelectGroup("origin")))}
                aria-label={c.group === PLACES_GROUP ? "Places — open the world map of your planetary lines" : "Origin Family — view traits & patterns"}
                style={{
                position: "absolute", left: c.lx, top: c.ly, transform: "translate(-50%,-50%)", whiteSpace: "nowrap",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 1, fontFamily: "inherit",
                color: c.color, padding: "8px 15px", borderRadius: 16,
                background: c.group === PLACES_GROUP ? "rgba(201,169,97,.20)" : "rgba(184,160,210,.22)",
                border: `1px solid ${c.color}`, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,.55)",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>
                  {c.label} <span aria-hidden="true" style={{ opacity: 0.85, fontSize: 13 }}>›</span>
                </span>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 8.5, fontWeight: 500, letterSpacing: ".06em", textTransform: "none", opacity: 0.8 }}>
                  {c.group === PLACES_GROUP ? "tap for the world map" : "tap for traits & patterns"}
                </span>
              </button>
            ) : (
              <span key={`l-${c.group}`} style={{
                position: "absolute", left: c.lx, top: c.ly, transform: "translate(-50%,-50%)", whiteSpace: "nowrap",
                fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: c.color,
                textShadow: "0 1px 6px rgba(0,0,0,.9)", pointerEvents: "none",
              }}>{c.label}</span>
            )
          ))}

          {/* You — centre */}
          <button onClick={tap(onSelectSelf)} style={{ position: "absolute", left: 0, top: 0, transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
            <span style={{ position: "relative", width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", animation: "ns-drift 6s ease-in-out infinite" }}>
              <span style={{ position: "absolute", inset: -10, borderRadius: 999, background: "radial-gradient(circle, rgba(201,169,97,.55), rgba(201,169,97,.12) 60%, transparent 75%)" }} />
              <span style={{ position: "relative", fontSize: 26, color: "#f3e6c4", textShadow: "0 0 14px rgba(201,169,97,.9)" }} aria-hidden="true">{"☉\uFE0E"}</span>
            </span>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color: "#f0e6d2", textShadow: "0 1px 6px rgba(0,0,0,.9)" }}>You</span>
            {hasChart && userSun && <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "#cdbfa6", textShadow: "0 1px 6px rgba(0,0,0,.9)" }}>{userSun}</span>}
          </button>

          {/* people and places — stars */}
          {nodes.map((person, i) => (
            person.group === PLACES_GROUP ? (
              /* A place wears a globe rather than an initial — "L" could be
                 Lisbon or Logan, and on a map of your life those are not the
                 same kind of thing. Where the chart was cast gets a filled
                 centre, so your beginning reads differently from somewhere you
                 moved to later. */
              <button
                key={person.id}
                onClick={tap(() => onSelectPlace(person.id))}
                aria-label={`${person.name}${person.kind === "born" ? " — where your chart was cast" : ""}`}
                style={{ position: "absolute", left: person.x, top: person.y, transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "inherit", animation: `ns-drift ${6 + (i % 3)}s ease-in-out infinite` }}
              >
                <span style={{ position: "relative", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ position: "absolute", inset: -6, borderRadius: 999, background: `radial-gradient(circle, ${person.color}99, ${person.color}22 60%, transparent 74%)` }} />
                  <span style={{ position: "relative", width: 30, height: 30, borderRadius: 999, background: person.kind === "born" ? `${person.color}33` : "rgba(10,7,16,.6)", border: `1px solid ${person.color}`, display: "flex", alignItems: "center", justifyContent: "center", color: person.color }}>
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" /></svg>
                  </span>
                </span>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 9.5, color: "#e8dfc4", maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textShadow: "0 1px 6px rgba(0,0,0,.9)" }}>{person.name}</span>
              </button>
            ) : (
            <button key={person.id} onClick={tap(() => onSelectPerson(person.id))} style={{ position: "absolute", left: person.x, top: person.y, transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "inherit", animation: `ns-drift ${5 + (i % 4)}s ease-in-out infinite` }}>
              <span style={{ position: "relative", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ position: "absolute", inset: -6, borderRadius: 999, background: `radial-gradient(circle, ${person.color}99, ${person.color}22 60%, transparent 74%)` }} />
                <span style={{ position: "relative", width: 30, height: 30, borderRadius: 999, background: "rgba(10,7,16,.6)", border: `1px solid ${person.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: person.color }}>
                  {person.name.charAt(0).toUpperCase()}
                </span>
              </span>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 9.5, color: "#e8dfc4", maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textShadow: "0 1px 6px rgba(0,0,0,.9)" }}>{person.name.split(" ")[0]}</span>
            </button>
            )
          ))}

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

      {/* Search — only once there is too much sky to scan by eye */}
      {crowded && (
        <div style={{ position: "absolute", left: 14, right: 74, top: 74, zIndex: 36 }}>
          <label htmlFor="sky-search" className="sr-only">Find someone or somewhere on your map</label>
          <input
            id="sky-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Find any of your ${nodes.length} stars…`}
            style={{
              width: "100%", padding: "10px 14px", minHeight: 44, borderRadius: 999,
              background: "rgba(20,16,28,.72)", border: "1px solid rgba(201,169,97,.3)",
              backdropFilter: "blur(8px)", color: "#f0e6d2", fontFamily: "var(--font-ui)", fontSize: 13,
              outline: "none", boxShadow: "0 6px 18px rgba(0,0,0,.4)",
            }}
          />
          {/* Said out loud, because a list that appears under a field is
              invisible to somebody who cannot see it appear. */}
          <p aria-live="polite" className="sr-only">
            {q ? `${matches.length} ${matches.length === 1 ? "match" : "matches"} for ${query}` : ""}
          </p>
          {matches.length > 0 && (
            <ul style={{ listStyle: "none", margin: "6px 0 0", padding: 6, borderRadius: 14, background: "rgba(20,16,28,.92)", border: "1px solid rgba(201,169,97,.22)", backdropFilter: "blur(8px)", boxShadow: "0 10px 26px rgba(0,0,0,.5)" }}>
              {matches.map((n) => (
                <li key={`${n.group}-${n.id}`}>
                  <button
                    onClick={() => { focusNode(n); setQuery(""); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", minHeight: 44, background: "none", border: "none", cursor: "pointer", textAlign: "left", borderRadius: 10, color: "#f0e6d2", fontFamily: "var(--font-ui)", fontSize: 13 }}
                  >
                    <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 999, background: n.color, flex: "0 0 auto" }} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.name}</span>
                    <span style={{ fontSize: 10.5, color: "#a79b86" }}>{GROUP_META[n.group]?.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {q && matches.length === 0 && (
            <p style={{ margin: "6px 0 0", padding: "9px 12px", borderRadius: 12, background: "rgba(20,16,28,.92)", border: "1px solid rgba(201,169,97,.22)", color: "#cdbfa6", fontFamily: "var(--font-ui)", fontSize: 12.5 }}>
              Nobody and nowhere by that name yet.
            </p>
          )}
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
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "#9a8662" }}>{o.hint}</span>
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
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "#b8a886", letterSpacing: ".02em" }}>Drag to roam · pinch to zoom · tap a star</span>
      </div>
    </div>
  );
}
