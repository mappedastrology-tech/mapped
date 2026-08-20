"use client";

/**
 * Profile — "Profile - You" (design_handoff_profile_archetype).
 *
 * The profile is deliberately not an account screen: it is a READING. One
 * archetype synthesized from the user's systems, with the reasoning shown:
 *   A. Archetype hero — breathing glow, drifting sigil, name, tagline, chips
 *   B. "How we got here" — weighted source rows linking to each system
 *   C. "Two more reads" — Chinese zodiac + character (and the app's animal
 *      guide + deity, same card anatomy)
 *   D. "You, in four parts" — single-open accordion
 *   E. Tension panel — where the systems disagree (plum, high contrast)
 *   F. "Rare in your make-up" — master numbers / karmic debts / rare profiles
 *   G. "Where you are right now" — personal year + nine-year strip + micro row
 *   H. "Words that keep coming up" — trait pills
 * Account controls live on /account (hamburger, top right).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchSetting, saveSetting } from "@/lib/syncedSettings";
import { computeNumerology } from "@/lib/numerology";
import { computeHumanDesign } from "@/lib/humanDesign/engine";
import { computeResonance, type Placement } from "@/lib/resonance/engine";
import { persistAllAssignments } from "@/lib/resonance/persist";
import { TRAIT_ORDER } from "@/lib/resonance/traits";
import { computeAnimalGuide, TIER_LABEL } from "@/lib/resonance/animals";
import { computeDeity, DEITY_TIER_LABEL } from "@/lib/resonance/deities";
import { computeCharacter } from "@/lib/resonance/characters";
import { computeChineseZodiac } from "@/lib/chineseZodiac";

const PHOTO_KEY = "mapped:profile-photo";
const NAME_KEY = "mapped:numerology-fullname";

// Symbol font stack — required on zodiac/occult glyphs or they render as emoji.
const GLYPH_STACK = "'Noto Sans Symbols', 'Noto Sans Symbols 2', 'Segoe UI Symbol', serif";

interface ChartRow {
  name: string;
  birthDate: string;
  birthTime: string;
  unknownTime: boolean;
  latitude: number | null;
  longitude: number | null;
  cityName: string | null;
  bigThree: { sun?: string; moon?: string; rising?: string } | null;
  placements: Placement[];
}

/** Pull {name, sign, house} from stored planet/special-point rows (shape varies by source). */
function toPlacements(...groups: unknown[]): Placement[] {
  const out: Placement[] = [];
  for (const g of groups) {
    if (!Array.isArray(g)) continue;
    for (const item of g) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const name = typeof o.name === "string" ? o.name : null;
      if (!name) continue;
      const sign = typeof o.sign === "string" ? o.sign : null;
      const house = typeof o.house === "number" ? o.house : null;
      out.push({ name, sign, house });
    }
  }
  return out;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Nov 7, 1994 · 9:42 PM · Portland, OR" — the identity line under the chips. */
function formatBirthLine(dateStr: string, timeStr: string, unknownTime: boolean, city: string | null): string {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  let line = dateStr;
  if (dm) {
    const [, y, mo, d] = dm;
    line = `${MONTHS[Number(mo) - 1]} ${Number(d)}, ${y}`;
  }
  if (!unknownTime && /^\d{1,2}:\d{2}$/.test(timeStr)) {
    const [h, min] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    line += ` · ${h12}:${String(min).padStart(2, "0")} ${ampm}`;
  }
  if (city) {
    // Geocoder display names can be very long — keep the first two segments.
    const short = city.split(",").slice(0, 2).map((s) => s.trim()).join(", ");
    if (short) line += ` · ${short}`;
  }
  return line;
}

/* ─── Numerology cycle helpers ─────────────────────────────────────────────── */

function digitSum(n: number): number {
  return String(n).split("").reduce((a, c) => a + Number(c), 0);
}
function reduce9(n: number): number {
  while (n > 9) n = digitSum(n);
  return n;
}
/** Personal year for the given calendar year (birth month + day + year, reduced 1–9). */
function personalYearFor(birthDate: string, year: number): number | null {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!dm) return null;
  return reduce9(Number(dm[2]) + Number(dm[3]) + digitSum(year));
}

const PY_TITLE: Record<number, string> = {
  1: "A year to begin", 2: "A year to tend", 3: "A year to say it",
  4: "A year to build", 5: "A year to move", 6: "A year to hold close",
  7: "A year to go inward", 8: "A year to claim it", 9: "A year to let go",
};
// {arch} = the archetype name without its leading "The".
const PY_BODY: Record<number, string> = {
  1: "Year one of a fresh nine. For a {arch} this is the good kind of year — the pull finally has somewhere to go.",
  2: "The seed year is over; this one is for tending. For a {arch}, the work is patience — let what you started take root before you tug on it.",
  3: "A year that wants to be spoken. For a {arch}, the risk isn't saying too much — it's polishing the thing instead of showing it.",
  4: "The foundation year. For a {arch} it will feel slow on purpose — what you make boring and solid now carries the next five.",
  5: "The hinge of the nine — change arrives whether invited or not. For a {arch}, this is home water; just choose which wave, not every wave.",
  6: "A year that pulls you toward your people. For a {arch}, the lesson is staying through the ordinary parts, not only the rescues.",
  7: "The quiet seventh. For a {arch}, going inward isn't retreat — it's where the next run gets its shape.",
  8: "The harvest year — power, money, weight. For a {arch}, ask for the full price; the year backs you when you don't flinch.",
  9: "The clearing year. For a {arch}, endings aren't losses here — they're the tide going out so the next nine can come in.",
};
const CYCLE_NOTE: Record<number, string> = {
  1: "Start it", 2: "Let it settle", 3: "Say it out loud",
  4: "Do the boring part", 5: "Shake it loose", 6: "Tend your people",
  7: "Go quiet, think", 8: "Push for it", 9: "Let things end",
};

/* ─── Facet copy — short titles keyed to real data ─────────────────────────── */

const OPERATE_TITLE: Record<string, string> = {
  "Manifesting Generator": "In bursts, not in lines",
  Generator: "Steady heat, once it's real",
  Projector: "By invitation, then all at once",
  Manifestor: "First moves, no permission",
  Reflector: "In cycles, not schedules",
};
const NEED_TITLE: Record<number, string> = {
  1: "A lane of your own", 2: "Someone to build beside", 3: "An audience for the spark",
  4: "Ground that holds", 5: "An exit that stays open", 6: "Somewhere to be needed",
  7: "Room to go quiet", 8: "Stakes worth the climb", 9: "A cause bigger than you",
  11: "A signal worth carrying", 22: "Something real to build", 33: "Someone to pour into",
};
const SNAG_TITLE: Record<string, string> = {
  emotional: "Deciding at the peak of the feeling",
  sacral: "Saying yes past the no",
  splenic: "Second-guessing the first hit",
  ego: "Promising more than the tank holds",
};

/* ─── Rarity copy ──────────────────────────────────────────────────────────── */

const MASTER_COPY: Record<number, { rarity: string; body: string }> = {
  11: { rarity: "in ~3% of charts", body: "Runs at master voltage — perceptive, magnetic, and more visible than is comfortable." },
  22: { rarity: "in ~2% of charts", body: "The master builder's number — big blueprints that only count once they stand in the real world." },
  33: { rarity: "in ~1% of charts", body: "The master teacher's number — a pull toward carrying others that has to be chosen, not obeyed." },
};
const KARMIC_COPY: Record<number, { rarity: string; body: string }> = {
  13: { rarity: "in ~9% of charts", body: "The debt of unfinished work — shortcuts cost double here, and honest labor pays triple." },
  14: { rarity: "in ~8% of charts", body: "The debt of excess — freedom keeps being the test, and moderation the unglamorous answer." },
  16: { rarity: "in ~7% of charts", body: "The oldest lesson there is: an identity built on something that has to fall before it can be rebuilt honestly." },
  19: { rarity: "in ~10% of charts", body: "The debt of standing alone — help has to be accepted, not just admired in other people." },
};
const RARE_PROFILES: Record<string, { rarity: string; name: string; body: string }> = {
  "4/1": { rarity: "in ~2% of designs", name: "Opportunist / Investigator", body: "A fixed foundation profile — one study, one network, one life built deliberately on both." },
  "6/2": { rarity: "in ~4% of designs", name: "Role Model / Hermit", body: "Meant to live it first and only teach it after — which is why early advice rarely sounds like you." },
  "6/3": { rarity: "in ~3% of designs", name: "Role Model / Martyr", body: "Wisdom earned by collision — the life tries everything once so the second act can mean something." },
};

const NUM_WORD: Record<number, string> = {
  11: "Eleven", 22: "Twenty-two", 33: "Thirty-three",
  13: "Thirteen", 14: "Fourteen", 16: "Sixteen", 19: "Nineteen",
};

export default function ProfilePageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [row, setRow] = useState<ChartRow | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [fullName, setFullName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [openFacet, setOpenFacet] = useState<string | null>("operate");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const p = localStorage.getItem(PHOTO_KEY);
      if (p) setPhoto(p);
    } catch { /* ignore */ }

    async function load() {
      let storedFull = "";
      try { storedFull = localStorage.getItem(NAME_KEY) || ""; } catch { /* ignore */ }

      const { data: { session } } = await supabase.auth.getSession();
      let metaName = "";
      if (session?.user) {
        setUserId(session.user.id);
        // Account-synced profile photo wins over the local copy.
        const acctPhoto = await fetchSetting(session.user.id, "profile-photo");
        if (acctPhoto) {
          setPhoto(acctPhoto);
          try { localStorage.setItem(PHOTO_KEY, acctPhoto); } catch { /* ignore */ }
        }
        metaName =
          (session.user.user_metadata?.full_name as string | undefined) ||
          (session.user.user_metadata?.name as string | undefined) || "";
        const { data } = await supabase
          .from("charts")
          .select("name, birth_date, birth_time, latitude, longitude, unknown_time, city_name, big_three, planets, special_points")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (data) {
          setRow({
            name: data.name,
            birthDate: data.birth_date,
            birthTime: data.birth_time || "12:00",
            unknownTime: !!data.unknown_time,
            latitude: data.latitude,
            longitude: data.longitude,
            cityName: (data.city_name as string | null) ?? null,
            bigThree: (data.big_three as ChartRow["bigThree"]) ?? null,
            placements: toPlacements(data.planets, data.special_points),
          });
          setDisplayName(metaName || data.name || "");
          setFullName(storedFull || metaName || data.name || "");
          setIsLoading(false);
          return;
        }
      }
      try {
        const stored = sessionStorage.getItem("chartResult");
        if (stored) {
          const parsed = JSON.parse(stored);
          setRow({
            name: parsed.name,
            birthDate: parsed.birthDate,
            birthTime: parsed.birthTime || "12:00",
            unknownTime: !!parsed.unknownTime,
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            cityName: parsed.cityName || parsed.city_name || null,
            bigThree: parsed.bigThree ?? null,
            placements: toPlacements(parsed.planets, parsed.specialPoints, parsed.special_points),
          });
          setDisplayName(metaName || parsed.name || "");
          setFullName(storedFull || metaName || parsed.name || "");
        }
      } catch { /* ignore */ }
      setIsLoading(false);
    }
    load();
  }, []);

  const numerology = useMemo(() => {
    if (!row || !fullName.trim()) return null;
    return computeNumerology(fullName, row.birthDate);
  }, [row, fullName]);

  const hd = useMemo(() => {
    if (!row || row.unknownTime || row.latitude == null || row.longitude == null) return null;
    return computeHumanDesign({
      birthDate: row.birthDate,
      birthTime: row.birthTime,
      latitude: row.latitude,
      longitude: row.longitude,
    });
  }, [row]);

  // Resonance engine — the 96-archetype / 6-facet result. Deterministic and
  // computed from the fixed chart, so it never regenerates or costs credits.
  const resonance = useMemo(() => {
    if (!row?.bigThree) return null;
    const nums = [
      numerology?.lifePath, numerology?.expression, numerology?.soulUrge,
      numerology?.personality, numerology?.maturity, numerology?.birthday,
    ];
    const masters: number[] = [];
    const karmics: number[] = [];
    for (const n of nums) {
      if (!n) continue;
      if ([11, 22, 33].includes(n.value) && !masters.includes(n.value)) masters.push(n.value);
      const kd = (n as { karmicDebt?: number | null }).karmicDebt;
      if (kd && !karmics.includes(kd)) karmics.push(kd);
    }
    return computeResonance({
      sun: row.bigThree.sun,
      moon: row.bigThree.moon,
      rising: row.unknownTime ? null : row.bigThree.rising,
      lifePath: numerology?.lifePath.value ?? null,
      expression: numerology?.expression.value ?? null,
      soulUrge: numerology?.soulUrge.value ?? null,
      hdType: hd?.type ?? null,
      hdAuthority: hd?.authority ?? null,
      hdLines: hd?.profileLines ?? null,
      hdDefinition: hd?.definitionName ?? null,
      masters,
      karmics,
      // When the birth time is unknown, house placements are unreliable — feed
      // sign features only (drop house data) so we don't invent a life-area layer.
      placements: row.unknownTime
        ? row.placements.map((p) => ({ name: p.name, sign: p.sign, house: null }))
        : row.placements,
    });
  }, [row, numerology, hd]);

  // Secondary libraries — same engine, deterministic, free (no regeneration).
  const animal = useMemo(() => (resonance ? computeAnimalGuide(resonance.traits) : null), [resonance]);
  const deity = useMemo(() => (resonance ? computeDeity(resonance.traits) : null), [resonance]);
  const character = useMemo(() => (resonance ? computeCharacter(resonance.traits) : null), [resonance]);

  // Chinese zodiac — year/month/hour pillars from the birth moment.
  const zodiac = useMemo(() => {
    if (!row) return null;
    return computeChineseZodiac(row.birthDate, row.birthTime, row.unknownTime);
  }, [row]);

  // Store all four assignments once (immutable snapshots, one current row per
  // library). Fire-and-forget — the page already renders from the deterministic
  // compute above.
  useEffect(() => {
    if (!resonance || !userId) return;
    persistAllAssignments(supabase, userId, resonance, { animal, deity, character }, {
      mode: row?.unknownTime ? "no-birth-time" : "full",
      confidence: row?.unknownTime ? 0.74 : 1.0,
    });
  }, [resonance, animal, deity, character, userId, row?.unknownTime]);

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 320;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setPhoto(dataUrl);
        try { localStorage.setItem(PHOTO_KEY, dataUrl); } catch { /* ignore */ }
        window.dispatchEvent(new CustomEvent("mapped:profile-photo"));
        if (userId) saveSetting(userId, "profile-photo", dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div
          className="w-6 h-6 border-2 rounded-full animate-spin"
          style={{ borderColor: "rgba(201,169,97,0.3)", borderTopColor: "var(--brass)" }}
          role="status"
          aria-label="Loading"
        />
      </main>
    );
  }

  const initials = (displayName || "You")
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const firstName = (displayName || "").split(/\s+/)[0] || "";
  // "The Riptide" → "Riptide", for copy like "For a Riptide…"
  const archShort = resonance ? resonance.primary.name.replace(/^The\s+/i, "") : "";

  /* ── B. Sources — weights renormalized to 100 across available systems ───── */
  type Source = { system: string; glyph: string; glyphSize: number; baseWeight: number; value: string; contribution: string; href: string };
  const sources: Source[] = [];
  if (row?.bigThree?.sun || row?.bigThree?.moon) {
    const b = row.bigThree!;
    const parts = [b.sun && `${b.sun} Sun`, b.moon && `${b.moon} Moon`, !row.unknownTime && b.rising && `${b.rising} Rising`].filter(Boolean);
    sources.push({
      system: "Astrology", glyph: "♏︎", glyphSize: 19, baseWeight: 35,
      value: parts.join(" · "),
      contribution: "Sets the emotional weather — how you feel, love, and are first seen.",
      href: "/you",
    });
  }
  if (numerology) {
    sources.push({
      system: "Numerology", glyph: String(numerology.lifePath.value), glyphSize: 19, baseWeight: 30,
      value: `Life Path ${numerology.lifePath.value} · Expression ${numerology.expression.value} · Personality ${numerology.personality.value}`,
      contribution: "Adds the motion — the path your name and birth date keep walking.",
      href: "/numerology",
    });
  }
  if (hd) {
    sources.push({
      system: "Human Design", glyph: "⚡︎", glyphSize: 19, baseWeight: 20,
      value: `${hd.type} ${hd.profile} · ${hd.authorityName.split(" — ")[0]}`,
      contribution: "Adds the mechanics — how your energy starts, stalls, and decides.",
      href: "/human-design",
    });
  }
  if (zodiac) {
    const zParts = [zodiac.title, `${zodiac.monthAnimal} month`, zodiac.hourAnimal && `${zodiac.hourAnimal} hour`].filter(Boolean);
    sources.push({
      system: "Chinese zodiac", glyph: "犬", glyphSize: 19, baseWeight: 15,
      value: zParts.join(" · "),
      contribution: "Adds the animal — the temperament your birth year and hour hand down.",
      href: "/library/reference",
    });
  }
  const weightTotal = sources.reduce((a, s) => a + s.baseWeight, 0);
  const weights = sources.map((s, i) => {
    if (weightTotal === 0) return 0;
    const scaled = sources.map((x) => (x.baseWeight / weightTotal) * 100);
    const floors = scaled.map(Math.floor);
    let rem = 100 - floors.reduce((a, n) => a + n, 0);
    const order = scaled.map((v, j) => ({ j, frac: v - Math.floor(v) })).sort((a, b) => b.frac - a.frac);
    const bumped = new Set<number>();
    for (const o of order) { if (rem <= 0) break; bumped.add(o.j); rem--; }
    return floors[i] + (bumped.has(i) ? 1 : 0);
  });

  /* ── C. Character stats — top three traits scaled 0–10 ──────────────────── */
  const charStats = resonance
    ? TRAIT_ORDER.map((t) => ({ label: t, v: resonance.traits[t] }))
        .sort((a, b) => b.v - a.v)
        .slice(0, 3)
        .map(({ label, v }) => ({ label, n: Math.max(1, Math.min(10, Math.round(v / 10))) }))
    : [];

  /* ── D. Facets — the four-part read, from the archetype's written content ── */
  const content = resonance?.primary.content;
  const facets = content ? [
    {
      id: "operate", kicker: "How you operate",
      title: (hd && OPERATE_TITLE[hd.type]) || "In your own rhythm",
      body: content.atWork,
      from: [hd?.type, numerology && `Life Path ${numerology.lifePath.value}`].filter(Boolean).join(" × ") || "Your chart, read together",
    },
    {
      id: "need", kicker: "What you need",
      title: (numerology && NEED_TITLE[numerology.lifePath.value]) || "Room to become",
      body: content.growthEdge,
      from: [row?.bigThree?.moon && `${row.bigThree.moon} Moon`, numerology && `Soul Urge ${numerology.soulUrge.value}`].filter(Boolean).join(" × ") || "Moon × Soul Urge",
    },
    {
      id: "snag", kicker: "Where you snag",
      title: (hd && SNAG_TITLE[hd.authority]) || "Deciding too fast",
      body: content.shadowSide,
      from: [hd && hd.authorityName.split(" — ")[0], row?.bigThree?.sun && `${row.bigThree.sun} Sun`].filter(Boolean).join(" × ") || "Sun × shadow",
    },
    {
      id: "read", kicker: "How others read you",
      title: numerology?.personality.value === 11 ? "More arriving than you think" : "First impressions run ahead of you",
      body: content.inRelationship,
      from: [numerology && `Personality ${numerology.personality.value}`, row?.bigThree?.rising && !row.unknownTime && `${row.bigThree.rising} Rising`].filter(Boolean).join(" × ") || "Personality × Rising",
    },
  ] : [];

  /* ── F. Rarities — masters, karmic debts, rare HD profiles ──────────────── */
  type Rarity = { mark: string; kicker: string; rarity: string; title: string; body: string };
  const rarities: Rarity[] = [];
  if (numerology) {
    const named: Array<[string, { value: number; karmicDebt?: number | null }]> = [
      ["Life Path", numerology.lifePath], ["Expression", numerology.expression],
      ["Soul Urge", numerology.soulUrge], ["Personality", numerology.personality],
      ["Birthday", numerology.birthday],
    ];
    const seenMaster = new Set<number>();
    const seenKarmic = new Set<number>();
    for (const [label, n] of named) {
      if (MASTER_COPY[n.value] && !seenMaster.has(n.value)) {
        seenMaster.add(n.value);
        rarities.push({ mark: String(n.value), kicker: "Master number", rarity: MASTER_COPY[n.value].rarity, title: `${NUM_WORD[n.value]} in your ${label}`, body: MASTER_COPY[n.value].body });
      }
      const kd = n.karmicDebt;
      if (kd && KARMIC_COPY[kd] && !seenKarmic.has(kd)) {
        seenKarmic.add(kd);
        rarities.push({ mark: String(kd), kicker: "Karmic debt", rarity: KARMIC_COPY[kd].rarity, title: `${NUM_WORD[kd]} inside your ${label}`, body: KARMIC_COPY[kd].body });
      }
    }
  }
  if (hd && RARE_PROFILES[hd.profile]) {
    const rp = RARE_PROFILES[hd.profile];
    rarities.push({ mark: hd.profile, kicker: "Rare profile", rarity: rp.rarity, title: rp.name, body: rp.body });
  }
  const shownRarities = rarities.slice(0, 4);

  /* ── G. Cycle — personal year / month / day + first live transit ────────── */
  const now = new Date();
  const py = row ? personalYearFor(row.birthDate, now.getFullYear()) : null;
  const pMonth = py ? reduce9(py + now.getMonth() + 1) : null;
  const pDay = pMonth ? reduce9(pMonth + now.getDate()) : null;
  let transitNote: string | null = null;
  try {
    const transits = JSON.parse(sessionStorage.getItem("mapped:transits") || "[]");
    if (Array.isArray(transits) && transits[0]?.transitPlanet && transits[0]?.natalPlanet) {
      transitNote = `${transits[0].transitPlanet} ${transits[0].aspect} your ${transits[0].natalPlanet}`;
    }
  } catch { /* ignore */ }
  const microCycles = [
    pMonth ? { label: "This month", note: CYCLE_NOTE[pMonth] } : null,
    pDay ? { label: "Today", note: CYCLE_NOTE[pDay] } : null,
    transitNote ? { label: "Transit", note: transitNote } : null,
  ].filter((m): m is { label: string; note: string } => !!m);

  /* ── H. Trait pills — the strongest words in the trait vector ───────────── */
  const traitPills = resonance
    ? TRAIT_ORDER.map((t) => ({ t, v: resonance.traits[t] })).sort((a, b) => b.v - a.v).slice(0, 5).map(({ t }) => t)
    : [];

  const kickerStyle: React.CSSProperties = { fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: "var(--foreground-muted)", margin: "0 0 6px" };
  const subLineStyle: React.CSSProperties = { fontSize: 12.5, lineHeight: 1.6, color: "var(--foreground-muted)", margin: "0 0 14px", textWrap: "pretty" };
  const glyphTile: React.CSSProperties = { width: 38, height: 38, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brass)", background: "var(--pf-soft)", border: "0.5px solid var(--pf-hair)", fontFamily: GLYPH_STACK };
  const readCard: React.CSSProperties = { borderRadius: 16, padding: "15px 14px", background: "var(--pf-card)", border: "0.5px solid var(--pf-card-bd)", display: "flex", flexDirection: "column", gap: 9 };

  return (
    <main className="pf-page flex-1 flex flex-col max-w-lg mx-auto w-full" style={{ padding: "0 22px 40px" }}>

      {/* Utility row — photo (left) · settings (right). Account controls live on /account. */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative w-[46px] h-[46px] rounded-full overflow-hidden active:scale-[0.97] transition-transform"
          style={{ border: "1px solid var(--pf-hair)", background: "var(--pf-soft)" }}
          aria-label={photo ? "Change profile photo" : "Add profile photo"}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Your profile" className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-[16px]" style={{ fontFamily: "var(--font-heading)", color: "var(--brass)" }}>
              {initials}
            </span>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} className="hidden" />
        <Link
          href="/account"
          aria-label="Settings"
          className="w-[46px] h-[46px] rounded-full flex items-center justify-center"
          style={{ border: "1px solid var(--pf-hair)" }}
        >
          <span className="flex flex-col gap-1">
            <span className="block w-[18px] rounded-[2px]" style={{ height: 1.6, background: "var(--foreground)" }} />
            <span className="block w-[18px] rounded-[2px]" style={{ height: 1.6, background: "var(--foreground)" }} />
            <span className="block w-[18px] rounded-[2px]" style={{ height: 1.6, background: "var(--foreground)" }} />
          </span>
        </Link>
      </div>

      {!row && (
        <div className="rounded-2xl px-4 py-5 text-center mt-6" style={{ background: "var(--pf-card)", border: "0.5px solid var(--pf-card-bd)" }}>
          <p className="text-[13px]" style={{ color: "var(--foreground-secondary)" }}>
            Add your birth details to unlock your archetype and everything you are.
          </p>
        </div>
      )}

      {/* ===== A. ARCHETYPE HERO ===== */}
      {resonance && (
        <div className="relative text-center" style={{ padding: "14px 0 0" }}>
          <div
            aria-hidden
            className="absolute rounded-full pointer-events-none"
            style={{ top: -4, left: "50%", width: 360, height: 340, transform: "translateX(-50%)", background: "radial-gradient(circle, var(--pf-glow) 0%, transparent 66%)", animation: "pf-breathe 9s ease-in-out infinite" }}
          />
          <div className="relative z-[2]">
            <p className="m-0 text-[9.5px] font-bold uppercase" style={{ letterSpacing: "0.26em", color: "var(--brass)" }}>
              {firstName ? `${firstName}’s archetype` : "Your archetype"}
            </p>

            {/* Sigil */}
            <div className="relative mx-auto" style={{ width: 190, height: 190, margin: "18px auto 0" }}>
              <svg viewBox="0 0 190 190" className="block w-full h-full">
                <defs>
                  <radialGradient id="pfCore" cx="50%" cy="42%" r="60%">
                    <stop offset="0%" stopColor="#f6ecd3" />
                    <stop offset="55%" stopColor="#d9bd85" />
                    <stop offset="100%" stopColor="#9d7c42" />
                  </radialGradient>
                </defs>
                <g style={{ animation: "pf-drift 22s ease-in-out infinite", transformOrigin: "95px 95px" }}>
                  <circle cx="95" cy="95" r="86" fill="none" stroke="var(--pf-hair)" strokeWidth="1" />
                  <circle cx="95" cy="95" r="68" fill="none" stroke="var(--pf-hair)" strokeWidth="0.8" strokeDasharray="2 8" strokeLinecap="round" />
                </g>
                <line x1="95" y1="26" x2="95" y2="95" stroke="var(--pf-hair)" strokeWidth="0.8" />
                <line x1="35" y1="130" x2="95" y2="95" stroke="var(--pf-hair)" strokeWidth="0.8" />
                <line x1="155" y1="130" x2="95" y2="95" stroke="var(--pf-hair)" strokeWidth="0.8" />
                <circle cx="95" cy="26" r="4.5" fill="var(--brass)" />
                <circle cx="35" cy="130" r="4.5" fill="var(--brass)" />
                <circle cx="155" cy="130" r="4.5" fill="var(--brass)" />
                <circle cx="95" cy="95" r="40" fill="url(#pfCore)" opacity="0.16" />
                <circle cx="95" cy="95" r="40" fill="none" stroke="var(--brass)" strokeWidth="1.2" strokeOpacity="0.55" />
                <text x="95" y="99" textAnchor="middle" dominantBaseline="middle" fontFamily="Bodoni Moda, serif" fontSize="34" fill="var(--foreground)">☾</text>
              </svg>
            </div>

            <h1 className="m-0" style={{ fontFamily: "var(--font-heading)", fontSize: 42, fontWeight: 500, lineHeight: 1.05, letterSpacing: "0.01em", color: "var(--foreground)", marginTop: 14 }}>
              {resonance.primary.name}
            </h1>
            <p className="m-0" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontStyle: "italic", fontSize: 17, color: "var(--foreground-secondary)", marginTop: 10 }}>
              {resonance.primary.tagline}
            </p>
            {content?.essence && (
              <p className="mx-auto" style={{ fontSize: 14, lineHeight: 1.75, color: "var(--foreground-secondary)", margin: "16px auto 0", maxWidth: 330, textWrap: "pretty" }}>
                {content.essence}
              </p>
            )}

            <div className="flex justify-center flex-wrap gap-1.5" style={{ marginTop: 16 }}>
              {[
                row?.bigThree?.sun ? `${row.bigThree.sun} Sun` : null,
                numerology ? `Life Path ${numerology.lifePath.value}` : null,
                hd?.type || null,
              ].filter((c): c is string => !!c).map((chip) => (
                <span key={chip} className="uppercase font-bold" style={{ fontSize: 9.5, letterSpacing: "0.14em", color: "var(--brass)", padding: "5px 12px", borderRadius: 99, border: "0.5px solid var(--pf-hair)", background: "var(--pf-soft)" }}>
                  {chip}
                </span>
              ))}
            </div>
            {row && (
              <p className="m-0" style={{ fontSize: 11, letterSpacing: "0.02em", color: "var(--foreground-faint)", marginTop: 14 }}>
                {formatBirthLine(row.birthDate, row.birthTime, row.unknownTime, row.cityName)}
              </p>
            )}
          </div>
        </div>
      )}

      {resonance && (
        <div className="flex flex-col" style={{ gap: 32, paddingTop: 34 }}>

          {/* ===== B. HOW WE GOT HERE ===== */}
          {sources.length > 0 && (
            <div>
              <p style={kickerStyle}>How we got here</p>
              <p style={subLineStyle}>
                {sources.length === 1 ? "One system for now — add birth details to widen the read." : `${["", "", "Two", "Three", "Four"][sources.length]} systems, read together. Where they agree becomes your archetype; where they argue becomes your tension.`}
              </p>
              <div className="flex flex-col" style={{ gap: 9 }}>
                {sources.map((s, i) => (
                  <Link key={s.system} href={s.href} className="flex items-start" style={{ gap: 13, borderRadius: 16, padding: "15px 16px", background: "var(--pf-card)", border: "0.5px solid var(--pf-card-bd)" }}>
                    <span className="shrink-0" style={{ ...glyphTile, width: 40, height: 40, fontSize: s.glyphSize }}>{s.glyph}</span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-baseline justify-between" style={{ gap: 10 }}>
                        <span className="uppercase font-bold" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--brass)" }}>{s.system}</span>
                        <span className="shrink-0" style={{ fontSize: 11, color: "var(--foreground-faint)" }}>weighted {weights[i]}%</span>
                      </span>
                      <span className="block" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontWeight: 500, fontSize: 16.5, color: "var(--foreground)", marginTop: 3 }}>{s.value}</span>
                      <span className="block" style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--foreground-secondary)", marginTop: 5, textWrap: "pretty" }}>{s.contribution}</span>
                    </span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-faint)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ marginTop: 4 }}><path d="M9 5l7 7-7 7" /></svg>
                  </Link>
                ))}
              </div>
              {numerology && (
                <p style={{ fontSize: 11, lineHeight: 1.6, color: "var(--foreground-faint)", margin: "10px 2px 0" }}>
                  Name numbers read from <span style={{ color: "var(--foreground-secondary)" }}>{fullName.trim()}</span>.{" "}
                  <Link href="/numerology" className="underline" style={{ color: "var(--brass)" }}>Not your full birth name? Change it</Link>
                </p>
              )}
              {row?.unknownTime && (
                <p style={{ fontSize: 11, lineHeight: 1.6, color: "var(--foreground-faint)", margin: "6px 2px 0" }}>
                  Your Human Design, Rising sign, and secret animal need an exact birth time — add one to complete the picture.
                </p>
              )}
            </div>
          )}

          {/* ===== C. TWO MORE READS ===== */}
          {(zodiac || character || animal || deity) && (
            <div>
              <p style={kickerStyle}>{zodiac && character ? "More reads" : "Two more reads"}</p>
              <p style={subLineStyle}>Your birth year and hour add an animal. All the systems together add a character, a guide, and a deity.</p>
              <div className="grid grid-cols-2 items-stretch" style={{ gap: 9 }}>

                {zodiac && (
                  <div style={readCard}>
                    <span className="uppercase font-bold" style={{ fontSize: 8.5, letterSpacing: "0.16em", color: "var(--brass)" }}>Chinese zodiac</span>
                    <span style={{ ...glyphTile, fontSize: 19 }}>犬</span>
                    <span style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontWeight: 500, fontSize: 18, color: "var(--foreground)", lineHeight: 1.1 }}>{zodiac.title}</span>
                    <span style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--foreground-secondary)", textWrap: "pretty" }}>{zodiac.line}</span>
                    <span className="flex flex-col" style={{ gap: 5, marginTop: "auto", paddingTop: 11, borderTop: "0.5px solid var(--pf-line)" }}>
                      {[
                        { label: "Element", value: zodiac.element },
                        { label: "Inner animal", value: zodiac.monthAnimal },
                        { label: "Secret animal", value: zodiac.hourAnimal ?? "Needs birth time" },
                      ].map((z) => (
                        <span key={z.label} className="flex items-baseline justify-between" style={{ gap: 8 }}>
                          <span className="uppercase" style={{ fontSize: 9, letterSpacing: "0.1em", color: "var(--foreground-faint)" }}>{z.label}</span>
                          <span style={{ fontSize: 11.5, color: "var(--foreground-secondary)", textAlign: "right" }}>{z.value}</span>
                        </span>
                      ))}
                    </span>
                  </div>
                )}

                {character && (
                  <div style={readCard}>
                    <span className="uppercase font-bold" style={{ fontSize: 8.5, letterSpacing: "0.16em", color: "var(--brass)" }}>Character</span>
                    <span style={{ ...glyphTile, fontSize: 17 }}>⚔</span>
                    <span style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontWeight: 500, fontSize: 18, color: "var(--foreground)", lineHeight: 1.1 }}>{character.guide.name}</span>
                    <span style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--foreground-secondary)", textWrap: "pretty" }}>{character.guide.tagline}</span>
                    <span className="flex flex-col" style={{ gap: 7, marginTop: "auto", paddingTop: 11, borderTop: "0.5px solid var(--pf-line)" }}>
                      {charStats.map((s) => (
                        <span key={s.label} className="flex flex-col" style={{ gap: 4 }}>
                          <span className="flex items-baseline justify-between" style={{ gap: 8 }}>
                            <span className="uppercase" style={{ fontSize: 9, letterSpacing: "0.1em", color: "var(--foreground-faint)" }}>{s.label}</span>
                            <span className="font-bold" style={{ fontSize: 10.5, color: "var(--foreground-secondary)" }}>{s.n}</span>
                          </span>
                          <span className="block overflow-hidden" style={{ height: 3, borderRadius: 99, background: "var(--pf-line)" }}>
                            <span className="block" style={{ height: 3, borderRadius: 99, width: `${s.n * 10}%`, background: "var(--brass)" }} />
                          </span>
                        </span>
                      ))}
                    </span>
                  </div>
                )}

                {animal && (
                  <div style={readCard}>
                    <span className="uppercase font-bold" style={{ fontSize: 8.5, letterSpacing: "0.16em", color: "var(--brass)" }}>Animal guide</span>
                    <span style={{ ...glyphTile, fontSize: 18 }}>♞</span>
                    <span style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontWeight: 500, fontSize: 18, color: "var(--foreground)", lineHeight: 1.1 }}>{animal.guide.name}</span>
                    <span style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--foreground-secondary)", textWrap: "pretty" }}>{animal.guide.tagline}</span>
                    <span className="flex flex-col" style={{ gap: 5, marginTop: "auto", paddingTop: 11, borderTop: "0.5px solid var(--pf-line)" }}>
                      {[
                        { label: "Tier", value: TIER_LABEL[animal.guide.tier] },
                        ...(animal.alt ? [{ label: "Also close", value: animal.alt.name }] : []),
                      ].map((z) => (
                        <span key={z.label} className="flex items-baseline justify-between" style={{ gap: 8 }}>
                          <span className="uppercase" style={{ fontSize: 9, letterSpacing: "0.1em", color: "var(--foreground-faint)" }}>{z.label}</span>
                          <span style={{ fontSize: 11.5, color: "var(--foreground-secondary)", textAlign: "right" }}>{z.value}</span>
                        </span>
                      ))}
                    </span>
                  </div>
                )}

                {deity && (
                  <div style={readCard}>
                    <span className="uppercase font-bold" style={{ fontSize: 8.5, letterSpacing: "0.16em", color: "var(--brass)" }}>Deity</span>
                    <span style={{ ...glyphTile, fontSize: 18 }}>☤</span>
                    <span style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontWeight: 500, fontSize: 18, color: "var(--foreground)", lineHeight: 1.1 }}>{deity.guide.name}</span>
                    <span style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--foreground-secondary)", textWrap: "pretty" }}>{deity.guide.tagline}</span>
                    <span className="flex flex-col" style={{ gap: 5, marginTop: "auto", paddingTop: 11, borderTop: "0.5px solid var(--pf-line)" }}>
                      {[
                        { label: "Pantheon", value: deity.guide.pantheon },
                        { label: "Tier", value: DEITY_TIER_LABEL[deity.guide.tier].split(" — ")[0] },
                      ].map((z) => (
                        <span key={z.label} className="flex items-baseline justify-between" style={{ gap: 8 }}>
                          <span className="uppercase" style={{ fontSize: 9, letterSpacing: "0.1em", color: "var(--foreground-faint)" }}>{z.label}</span>
                          <span style={{ fontSize: 11.5, color: "var(--foreground-secondary)", textAlign: "right" }}>{z.value}</span>
                        </span>
                      ))}
                    </span>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ===== D. YOU, IN FOUR PARTS ===== */}
          {facets.length > 0 && (
            <div>
              <p style={{ ...kickerStyle, margin: "0 0 14px" }}>You, in four parts</p>
              <div className="flex flex-col" style={{ gap: 9 }}>
                {facets.map((f) => {
                  const open = openFacet === f.id;
                  return (
                    <div key={f.id} className="overflow-hidden" style={{ borderRadius: 16, background: "var(--pf-card)", border: "0.5px solid var(--pf-card-bd)" }}>
                      <button
                        onClick={() => setOpenFacet((cur) => (cur === f.id ? null : f.id))}
                        aria-expanded={open}
                        className="flex items-center w-full text-left"
                        style={{ gap: 12, padding: "15px 16px", background: "none", border: "none", cursor: "pointer" }}
                      >
                        <span className="flex-1 min-w-0">
                          <span className="block uppercase font-bold" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--brass)" }}>{f.kicker}</span>
                          <span className="block" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontWeight: 500, fontSize: 17.5, color: "var(--foreground)", marginTop: 3 }}>{f.title}</span>
                        </span>
                        <span className="shrink-0" style={{ fontSize: 15, color: "var(--brass)", transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .2s" }}>›</span>
                      </button>
                      {open && (
                        <div style={{ padding: "0 16px 16px" }}>
                          <div style={{ height: 1, background: "var(--pf-line)", margin: "0 0 13px" }} />
                          <p className="m-0" style={{ fontSize: 13.5, lineHeight: 1.75, color: "var(--foreground-secondary)", textWrap: "pretty" }}>{f.body}</p>
                          <p className="m-0" style={{ fontSize: 11, letterSpacing: "0.04em", color: "var(--foreground-faint)", marginTop: 12 }}>{f.from}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== E. TENSION ===== */}
          {resonance.secondary && (
            <div style={{ borderRadius: 20, padding: 20, background: "var(--pf-plum)", border: "0.5px solid var(--pf-card-bd)" }}>
              <p className="m-0 uppercase font-bold" style={{ fontSize: 9, letterSpacing: "0.22em", color: "#c9a961" }}>Where your systems disagree</p>
              <p className="m-0" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontWeight: 500, fontSize: 22, color: "var(--pf-plum-fg)", marginTop: 8 }}>
                {resonance.secondary.tagline}
              </p>
              {(resonance.secondary.shading || resonance.secondary.content?.essence) && (
                <p className="m-0" style={{ fontSize: 13, lineHeight: 1.7, color: "var(--pf-plum-soft)", marginTop: 11, textWrap: "pretty" }}>
                  {resonance.secondary.shading || resonance.secondary.content?.essence}
                </p>
              )}
              <div className="flex items-center" style={{ gap: 10, marginTop: 16 }}>
                <span className="flex-1" style={{ height: 5, borderRadius: 99, background: "linear-gradient(90deg, #c9a961, rgba(201,169,97,0.15))" }} />
                <span className="uppercase" style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(240,230,210,0.55)" }}>{resonance.secondary.name}</span>
              </div>
            </div>
          )}

          {/* ===== F. RARE IN YOUR MAKE-UP ===== */}
          {shownRarities.length > 0 && (
            <div>
              <p style={kickerStyle}>Rare in your make-up</p>
              <p style={subLineStyle}>The markers the algorithm weighted most heavily — few charts carry them.</p>
              <div className="flex flex-col" style={{ gap: 9 }}>
                {shownRarities.map((r) => (
                  <div key={`${r.kicker}${r.mark}`} className="flex items-start" style={{ gap: 12, borderRadius: 15, padding: "14px 16px", background: "var(--pf-card)", border: "0.5px solid rgba(212,161,58,0.28)", borderLeft: "2.5px solid var(--pf-amber)" }}>
                    <span className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 34, height: 34, fontFamily: "'Bodoni Moda', Georgia, serif", fontSize: 15, color: "var(--pf-amber)", background: "rgba(212,161,58,0.12)", border: "1px solid rgba(212,161,58,0.35)" }}>{r.mark}</span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center flex-wrap" style={{ gap: 7 }}>
                        <span className="uppercase font-bold" style={{ fontSize: 8.5, letterSpacing: "0.16em", color: "var(--pf-amber)" }}>{r.kicker}</span>
                        <span style={{ fontSize: 8.5, letterSpacing: "0.06em", color: "var(--foreground-faint)" }}>{r.rarity}</span>
                      </span>
                      <span className="block" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontWeight: 500, fontSize: 16, color: "var(--foreground)", marginTop: 2 }}>{r.title}</span>
                      <span className="block" style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--foreground-secondary)", marginTop: 5, textWrap: "pretty" }}>{r.body}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== G. WHERE YOU ARE RIGHT NOW ===== */}
          {py && (
            <div>
              <p style={{ ...kickerStyle, margin: "0 0 14px" }}>Where you are right now</p>
              <div style={{ borderRadius: 18, background: "var(--pf-card)", border: "0.5px solid var(--pf-card-bd)", padding: "18px 18px 16px" }}>
                <div className="flex items-center" style={{ gap: 13 }}>
                  <span className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 46, height: 46, fontFamily: "'Bodoni Moda', Georgia, serif", fontSize: 24, color: "var(--pf-amber)", background: "var(--pf-soft)", border: "1px solid var(--pf-hair)" }}>{py}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block uppercase font-bold" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--brass)" }}>Personal Year · {now.getFullYear()}</span>
                    <span className="block" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontWeight: 500, fontSize: 19.5, color: "var(--foreground)", marginTop: 2 }}>{PY_TITLE[py]}</span>
                  </span>
                </div>
                <p className="m-0" style={{ fontSize: 12.5, lineHeight: 1.65, color: "var(--foreground-secondary)", marginTop: 12, textWrap: "pretty" }}>
                  {PY_BODY[py].replace("{arch}", archShort || "soul like yours")}
                </p>
                <div className="flex" style={{ gap: 4, marginTop: 16 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <span key={n} className="flex-1 flex flex-col items-center" style={{ gap: 6 }}>
                      <span className="w-full" style={{ height: 4, borderRadius: 99, background: n === py ? "var(--pf-amber)" : n < py ? "var(--brass)" : "var(--pf-line)" }} />
                      <span style={{ fontSize: 9.5, fontWeight: n === py ? 700 : 400, color: n === py ? "var(--pf-amber)" : "var(--foreground-faint)" }}>{n}</span>
                    </span>
                  ))}
                </div>
                {microCycles.length > 0 && (
                  <div className="flex" style={{ gap: 8, marginTop: 16, paddingTop: 14, borderTop: "0.5px solid var(--pf-line)" }}>
                    {microCycles.map((m) => (
                      <span key={m.label} className="flex-1 flex flex-col" style={{ gap: 3, padding: "11px 12px", borderRadius: 12, background: "var(--pf-soft)" }}>
                        <span className="uppercase" style={{ fontSize: 8.5, letterSpacing: "0.12em", color: "var(--foreground-faint)" }}>{m.label}</span>
                        <span style={{ fontSize: 12.5, color: "var(--foreground-secondary)" }}>{m.note}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== H. WORDS THAT KEEP COMING UP ===== */}
          {traitPills.length > 0 && (
            <div>
              <p style={{ ...kickerStyle, margin: "0 0 12px" }}>Words that keep coming up</p>
              <div className="flex flex-wrap" style={{ gap: 8 }}>
                {traitPills.map((t) => (
                  <span key={t} className="capitalize" style={{ padding: "9px 15px", borderRadius: 99, background: "var(--pf-card)", border: "0.5px solid var(--pf-card-bd)", fontSize: 12.5, color: "var(--foreground-secondary)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-center m-0" style={{ fontSize: 11, lineHeight: 1.6, color: "var(--foreground-faint)", textWrap: "pretty" }}>
            Your archetype re-runs whenever your birth details or name change.
          </p>

        </div>
      )}
    </main>
  );
}
