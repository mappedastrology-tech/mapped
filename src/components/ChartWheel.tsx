"use client";

/**
 * ChartWheel — Vintage parchment-style birth chart wheel.
 *
 * Zodiac signs in outer ring use MF Zodiac Dings SVGs.
 * Planets placed at true ecliptic positions inside the houses,
 * stacked radially when congested (no angular displacement).
 * House cusps labeled with sign + degree.
 */

import { useMemo } from "react";

// SVG file paths for zodiac signs (outer ring — MF Zodiac Dings)
const ZODIAC_SVG_FILES: Record<string, string> = {
  Ari: "/signs/aries.svg",
  Tau: "/signs/taurus.svg",
  Gem: "/signs/gemini.svg",
  Can: "/signs/cancer.svg",
  Leo: "/signs/leo.svg",
  Vir: "/signs/virgo.svg",
  Lib: "/signs/libra.svg",
  Sco: "/signs/scorpio.svg",
  Sag: "/signs/sagittarius.svg",
  Cap: "/signs/capricorn.svg",
  Aqu: "/signs/aquarius.svg",
  Pis: "/signs/pisces.svg",
};

// Keep these exports for other components
const SIGN_GLYPHS: Record<string, string> = {
  Ari: "\u2648\uFE0E", Tau: "\u2649\uFE0E", Gem: "\u264A\uFE0E", Can: "\u264B\uFE0E",
  Leo: "\u264C\uFE0E", Vir: "\u264D\uFE0E", Lib: "\u264E\uFE0E", Sco: "\u264F\uFE0E",
  Sag: "\u2650\uFE0E", Cap: "\u2651\uFE0E", Aqu: "\u2652\uFE0E", Pis: "\u2653\uFE0E",
};

const SIGN_NAMES: Record<string, string> = {
  Ari: "Aries", Tau: "Taurus", Gem: "Gemini", Can: "Cancer",
  Leo: "Leo", Vir: "Virgo", Lib: "Libra", Sco: "Scorpio",
  Sag: "Sagittarius", Cap: "Capricorn", Aqu: "Aquarius", Pis: "Pisces",
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "\u2609", Moon: "\u263D", Mercury: "\u263F", Venus: "\u2640",
  Mars: "\u2642", Jupiter: "\u2643", Saturn: "\u2644", Uranus: "\u2645",
  Neptune: "\u2646", Pluto: "\u2647",
};

const PLANET_FONT = "'Noto Sans Symbols 2', 'Segoe UI Symbol', serif";

const ROMAN: Record<number, string> = {
  1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI",
  7: "VII", 8: "VIII", 9: "IX", 10: "X", 11: "XI", 12: "XII",
};

const SIGN_ORDER = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"];

function elementColor(sign: string): string {
  if (["Ari", "Leo", "Sag"].includes(sign)) return "#B45128";
  if (["Tau", "Vir", "Cap"].includes(sign)) return "#7a8c6e";
  if (["Gem", "Lib", "Aqu"].includes(sign)) return "#C4A265";
  return "#6b8a9e";
}

interface Planet {
  name: string;
  sign: string;
  position: number;
  absPosition: number;
  retrograde: boolean;
}

interface House {
  number: number;
  sign: string;
  position: number;
  absPosition: number;
}

interface ChartWheelProps {
  planets: Planet[];
  houses: House[];
}

export default function ChartWheel({ planets, houses }: ChartWheelProps) {
  const size = 400;
  const cx = size / 2;
  const cy = size / 2;

  const outerR = 170;
  const signR = 144;
  const houseR = 108;
  const innerR = 40;
  const glyphSize = 20;

  const ascDeg = houses[0]?.absPosition || 0;

  function eclipticToAngle(deg: number): number {
    return 180 - (deg - ascDeg);
  }

  function polarToXY(angleDeg: number, r: number): [number, number] {
    const rad = (angleDeg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
  }

  const ink = "#4A3F35";
  const inkMed = "#6B5E50";
  const axisInk = "#8B6B4A";

  // Resolve planets: keep at true angle, stack radially when close
  const resolvedPlanets = useMemo(() => {
    const sorted = [...planets].sort((a, b) => a.absPosition - b.absPosition);
    const minAngularSep = 6; // degrees — tighter packing before bumping to next ring
    const rings = [
      signR - 14,  // ring 0: just inside sign ring
      signR - 27,  // ring 1
      signR - 40,  // ring 2
      signR - 53,  // ring 3
      signR - 66,  // ring 4
      signR - 79,  // ring 5 (near inner ring, for very congested charts)
    ];

    const placed: { planet: Planet; angle: number; ringIdx: number }[] = [];

    for (const planet of sorted) {
      const angle = eclipticToAngle(planet.absPosition);
      let ringIdx = 0;

      // Find first ring where this planet doesn't collide
      let foundSlot = false;
      for (let r = 0; r < rings.length; r++) {
        const collision = placed.some(p => {
          if (p.ringIdx !== r) return false;
          const diff = Math.abs(angle - p.angle);
          const nd = diff > 180 ? 360 - diff : diff;
          return nd < minAngularSep;
        });
        if (!collision) {
          ringIdx = r;
          foundSlot = true;
          break;
        }
      }

      // If all rings full (shouldn't happen with 10 planets), use last ring
      if (!foundSlot) ringIdx = rings.length - 1;

      placed.push({ planet, angle, ringIdx });
    }

    return placed.map(p => ({
      planet: p.planet,
      angle: p.angle,
      r: rings[p.ringIdx],
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planets, ascDeg]);

  return (
    <div className="relative w-full max-w-[400px] mx-auto">
      {/* Parchment circle */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at 42% 38%, #F2E8D5 0%, #E8DCC8 40%, #DDD0B8 70%, #D0C0A4 100%)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2), inset 0 2px 20px rgba(0,0,0,0.06)",
          aspectRatio: "1",
        }}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label="Birth chart wheel"
        >
          {/* Wheel circles */}
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={ink} strokeWidth="1.5" opacity="0.3" />
          <circle cx={cx} cy={cy} r={signR} fill="none" stroke={ink} strokeWidth="1.2" opacity="0.25" />
          <circle cx={cx} cy={cy} r={houseR} fill="none" stroke={ink} strokeWidth="0.8" opacity="0.18" />
          <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={ink} strokeWidth="1.2" opacity="0.22" />

          {/* Zodiac signs — MF Zodiac Dings in outer ring */}
          {SIGN_ORDER.map((sign, i) => {
            const startDeg = eclipticToAngle(i * 30);
            const midDeg = eclipticToAngle(i * 30 + 15);
            const [tx, ty] = polarToXY(midDeg, (outerR + signR) / 2);
            const [dx1, dy1] = polarToXY(startDeg, outerR);
            const [dx2, dy2] = polarToXY(startDeg, signR);

            return (
              <g key={sign}>
                <line x1={dx1} y1={dy1} x2={dx2} y2={dy2}
                      stroke={ink} strokeWidth="0.6" opacity="0.2" />
                <image
                  href={ZODIAC_SVG_FILES[sign]}
                  x={tx - glyphSize / 2}
                  y={ty - glyphSize / 2}
                  width={glyphSize}
                  height={glyphSize}
                  opacity="0.8"
                />
              </g>
            );
          })}

          {/* House divisions + roman numerals + cusp labels */}
          {houses.map((house, i) => {
            const angle = eclipticToAngle(house.absPosition);
            const [x1, y1] = polarToXY(angle, signR);
            const [x2, y2] = polarToXY(angle, innerR);
            const isAxis = i === 0 || i === 3 || i === 6 || i === 9;

            // Roman numeral in middle of house
            const next = houses[(i + 1) % 12];
            let midAbs = (house.absPosition + next.absPosition) / 2;
            if (next.absPosition < house.absPosition) {
              midAbs = (house.absPosition + next.absPosition + 360) / 2;
              if (midAbs >= 360) midAbs -= 360;
            }
            const [hx, hy] = polarToXY(eclipticToAngle(midAbs), (houseR + innerR) / 2);

            // House cusp sign + degree (just outside the sign ring)
            const deg = Math.floor(house.position);
            const signKey = house.sign.slice(0, 3);
            const labelAngle = angle + 4;
            // Axis cusps get label further out so it doesn't collide with ASC/DSC/MC/IC
            const labelR = isAxis ? outerR + 22 : outerR + 12;
            const [lx, ly] = polarToXY(labelAngle, labelR);

            return (
              <g key={`h-${i}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={isAxis ? axisInk : ink}
                      strokeWidth={isAxis ? "1.8" : "0.6"}
                      opacity={isAxis ? "0.35" : "0.18"} />
                {/* Roman numeral */}
                <text x={hx} y={hy}
                      textAnchor="middle" dominantBaseline="central"
                      fontSize={house.number >= 8 ? "8" : "9"}
                      fill={inkMed} opacity="0.35"
                      style={{ fontFamily: "var(--font-display)", letterSpacing: "0.5px" }}>
                  {ROMAN[house.number]}
                </text>
                {/* Cusp sign + degree */}
                <text x={lx} y={ly}
                      textAnchor="middle" dominantBaseline="central"
                      fontSize={isAxis ? "7" : "6"} fill={ink} opacity={isAxis ? "0.35" : "0.25"}
                      style={{ fontFamily: "var(--font-body)" }}>
                  {deg} {signKey}
                </text>
              </g>
            );
          })}

          {/* Planets — at true angle, stacked radially */}
          {resolvedPlanets.map(({ planet, angle, r }) => {
            const [px, py] = polarToXY(angle, r);
            const color = elementColor(planet.sign);

            // Tick mark on sign ring
            const [t1x, t1y] = polarToXY(angle, signR);
            const [t2x, t2y] = polarToXY(angle, signR - 4);

            return (
              <g key={planet.name}>
                {/* Tick mark */}
                <line x1={t1x} y1={t1y} x2={t2x} y2={t2y}
                      stroke={color} strokeWidth="1.2" opacity="0.45" />

                {/* Planet glyph — colored, no circle */}
                <text x={px} y={py}
                      textAnchor="middle" dominantBaseline="central"
                      fontSize="11" fill={color} opacity="0.9"
                      style={{ fontFamily: PLANET_FONT }}>
                  {PLANET_GLYPHS[planet.name] || planet.name[0]}
                </text>

                {/* Retrograde */}
                {planet.retrograde && (
                  <text x={px + 7} y={py - 5}
                        fontSize="4" fill="#B45128" opacity="0.55"
                        style={{ fontFamily: "var(--font-body)", fontWeight: "600" }}>
                    R
                  </text>
                )}
              </g>
            );
          })}

          {/* Center */}
          <circle cx={cx} cy={cy} r={innerR - 8} fill="none" stroke={ink} strokeWidth="0.4" opacity="0.12" />
          <circle cx={cx} cy={cy} r="3" fill={ink} opacity="0.15" />

          {/* Axis labels */}
          {[
            { label: "ASC", idx: 0 },
            { label: "DSC", idx: 6 },
            { label: "MC", idx: 9 },
            { label: "IC", idx: 3 },
          ].map(({ label, idx }) => {
            const angle = eclipticToAngle(houses[idx].absPosition);
            const [lx, ly] = polarToXY(angle, outerR + 12);
            return (
              <text key={label} x={lx} y={ly}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize="8" fontWeight="600"
                    fill={ink} opacity="0.38" letterSpacing="0.8"
                    style={{ fontFamily: "var(--font-display)" }}>
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export { SIGN_NAMES, SIGN_GLYPHS, PLANET_GLYPHS };
