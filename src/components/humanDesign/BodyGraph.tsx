"use client";

/**
 * The iconic Human Design BodyGraph — nine centers in their canonical layout,
 * linked by the 36 channels. Defined centers are filled; defined channels are
 * lit in brass. Theme-aware via CSS variables.
 */

import { CHANNELS, CENTER_NAMES, type CenterId } from "@/lib/humanDesign/data";

type Shape = "square" | "diamond" | "triUp" | "triDown" | "triLeft" | "triRight";

interface CenterLayout {
  cx: number;
  cy: number;
  size: number;
  shape: Shape;
  labelDy: number; // offset for the text label
}

const LAYOUT: Record<CenterId, CenterLayout> = {
  head: { cx: 140, cy: 36, size: 46, shape: "triDown", labelDy: 2 },
  ajna: { cx: 140, cy: 96, size: 46, shape: "triUp", labelDy: 4 },
  throat: { cx: 140, cy: 156, size: 48, shape: "square", labelDy: 4 },
  g: { cx: 140, cy: 236, size: 50, shape: "diamond", labelDy: 4 },
  heart: { cx: 205, cy: 232, size: 32, shape: "triLeft", labelDy: 4 },
  spleen: { cx: 44, cy: 304, size: 40, shape: "triRight", labelDy: 4 },
  solarPlexus: { cx: 236, cy: 304, size: 40, shape: "triLeft", labelDy: 4 },
  sacral: { cx: 140, cy: 314, size: 48, shape: "square", labelDy: 4 },
  root: { cx: 140, cy: 398, size: 48, shape: "square", labelDy: 4 },
};

function shapePoints(l: CenterLayout): string {
  const { cx, cy, size: s } = l;
  const h = s / 2;
  switch (l.shape) {
    case "diamond":
      return `${cx},${cy - h} ${cx + h},${cy} ${cx},${cy + h} ${cx - h},${cy}`;
    case "triUp":
      return `${cx},${cy - h} ${cx + h},${cy + h} ${cx - h},${cy + h}`;
    case "triDown":
      return `${cx},${cy + h} ${cx - h},${cy - h} ${cx + h},${cy - h}`;
    case "triLeft":
      return `${cx - h},${cy} ${cx + h},${cy - h} ${cx + h},${cy + h}`;
    case "triRight":
      return `${cx + h},${cy} ${cx - h},${cy - h} ${cx - h},${cy + h}`;
    default:
      return "";
  }
}

export default function BodyGraph({
  definedCenters,
  definedChannels,
}: {
  definedCenters: CenterId[];
  definedChannels: { gates: [number, number]; centers: [CenterId, CenterId] }[];
}) {
  const definedCenterSet = new Set(definedCenters);
  const definedKeys = new Set(definedChannels.map((c) => `${Math.min(...c.gates)}-${Math.max(...c.gates)}`));

  // Group channels by center-pair so parallel channels can be offset apart.
  const pairGroups = new Map<string, typeof CHANNELS>();
  for (const ch of CHANNELS) {
    const key = [ch.centers[0], ch.centers[1]].sort().join("|");
    if (!pairGroups.has(key)) pairGroups.set(key, []);
    pairGroups.get(key)!.push(ch);
  }

  const channelLines: React.ReactNode[] = [];
  for (const [, group] of pairGroups) {
    const n = group.length;
    group.forEach((ch, i) => {
      const a = LAYOUT[ch.centers[0]];
      const b = LAYOUT[ch.centers[1]];
      // Perpendicular offset for parallel channels sharing a center pair.
      const dx = b.cx - a.cx;
      const dy = b.cy - a.cy;
      const len = Math.hypot(dx, dy) || 1;
      const px = -dy / len;
      const py = dx / len;
      const spread = 6;
      const off = (i - (n - 1) / 2) * spread;
      const key = `${Math.min(...ch.gates)}-${Math.max(...ch.gates)}`;
      const defined = definedKeys.has(key);
      channelLines.push(
        <line
          key={key}
          x1={a.cx + px * off}
          y1={a.cy + py * off}
          x2={b.cx + px * off}
          y2={b.cy + py * off}
          stroke={defined ? "var(--brass)" : "var(--foreground)"}
          strokeOpacity={defined ? 0.95 : 0.12}
          strokeWidth={defined ? 3 : 1.25}
          strokeLinecap="round"
        />,
      );
    });
  }

  return (
    <svg viewBox="0 0 280 440" className="w-full max-w-[320px] mx-auto" role="img" aria-label="Your BodyGraph">
      {/* Channels behind centers */}
      {channelLines}
      {/* Centers */}
      {(Object.keys(LAYOUT) as CenterId[]).map((id) => {
        const l = LAYOUT[id];
        const defined = definedCenterSet.has(id);
        const common = {
          fill: defined ? "var(--brass)" : "transparent",
          fillOpacity: defined ? 0.28 : 1,
          stroke: defined ? "var(--brass)" : "var(--foreground)",
          strokeOpacity: defined ? 1 : 0.28,
          strokeWidth: 1.75,
        };
        return (
          <g key={id}>
            {l.shape === "square" ? (
              <rect
                x={l.cx - l.size / 2}
                y={l.cy - l.size / 2}
                width={l.size}
                height={l.size}
                rx={7}
                {...common}
              />
            ) : (
              <polygon points={shapePoints(l)} {...common} strokeLinejoin="round" />
            )}
            <text
              x={l.cx}
              y={l.cy + l.labelDy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7.5"
              style={{ fontWeight: 600, letterSpacing: "0.02em" }}
              fill={defined ? "var(--foreground)" : "var(--foreground-faint)"}
            >
              {CENTER_NAMES[id].split(" ")[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
