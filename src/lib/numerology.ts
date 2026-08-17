/**
 * Numerology calculation engine.
 *
 * Pure, deterministic functions that turn a full birth name + birth date into a
 * complete numerology profile. Supports both the Pythagorean (Western standard)
 * and Chaldean letter systems via a `system` flag.
 *
 * Methodology follows the Decoz / World Numerology canon for the Western system
 * and the Cheiro canonical map for Chaldean. Date-based numbers (Life Path,
 * Birthday, Personal Year/Month/Day, Pinnacles, Challenges) are identical across
 * systems — only name-based numbers (Expression, Soul Urge, Personality, etc.)
 * use the active letter map. Karmic Lessons, Hidden Passion and the Subconscious
 * Self depend on the 1–9 letter tally and are computed on the Pythagorean map
 * only (Chaldean assigns no letter the value 9, so "9 missing" is undefined).
 */

export type NumerologySystem = "pythagorean" | "chaldean";

export const MASTER_NUMBERS = [11, 22, 33];
export const KARMIC_DEBT_NUMBERS = [13, 14, 16, 19];

// ── Letter maps ───────────────────────────────────────────────────────────────

/** Pythagorean: A=1…I=9, wrapping (J=1, R=9, S=1, Z=8). */
export function pythagoreanValue(ch: string): number {
  const code = ch.toUpperCase().charCodeAt(0);
  if (code < 65 || code > 90) return 0;
  return ((code - 65) % 9) + 1;
}

/** Chaldean (Cheiro canonical): values 1–8, no letter is ever 9. */
const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

export function chaldeanValue(ch: string): number {
  return CHALDEAN_MAP[ch.toUpperCase()] ?? 0;
}

function letterValue(ch: string, system: NumerologySystem): number {
  return system === "chaldean" ? chaldeanValue(ch) : pythagoreanValue(ch);
}

// ── Reduction ─────────────────────────────────────────────────────────────────

export interface Reduction {
  /** Final reduced value (single digit, or a preserved master number). */
  value: number;
  /** Each two-digit total seen on the way down (for master/karmic inspection). */
  steps: number[];
  /** The karmic-debt number (13/14/16/19) the value passes through, if any. */
  karmicDebt: number | null;
}

function sumDigits(n: number): number {
  let s = 0;
  let x = Math.abs(n);
  while (x > 0) {
    s += x % 10;
    x = Math.floor(x / 10);
  }
  return s;
}

/**
 * Repeatedly sum digits until a single digit — or, when `keepMasters` is true, a
 * master number (11/22/33). Records intermediate two-digit totals so callers can
 * detect karmic-debt vibrations (13/14/16/19) the number passes through.
 */
export function reduceNumber(n: number, keepMasters = true): Reduction {
  const steps: number[] = [];
  let cur = n;
  while (cur > 9 && !(keepMasters && MASTER_NUMBERS.includes(cur))) {
    steps.push(cur);
    cur = sumDigits(cur);
  }
  const karmicDebt = steps.find((s) => KARMIC_DEBT_NUMBERS.includes(s)) ?? null;
  return { value: cur, steps, karmicDebt };
}

export function isMaster(n: number): boolean {
  return MASTER_NUMBERS.includes(n);
}

// ── Name parsing & Y classification ───────────────────────────────────────────

interface Letter {
  char: string;
  isVowel: boolean;
}

function isPlainVowel(ch: string): boolean {
  return "AEIOU".includes(ch);
}

/**
 * Decoz positional rules for whether a Y acts as a vowel. W is never a vowel.
 * `word` is the array of A–Z letters for a single name part; `i` is the index.
 */
function yIsVowel(word: string[], i: number): boolean {
  const prev = word[i - 1];
  const next = word[i + 1];
  const prevVowel = prev ? isPlainVowel(prev) : false;
  const nextVowel = next ? isPlainVowel(next) : false;

  if (i === 0) {
    // First letter: vowel only if followed by a consonant (Yvonne), else consonant (Yolanda).
    return next ? !nextVowel : false;
  }
  if (i === word.length - 1) {
    // Last letter: vowel if it follows a consonant (Mary, Barry), consonant after a vowel (Mickey).
    return !prevVowel;
  }
  // Middle: vowel only when wedged between two consonants (Kyle, Blythe).
  return !prevVowel && !nextVowel;
}

/**
 * Letters that don't decompose to a base A–Z under Unicode NFD and so need an
 * explicit transliteration (standard Latin-alphabet conventions). Everything
 * with a diacritic (é ü ñ ó ø-with-stroke aside, etc.) is handled by NFD +
 * stripping combining marks below.
 */
const TRANSLIT: Record<string, string> = {
  "Þ": "TH", "þ": "TH",   // thorn
  "ß": "SS",              // eszett
  "Æ": "AE", "æ": "AE",
  "Œ": "OE", "œ": "OE",
  "Ø": "O",  "ø": "O",    // stroke does not decompose
  "Đ": "D",  "đ": "D",
  "Ð": "D",  "ð": "D",    // eth
  "Ł": "L",  "ł": "L",
  "Ħ": "H",  "ħ": "H",
  "Ŧ": "T",  "ŧ": "T",
  "İ": "I",  "ı": "I",
  "Ŋ": "N",  "ŋ": "N",
};

/**
 * Normalise a name to plain A–Z for letter valuation. Previously this did a
 * bare `.replace(/[^A-Z]/g, "")`, which silently DELETED every non-ASCII
 * letter — so "Freya Þórsdóttir" lost Þ and both ó's, "José García" lost the
 * accented letters, and Expression / Soul Urge / Personality came out wrong
 * (sometimes producing false master numbers). Transliterate first, then filter.
 */
export function normalizeNameLetters(word: string): string {
  return word
    .replace(/[À-ɏḀ-ỿ]/g, (ch) => TRANSLIT[ch] ?? ch) // explicit map first
    .normalize("NFD")                       // é → e + ́
    .replace(/[̀-ͯ]/g, "")        // drop combining marks
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

/** Split a full name into words of {char, isVowel}, dropping non-letters. */
function parseName(fullName: string): Letter[][] {
  return fullName
    .split(/\s+/)
    .map((w) => normalizeNameLetters(w))
    .filter((w) => w.length > 0)
    .map((word) => {
      const chars = word.split("");
      return chars.map((char, i) => {
        let isVowel: boolean;
        if (char === "Y") isVowel = yIsVowel(chars, i);
        else if (char === "W") isVowel = false;
        else isVowel = isPlainVowel(char);
        return { char, isVowel };
      });
    });
}

// ── Name-based numbers ────────────────────────────────────────────────────────

export interface NameNumber {
  value: number;
  total: number; // grand total of selected letter values (Chaldean "compound" total)
  karmicDebt: number | null;
  isMaster: boolean;
}

/**
 * Compute a name number by reducing each name part separately, then summing the
 * parts and reducing once more (the Decoz master-preserving method). The karmic
 * debt is read from the grand total's reduction chain.
 */
function nameNumber(
  words: Letter[][],
  pick: (l: Letter) => boolean,
  system: NumerologySystem,
  keepMasters: boolean,
): NameNumber {
  let grandTotal = 0;
  const partReduced: number[] = [];
  for (const word of words) {
    let partSum = 0;
    for (const l of word) {
      if (pick(l)) {
        const v = letterValue(l.char, system);
        partSum += v;
        grandTotal += v;
      }
    }
    partReduced.push(reduceNumber(partSum, keepMasters).value);
  }
  const final = reduceNumber(
    partReduced.reduce((a, b) => a + b, 0),
    keepMasters,
  );
  return {
    value: final.value,
    total: grandTotal,
    karmicDebt: reduceNumber(grandTotal, keepMasters).karmicDebt,
    isMaster: isMaster(final.value),
  };
}

/** Tally of how many letters map to each digit 1–9 (Pythagorean). */
function letterTally(words: Letter[][]): Record<number, number> {
  const tally: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const word of words) {
    for (const l of word) {
      const v = pythagoreanValue(l.char);
      if (v >= 1 && v <= 9) tally[v] += 1;
    }
  }
  return tally;
}

// ── Profile types ─────────────────────────────────────────────────────────────

export interface CoreNumber {
  value: number;
  isMaster: boolean;
  karmicDebt: number | null;
}

export interface PinnacleCycle {
  index: 1 | 2 | 3 | 4;
  value: number;
  isMaster: boolean;
  startAge: number;
  endAge: number | null; // null = "to the end of life"
  active: boolean;
}

export interface ChallengeCycle {
  index: 1 | 2 | 3 | 4;
  value: number;
  label: string;
}

export interface NumerologyProfile {
  system: NumerologySystem;
  fullName: string;
  birthDate: string; // YYYY-MM-DD

  lifePath: CoreNumber;
  expression: CoreNumber;
  soulUrge: CoreNumber;
  personality: CoreNumber;
  birthday: { value: number; day: number; isMaster: boolean; karmicDebt: number | null };
  maturity: CoreNumber;

  // Name compound totals (useful for Chaldean interpretation)
  expressionTotal: number;

  // Advanced layers (Pythagorean-derived where noted)
  karmicLessons: number[]; // missing digits 1–9
  hiddenPassion: number[]; // most-frequent digit(s)
  balance: number;
  subconsciousSelf: number;
  bridges: { lifePathExpression: number; soulUrgePersonality: number };

  // Cycles
  personalYear: number;
  personalMonth: number;
  personalDay: number;
  pinnacles: PinnacleCycle[];
  challenges: ChallengeCycle[];

  // Convenience: every karmic-debt flag found across the core positions
  karmicDebts: { position: string; debt: number }[];
}

// ── Main computation ──────────────────────────────────────────────────────────

function parseBirthDate(birthDate: string): { year: number; month: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

export function computeNumerology(
  fullName: string,
  birthDate: string,
  options: { system?: NumerologySystem; now?: Date } = {},
): NumerologyProfile | null {
  const system = options.system ?? "pythagorean";
  const now = options.now ?? new Date();
  const date = parseBirthDate(birthDate);
  if (!date) return null;
  const { year, month, day } = date;

  const words = parseName(fullName);

  // Core date number — Life Path (segmented, master-preserving).
  const rm = reduceNumber(month, true).value;
  const rd = reduceNumber(day, true).value;
  const ry = reduceNumber(year, true).value;
  const lifePathRed = reduceNumber(rm + rd + ry, true);
  const lifePath: CoreNumber = {
    value: lifePathRed.value,
    isMaster: isMaster(lifePathRed.value),
    karmicDebt: lifePathRed.karmicDebt,
  };

  // Core name numbers.
  const exprN = nameNumber(words, () => true, system, true);
  const soulN = nameNumber(words, (l) => l.isVowel, system, true);
  const persN = nameNumber(words, (l) => !l.isVowel, system, true);

  const expression: CoreNumber = { value: exprN.value, isMaster: exprN.isMaster, karmicDebt: exprN.karmicDebt };
  const soulUrge: CoreNumber = { value: soulN.value, isMaster: soulN.isMaster, karmicDebt: soulN.karmicDebt };
  const personality: CoreNumber = { value: persN.value, isMaster: persN.isMaster, karmicDebt: persN.karmicDebt };

  // Birthday number.
  const bdRed = reduceNumber(day, true);
  const birthday = {
    value: bdRed.value,
    day,
    isMaster: isMaster(bdRed.value),
    karmicDebt: KARMIC_DEBT_NUMBERS.includes(day) ? day : null,
  };

  // Maturity = Life Path + Expression.
  const matRed = reduceNumber(lifePath.value + expression.value, true);
  const maturity: CoreNumber = {
    value: matRed.value,
    isMaster: isMaster(matRed.value),
    karmicDebt: matRed.karmicDebt,
  };

  // Pythagorean tally → Karmic Lessons, Hidden Passion, Subconscious Self.
  const tally = letterTally(words);
  const karmicLessons = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => tally[d] === 0);
  const maxCount = Math.max(...Object.values(tally));
  const hiddenPassion =
    maxCount > 0 ? [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => tally[d] === maxCount) : [];
  const subconsciousSelf = 9 - karmicLessons.length;

  // Balance number — initials, reduced to a single digit.
  let initialSum = 0;
  for (const word of words) if (word[0]) initialSum += letterValue(word[0].char, system);
  const balance = reduceNumber(initialSum, false).value;

  // Bridges — absolute difference of single-digit reductions.
  const lpSingle = reduceNumber(lifePath.value, false).value;
  const exprSingle = reduceNumber(expression.value, false).value;
  const soulSingle = reduceNumber(soulUrge.value, false).value;
  const persSingle = reduceNumber(personality.value, false).value;
  const bridges = {
    lifePathExpression: Math.abs(lpSingle - exprSingle),
    soulUrgePersonality: Math.abs(soulSingle - persSingle),
  };

  // Cycles — Personal Year / Month / Day (single-digit cycle).
  const pyMonth = reduceNumber(month, false).value;
  const pyDay = reduceNumber(day, false).value;
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  const curDay = now.getDate();
  const personalYear = reduceNumber(pyMonth + pyDay + reduceNumber(curYear, false).value, false).value;
  const personalMonth = reduceNumber(personalYear + curMonth, false).value;
  const personalDay = reduceNumber(personalMonth + curDay, false).value;

  // Pinnacles — master-preserving sums.
  const p1 = reduceNumber(rm + rd, true).value;
  const p2 = reduceNumber(rd + ry, true).value;
  const p3 = reduceNumber(p1 + p2, true).value;
  const p4 = reduceNumber(rm + ry, true).value;
  const lpForTiming = reduceNumber(lifePath.value, false).value;
  const p1End = 36 - lpForTiming;
  const age = currentAge(year, month, day, now);
  const pinnacleVals = [p1, p2, p3, p4];
  const pinnacleRanges: [number, number | null][] = [
    [0, p1End],
    [p1End + 1, p1End + 9],
    [p1End + 10, p1End + 18],
    [p1End + 19, null],
  ];
  const pinnacles: PinnacleCycle[] = pinnacleVals.map((value, i) => {
    const [startAge, endAge] = pinnacleRanges[i];
    return {
      index: (i + 1) as 1 | 2 | 3 | 4,
      value,
      isMaster: isMaster(value),
      startAge,
      endAge,
      active: age >= startAge && (endAge === null || age <= endAge),
    };
  });

  // Challenges — absolute differences (master numbers reduced to single digits).
  const cm = reduceNumber(month, false).value;
  const cd = reduceNumber(day, false).value;
  const cy = reduceNumber(year, false).value;
  const c1 = Math.abs(cm - cd);
  const c2 = Math.abs(cd - cy);
  const c3 = Math.abs(c1 - c2);
  const c4 = Math.abs(cm - cy);
  const challenges: ChallengeCycle[] = [
    { index: 1, value: c1, label: "Early challenge" },
    { index: 2, value: c2, label: "Midlife challenge" },
    { index: 3, value: c3, label: "Main challenge" },
    { index: 4, value: c4, label: "Later challenge" },
  ];

  // Collect karmic debts across positions.
  const karmicDebts: { position: string; debt: number }[] = [];
  if (lifePath.karmicDebt) karmicDebts.push({ position: "Life Path", debt: lifePath.karmicDebt });
  if (expression.karmicDebt) karmicDebts.push({ position: "Expression", debt: expression.karmicDebt });
  if (soulUrge.karmicDebt) karmicDebts.push({ position: "Soul Urge", debt: soulUrge.karmicDebt });
  if (personality.karmicDebt) karmicDebts.push({ position: "Personality", debt: personality.karmicDebt });
  if (birthday.karmicDebt) karmicDebts.push({ position: "Birthday", debt: birthday.karmicDebt });

  return {
    system,
    fullName: fullName.trim(),
    birthDate,
    lifePath,
    expression,
    soulUrge,
    personality,
    birthday,
    maturity,
    expressionTotal: exprN.total,
    karmicLessons,
    hiddenPassion,
    balance,
    subconsciousSelf,
    bridges,
    personalYear,
    personalMonth,
    personalDay,
    pinnacles,
    challenges,
    karmicDebts,
  };
}

function currentAge(year: number, month: number, day: number, now: Date): number {
  let age = now.getFullYear() - year;
  const hadBirthday =
    now.getMonth() + 1 > month || (now.getMonth() + 1 === month && now.getDate() >= day);
  if (!hadBirthday) age -= 1;
  return age;
}
