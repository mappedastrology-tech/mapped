"use client";

/**
 * SignPlate — the painted plate for a western zodiac sign.
 *
 * One component for every "here are your signs" moment, so the plates can't
 * drift apart across the chart page, the onboarding reveal and the chart
 * result. It takes whatever form of the sign the caller already has — the
 * three-letter abbreviation the chart data uses ("Sco"), the full name
 * ("Scorpio"), or either in any casing — because the app stores both and
 * making each call site normalise first is how they end up inconsistent.
 *
 * These are illustrations, not icons. They are wired where a sign is the
 * subject of the moment and has room to be looked at; the 20px ring on the
 * chart wheel keeps its line-art SVG, which is legible at that size in a way a
 * painting is not.
 *
 * A missing or failed plate renders nothing and collapses, leaving the caller's
 * existing text intact. That matters here: the plates are decoration layered
 * over labels that already say the sign in words, so there is nothing to fall
 * back TO and nothing lost if one doesn't load.
 */

import { useState } from "react";

const SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
] as const;

/** Accepts "Sco", "Scorpio", "scorpio" — anything the chart data might hold. */
export function signSlug(sign?: string | null): string | null {
  if (!sign) return null;
  const s = sign.trim().toLowerCase();
  if (!s) return null;
  return SIGNS.find((full) => full === s || full.startsWith(s.slice(0, 3))) ?? null;
}

export function signPlateSrc(sign?: string | null): string | null {
  const slug = signSlug(sign);
  return slug ? `/signs/sign.${slug}.webp` : null;
}

export default function SignPlate({
  sign,
  size = 72,
  tile = false,
  className = "",
  style,
}: {
  sign?: string | null;
  size?: number;
  /**
   * Sit the plate on a soft tile instead of straight on the page.
   *
   * These plates are painted on white and keyed, so the feathered edge holds a
   * little of the paper it was painted on. Against a light page that is
   * invisible — it is the same white. Against the dark theme's near-black it
   * reads as a faint halo tracing the cutout. A tile puts a lit surface back
   * under the subject, which is what the edge was painted against, and the
   * fringe stops being a boundary between the art and the void.
   *
   * It also gives the plate the presence of an object rather than a floating
   * cutout, which is why the tile is used even where the halo would not show.
   */
  tile?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  const src = signPlateSrc(sign);
  if (!src || failed) return null;

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      onError={() => setFailed(true)}
      className={tile ? "" : className}
      style={
        tile
          ? { width: "82%", height: "82%", objectFit: "contain" }
          : { width: size, height: size, objectFit: "contain", ...style }
      }
    />
  );
  if (!tile) return img;

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.26),
        background: "var(--sign-plate-tile, rgba(244,236,214,0.10))",
        border: "0.5px solid var(--border-card)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
        ...style,
      }}
    >
      {img}
    </span>
  );
}
