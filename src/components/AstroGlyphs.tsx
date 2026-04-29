"use client";

/**
 * AstroGlyphs — Precise SVG astrological symbols.
 *
 * Each glyph is a standalone SVG component built from clean geometric
 * primitives (circles, arcs, lines). No Unicode, no fonts, no emoji.
 * These render identically on every browser and device.
 */

interface GlyphProps {
  size?: number;
  color?: string;
  opacity?: number;
}

// ── ZODIAC SIGNS ──────────────────────────────────────────────────────

export function Aries({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      <path d="M8 28 C8 16 10 8 16 4 C22 8 24 16 24 28" />
      <line x1="16" y1="4" x2="16" y2="16" />
    </svg>
  );
}

export function Taurus({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      <circle cx="16" cy="20" r="8" />
      <path d="M4 8 C4 3 9 3 16 8 C23 3 28 3 28 8" />
    </svg>
  );
}

export function Gemini({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      <path d="M4 4 C10 8 22 8 28 4" />
      <path d="M4 28 C10 24 22 24 28 28" />
      <line x1="10" y1="6" x2="10" y2="26" />
      <line x1="22" y1="6" x2="22" y2="26" />
    </svg>
  );
}

export function Cancer({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      <circle cx="10" cy="14" r="4" />
      <circle cx="22" cy="18" r="4" />
      <path d="M6 14 C6 6 26 6 26 14" />
      <path d="M26 18 C26 26 6 26 6 18" />
    </svg>
  );
}

export function Leo({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      <circle cx="12" cy="18" r="6" />
      <path d="M18 18 C22 18 26 14 24 8 C22 4 16 6 16 10" />
      <path d="M16 10 C16 6 12 4 10 8" />
    </svg>
  );
}

export function Virgo({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      <path d="M4 24 L4 8 C8 16 8 16 8 8 C12 16 12 16 12 8 L12 20" />
      <path d="M12 20 C16 20 18 16 16 12" />
      <path d="M16 12 C20 14 22 20 20 24 L24 20" />
    </svg>
  );
}

export function Libra({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      <line x1="4" y1="26" x2="28" y2="26" />
      <line x1="4" y1="20" x2="28" y2="20" />
      <path d="M8 20 C8 12 16 8 16 8 C16 8 24 12 24 20" />
    </svg>
  );
}

export function Scorpio({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      <path d="M4 24 L4 8 C8 16 8 16 8 8 C12 16 12 16 12 8 L12 24" />
      <path d="M12 24 L18 18" />
      <path d="M15 21 L18 18 L18 22" />
    </svg>
  );
}

export function Sagittarius({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      <line x1="6" y1="26" x2="26" y2="6" />
      <path d="M18 6 L26 6 L26 14" />
      <line x1="10" y1="16" x2="22" y2="16" />
      <line x1="16" y1="10" x2="16" y2="22" />
    </svg>
  );
}

export function Capricorn({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      <path d="M4 8 L10 24 L16 8" />
      <path d="M16 8 C20 8 24 12 22 18 C20 24 26 26 28 22" />
      <circle cx="26" cy="26" r="3" />
    </svg>
  );
}

export function Aquarius({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      <path d="M4 12 L8 8 L12 12 L16 8 L20 12 L24 8 L28 12" />
      <path d="M4 22 L8 18 L12 22 L16 18 L20 22 L24 18 L28 22" />
    </svg>
  );
}

export function Pisces({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      <path d="M8 4 C2 10 2 22 8 28" />
      <path d="M24 4 C30 10 30 22 24 28" />
      <line x1="4" y1="16" x2="28" y2="16" />
    </svg>
  );
}

// ── PLANET SYMBOLS ────────────────────────────────────────────────────

export function Sun({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" opacity={opacity}>
      <circle cx="16" cy="16" r="8" />
      <circle cx="16" cy="16" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}

export function Moon({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" opacity={opacity}>
      <path d="M20 6 A10 10 0 1 0 20 26 A7 7 0 0 1 20 6" />
    </svg>
  );
}

export function Mercury({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2" strokeLinecap="round" opacity={opacity}>
      <circle cx="16" cy="14" r="6" />
      <line x1="16" y1="20" x2="16" y2="28" />
      <line x1="11" y1="24" x2="21" y2="24" />
      <path d="M10 6 A6 6 0 0 0 22 6" />
    </svg>
  );
}

export function Venus({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" opacity={opacity}>
      <circle cx="16" cy="12" r="7" />
      <line x1="16" y1="19" x2="16" y2="28" />
      <line x1="11" y1="24" x2="21" y2="24" />
    </svg>
  );
}

export function Mars({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" opacity={opacity}>
      <circle cx="13" cy="19" r="8" />
      <line x1="19" y1="13" x2="27" y2="5" />
      <path d="M21 5 L27 5 L27 11" />
    </svg>
  );
}

export function Jupiter({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" opacity={opacity}>
      <path d="M6 12 C6 6 12 4 18 8" />
      <line x1="18" y1="4" x2="18" y2="28" />
      <line x1="8" y1="18" x2="26" y2="18" />
    </svg>
  );
}

export function Saturn({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" opacity={opacity}>
      <line x1="12" y1="4" x2="12" y2="24" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <path d="M12 24 C18 24 22 20 20 14 C18 10 12 12 12 16" />
    </svg>
  );
}

export function Uranus({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" opacity={opacity}>
      <circle cx="16" cy="24" r="4" />
      <line x1="16" y1="10" x2="16" y2="20" />
      <line x1="10" y1="4" x2="10" y2="14" />
      <line x1="22" y1="4" x2="22" y2="14" />
      <line x1="10" y1="10" x2="22" y2="10" />
      <circle cx="16" cy="6" r="2" fill={color} stroke="none" />
    </svg>
  );
}

export function Neptune({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" opacity={opacity}>
      <line x1="16" y1="12" x2="16" y2="28" />
      <line x1="10" y1="24" x2="22" y2="24" />
      <path d="M6 10 C8 4 12 4 16 8 C20 4 24 4 26 10" />
      <line x1="6" y1="10" x2="6" y2="6" />
      <line x1="16" y1="8" x2="16" y2="4" />
      <line x1="26" y1="10" x2="26" y2="6" />
    </svg>
  );
}

export function Pluto({ size = 20, color = "#4A3F35", opacity = 0.75 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2.2" strokeLinecap="round" opacity={opacity}>
      <circle cx="16" cy="12" r="5" />
      <path d="M8 4 C8 4 8 18 8 18" />
      <path d="M24 4 C24 4 24 18 24 18" />
      <path d="M8 4 A8 8 0 0 1 24 4" />
      <line x1="16" y1="17" x2="16" y2="28" />
      <line x1="10" y1="24" x2="22" y2="24" />
    </svg>
  );
}

// ── LOOKUP MAPS ───────────────────────────────────────────────────────

export const ZODIAC_COMPONENTS: Record<string, React.FC<GlyphProps>> = {
  Ari: Aries, Tau: Taurus, Gem: Gemini, Can: Cancer,
  Leo, Vir: Virgo, Lib: Libra, Sco: Scorpio,
  Sag: Sagittarius, Cap: Capricorn, Aqu: Aquarius, Pis: Pisces,
};

export const PLANET_COMPONENTS: Record<string, React.FC<GlyphProps>> = {
  Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto,
};
