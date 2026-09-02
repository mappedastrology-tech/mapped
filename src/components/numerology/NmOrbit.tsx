"use client";

/**
 * NmOrbit — the Numerology "Your numbers" hero, ported from the Claude Design
 * SVG: a plum card with the Life Path number glowing at the centre and the four
 * other core numbers (Expression, Soul Urge, Personality, Birthday) orbiting it
 * on an animated ring, over a slow-pulsing halo.
 */

type Token = { num: number | string; label: string; master?: boolean };

export default function NmOrbit({
  lifePath,
  title,
  subtitle,
  top,
  right,
  bottom,
  left,
}: {
  lifePath: number | string;
  title: string;
  subtitle: string;
  top: Token;
  right: Token;
  bottom: Token;
  left: Token;
}) {
  const token = (x: number, y: number, t: Token) => (
    <g>
      <circle cx={x} cy={y} r={34} fill="#1c1329" stroke="#c9a961" strokeWidth={1.1} strokeOpacity={0.55} />
      <text x={x} y={y - 6} textAnchor="middle" dominantBaseline="central" fontFamily="Bodoni Moda, serif" fontSize={23} fill="#e8dfc4">
        {t.num}
      </text>
      <text x={x} y={y + 11} textAnchor="middle" dominantBaseline="central" fontSize={6.3} letterSpacing="0.1em" fill={t.master ? "#d4a13a" : "#c9a961"} opacity={0.92}>
        {t.label}
      </text>
    </g>
  );

  return (
    <div
      className="relative mx-auto"
      style={{ width: 300, maxWidth: "92vw", borderRadius: 26, padding: "14px 12px 20px", background: "#4a2540", boxShadow: "0 8px 22px rgba(0,0,0,0.34)" }}
    >
      <style>{`
        @keyframes nm-spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes nm-pulse { 0%,100% { opacity:0.55 } 50% { opacity:0.9 } }
        .nm-orbit { transform-box:fill-box; transform-origin:center; animation:nm-spin 90s linear infinite; }
        .nm-halo { transform-box:fill-box; transform-origin:center; animation:nm-pulse 5.5s ease-in-out infinite; }
      `}</style>
      <svg viewBox="0 0 300 300" style={{ width: "100%", height: "auto", display: "block" }} fontFamily="DM Sans, sans-serif">
        <defs>
          <radialGradient id="nmCenter" cx="50%" cy="40%" r="62%">
            <stop offset="0%" stopColor="#3a2c55" />
            <stop offset="55%" stopColor="#251a39" />
            <stop offset="100%" stopColor="#160f22" />
          </radialGradient>
          <linearGradient id="nmNum" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbf4dc" />
            <stop offset="52%" stopColor="#ecdcae" />
            <stop offset="100%" stopColor="#d8bd82" />
          </linearGradient>
          <filter id="nmGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <circle className="nm-halo" cx="150" cy="150" r="120" fill="rgba(201,169,97,0.05)" />

        {/* spokes */}
        <g stroke="rgba(201,169,97,0.16)" strokeWidth="1">
          <line x1="150" y1="150" x2="150" y2="44" />
          <line x1="150" y1="150" x2="256" y2="150" />
          <line x1="150" y1="150" x2="150" y2="256" />
          <line x1="150" y1="150" x2="44" y2="150" />
        </g>

        {/* orbit ring */}
        <circle className="nm-orbit" cx="150" cy="150" r="106" fill="none" stroke="rgba(201,169,97,0.3)" strokeWidth="1.4" strokeDasharray="1.5 7" strokeLinecap="round" />

        {/* orbiting tokens */}
        {token(150, 44, top)}
        {token(256, 150, right)}
        {token(150, 256, bottom)}
        {token(44, 150, left)}

        {/* center: life path */}
        <circle cx="150" cy="150" r="63" fill="url(#nmCenter)" stroke="#c9a961" strokeWidth="1.6" strokeOpacity="0.7" filter="url(#nmGlow)" />
        <circle cx="150" cy="150" r="63" fill="none" stroke="#c9a961" strokeWidth="0.6" strokeOpacity="0.4" />
        <circle cx="150" cy="150" r="55" fill="none" stroke="#c9a961" strokeWidth="0.5" strokeOpacity="0.22" />
        <text x="150" y="145" textAnchor="middle" dominantBaseline="central" fontFamily="Bodoni Moda, serif" fontWeight="500" fontSize="80" fill="url(#nmNum)">
          {lifePath}
        </text>
        <text x="150" y="198" textAnchor="middle" dominantBaseline="central" fontSize="8.5" letterSpacing="0.26em" fill="#c9a961">
          LIFE PATH
        </text>
      </svg>

      <div className="text-center mt-1.5">
        <p className="m-0" style={{ fontFamily: "var(--font-heading)", fontSize: 23, color: "#f0e6d2" }}>{title}</p>
        <p className="mt-1" style={{ fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.03em", color: "rgba(232,223,196,0.62)" }}>{subtitle}</p>
      </div>
    </div>
  );
}
