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
  className = "",
  style,
}: {
  sign?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  const src = signPlateSrc(sign);
  if (!src || failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      onError={() => setFailed(true)}
      className={className}
      style={{ width: size, height: size, objectFit: "contain", ...style }}
    />
  );
}
