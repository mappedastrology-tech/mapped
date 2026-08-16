"use client";

/**
 * ResonanceRadar — the 6-facet hexagonal radar for the profile page (spec §2, §5).
 * Pure SVG, no dependencies. Facet scores are 0–100.
 */

import { FACET_ORDER, FACET_LABEL, type FacetId } from "@/lib/resonance/traits";

interface Props {
  facets: Record<FacetId, number>;
  size?: number;
  accent?: string; // CSS color
}

export default function ResonanceRadar({ facets, size = 240, accent = "var(--brass)" }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 34; // leave room for labels
  const rings = [0.25, 0.5, 0.75, 1];

  // Six axes, starting at the top (−90°), clockwise.
  const angle = (i: number) => (-90 + i * 60) * (Math.PI / 180);
  const pt = (i: number, r: number) => ({
    x: cx + Math.cos(angle(i)) * R * r,
    y: cy + Math.sin(angle(i)) * R * r,
  });

  const hex = (r: number) =>
    FACET_ORDER.map((_, i) => { const p = pt(i, r); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(" ");

  const shape = FACET_ORDER.map((f, i) => {
    const p = pt(i, Math.max(0.04, facets[f] / 100));
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Resonance radar">
      {/* rings */}
      {rings.map((r, i) => (
        <polygon key={i} points={hex(r)} fill="none" stroke="var(--border-card, rgba(255,255,255,0.14))" strokeWidth={1} />
      ))}
      {/* spokes */}
      {FACET_ORDER.map((_, i) => {
        const p = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border-card, rgba(255,255,255,0.14))" strokeWidth={1} />;
      })}
      {/* value shape */}
      <polygon points={shape} fill={accent} fillOpacity={0.22} stroke={accent} strokeWidth={2} strokeLinejoin="round" />
      {FACET_ORDER.map((f, i) => {
        const p = pt(i, Math.max(0.04, facets[f] / 100));
        return <circle key={f} cx={p.x} cy={p.y} r={2.6} fill={accent} />;
      })}
      {/* labels */}
      {FACET_ORDER.map((f, i) => {
        const p = pt(i, 1.16);
        return (
          <text
            key={f}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fill: "var(--foreground-muted, #999)", fontWeight: 600 }}
          >
            {FACET_LABEL[f]}
          </text>
        );
      })}
    </svg>
  );
}
