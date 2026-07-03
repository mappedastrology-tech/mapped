"use client";

/**
 * HdBodyGraph — the "Human Design — You" bodygraph, ported from the Claude
 * Design SVG: a fixed navy graph (theme-independent) with a soft body
 * silhouette, all nine centers colored by definition, the full faint channel
 * web, glowing amber wiring for the user's defined channels, and every one of
 * the 64 gates drawn as a numbered node (active gates highlighted).
 */

import { CHANNELS, type CenterId } from "@/lib/humanDesign/data";

/** Gate node positions in the 320×560 viewBox (from the design). */
const GATE_POS: Record<number, { x: number; y: number }> = {
  // Head
  64: { x: 145, y: 60 }, 61: { x: 160, y: 60 }, 63: { x: 175, y: 60 },
  // Ajna
  47: { x: 146, y: 93 }, 24: { x: 160, y: 92 }, 4: { x: 174, y: 93 },
  17: { x: 151, y: 108 }, 11: { x: 169, y: 108 }, 43: { x: 160, y: 121 },
  // Throat
  62: { x: 145, y: 146 }, 23: { x: 160, y: 146 }, 56: { x: 175, y: 146 },
  16: { x: 139, y: 159 }, 35: { x: 181, y: 159 }, 20: { x: 139, y: 171 },
  12: { x: 181, y: 171 }, 31: { x: 143, y: 181 }, 8: { x: 155, y: 181 },
  33: { x: 167, y: 181 }, 45: { x: 179, y: 181 },
  // G
  1: { x: 160, y: 227 }, 7: { x: 141, y: 245 }, 13: { x: 179, y: 245 },
  10: { x: 128, y: 262 }, 25: { x: 192, y: 262 }, 15: { x: 141, y: 279 },
  46: { x: 179, y: 279 }, 2: { x: 160, y: 297 },
  // Heart
  21: { x: 225, y: 248 }, 26: { x: 212, y: 257 }, 51: { x: 212, y: 271 }, 40: { x: 225, y: 280 },
  // Spleen
  48: { x: 56, y: 316 }, 57: { x: 75, y: 322 }, 18: { x: 53, y: 328 }, 44: { x: 89, y: 334 },
  28: { x: 53, y: 341 }, 50: { x: 75, y: 347 }, 32: { x: 59, y: 353 },
  // Solar Plexus
  36: { x: 264, y: 316 }, 55: { x: 268, y: 329 }, 22: { x: 251, y: 322 }, 37: { x: 251, y: 334 },
  6: { x: 227, y: 340 }, 49: { x: 260, y: 347 }, 30: { x: 270, y: 353 },
  // Sacral
  5: { x: 145, y: 332 }, 14: { x: 160, y: 332 }, 29: { x: 175, y: 332 },
  34: { x: 145, y: 347 }, 27: { x: 160, y: 347 }, 59: { x: 178, y: 347 },
  42: { x: 148, y: 362 }, 3: { x: 163, y: 362 }, 9: { x: 178, y: 362 },
  // Root
  53: { x: 146, y: 424 }, 60: { x: 160, y: 424 }, 52: { x: 174, y: 424 },
  54: { x: 141, y: 439 }, 19: { x: 179, y: 439 }, 38: { x: 141, y: 452 },
  39: { x: 179, y: 452 }, 58: { x: 154, y: 462 }, 41: { x: 170, y: 462 },
};

/** Center shapes at design coordinates, plus the color each takes when defined. */
type CenterShape =
  | { id: CenterId; kind: "rect"; x: number; y: number; w: number; h: number; color: string }
  | { id: CenterId; kind: "poly"; points: string; color: string };

const CENTERS: CenterShape[] = [
  { id: "head", kind: "poly", points: "160,18 128,70 192,70", color: "#d4a13a" },
  { id: "ajna", kind: "poly", points: "128,82 192,82 160,128", color: "#8aa055" },
  { id: "throat", kind: "rect", x: 128, y: 136, w: 64, h: 50, color: "#c9a961" },
  { id: "g", kind: "poly", points: "160,208 214,262 160,316 106,262", color: "#d4a13a" },
  { id: "heart", kind: "poly", points: "236,238 236,290 194,264", color: "#c07a52" },
  { id: "spleen", kind: "poly", points: "42,306 42,362 100,334", color: "#8aa055" },
  { id: "solarPlexus", kind: "poly", points: "278,306 278,362 220,334", color: "#9d8fd0" },
  { id: "sacral", kind: "rect", x: 128, y: 320, w: 64, h: 54, color: "#c07a52" },
  { id: "root", kind: "rect", x: 128, y: 412, w: 64, h: 56, color: "#8aa055" },
];

export default function HdBodyGraph({
  definedCenters,
  definedChannels,
  activeGates,
  children,
}: {
  definedCenters: CenterId[];
  definedChannels: { gates: [number, number] }[];
  activeGates: number[];
  children?: React.ReactNode;
}) {
  const defCenter = new Set(definedCenters);
  const active = new Set(activeGates);

  return (
    <div
      className="relative mx-auto"
      style={{
        width: 330,
        maxWidth: "92vw",
        borderRadius: 26,
        padding: "14px 10px 18px",
        background: "#342440",
        boxShadow: "0 8px 22px rgba(0,0,0,0.32), inset 0 0 60px rgba(6,10,22,0.5)",
      }}
    >
      <svg viewBox="0 0 320 560" style={{ width: "100%", height: "auto", display: "block" }} fontFamily="DM Sans, sans-serif">
        <defs>
          <filter id="hdGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="hdBody" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        {/* body silhouette */}
        <g filter="url(#hdBody)" fill="rgba(233,224,196,0.11)">
          <ellipse cx="160" cy="44" rx="37" ry="43" />
          <path d="M80 172 C80 148 104 138 160 136 C216 138 240 148 240 172 L236 300 C244 356 248 362 238 404 C224 486 202 510 160 514 C118 510 96 486 82 404 C72 362 76 356 84 300 Z" />
        </g>

        {/* faint channel web (every channel, undefined-looking) */}
        <g stroke="rgba(232,236,251,0.16)" strokeWidth="1" strokeLinecap="round">
          {CHANNELS.map((ch) => {
            const a = GATE_POS[ch.gates[0]];
            const b = GATE_POS[ch.gates[1]];
            if (!a || !b) return null;
            return <line key={`f-${ch.gates[0]}-${ch.gates[1]}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}
        </g>

        {/* defined channels — glowing amber */}
        <g stroke="#d4a13a" strokeWidth="4" strokeLinecap="round" filter="url(#hdGlow)" opacity="0.96">
          {definedChannels.map((ch) => {
            const a = GATE_POS[ch.gates[0]];
            const b = GATE_POS[ch.gates[1]];
            if (!a || !b) return null;
            return <line key={`d-${ch.gates[0]}-${ch.gates[1]}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}
        </g>

        {/* centers */}
        {CENTERS.map((c) => {
          const defined = defCenter.has(c.id);
          const fill = defined ? c.color : "none";
          const fillOpacity = defined ? 0.82 : 1;
          const stroke = defined ? "#f3ead0" : "rgba(232,236,251,0.5)";
          const sw = defined ? 0.8 : 1.6;
          if (c.kind === "rect") {
            return <rect key={c.id} x={c.x} y={c.y} width={c.w} height={c.h} rx={3} fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeWidth={sw} />;
          }
          return <polygon key={c.id} points={c.points} fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeWidth={sw} />;
        })}

        {/* gate nodes */}
        <g fontSize="6.6" textAnchor="middle" dominantBaseline="central">
          {Object.entries(GATE_POS).map(([numStr, p]) => {
            const num = Number(numStr);
            const on = active.has(num);
            return (
              <g key={num} transform={`translate(${p.x} ${p.y})`}>
                <circle
                  r={on ? 6.1 : 5.8}
                  fill={on ? "#d4a13a" : "rgba(16,23,41,0.92)"}
                  stroke={on ? "#f3ead0" : "rgba(232,236,251,0.4)"}
                  strokeWidth={on ? 0.8 : 0.7}
                />
                <text y={0.4} fontWeight={on ? 700 : 500} fill={on ? "#12203a" : "rgba(240,244,255,0.92)"}>
                  {num}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Design / Personality activation columns (inside the card, per the design) */}
      {children}

      {/* legend */}
      <div className="flex justify-center gap-[18px] mt-3">
        <span className="flex items-center gap-1.5 text-[9.5px]" style={{ color: "rgba(232,236,251,0.8)" }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "#d4a13a" }} />
          Defined
        </span>
        <span className="flex items-center gap-1.5 text-[9.5px]" style={{ color: "rgba(232,236,251,0.8)" }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, border: "1.4px solid rgba(232,236,251,0.55)" }} />
          Open
        </span>
      </div>

    </div>
  );
}
