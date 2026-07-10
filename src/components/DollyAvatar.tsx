"use client";

import { useState } from "react";

/**
 * Dolly's avatar — her watercolor portrait cropped to a circle.
 *
 * Until the portrait file exists at /dolly.png, this falls back to a moonlit
 * orb (the app's previous Dolly mark), so the UI never shows a broken image.
 * Drop the portrait in as public/dolly.png and it appears everywhere at once.
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
          src="/dolly.png"
          alt="Dolly"
          draggable={false}
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "50% 18%" }}
        />
      )}
    </div>
  );
}
