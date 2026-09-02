"use client";

import { useState } from "react";

type Card = { img: string; name: string; caption?: string };

/**
 * Tap-to-flip card grid (design frame T). Each card does a real 3D flip from an
 * ornate gold back to its art; the caption bar follows the last card turned and
 * a counter tracks how many have been revealed.
 */
export default function FlipBlock({ prompt, instructions, cards }: { prompt: string; instructions?: string; cards: Card[] }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [last, setLast] = useState<number | null>(null);

  function flip(i: number) {
    setLast(i);
    setFlipped((prev) => {
      const next = new Set(prev);
      next.add(i);
      return next;
    });
  }

  const turned = flipped.size;
  const cap = last != null ? cards[last] : null;

  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--background-card)", border: "1px solid var(--border-card)", boxShadow: "var(--card-shadow)" }}>
      <p className="text-[9px] uppercase font-semibold text-center" style={{ letterSpacing: "0.2em", color: "var(--brass)" }}>Tap to reveal</p>
      <p className="text-[17px] text-center mt-1.5" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{prompt}</p>
      <p className="text-[12px] text-center mt-2" style={{ color: "var(--foreground-muted)" }}>
        {turned === cards.length ? "All turned — nicely done" : instructions ?? `${turned} of ${cards.length} turned`}
      </p>

      <div className="grid grid-cols-3 gap-2.5 mt-4">
        {cards.map((c, i) => {
          const isFlipped = flipped.has(i);
          return (
            <button key={i} onClick={() => flip(i)} aria-label={isFlipped ? c.name : `Card ${i + 1}, tap to reveal`} style={{ perspective: 820, height: 168 }} className="active:scale-[0.98] transition-transform">
              <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transition: "transform 0.6s cubic-bezier(.2,.7,.2,1)", transform: isFlipped ? "rotateY(180deg)" : "none" }}>
                {/* back */}
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderRadius: 11, overflow: "hidden", background: "radial-gradient(circle at 50% 32%, #3a2550, #1f1730 70%)", boxShadow: "0 10px 22px -10px rgba(0,0,0,0.7), inset 0 0 0 0.5px rgba(201,169,97,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: "62%", height: "78%", borderRadius: 8, border: "1px solid rgba(201,169,97,0.45)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brass)", fontSize: 22 }} aria-hidden="true">✦</span>
                </div>
                {/* front */}
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 11, overflow: "hidden", boxShadow: "0 12px 26px -8px rgba(0,0,0,0.78), inset 0 0 0 0.5px rgba(201,169,97,0.55)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.img} alt={c.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* caption */}
      <div className="flex items-center gap-3 mt-4 px-4 py-3 rounded-2xl" style={{ background: "var(--lib-plum)", boxShadow: "inset 0 0 0 0.5px rgba(201,169,97,0.18)", minHeight: 30 }}>
        {cap ? (
          <>
            <span className="shrink-0 text-center text-[18px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--brass-light)", minWidth: 22 }}>{(last ?? 0) + 1}</span>
            <div className="min-w-0">
              <div className="text-[15px] leading-tight" style={{ fontFamily: "var(--font-ui)", color: "var(--foreground)" }}>{cap.name}</div>
              {cap.caption && <div className="text-[11.5px] mt-0.5" style={{ color: "var(--foreground-secondary)" }}>{cap.caption}</div>}
            </div>
          </>
        ) : (
          <span className="text-[12px]" style={{ color: "var(--foreground-muted)" }}>Turn a card to read it.</span>
        )}
      </div>
    </div>
  );
}
