"use client";

import { useState } from "react";

/**
 * Dolly's avatar — her watercolour portrait, cropped to a circle.
 *
 * The portrait is pre-cropped square and face-forward rather than shipped whole
 * and framed in CSS: the source is a 1024x1536 full portrait, and letting
 * object-fit crop it down to 44px left her face too small to read. The crop is
 * baked in, so every size renders the same framing and nothing carries 1536px
 * of image to draw 44 of them.
 *
 * The moonlit orb stays as the fallback, so a missing or failed image degrades
 * to the app's earlier Dolly mark instead of a hole.
 */
export default function DollyAvatar({
  size = 44,
  float = false,
  className = "",
}: {
  size?: number;
  /** Gentle bob animation — only use where the `dl-orb` keyframes are in scope. */
  float?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 34% 30%, #e9ecfa 0%, #b9bfe0 32%, #6d6aa0 74%, #3c3564 100%)",
        boxShadow: "inset -4px -5px 10px rgba(30,20,50,0.5)",
        animation: float ? "dl-orb 5s ease-in-out infinite" : undefined,
      }}
    >
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/dolly.webp"
          alt="Dolly"
          draggable={false}
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}
