/**
 * Body Timing — Traditional almanac medical timing.
 * Based on the old almanac principle that each zodiac sign rules body parts,
 * and procedures on those areas go less smoothly while the Moon transits that sign.
 *
 * This is folklore for elective scheduling — never for emergencies.
 */

import { getCurrentMoonSign, getMoonLongitude } from "@/lib/astro/currentSky";

// ─── INTERFACES ─────────────────────────────────────────────────────────────

export interface BodyTimingItem {
  label: string;
  detail: string;
  icon: string;
  risk: "high" | "caution" | "good";
}

export interface BodyTimingNote {
  label: string;
  detail: string;
  icon: string;
}

export interface BetterDay {
  date: Date;
  label: string;     // "Mon, July 12"
  moonSign: string;
  reason: string;     // "safe for knees"
}

export interface BodyTimingForecast {
  planningDate: Date;
  dayLabel: string;          // "THURSDAY"
  dateLabel: string;         // "July 8, 2026"
  daysAway: number;          // 0 = today
  moonSign: string;
  moonPhase: string;
  summaryLabel: string;      // "Mixed day · proceed with care"
  avoid: BodyTimingItem[];   // things to avoid
  safe: BodyTimingItem[];    // things safe to schedule
  notes: BodyTimingNote[];   // worth knowing
  betterDays: BetterDay[];   // nearby better dates
}

// ─── SIGN → BODY RULES ─────────────────────────────────────────────────────

interface SignBodyRules {
  bodyPart: string;
  avoidItems: { label: string; detail: string; icon: string }[];
  safeItems: { label: string; detail: string; icon: string }[];
}

const SIGN_BODY_RULES: Record<string, SignBodyRules> = {
  Aries: {
    bodyPart: "Head",
    avoidItems: [
      { label: "Head & face appointments", detail: "The Moon highlights this area today", icon: "🧠" },
      { label: "Eye appointments", detail: "Aries governs the eyes", icon: "👁️" },
      { label: "Dental work (upper jaw)", detail: "Upper jaw is linked to Aries", icon: "🦷" },
    ],
    safeItems: [
      { label: "Foot care", detail: "Pisces (feet) is opposite — all clear", icon: "🦶" },
      { label: "Manicures & pedicures", detail: "Hands and feet are in the clear", icon: "💅" },
      { label: "Lower body care", detail: "Hips through feet are unaffected", icon: "🦵" },
    ],
  },
  Taurus: {
    bodyPart: "Neck & Throat",
    avoidItems: [
      { label: "Throat appointments", detail: "The Moon highlights this area today", icon: "🗣️" },
      { label: "Thyroid check-ups", detail: "Taurus governs the thyroid", icon: "⚕️" },
      { label: "Neck & vocal cord care", detail: "Neck area may be extra sensitive", icon: "🎤" },
    ],
    safeItems: [
      { label: "Lower back care", detail: "Scorpio (lower torso) is opposite — all clear", icon: "🔄" },
      { label: "Knee & leg treatments", detail: "Lower body is unaffected", icon: "🦵" },
      { label: "Manicures & pedicures", detail: "Hands and feet are in the clear", icon: "💅" },
    ],
  },
  Gemini: {
    bodyPart: "Arms & Lungs",
    avoidItems: [
      { label: "Arm & shoulder work", detail: "The Moon highlights upper limbs today", icon: "💪" },
      { label: "Respiratory appointments", detail: "Gemini governs the lungs", icon: "🫁" },
      { label: "Hand & wrist care", detail: "Gemini rules hands and fingers", icon: "✋" },
    ],
    safeItems: [
      { label: "Hip & thigh care", detail: "Sagittarius (hips) is opposite — all clear", icon: "🦵" },
      { label: "Foot treatments", detail: "Feet are well away from the sensitive zone", icon: "🦶" },
      { label: "Tattoos & piercings (legs)", detail: "Lower body is fine", icon: "✨" },
    ],
  },
  Cancer: {
    bodyPart: "Chest & Stomach",
    avoidItems: [
      { label: "Chest appointments", detail: "The Moon highlights this area today", icon: "🫀" },
      { label: "Stomach & digestion care", detail: "Cancer governs the stomach", icon: "🩺" },
      { label: "Breast check-ups", detail: "Cancer traditionally rules the chest", icon: "⚕️" },
    ],
    safeItems: [
      { label: "Knee care", detail: "Capricorn (knees) is opposite — all clear", icon: "🦵" },
      { label: "Dental work", detail: "Teeth and jaw are unaffected", icon: "🦷" },
      { label: "Tattoos & piercings", detail: "Just skip the chest and stomach area", icon: "✨" },
    ],
  },
  Leo: {
    bodyPart: "Heart & Back",
    avoidItems: [
      { label: "Heart-related appointments", detail: "The Moon highlights this area today", icon: "❤️" },
      { label: "Spine & back care", detail: "Leo governs the upper back", icon: "🦴" },
      { label: "Circulation check-ups", detail: "Leo rules circulation near the heart", icon: "🩸" },
    ],
    safeItems: [
      { label: "Ankle & shin care", detail: "Aquarius (ankles) is opposite — all clear", icon: "🦶" },
      { label: "Foot treatments", detail: "Well away from the heart zone", icon: "👟" },
      { label: "Manicures & pedicures", detail: "Hands and feet are in the clear", icon: "💅" },
    ],
  },
  Virgo: {
    bodyPart: "Intestines",
    avoidItems: [
      { label: "Digestive appointments", detail: "The Moon highlights this area today", icon: "🩺" },
      { label: "Abdominal care", detail: "Virgo governs the lower abdomen", icon: "⚕️" },
      { label: "Liver & pancreas check-ups", detail: "Digestive organs may be extra sensitive", icon: "🫁" },
    ],
    safeItems: [
      { label: "Foot care", detail: "Pisces (feet) is opposite — all clear", icon: "🦶" },
      { label: "Head & face treatments", detail: "Well away from the sensitive zone", icon: "💆" },
      { label: "Tattoos & piercings", detail: "Just skip the abdomen area", icon: "✨" },
    ],
  },
  Libra: {
    bodyPart: "Kidneys & Lower Back",
    avoidItems: [
      { label: "Kidney check-ups", detail: "The Moon highlights this area today", icon: "🫘" },
      { label: "Lower back care", detail: "Libra governs the lumbar region", icon: "🦴" },
      { label: "Skin treatments (torso)", detail: "Libra also influences skin balance", icon: "✨" },
    ],
    safeItems: [
      { label: "Head & face care", detail: "Aries (head) is opposite — all clear", icon: "🧠" },
      { label: "Dental work", detail: "Jaw and teeth are unaffected", icon: "🦷" },
      { label: "Eye care", detail: "Eyes are well away from the sensitive zone", icon: "👁️" },
    ],
  },
  Scorpio: {
    bodyPart: "Pelvic area",
    avoidItems: [
      { label: "Pelvic appointments", detail: "The Moon highlights this area today", icon: "⚕️" },
      { label: "Bladder & lower abdomen", detail: "Scorpio governs the lower torso", icon: "🩺" },
      { label: "Groin & hip flexor care", detail: "This region may be extra sensitive", icon: "🔻" },
    ],
    safeItems: [
      { label: "Throat & neck care", detail: "Taurus (throat) is opposite — all clear", icon: "🗣️" },
      { label: "Dental work", detail: "Jaw and teeth are unaffected", icon: "🦷" },
      { label: "Manicures & pedicures", detail: "Hands and feet are in the clear", icon: "💅" },
    ],
  },
  Sagittarius: {
    bodyPart: "Hips & Thighs",
    avoidItems: [
      { label: "Hip appointments", detail: "The Moon highlights this area today", icon: "🦴" },
      { label: "Thigh & upper leg care", detail: "Sagittarius governs upper legs", icon: "🦵" },
      { label: "Sciatic nerve area", detail: "Sagittarius rules the sciatic region", icon: "⚡" },
    ],
    safeItems: [
      { label: "Arm & hand care", detail: "Gemini (arms) is opposite — all clear", icon: "✋" },
      { label: "Respiratory check-ups", detail: "Lungs are unaffected", icon: "🫁" },
      { label: "Tattoos & piercings", detail: "Just skip thighs and hips", icon: "✨" },
    ],
  },
  Capricorn: {
    bodyPart: "Knees & Bones",
    avoidItems: [
      { label: "Knees, joints, bones", detail: "The Moon highlights this area today", icon: "🦴" },
      { label: "Teeth & dental visits", detail: "Capricorn also rules teeth and skin", icon: "🦷" },
      { label: "Haircuts for growth", detail: "Waxing Moon — cut for thickness only", icon: "✂️" },
    ],
    safeItems: [
      { label: "Manicures & pedicures", detail: "Hands and feet are in the clear", icon: "💅" },
      { label: "Tattoos & piercings", detail: "Just skip knees and lower legs", icon: "✨" },
      { label: "Chest & stomach care", detail: "Cancer (chest) is opposite — all clear", icon: "🩺" },
    ],
  },
  Aquarius: {
    bodyPart: "Ankles & Circulation",
    avoidItems: [
      { label: "Ankle & shin care", detail: "The Moon highlights this area today", icon: "🦶" },
      { label: "Vein & circulation visits", detail: "Aquarius governs circulation", icon: "🩸" },
      { label: "Calf & Achilles care", detail: "Lower leg tendons may be extra sensitive", icon: "🦵" },
    ],
    safeItems: [
      { label: "Heart & back care", detail: "Leo (heart) is opposite — all clear", icon: "❤️" },
      { label: "Dental work", detail: "Jaw and teeth are unaffected", icon: "🦷" },
      { label: "Tattoos & piercings", detail: "Just skip the lower legs", icon: "✨" },
    ],
  },
  Pisces: {
    bodyPart: "Feet & Lymph",
    avoidItems: [
      { label: "Foot care appointments", detail: "The Moon highlights this area today", icon: "🦶" },
      { label: "Lymphatic treatments", detail: "Pisces governs the lymph system", icon: "💧" },
      { label: "Toe & sole care", detail: "The whole foot area may be extra sensitive", icon: "👟" },
    ],
    safeItems: [
      { label: "Digestive check-ups", detail: "Virgo (intestines) is opposite — all clear", icon: "🩺" },
      { label: "Head & face treatments", detail: "Head zone is unaffected", icon: "💆" },
      { label: "Dental work", detail: "Jaw and teeth are unaffected", icon: "🦷" },
    ],
  },
};

// ─── MOON SIGN LOOKUP (simplified, matches gardeningAlmanac) ────────────────

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

function getMoonSignForDate(date: Date): string {
  // Use astronomy-engine for accurate moon sign (sub-arcminute)
  const { full } = getCurrentMoonSign(date);
  return full;
}

function getMoonPhaseLabel(date: Date): string {
  const J2000 = new Date(2000, 0, 1).getTime();
  const daysSince = (date.getTime() - J2000) / 86400000;
  const synodicPeriod = 29.530588;
  const phaseDay = (daysSince % synodicPeriod + synodicPeriod) % synodicPeriod;
  if (phaseDay < 1.5) return "new moon";
  if (phaseDay < 7.4) return "waxing crescent";
  if (phaseDay < 8.5) return "first quarter";
  if (phaseDay < 14) return "waxing gibbous";
  if (phaseDay < 15.5) return "full moon";
  if (phaseDay < 22) return "waning gibbous";
  if (phaseDay < 23.5) return "third quarter";
  return "waning crescent";
}

function isWaxing(date: Date): boolean {
  const phase = getMoonPhaseLabel(date);
  return phase.includes("waxing") || phase === "first quarter" || phase === "new moon";
}

// ─── MERCURY RETROGRADE CHECK ──────────────────────────────────────────────

interface MercuryStatus {
  label: string;
  detail: string;
  icon: string;
}

// 2026 Mercury retrograde periods (verified against ephemeris data)
// Sources: astro-seek.com, cafeastrology.com, almanac.com
const MERCURY_RETROGRADES_2026 = [
  { start: new Date(2026, 1, 26), end: new Date(2026, 2, 20), shadow: new Date(2026, 3, 9) },   // Feb 26 – Mar 20, post-shadow Apr 9
  { start: new Date(2026, 5, 29), end: new Date(2026, 6, 23), shadow: new Date(2026, 7, 7) },   // Jun 29 – Jul 23, post-shadow Aug 7
  { start: new Date(2026, 9, 24), end: new Date(2026, 10, 13), shadow: new Date(2026, 10, 30) }, // Oct 24 – Nov 13, post-shadow Nov 30
];

function getMercuryStatus(date: Date): MercuryStatus {
  for (const rx of MERCURY_RETROGRADES_2026) {
    if (date >= rx.start && date <= rx.end) {
      return {
        label: "Mercury retrograde",
        detail: "Communication and scheduling may be tricky — double-check appointments",
        icon: "☿️",
      };
    }
    if (date > rx.end && date <= rx.shadow) {
      return {
        label: "Mercury post-shadow",
        detail: "Retrograde effects fading — proceed with mild caution",
        icon: "☿️",
      };
    }
  }
  return {
    label: "Mercury direct, no shadow",
    detail: "Procedures booked now will hold",
    icon: "☿️",
  };
}

// ─── ECLIPSE SEASON CHECK ──────────────────────────────────────────────────

interface EclipseStatus {
  label: string;
  detail: string;
  icon: string;
}

// 2026 eclipse windows (approximately 2 weeks around each eclipse)
const ECLIPSE_WINDOWS_2026 = [
  { start: new Date(2026, 1, 11), end: new Date(2026, 2, 3), note: "Lunar eclipse Feb 17" },
  { start: new Date(2026, 1, 28), end: new Date(2026, 2, 17), note: "Solar eclipse Mar 3" },
  { start: new Date(2026, 7, 6), end: new Date(2026, 7, 25), note: "Lunar eclipse Aug 12" },
  { start: new Date(2026, 7, 22), end: new Date(2026, 8, 9), note: "Solar eclipse Aug 28" },
];

function getEclipseStatus(date: Date): EclipseStatus {
  for (const ew of ECLIPSE_WINDOWS_2026) {
    if (date >= ew.start && date <= ew.end) {
      return {
        label: "Eclipse season active",
        detail: `${ew.note} — traditional almanacs advise extra caution`,
        icon: "🌑",
      };
    }
  }
  // Find next eclipse window
  const next = ECLIPSE_WINDOWS_2026.find(ew => ew.start > date);
  if (next) {
    const startMonth = next.start.toLocaleDateString("en-US", { month: "short" });
    const startDay = next.start.getDate();
    return {
      label: "Outside eclipse season",
      detail: `Next eclipse window opens ${startMonth} ${startDay}`,
      icon: "🌕",
    };
  }
  return {
    label: "Outside eclipse season",
    detail: "No upcoming eclipse windows this year",
    icon: "🌕",
  };
}

// ─── BETTER DAYS ───────────────────────────────────────────────────────────

function findBetterDays(date: Date, avoidBodyPart: string): BetterDay[] {
  const days: BetterDay[] = [];
  const bodyPartLower = avoidBodyPart.toLowerCase();

  // Look ±14 days for days where the moon sign doesn't conflict
  for (let offset = 1; offset <= 14; offset++) {
    for (const dir of [1, -1]) {
      const d = new Date(date);
      d.setDate(date.getDate() + offset * dir);
      const sign = getMoonSignForDate(d);
      const rules = SIGN_BODY_RULES[sign];
      if (!rules) continue;

      // This day is "clean" if none of its avoid items overlap
      const conflicts = rules.avoidItems.some(item =>
        item.label.toLowerCase().includes(bodyPartLower.split(" ")[0]) ||
        bodyPartLower.includes(rules.bodyPart.toLowerCase().split(" ")[0])
      );

      if (!conflicts && days.length < 2) {
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        const monthDay = d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
        days.push({
          date: d,
          label: `${dayName}, ${monthDay}`,
          moonSign: sign,
          reason: `safe for ${bodyPartLower.split("&")[0].trim().split(",")[0].trim()}`,
        });
      }
    }
    if (days.length >= 2) break;
  }

  // Sort chronologically
  days.sort((a, b) => a.date.getTime() - b.date.getTime());
  return days;
}

// ─── SUMMARY LABEL ─────────────────────────────────────────────────────────

function getSummaryLabel(moonSign: string, moonPhase: string): string {
  const rules = SIGN_BODY_RULES[moonSign];
  if (!rules) return "Check conditions";

  // Sensitive signs (many body part conflicts)
  const sensitiveSigns = ["Cancer", "Leo", "Capricorn", "Scorpio"];
  if (sensitiveSigns.includes(moonSign)) {
    return "Mixed day · worth checking the details";
  }
  if (moonPhase.includes("full") || moonPhase.includes("new")) {
    return "Extra-sensitive day · check before you book";
  }
  return "Generally good · a few things to note";
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────

const DAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

/**
 * Get body timing forecast for a given date.
 * Includes avoid/safe lists, Mercury/eclipse status, and better nearby days.
 */
export function getBodyTiming(date: Date): BodyTimingForecast {
  const moonSign = getMoonSignForDate(date);
  const moonPhase = getMoonPhaseLabel(date);
  const rules = SIGN_BODY_RULES[moonSign] || SIGN_BODY_RULES.Aries;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const daysAway = Math.round((target.getTime() - today.getTime()) / 86400000);

  // Build avoid items with risk levels
  const avoid: BodyTimingItem[] = rules.avoidItems.map((item, i) => ({
    ...item,
    risk: i < 2 ? "high" as const : "caution" as const,
  }));

  // Build safe items
  const safe: BodyTimingItem[] = rules.safeItems.map(item => ({
    ...item,
    risk: "good" as const,
  }));

  // If waxing moon, add haircut caution to avoid
  const waxing = isWaxing(date);
  if (waxing && !avoid.some(a => a.label.includes("Haircut"))) {
    avoid.push({
      label: "Haircuts for growth",
      detail: "Waxing Moon · cut for thickness only",
      icon: "✂️",
      risk: "caution",
    });
  }

  // Notes: Mercury + Eclipse
  const mercury = getMercuryStatus(date);
  const eclipse = getEclipseStatus(date);
  const notes: BodyTimingNote[] = [
    { label: mercury.label, detail: mercury.detail, icon: mercury.icon },
    { label: eclipse.label, detail: eclipse.detail, icon: eclipse.icon },
  ];

  // Better days
  const betterDays = findBetterDays(date, rules.bodyPart);

  return {
    planningDate: date,
    dayLabel: DAY_NAMES[date.getDay()],
    dateLabel: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    daysAway,
    moonSign,
    moonPhase,
    summaryLabel: getSummaryLabel(moonSign, moonPhase),
    avoid,
    safe,
    notes,
    betterDays,
  };
}
