"use client";

import { useMemo } from "react";

/**
 * Lightweight, dependency-free full-screen confetti burst. Render it briefly
 * (the parent unmounts it after a few seconds). Respects reduced-motion.
 */
const COLORS = ["#c9a961", "#6a9a4a", "#a274d6", "#4a90c2", "#d39a3e", "#b5654a", "#4caf93"];

export default function Confetti({ count = 70 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2.4 + Math.random() * 1.8,
        size: 6 + Math.random() * 7,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
        drift: (Math.random() - 0.5) * 120,
        round: Math.random() > 0.6,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden motion-reduce:hidden" aria-hidden="true">
      <style>{`
        @keyframes mapped-confetti-fall {
          0% { transform: translate(0, -12vh) rotate(0deg); opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translate(var(--drift), 112vh) rotate(var(--spin)); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: 0,
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            backgroundColor: p.color,
            borderRadius: p.round ? "50%" : "1px",
            // @ts-expect-error custom props for the keyframe
            "--drift": `${p.drift}px`,
            "--spin": `${p.rotate + 540}deg`,
            animation: `mapped-confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
