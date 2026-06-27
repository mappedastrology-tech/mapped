"use client";

import { useState } from "react";

type Item = { glyph: string; name: string; meta?: string; blurb: string; accent?: string };

/**
 * Tap-the-wheel explorer (design frame Q). Glyph nodes are arranged around a
 * ring; tapping one updates the center orb and the detail card, and the runner
 * tracks how many of the set you've explored. Hit targets are 46px (a11y).
 */
export default function ExploreBlock({ prompt, instructions, image, items }: { prompt: string; instructions?: string; image?: string; items: Item[] }) {
  const [sel, setSel] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));

  const cur = items[sel];
  const accent = cur.accent ?? "var(--brass)";

  const SIZE = 248;
  const C = SIZE / 2;
  const R = C - 26;
  const NODE = 46;

  function pick(i: number) {
    setSel(i);
    setSeen((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--background-card)", border: "1px solid var(--border-card)", boxShadow: "var(--card-shadow)" }}>
      <p className="text-[9px] uppercase font-semibold text-center" style={{ letterSpacing: "0.2em", color: "var(--brass)" }}>Tap to explore</p>
      <p className="text-[17px] text-center mt-1.5" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{prompt}</p>
      <p className="text-[12px] text-center mt-2" style={{ color: "var(--foreground-muted)" }}>{instructions ?? "Tap any glyph to learn it"}</p>

      {/* wheel */}
      <div className="relative mx-auto mt-3" style={{ width: SIZE, height: SIZE }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 50% 46%, rgba(201,169,97,0.16), rgba(11,7,18,0) 70%)" }} />
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" aria-hidden="true" loading="lazy" style={{ position: "absolute", inset: 22, width: SIZE - 44, height: SIZE - 44, objectFit: "contain", opacity: 0.2, filter: "saturate(0.7) drop-shadow(0 8px 22px rgba(0,0,0,0.55))" }} />
        )}
        {/* center orb */}
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 72, height: 72, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "var(--foreground)", zIndex: 2, background: `radial-gradient(circle at 42% 36%, ${accent}40, rgba(11,7,18,0.92) 78%)`, boxShadow: `0 0 0 1px ${accent}66, 0 0 26px -6px ${accent}` }} aria-hidden="true">
          {cur.glyph}
        </div>
        {/* nodes */}
        {items.map((it, i) => {
          const ang = (i / items.length) * 2 * Math.PI - Math.PI / 2;
          const x = C + R * Math.cos(ang);
          const y = C + R * Math.sin(ang);
          const active = i === sel;
          const explored = seen.has(i);
          const a = it.accent ?? "var(--brass)";
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              aria-label={it.name}
              aria-pressed={active}
              style={{
                position: "absolute", left: x, top: y, width: NODE, height: NODE, transform: "translate(-50%,-50%)",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
                color: active ? "var(--btn-primary-text)" : explored ? "var(--foreground)" : "var(--foreground-secondary)",
                background: active ? a : explored ? `${a}26` : "var(--lib-soft)",
                border: `1px solid ${active ? a : explored ? `${a}66` : "var(--border-card)"}`,
                boxShadow: active ? `0 0 18px -3px ${a}` : "none",
                transition: "all 0.18s ease",
              }}
            >
              {it.glyph}
            </button>
          );
        })}
      </div>

      {/* detail */}
      <div className="mt-4 p-4 rounded-2xl" style={{ background: "var(--lib-plum)", boxShadow: "inset 0 0 0 0.5px rgba(201,169,97,0.18)" }}>
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center text-[22px]" style={{ width: 44, height: 44, borderRadius: 12, background: `${accent}26`, color: accent }} aria-hidden="true">{cur.glyph}</span>
          <div className="min-w-0">
            <div className="text-[19px] leading-tight" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{cur.name}</div>
            {cur.meta && <div className="text-[11px] mt-0.5" style={{ color: "var(--foreground-secondary)" }}>{cur.meta}</div>}
          </div>
        </div>
        <p className="text-[12.5px] leading-relaxed mt-3" style={{ color: "var(--foreground-secondary)" }}>{cur.blurb}</p>
      </div>

      <p className="text-[11px] text-center mt-3" style={{ color: "var(--foreground-muted)" }}>
        {seen.size} of {items.length} explored
      </p>
    </div>
  );
}
