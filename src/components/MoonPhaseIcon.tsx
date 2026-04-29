"use client";

/**
 * MoonPhaseIcon — renders the watercolor moon phase image
 * matching the brand guide's navy/cream painted moon style.
 *
 * Uses pre-generated watercolor PNG images from /moons/.
 */

interface MoonPhaseIconProps {
  /** Moon phase label from celestialCalendar */
  phase: string;
  /** Size in pixels (default 64) */
  size?: number;
  /** Optional className */
  className?: string;
}

/** Map phase labels to the image filename (without extension). */
function getPhaseFile(phase: string): string {
  const p = phase.toLowerCase();
  if (p.includes("new")) return "new-moon";
  if (p.includes("waxing") && p.includes("crescent")) return "waxing-crescent";
  if (p.includes("first") && p.includes("quarter")) return "first-quarter";
  if (p.includes("waxing") && p.includes("gibbous")) return "waxing-gibbous";
  if (p.includes("full")) return "full-moon";
  if (p.includes("waning") && p.includes("gibbous")) return "waning-gibbous";
  if ((p.includes("third") || p.includes("last")) && p.includes("quarter")) return "third-quarter";
  if (p.includes("waning") && p.includes("crescent")) return "waning-crescent";
  // Fallback
  return "full-moon";
}

export default function MoonPhaseIcon({ phase, size = 64, className = "" }: MoonPhaseIconProps) {
  const file = getPhaseFile(phase);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/moons/${file}.png`}
      alt={phase}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      style={{ width: size, height: size, objectFit: "cover" }}
    />
  );
}
