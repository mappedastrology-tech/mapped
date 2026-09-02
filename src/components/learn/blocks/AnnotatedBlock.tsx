"use client";

import { useState } from "react";

type Pin = { x: number; y: number; title: string; body: string };

/**
 * Annotated teaching diagram (design frame R). A diagram with numbered pins;
 * tapping a pin highlights it and reveals its annotation in a detail card,
 * tracking how many of the markers have been opened.
 */
export default function AnnotatedBlock({ prompt, instructions, image, pins }: { prompt: string; instructions?: string; image: string; pins: Pin[] }) {
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));

  function pick(i: number) {
    setActive(i);
    setSeen((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
  }

  const cur = pins[active];

  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--background-card)", border: "1px solid var(--border-card)", boxShadow: "var(--card-shadow)" }}>
      <p className="text-[9px] uppercase font-semibold text-center" style={{ letterSpacing: "0.2em", color: "var(--brass)" }}>See it</p>
      <p className="text-[17px] text-center mt-1.5" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{prompt}</p>

      {/* diagram */}
      <div className="relative mx-auto mt-3" style={{ width: 248, height: 248, maxWidth: "100%" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 50% 46%, rgba(201,169,97,0.12), rgba(11,7,18,0) 70%)" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={prompt} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 8px 22px rgba(0,0,0,0.5))" }} />
        {pins.map((p, i) => {
          const on = i === active;
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              aria-label={`Marker ${i + 1}: ${p.title}`}
              aria-pressed={on}
              className="absolute flex items-center justify-center font-bold"
              style={{
                left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)",
                width: 30, height: 30, borderRadius: "50%", fontSize: 13, fontFamily: "var(--font-display)",
                background: on ? "var(--brass)" : "var(--lib-surface)",
                color: on ? "var(--btn-primary-text)" : "var(--brass-light)",
                border: on ? "none" : "1px solid rgba(201,169,97,0.5)",
                boxShadow: on ? "0 0 0 4px rgba(201,169,97,0.25), 0 0 18px -2px rgba(201,169,97,0.7)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* detail */}
      <div className="mt-4 p-4 rounded-2xl" style={{ background: "var(--lib-plum)", boxShadow: "inset 0 0 0 0.5px rgba(201,169,97,0.18)" }}>
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center text-[13px] font-bold" style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--brass)", color: "var(--btn-primary-text)", fontFamily: "var(--font-ui)" }} aria-hidden="true">{active + 1}</span>
          <span className="text-[18px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{cur.title}</span>
        </div>
        <p className="text-[13px] leading-relaxed mt-3" style={{ color: "var(--foreground-secondary)" }}>{cur.body}</p>
      </div>

      <p className="text-[11px] text-center mt-3" style={{ color: "var(--foreground-muted)" }}>
        {seen.size < pins.length ? (instructions ?? `Tap the markers — ${seen.size} of ${pins.length} revealed`) : "All markers revealed ✦"}
      </p>
    </div>
  );
}
