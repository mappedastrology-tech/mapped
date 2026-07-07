"use client";

/**
 * ChartWheelStar — the natal chart wheel in the Claude Design "Chart — You"
 * style: a plum star-map disc with a faint starfield, gold zodiac ring, sign
 * dividers, house-cusp spokes, gold ASC/MC axes, the aspect web, and planet
 * glyph discs. Reuses the ecliptic→angle math of the parchment ChartWheel but
 * renders the night-sky look, and adds the aspect lines the design shows.
 */

import { useMemo } from "react";

interface Planet { name: string; sign: string; absPosition: number; retrograde: boolean }
interface House { number: number; sign: string; absPosition: number }
interface Aspect { p1Name: string; p2Name: string; aspect: string }

const SIGN_ORDER = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"];
const SIGN_GLYPH: Record<string, string> = {
  Ari: "♈", Tau: "♉", Gem: "♊", Can: "♋", Leo: "♌", Vir: "♍",
  Lib: "♎", Sco: "♏", Sag: "♐", Cap: "♑", Aqu: "♒", Pis: "♓",
};
const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
};
const PLANET_FONT = "'Noto Sans Symbols', 'Noto Sans Symbols 2', 'Segoe UI Symbol', serif";

/** Element accent per sign (fire / earth / air / water). */
function elColor(sign: string): string {
  const s = sign.slice(0, 3);
  if (["Ari", "Leo", "Sag"].includes(s)) return "#c07a52";
  if (["Tau", "Vir", "Cap"].includes(s)) return "#8aa055";
  if (["Gem", "Lib", "Aqu"].includes(s)) return "#c9a961";
  return "#9d8fd0";
}

/** Aspect line style by nature. */
function aspectStyle(type: string): { color: string; dash: string; w: number; op: number } | null {
  const t = type.toLowerCase();
  if (t === "conjunction") return { color: "#e6cf8c", dash: "0", w: 1.1, op: 0.55 };
  if (["trine", "sextile"].includes(t)) return { color: "#79aee0", dash: "0", w: 1, op: 0.5 };
  if (["square", "opposition"].includes(t)) return { color: "#e08c7a", dash: "3 3", w: 1, op: 0.5 };
  return null; // minor aspects omitted from the web for clarity
}

/** Deterministic starfield so the wheel is stable across renders. */
const STARS: [number, number, number, number][] = (() => {
  const out: [number, number, number, number][] = [];
  let seed = 20260707;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 130; i++) {
    const a = rnd() * Math.PI * 2;
    const rr = Math.sqrt(rnd()) * 198;
    out.push([230 + rr * Math.cos(a), 230 + rr * Math.sin(a), 0.4 + rnd() * 1.1, 0.2 + rnd() * 0.7]);
  }
  return out;
})();

export default function ChartWheelStar({ planets, houses, aspects }: { planets: Planet[]; houses: House[]; aspects: Aspect[] }) {
  const safePlanets = (planets || []).filter((p) => p && isFinite(p.absPosition));
  const safeHouses = (houses || []).filter((h) => h && isFinite(h.absPosition));

  const cx = 230, cy = 230;
  const rimR = 206, signGlyphR = 193, signRingR = 180, planetRingR = 150, houseNumR = 100, aspectR = 132;
  const ascDeg = safeHouses[0]?.absPosition || 0;

  const toAngle = (deg: number) => 180 - (deg - ascDeg);
  const xy = (angleDeg: number, r: number): [number, number] => {
    const rad = (angleDeg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
  };

  // Planet placement: true angle, stacked inward when congested.
  const placed = useMemo(() => {
    const sorted = [...safePlanets].sort((a, b) => a.absPosition - b.absPosition);
    const rings = [planetRingR, planetRingR - 20, planetRingR - 40, planetRingR - 60];
    const out: { p: Planet; angle: number; r: number }[] = [];
    for (const p of sorted) {
      const angle = toAngle(p.absPosition);
      let ringIdx = 0;
      for (let r = 0; r < rings.length; r++) {
        const collide = out.some((o) => {
          if (o.r !== rings[r]) return false;
          const d = Math.abs(angle - o.angle);
          return (d > 180 ? 360 - d : d) < 9;
        });
        if (!collide) { ringIdx = r; break; }
      }
      out.push({ p, angle, r: rings[ringIdx] });
    }
    return out;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePlanets, ascDeg]);

  const angleOf = (name: string) => {
    const pl = safePlanets.find((p) => p.name === name);
    return pl ? toAngle(pl.absPosition) : null;
  };

  return (
    <div className="relative mx-auto" style={{ width: 360, maxWidth: "90vw", aspectRatio: "1" }}>
      <div className="absolute inset-0 rounded-full overflow-hidden" style={{ background: "#4a2540", boxShadow: "0 8px 22px rgba(0,0,0,0.32), inset 0 0 70px rgba(6,10,22,0.55)" }}>
        <svg viewBox="0 0 460 460" className="absolute inset-0 w-full h-full">
          {/* stars */}
          {STARS.map(([x, y, r, op], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#eef2fb" opacity={op} />
          ))}

          {/* rings */}
          <circle cx={cx} cy={cy} r={signRingR} fill="none" stroke="#dfe6f4" strokeWidth="0.75" opacity="0.22" />
          <circle cx={cx} cy={cy} r={houseNumR + 13} fill="none" stroke="#c9a961" strokeWidth="0.6" opacity="0.3" />
          <circle cx={cx} cy={cy} r={houseNumR - 12} fill="none" stroke="#c9a961" strokeWidth="0.6" opacity="0.3" />
          <circle cx={cx} cy={cy} r={rimR - 5} fill="none" stroke="#eef2fb" strokeWidth="0.9" opacity="0.5" />
          <circle cx={cx} cy={cy} r={rimR} fill="none" stroke="#eef2fb" strokeWidth="1.4" opacity="0.8" />

          {/* sign dividers + glyphs */}
          {SIGN_ORDER.map((sign, i) => {
            const [dx1, dy1] = xy(toAngle(i * 30), rimR);
            const [dx2, dy2] = xy(toAngle(i * 30), signRingR);
            const [gx, gy] = xy(toAngle(i * 30 + 15), signGlyphR);
            return (
              <g key={sign}>
                <line x1={dx1} y1={dy1} x2={dx2} y2={dy2} stroke="#eef2fb" strokeWidth="0.9" opacity="0.5" />
                <text x={gx} y={gy} textAnchor="middle" dominantBaseline="central" fontSize="15" fill="#eef2fb" style={{ fontFamily: PLANET_FONT }}>
                  {SIGN_GLYPH[sign]}
                </text>
              </g>
            );
          })}

          {/* house cusp spokes + ASC/MC axes + house numbers */}
          {safeHouses.map((h, i) => {
            const angle = toAngle(h.absPosition);
            const [x1, y1] = xy(angle, signRingR);
            const [x2, y2] = xy(angle, 40);
            const isAxis = i === 0 || i === 9; // ASC, MC
            const next = safeHouses[(i + 1) % safeHouses.length];
            let midAbs = (h.absPosition + next.absPosition) / 2;
            if (next.absPosition < h.absPosition) { midAbs = (h.absPosition + next.absPosition + 360) / 2; if (midAbs >= 360) midAbs -= 360; }
            const [hx, hy] = xy(toAngle(midAbs), houseNumR);
            return (
              <g key={`h-${i}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isAxis ? "#e0c488" : "#c9a961"} strokeWidth={isAxis ? 1 : 0.6} opacity={isAxis ? 0.5 : 0.28} />
                <text x={hx} y={hy} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="600" fill="rgba(214,186,120,0.82)" style={{ fontFamily: "var(--font-display)" }}>
                  {h.number}
                </text>
              </g>
            );
          })}

          {/* aspect web */}
          {aspects.map((a, i) => {
            const st = aspectStyle(a.aspect);
            if (!st) return null;
            const a1 = angleOf(a.p1Name), a2 = angleOf(a.p2Name);
            if (a1 == null || a2 == null) return null;
            const [x1, y1] = xy(a1, aspectR);
            const [x2, y2] = xy(a2, aspectR);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={st.color} strokeWidth={st.w} strokeDasharray={st.dash} opacity={st.op} />;
          })}

          {/* planet discs + glyphs */}
          {placed.map(({ p, angle, r }) => {
            const [px, py] = xy(angle, r);
            const col = elColor(p.sign);
            const [t1x, t1y] = xy(angle, signRingR);
            const [t2x, t2y] = xy(angle, signRingR - 5);
            return (
              <g key={p.name}>
                <line x1={t1x} y1={t1y} x2={t2x} y2={t2y} stroke={col} strokeWidth="1.1" opacity="0.6" />
                <circle cx={px} cy={py} r="11.5" fill="#0f1729" stroke={col} strokeWidth="1.2" />
                <text x={px} y={py} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="700" fill={col} style={{ fontFamily: PLANET_FONT }}>
                  {PLANET_GLYPH[p.name] || p.name[0]}
                </text>
                {p.retrograde && (
                  <text x={px + 9} y={py - 8} fontSize="6" fill="#9d8fd0" fontWeight="700">℞</text>
                )}
              </g>
            );
          })}

          {/* center */}
          <circle cx={cx} cy={cy} r="3" fill="#e0c488" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}
