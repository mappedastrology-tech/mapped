/**
 * Sign rulerships — the one table.
 *
 * Mapped's convention (Taylor's decision):
 *
 * - When we NAME a sign's ruler to a person, the modern ruler comes first with
 *   the traditional co-ruler alongside: "Pluto, traditionally Mars". Both are
 *   in wide use and a reader who learned either should recognise their answer.
 * - When a technique needs ONE planet — Lord of the Year (profections), the
 *   final dispositor, Dolly's time-lord — it uses the TRADITIONAL ruler, because
 *   those techniques were built on the seven visible planets, and the copy says
 *   so.
 *
 * Before this file there were three tables: chartRuler.ts (modern), rulers.ts
 * and chartAnalysis.ts (traditional), with nothing saying which was which.
 *
 * Pure and dependency-free so calculation modules and tests can import it.
 */

/** Sign abbreviation → traditional (classical, seven-planet) ruler. */
export const TRADITIONAL_RULER: Record<string, string> = {
  Ari: "Mars",     Tau: "Venus",    Gem: "Mercury",
  Can: "Moon",     Leo: "Sun",      Vir: "Mercury",
  Lib: "Venus",    Sco: "Mars",     Sag: "Jupiter",
  Cap: "Saturn",   Aqu: "Saturn",   Pis: "Jupiter",
};

/** Sign abbreviation → modern ruler (outer planets for Scorpio, Aquarius, Pisces). */
export const MODERN_RULER: Record<string, string> = {
  ...TRADITIONAL_RULER,
  Sco: "Pluto",
  Aqu: "Uranus",
  Pis: "Neptune",
};

/** Accepts "Sco" or "Scorpio". */
function abbr(sign: string): string {
  return (sign || "").slice(0, 3);
}

export function traditionalRuler(sign: string): string | undefined {
  return TRADITIONAL_RULER[abbr(sign)];
}

export function modernRuler(sign: string): string | undefined {
  return MODERN_RULER[abbr(sign)];
}

/** The traditional co-ruler, only where it differs from the modern ruler. */
export function traditionalCoRuler(sign: string): string | undefined {
  const a = abbr(sign);
  return MODERN_RULER[a] !== TRADITIONAL_RULER[a] ? TRADITIONAL_RULER[a] : undefined;
}

/**
 * The display form: "Pluto, traditionally Mars" for the three signs with a
 * modern ruler, plain "Venus" for the rest.
 */
export function rulerLabel(sign: string): string {
  const modern = modernRuler(sign);
  if (!modern) return "";
  const trad = traditionalCoRuler(sign);
  return trad ? `${modern}, traditionally ${trad}` : modern;
}
