"use client";

/**
 * Profile — the user's archetype, read as a reading rather than an account
 * screen (per the "Profile — Archetype Overview" design handoff).
 *
 * Order: hero (sigil + archetype plate, name, tagline, essence, chips, birth
 * line) → how we got here (per-system rows with their REAL weights) → the
 * six-facet radar → three more reads (animal / deity / character) → you, in
 * four parts (accordion) → the tension panel → rare markers → where you are
 * right now (personal-year cycle) → words that keep coming up → everything
 * you are.
 *
 * All of it derives from the deterministic resonance engine, so nothing here
 * regenerates or costs credits.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchSetting, saveSetting } from "@/lib/syncedSettings";
import { computeNumerology } from "@/lib/numerology";
import { computeHumanDesign } from "@/lib/humanDesign/engine";
import { computeArchetype } from "@/lib/archetype/engine";
import { ELEMENT_LABEL } from "@/lib/archetype/types";
import { computeResonance, systemShares, type Placement } from "@/lib/resonance/engine";
import { persistAllAssignments } from "@/lib/resonance/persist";
import { TRAIT_ORDER, TRAIT_PHRASE } from "@/lib/resonance/traits";
import ResonanceRadar from "@/components/profile/ResonanceRadar";
import { computeAnimalGuide, TIER_LABEL } from "@/lib/resonance/animals";
import { computeDeity, DEITY_TIER_LABEL } from "@/lib/resonance/deities";
import { computeCharacter } from "@/lib/resonance/characters";
import { computeChineseZodiac, ANIMAL_TRAIT, ELEMENT_TRAIT } from "@/lib/chineseZodiac";
import { masterLabel } from "@/lib/numerologyMeanings";

const PHOTO_KEY = "mapped:profile-photo";
const NAME_KEY = "mapped:numerology-fullname";

interface ChartRow {
  name: string;
  birthDate: string;
  birthTime: string;
  unknownTime: boolean;
  latitude: number | null;
  longitude: number | null;
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

function formatBirth(dateStr: string, timeStr: string, unknownTime: boolean): string {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!dm) return dateStr;
  const [, y, mo, d] = dm;
  const datePart = `${Number(mo)}/${Number(d)}/${y}`;
  if (unknownTime || !/^\d{1,2}:\d{2}$/.test(timeStr)) return datePart;
  const [h, min] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${datePart} · ${h12}:${String(min).padStart(2, "0")} ${ampm}`;
}

export default function ProfilePageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [row, setRow] = useState<ChartRow | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [fullName, setFullName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  /** Single-open accordion for "You, in four parts". */
  const [openFacet, setOpenFacet] = useState<string | null>("shadow");
  /** Which "more reads" card is expanded into its detail sheet. */
  const [openRead, setOpenRead] = useState<ReadDetail | null>(null);

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
          .select("name, birth_date, birth_time, latitude, longitude, unknown_time, big_three, planets, special_points")
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

  const result = useMemo(() => {
    if (!row) return null;
    return computeArchetype({
      sunSign: row.bigThree?.sun,
      moonSign: row.bigThree?.moon,
      risingSign: row.bigThree?.rising,
      lifePath: numerology?.lifePath.value ?? null,
      hdType: hd?.type ?? null,
    });
  }, [row, numerology, hd]);

  // The exact input the engine matches on — shared so the "weighted N%" labels
  // are computed from the same features that produced the archetype.
  const resonanceInput = useMemo(() => {
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
    return {
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
    };
  }, [row, numerology, hd]);

  // Resonance engine — the 96-archetype / 6-facet result. Deterministic and
  // computed from the fixed chart, so it never regenerates or costs credits.
  const resonance = useMemo(
    () => (resonanceInput ? computeResonance(resonanceInput) : null),
    [resonanceInput],
  );

  /** Real per-system contribution shares (sum 100) — not decorative numbers. */
  const shares = useMemo(
    () => (resonanceInput ? systemShares(resonanceInput) : []),
    [resonanceInput],
  );

  // Secondary libraries — same engine, deterministic, free (no regeneration).
  const animal = useMemo(() => (resonance ? computeAnimalGuide(resonance.traits) : null), [resonance]);
  const deity = useMemo(() => (resonance ? computeDeity(resonance.traits) : null), [resonance]);
  const character = useMemo(() => (resonance ? computeCharacter(resonance.traits) : null), [resonance]);

  // Chinese zodiac — real lunisolar calculation (year from Chinese New Year,
  // month from the solar terms, hour from the double-hours).
  const zodiac = useMemo(
    () => (row ? computeChineseZodiac(row.birthDate, row.unknownTime ? null : row.birthTime) : null),
    [row],
  );

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

  const element = result?.element ?? null;
  const heroName = (displayName || "You").split(/\s+/)[0];
  const chips = [
    row?.bigThree?.sun ? `${SIGN_FULL[row.bigThree.sun] ?? row.bigThree.sun} Sun` : null,
    numerology ? `Life Path ${masterLabel(numerology.lifePath.value)}` : null,
    hd?.type ?? null,
  ].filter(Boolean) as string[];

  // "How we got here" — one row per source system, with its real weight.
  const sources = [
    row?.bigThree && {
      key: "astrology",
      label: "Astrology",
      glyph: "☉",
      href: "/you",
      value: [
        row.bigThree.sun && `${SIGN_FULL[row.bigThree.sun] ?? row.bigThree.sun} Sun`,
        row.bigThree.moon && `${SIGN_FULL[row.bigThree.moon] ?? row.bigThree.moon} Moon`,
        !row.unknownTime && row.bigThree.rising && `${SIGN_FULL[row.bigThree.rising] ?? row.bigThree.rising} Rising`,
      ].filter(Boolean).join(" · "),
      contribution: "Where your energy naturally points, and the face it wears.",
    },
    numerology && {
      key: "numerology",
      label: "Numerology",
      glyph: String(numerology.lifePath.value),
      href: "/numerology",
      value: `Life Path ${masterLabel(numerology.lifePath.value)} · Expression ${masterLabel(numerology.expression.value)} · Personality ${masterLabel(numerology.personality.value)}`,
      contribution: "The pattern your name and birth date keep repeating.",
    },
    hd && {
      key: "humanDesign",
      label: "Human Design",
      glyph: "⚡",
      href: "/human-design",
      value: `${hd.type} ${hd.profile} · ${hd.authorityName?.split(" — ")[0] ?? ""}`.trim(),
      contribution: "How you're built to decide, and what to wait for.",
    },
    zodiac && {
      key: "chineseZodiac",
      label: "Chinese zodiac",
      glyph: "\u516D",
      href: "/library",
      value: `${zodiac.yearName} \u00B7 ${zodiac.innerAnimal} month \u00B7 ${zodiac.secretAnimal} hour`,
      contribution: "Your year, month, and hour animals \u2014 the outer, inner, and secret self.",
    },
  ].filter(Boolean) as { key: string; label: string; glyph: string; href: string; value: string; contribution: string }[];

  // "You, in four parts" — the reading, minus the essence (which is the hero body).
  const facets = resonance?.primary.content
    ? [
        { id: "shadow", kicker: "Where you snag", title: "Your shadow", body: resonance.primary.content.shadowSide },
        { id: "growth", kicker: "What you're growing", title: "Growth edge", body: resonance.primary.content.growthEdge },
        { id: "love", kicker: "In relationship", title: "In love", body: resonance.primary.content.inRelationship },
        { id: "work", kicker: "How you work", title: "At work", body: resonance.primary.content.atWork },
      ]
    : [];
  const attribution = resonance?.evidence.slice(0, 3).map((e) => e.feature).join(" × ") ?? "";

  // "Rare in your make-up" — only markers actually present, with real frequency
  // where it's computable (Life Path is pure date maths; name-derived positions
  // depend on the name, so those carry no invented percentage).
  const rarities: { mark: string; kicker: string; rarity: string | null; title: string; body: string }[] = [];
  if (numerology) {
    const lp = numerology.lifePath.value;
    if (LIFE_PATH_FREQ[lp]) {
      rarities.push({
        mark: String(lp),
        kicker: [11, 22, 33].includes(lp) ? "Master number" : "Uncommon Life Path",
        rarity: `in ${LIFE_PATH_FREQ[lp]}% of birth dates`,
        title: `${masterLabel(lp)} as your Life Path`,
        body: [11, 22, 33].includes(lp)
          ? "A master number stays unreduced — it asks more of you than the single digit would."
          : "One of the less common paths, which tends to make its themes louder.",
      });
    }
    for (const kd of numerology.karmicDebts ?? []) {
      rarities.push({
        mark: String(kd.debt),
        kicker: "Karmic debt",
        rarity: null,
        title: `${kd.debt} inside your ${kd.position}`,
        body: "A number that arrives with homework attached — the same lesson until it's learned.",
      });
    }
  }
  if (hd?.profile) {
    rarities.push({
      mark: hd.profile,
      kicker: "Profile",
      rarity: null,
      title: hd.profileName ?? hd.profile,
      body: "The role you keep being cast in, whether or not you auditioned for it.",
    });
  }

  const cycleYear = new Date().getFullYear();

  return (
    <main className="flex-1 flex flex-col max-w-lg mx-auto w-full pb-10">
      {/* ═══ A. Archetype hero ═══ */}
      {resonance ? (
        <section className="px-[22px] pt-[30px] text-center relative">
          {/* breathing glow behind the sigil */}
          <div aria-hidden className="pf-breathe pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2"
            style={{ width: 360, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,169,97,0.16) 0%, transparent 66%)" }} />

          <p className="text-[9.5px] font-bold uppercase" style={{ letterSpacing: "0.26em", color: "var(--brass)" }}>
            {heroName}&rsquo;s archetype
          </p>

          {/* Sigil — rings drift slowly around the archetype plate */}
          <div className="relative mx-auto mt-[18px]" style={{ width: 190, height: 190 }}>
            <svg width="190" height="190" viewBox="0 0 190 190" className="absolute inset-0" aria-hidden>
              <g className="pf-drift" style={{ transformOrigin: "95px 95px" }}>
                <circle cx="95" cy="95" r="86" fill="none" stroke="var(--brass)" strokeOpacity="0.28" strokeWidth="1" />
                <circle cx="95" cy="95" r="68" fill="none" stroke="var(--brass)" strokeOpacity="0.3" strokeWidth="0.8"
                  strokeDasharray="2 8" strokeLinecap="round" />
                {[[95, 26], [35, 130], [155, 130]].map(([x, y]) => (
                  <g key={`${x}-${y}`}>
                    <line x1="95" y1="95" x2={x} y2={y} stroke="var(--brass)" strokeOpacity="0.22" strokeWidth="0.8" />
                    <circle cx={x} cy={y} r="4.5" fill="var(--brass)" fillOpacity="0.75" />
                  </g>
                ))}
              </g>
            </svg>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/archetypes/${resonance.primary.id}.webp`}
              alt={resonance.primary.name}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: 124, height: 124, objectFit: "contain" }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          </div>

          <h1 className="mt-[14px]" style={{ fontFamily: "var(--font-heading)", fontSize: 42, fontWeight: 500, lineHeight: 1.05, letterSpacing: "0.01em", color: "var(--foreground)" }}>
            {resonance.primary.name}
          </h1>
          <p className="mt-[10px] italic" style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "var(--foreground-secondary)" }}>
            {resonance.primary.tagline}
          </p>
          {resonance.primary.content && (
            <p className="mx-auto mt-4 text-[14px]" style={{ lineHeight: 1.75, color: "var(--foreground-secondary)", maxWidth: 330 }}>
              {resonance.primary.content.essence}
            </p>
          )}

          {chips.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-4">
              {chips.map((c) => (
                <span key={c} className="text-[9.5px] font-bold uppercase"
                  style={{ letterSpacing: "0.14em", color: "var(--brass)", padding: "5px 12px", borderRadius: 99, border: "0.5px solid var(--border-card)", background: "rgba(255,255,255,0.04)" }}>
                  {c}
                </span>
              ))}
            </div>
          )}
          {row && (
            <p className="text-[11px] mt-[14px]" style={{ color: "var(--foreground-faint)" }}>
              {formatBirth(row.birthDate, row.birthTime, row.unknownTime)}
            </p>
          )}
        </section>
      ) : (
        <section className="px-[22px] pt-[30px] text-center">
          <button onClick={() => fileRef.current?.click()} className="relative w-24 h-24 rounded-full overflow-hidden mx-auto block"
            style={{ border: "2px solid var(--brass)", backgroundColor: "var(--background-card)" }} aria-label="Change profile photo">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Your profile" className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-[28px]" style={{ fontFamily: "var(--font-display)", color: "var(--brass)" }}>{initials}</span>
            )}
          </button>
          <h1 className="text-[24px] tracking-[0.06em] mt-4" style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--foreground)" }}>
            {displayName || "Your Profile"}
          </h1>
          <p className="text-[13px] mt-3 mx-auto" style={{ color: "var(--foreground-secondary)", maxWidth: 300 }}>
            Add your birth details to unlock your archetype and everything you are.
          </p>
          {/*
            The sentence above is the only thing on this screen without a chart,
            and on its own it reads as a dead end — the one tappable element was
            the photo picker. Every sibling page (You, Human Design, Numerology)
            sends people to /chart/new from its empty state; match that.
          */}
          <Link
            href="/chart/new"
            className="inline-flex items-center justify-center mt-6 active:scale-[0.98] transition-transform"
            style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.01em", padding: "13px 26px", borderRadius: 999, background: "var(--brass)", color: "var(--btn-ink)" }}
          >
            Add your birth details
          </Link>
        </section>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} className="hidden" />

      {resonance && (
        <div className="flex flex-col gap-8 px-[22px] pt-[34px] pb-10">

          {/* ═══ B. How we got here ═══ */}
          <section>
            <Kicker>How we got here</Kicker>
            <SubLine>
              Four systems, read together. Where they agree becomes your archetype;
              where they argue becomes your tension.
            </SubLine>
            <div className="flex flex-col gap-[9px]">
              {sources.map((s) => {
                const pct = shares.find((x) => x.system === s.key)?.pct;
                return (
                  <Link key={s.key} href={s.href} className="flex items-start gap-[13px] active:scale-[0.995] transition-transform"
                    style={{ borderRadius: 16, padding: "15px 16px", background: "var(--background-card)", border: "0.5px solid var(--border-card)" }}>
                    <span className="flex items-center justify-center flex-shrink-0"
                      style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "0.5px solid var(--border-card)", color: "var(--brass)", fontSize: 19 }}>
                      {s.glyph}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[9px] font-bold uppercase" style={{ letterSpacing: "0.18em", color: "var(--brass)" }}>{s.label}</span>
                        {pct != null && <span className="text-[11px]" style={{ color: "var(--foreground-faint)" }}>weighted {pct}%</span>}
                      </div>
                      <p className="mt-[3px]" style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 16.5, color: "var(--foreground)" }}>{s.value}</p>
                      <p className="text-[12.5px] mt-[5px]" style={{ lineHeight: 1.6, color: "var(--foreground-secondary)" }}>{s.contribution}</p>
                    </div>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-1" aria-hidden>
                      <path d="M9 6l6 6-6 6" stroke="var(--foreground-faint)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ═══ Your shape — the six-facet radar ═══ */}
          <section>
            <Kicker>Your shape</Kicker>
            <SubLine>Six facets, scored against everyone else&rsquo;s.</SubLine>
            <div className="flex justify-center" style={{ borderRadius: 18, padding: "10px 0 4px", background: "var(--background-card)", border: "0.5px solid var(--border-card)" }}>
              <ResonanceRadar facets={resonance.facets} size={244} />
            </div>
          </section>

          {/* ═══ C. Three more reads ═══ */}
          <section>
            <Kicker>Four more reads</Kicker>
            <SubLine>The same pattern, matched against four other systems. Tap any card to read it in full.</SubLine>
            <div className="grid grid-cols-2 gap-[9px] items-stretch">
              {animal && (
                <ReadCard kicker="Animal guide" glyph="\u2766" title={animal.guide.name} body={animal.guide.tagline}
                  onOpen={() => setOpenRead({
                    kind: "Animal guide", title: animal.guide.name, tagline: animal.guide.tagline,
                    body: animal.guide.essence, shadow: animal.guide.shadow,
                    meta: [
                      { label: "Source", value: TIER_LABEL[animal.guide.tier] },
                      { label: "Tradition", value: animal.guide.tradition },
                      ...(animal.alt ? [{ label: "Also close", value: animal.alt.name }] : []),
                    ],
                    sources: animal.guide.sources,
                    note: animal.guide.status === "living-open"
                      ? "Shown as a comparison, not a claim, out of respect for a living tradition."
                      : null,
                  })}>
                  <FooterRow label="Source" value={TIER_LABEL[animal.guide.tier]} />
                </ReadCard>
              )}
              {deity && (
                <ReadCard kicker="Deity" glyph="\u2736" title={deity.guide.name} body={deity.guide.tagline}
                  onOpen={() => setOpenRead({
                    kind: "Deity", title: deity.guide.name, tagline: deity.guide.tagline,
                    body: deity.guide.essence, shadow: deity.guide.shadow,
                    meta: [
                      { label: "Pantheon", value: deity.guide.pantheon },
                      { label: "Source", value: DEITY_TIER_LABEL[deity.guide.tier] },
                      ...(deity.alt ? [{ label: "Also close", value: deity.alt.name }] : []),
                    ],
                    sources: deity.guide.sources,
                    note: deity.guide.tier === "living-open"
                      ? "Shown as a comparison, not a claim, out of respect for a living tradition."
                      : null,
                  })}>
                  <FooterRow label="Pantheon" value={deity.guide.pantheon} />
                </ReadCard>
              )}
              {character && (
                <ReadCard kicker="Character" glyph="\u2694" title={character.guide.name} body={character.guide.tagline}
                  onOpen={() => setOpenRead({
                    kind: "Character", title: character.guide.name, tagline: character.guide.tagline,
                    body: character.guide.essence, shadow: character.guide.shadow,
                    meta: [
                      { label: "From", value: character.guide.work },
                      { label: "Author", value: character.guide.author },
                      ...(character.alt ? [{ label: "Also close", value: character.alt.name }] : []),
                    ],
                    sources: character.guide.sources, note: null,
                  })}>
                  <FooterRow label="From" value={character.guide.work} />
                </ReadCard>
              )}
              {zodiac && (
                <ReadCard kicker="Chinese zodiac" glyph="\u516D" title={zodiac.yearName} body={ANIMAL_TRAIT[zodiac.animal].split("\u2014")[0].trim()}
                  onOpen={() => setOpenRead({
                    kind: "Chinese zodiac", title: zodiac.yearName, tagline: `${zodiac.innerAnimal} month \u00B7 ${zodiac.secretAnimal} hour`,
                    body: `${ANIMAL_TRAIT[zodiac.animal]} ${ELEMENT_TRAIT[zodiac.element]}`,
                    shadow: null,
                    meta: [
                      { label: "Outer (year)", value: `${zodiac.element} ${zodiac.animal}` },
                      { label: "Inner (month)", value: zodiac.innerAnimal },
                      { label: "Secret (hour)", value: zodiac.secretAnimal },
                      { label: "Polarity", value: zodiac.polarity },
                      { label: "Zodiac year began", value: zodiac.newYear },
                    ],
                    sources: ["Sexagenary cycle; year set by Chinese New Year, month by the solar terms, hour by the double-hours"],
                    note: row?.unknownTime ? "Your hour animal needs an exact birth time \u2014 add one to complete it." : null,
                  })}>
                  <FooterRow label="Element" value={zodiac.element} />
                </ReadCard>
              )}
            </div>
          </section>

          {/* ═══ D. You, in four parts ═══ */}
          {facets.length > 0 && (
            <section>
              <Kicker>You, in four parts</Kicker>
              <div className="flex flex-col gap-[9px]">
                {facets.map((f) => {
                  const open = openFacet === f.id;
                  return (
                    <div key={f.id} style={{ borderRadius: 16, background: "var(--background-card)", border: "0.5px solid var(--border-card)", overflow: "hidden" }}>
                      <button onClick={() => setOpenFacet(open ? null : f.id)} aria-expanded={open}
                        className="w-full flex items-center gap-3 text-left" style={{ padding: "15px 16px" }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold uppercase" style={{ letterSpacing: "0.18em", color: "var(--brass)" }}>{f.kicker}</p>
                          <p className="mt-[3px]" style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 17.5, color: "var(--foreground)" }}>{f.title}</p>
                        </div>
                        <span className="text-[15px] transition-transform duration-200"
                          style={{ color: "var(--brass)", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
                      </button>
                      {open && (
                        <div style={{ padding: "0 16px 16px" }}>
                          <div style={{ height: 1, background: "var(--border-card)", marginBottom: 13 }} />
                          <p className="text-[13.5px]" style={{ lineHeight: 1.75, color: "var(--foreground-secondary)" }}>{f.body}</p>
                          {attribution && (
                            <p className="text-[11px] mt-3" style={{ letterSpacing: "0.04em", color: "var(--foreground-faint)" }}>{attribution}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ E. Tension panel ═══ */}
          {resonance.secondary && (
            <section style={{ borderRadius: 20, padding: 20, background: "var(--plum)", border: "0.5px solid var(--border-card)" }}>
              <p className="text-[9px] font-bold uppercase" style={{ letterSpacing: "0.22em", color: "#c9a961" }}>
                Where your systems disagree
              </p>
              <p className="mt-1" style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22, color: "#f0e6d2" }}>
                Shaded by {resonance.secondary.name}
              </p>
              <p className="text-[13px] mt-2" style={{ lineHeight: 1.7, color: "rgba(240,230,210,0.62)" }}>
                {resonance.secondary.shading ?? resonance.secondary.tagline}
              </p>
              <div className="flex items-center gap-2.5 mt-4">
                <span className="flex-1" style={{ height: 5, borderRadius: 99, background: "linear-gradient(90deg, #c9a961, rgba(201,169,97,0.15))" }} />
                <span className="text-[10px] uppercase whitespace-nowrap" style={{ letterSpacing: "0.12em", color: "rgba(240,230,210,0.55)" }}>
                  Hold both
                </span>
              </div>
            </section>
          )}

          {/* ═══ F. Rare in your make-up ═══ */}
          {rarities.length > 0 && (
            <section>
              <Kicker>Rare in your make-up</Kicker>
              <SubLine>The markers the engine weighted most heavily — few charts carry them.</SubLine>
              <div className="flex flex-col gap-[9px]">
                {rarities.map((r) => (
                  <div key={`${r.kicker}-${r.mark}`} className="flex items-start gap-3"
                    style={{ borderRadius: 15, padding: "14px 16px", background: "var(--background-card)", border: "0.5px solid rgba(212,161,58,0.28)", borderLeft: "2.5px solid #d4a13a" }}>
                    <span className="flex items-center justify-center flex-shrink-0"
                      style={{ width: 34, height: 34, borderRadius: "50%", fontFamily: "var(--font-display)", fontSize: 15, color: "#d4a13a", background: "rgba(212,161,58,0.12)", border: "1px solid rgba(212,161,58,0.35)" }}>
                      {r.mark}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-[7px]">
                        <span className="text-[8.5px] font-bold uppercase" style={{ letterSpacing: "0.16em", color: "#d4a13a" }}>{r.kicker}</span>
                        {r.rarity && <span className="text-[8.5px]" style={{ color: "var(--foreground-faint)" }}>{r.rarity}</span>}
                      </div>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 16, color: "var(--foreground)" }}>{r.title}</p>
                      <p className="text-[12.5px]" style={{ lineHeight: 1.6, color: "var(--foreground-secondary)" }}>{r.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ G. Where you are right now ═══ */}
          {numerology && (
            <section style={{ borderRadius: 18, background: "var(--background-card)", border: "0.5px solid var(--border-card)", padding: "18px 18px 16px" }}>
              <div className="flex items-center gap-[13px]">
                <span className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 46, height: 46, borderRadius: "50%", fontFamily: "var(--font-display)", fontSize: 24, color: "#d4a13a", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-card)" }}>
                  {numerology.personalYear}
                </span>
                <div>
                  <p className="text-[9px] font-bold uppercase" style={{ letterSpacing: "0.2em", color: "var(--brass)" }}>
                    Personal Year · {cycleYear}
                  </p>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 19.5, color: "var(--foreground)" }}>
                    {PERSONAL_YEAR_TITLE[numerology.personalYear] ?? "Where you are"}
                  </p>
                </div>
              </div>
              <p className="text-[12.5px] mt-3" style={{ lineHeight: 1.65, color: "var(--foreground-secondary)" }}>
                {PERSONAL_YEAR_BODY[numerology.personalYear] ?? ""}
              </p>
              {/* nine-year cycle strip */}
              <div className="flex gap-1 mt-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                  const cur = n === numerology.personalYear;
                  const past = n < numerology.personalYear;
                  return (
                    <div key={n} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="w-full" style={{ height: 4, borderRadius: 99, background: cur ? "#d4a13a" : past ? "var(--brass)" : "var(--border-card)" }} />
                      <span className="text-[9.5px]" style={{ color: cur ? "#d4a13a" : "var(--foreground-faint)", fontWeight: cur ? 700 : 400 }}>{n}</span>
                    </div>
                  );
                })}
              </div>
              {/* micro-cycle */}
              <div className="flex gap-2 mt-4 pt-3.5" style={{ borderTop: "0.5px solid var(--border-card)" }}>
                {[
                  { label: "This month", note: `Personal month ${numerology.personalMonth}` },
                  { label: "Today", note: `Personal day ${numerology.personalDay}` },
                ].map((t) => (
                  <div key={t.label} className="flex-1" style={{ padding: "11px 12px", borderRadius: 12, background: "rgba(255,255,255,0.04)" }}>
                    <p className="text-[8.5px] uppercase" style={{ letterSpacing: "0.12em", color: "var(--foreground-faint)" }}>{t.label}</p>
                    <p className="text-[12.5px]" style={{ color: "var(--foreground-secondary)" }}>{t.note}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ H. Words that keep coming up ═══ */}
          <section>
            <Kicker>Words that keep coming up</Kicker>
            <div className="flex flex-wrap gap-2">
              {TRAIT_ORDER.map((t) => ({ t, v: resonance.traits[t] }))
                .sort((a, b) => b.v - a.v)
                .slice(0, 6)
                .map(({ t }) => (
                  <span key={t} className="text-[12.5px] capitalize"
                    style={{ padding: "9px 15px", borderRadius: 99, background: "var(--background-card)", border: "0.5px solid var(--border-card)", color: "var(--foreground-secondary)" }}>
                    {TRAIT_PHRASE[t]}
                  </span>
                ))}
            </div>
          </section>

          {/* ═══ Everything you are ═══ */}
          <section>
            <Kicker>Everything you are</Kicker>
            <div className="flex flex-col gap-[9px]">
              {row?.bigThree && (row.bigThree.sun || row.bigThree.moon) && (
                <SystemCard title="Astrology">
                  {row.bigThree.sun && <Row label="Sun" value={SIGN_FULL[row.bigThree.sun] ?? row.bigThree.sun} />}
                  {row.bigThree.moon && <Row label="Moon" value={SIGN_FULL[row.bigThree.moon] ?? row.bigThree.moon} />}
                  {row.bigThree.rising && !row.unknownTime && <Row label="Rising" value={SIGN_FULL[row.bigThree.rising] ?? row.bigThree.rising} />}
                  {element && <Row label="Element" value={ELEMENT_LABEL[element]} accent />}
                </SystemCard>
              )}
              {numerology && (
                <SystemCard title="Numerology">
                  <Row label="Life Path" value={masterLabel(numerology.lifePath.value)} accent />
                  <Row label="Expression" value={masterLabel(numerology.expression.value)} />
                  <Row label="Soul Urge" value={masterLabel(numerology.soulUrge.value)} />
                  <Row label="Personality" value={masterLabel(numerology.personality.value)} />
                  <p className="text-[11px] leading-relaxed pt-2 mt-1" style={{ color: "var(--foreground-faint)", borderTop: "0.5px solid var(--border-card)" }}>
                    Name numbers calculated from <span style={{ color: "var(--foreground-secondary)" }}>{fullName.trim()}</span>.{" "}
                    <Link href="/numerology" className="underline" style={{ color: "var(--brass)" }}>Not your full birth name? Change it</Link>
                  </p>
                </SystemCard>
              )}
              {hd && (
                <SystemCard title="Human Design">
                  <Row label="Type" value={hd.type} accent />
                  <Row label="Strategy" value={hd.strategy} />
                  <Row label="Authority" value={hd.authorityName.split(" — ")[0]} />
                  <Row label="Profile" value={`${hd.profile} · ${hd.profileName.split(" / ")[0]}`} />
                </SystemCard>
              )}
              {row?.unknownTime && (
                <p className="text-[11px] leading-relaxed px-1" style={{ color: "var(--foreground-faint)" }}>
                  Your Human Design and Rising sign need an exact birth time — add one to complete the picture.
                </p>
              )}
            </div>
          </section>

          <p className="text-[11px] text-center" style={{ lineHeight: 1.6, color: "var(--foreground-faint)" }}>
            Your archetype re-runs whenever your birth details or name change.
          </p>
        </div>
      )}

      {openRead && <ReadSheet detail={openRead} onClose={() => setOpenRead(null)} />}

      <style jsx global>{`
        @keyframes pf-breathe { 0%,100% { opacity:.35 } 50% { opacity:.75 } }
        @keyframes pf-drift { 0%,100% { transform:rotate(0deg) } 50% { transform:rotate(3deg) } }
        .pf-breathe { animation: pf-breathe 9s ease-in-out infinite; }
        .pf-drift { animation: pf-drift 22s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .pf-breathe, .pf-drift { animation: none; }
        }
      `}</style>
    </main>
  );
}

/** Life Path frequency across every real date 1930–2029 (N=36,525). */
const LIFE_PATH_FREQ: Record<number, string> = {
  2: "4.7", 4: "8.0", 11: "6.4", 22: "3.1", 33: "0.8",
};

const PERSONAL_YEAR_TITLE: Record<number, string> = {
  1: "A year to begin", 2: "A year to partner", 3: "A year to express",
  4: "A year to build", 5: "A year to change", 6: "A year to tend",
  7: "A year to withdraw", 8: "A year to claim", 9: "A year to finish",
};

const PERSONAL_YEAR_BODY: Record<number, string> = {
  1: "Doors open that won't be open later. Start the thing before you feel ready — this year rewards the first move, not the perfect one.",
  2: "Slower on purpose. What you planted last year needs company and patience rather than force, and other people are the method.",
  3: "The year your voice carries. Make things, say things, be seen — the work that gets shared this year travels further than it should.",
  4: "Unglamorous and load-bearing. Foundations laid now are what everything after stands on, so choose materials you trust.",
  5: "Everything loosens. Expect movement, offers, and interruptions — hold plans lightly and say yes to the ones that scare you slightly.",
  6: "The year of people. Home, obligation, and care take the front seat, and the cost of ignoring them is higher than usual.",
  7: "Go quiet and think. Answers arrive through study and solitude rather than effort — resist the urge to push.",
  8: "Ask for what it's worth. Authority, money, and consequence come into focus; this is the year to negotiate rather than hope.",
  9: "Let things end. Clear what's finished so next year's beginning has somewhere to land — release is the whole assignment.",
};

const SIGN_FULL: Record<string, string> = {
  Ari: "Aries", Tau: "Taurus", Gem: "Gemini", Can: "Cancer", Leo: "Leo", Vir: "Virgo",
  Lib: "Libra", Sco: "Scorpio", Sag: "Sagittarius", Cap: "Capricorn", Aqu: "Aquarius", Pis: "Pisces",
};

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10.5px] font-bold uppercase mb-2" style={{ letterSpacing: "0.18em", color: "var(--foreground-muted)" }}>
      {children}
    </h2>
  );
}

function SubLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12.5px] mb-3.5" style={{ lineHeight: 1.6, color: "var(--foreground-muted)" }}>
      {children}
    </p>
  );
}

function ReadCard({ kicker, glyph, title, body, children, onOpen }: {
  kicker: string; glyph: string; title: string; body: string;
  children?: React.ReactNode; onOpen?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col gap-[9px] h-full w-full text-left active:scale-[0.985] transition-transform"
      style={{ borderRadius: 16, padding: "15px 14px", background: "var(--background-card)", border: "0.5px solid var(--border-card)" }}
    >
      <p className="text-[8.5px] font-bold uppercase" style={{ letterSpacing: "0.16em", color: "var(--brass)" }}>{kicker}</p>
      <span className="flex items-center justify-center"
        style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "0.5px solid var(--border-card)", color: "var(--brass)", fontSize: 18 }}>
        {glyph}
      </span>
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 18, lineHeight: 1.1, color: "var(--foreground)" }}>{title}</p>
      <p className="text-[12.5px]" style={{ lineHeight: 1.55, color: "var(--foreground-secondary)" }}>{body}</p>
      <div className="flex flex-col gap-[5px] mt-auto pt-[11px] w-full" style={{ borderTop: "0.5px solid var(--border-card)" }}>
        {children}
        <span className="text-[10px] mt-0.5" style={{ color: "var(--brass)" }}>Read more \u2192</span>
      </div>
    </button>
  );
}

/** Payload for the expanded detail sheet behind each "more reads" card. */
interface ReadDetail {
  kind: string;
  title: string;
  tagline: string;
  body: string;
  shadow: string | null;
  meta: { label: string; value: string }[];
  sources: string[];
  note: string | null;
}

function ReadSheet({ detail, onClose }: { detail: ReadDetail; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={detail.title}>
      <button aria-label="Close" onClick={onClose} className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }} />
      <div className="relative w-full max-w-lg max-h-[86vh] overflow-y-auto"
        style={{ background: "var(--background-elevated)", borderTopLeftRadius: 24, borderTopRightRadius: 24, border: "0.5px solid var(--border-card)", padding: "10px 22px 30px" }}>
        <div className="sticky top-0 flex justify-center pb-3 pt-1" style={{ background: "var(--background-elevated)" }}>
          <span style={{ width: 42, height: 4, borderRadius: 99, background: "var(--border-card)" }} />
        </div>
        <p className="text-[9px] font-bold uppercase" style={{ letterSpacing: "0.2em", color: "var(--brass)" }}>{detail.kind}</p>
        <h3 className="mt-1" style={{ fontFamily: "var(--font-heading)", fontSize: 30, fontWeight: 500, lineHeight: 1.1, color: "var(--foreground)" }}>
          {detail.title}
        </h3>
        <p className="text-[13px] italic mt-1.5" style={{ color: "var(--brass)" }}>{detail.tagline}</p>
        <p className="text-[14px] mt-4" style={{ lineHeight: 1.75, color: "var(--foreground-secondary)" }}>{detail.body}</p>

        {detail.shadow && (
          <div className="mt-4" style={{ borderRadius: 14, padding: "13px 15px", background: "var(--background-card)", border: "0.5px solid color-mix(in srgb, var(--oxblood-light) 34%, transparent)" }}>
            <p className="text-[9px] font-bold uppercase mb-1" style={{ letterSpacing: "0.16em", color: "var(--oxblood-light)" }}>Its shadow in you</p>
            <p className="text-[13px]" style={{ lineHeight: 1.65, color: "var(--foreground-secondary)" }}>{detail.shadow}</p>
          </div>
        )}

        {detail.meta.length > 0 && (
          <div className="flex flex-col gap-2 mt-4" style={{ borderRadius: 14, padding: "13px 15px", background: "var(--background-card)", border: "0.5px solid var(--border-card)" }}>
            {detail.meta.map((m) => (
              <div key={m.label} className="flex items-baseline justify-between gap-3">
                <span className="text-[9px] uppercase flex-shrink-0" style={{ letterSpacing: "0.12em", color: "var(--foreground-faint)" }}>{m.label}</span>
                <span className="text-[12.5px] text-right" style={{ color: "var(--foreground-secondary)" }}>{m.value}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-[11px] mt-4" style={{ lineHeight: 1.6, color: "var(--foreground-faint)" }}>
          {detail.sources.join("; ")}.{detail.note ? ` ${detail.note}` : ""}
        </p>

        <button onClick={onClose} className="w-full mt-5 py-3 rounded-full text-[14px] font-bold"
          style={{ backgroundColor: "var(--brass)", color: "var(--btn-ink)" }}>
          Close
        </button>
      </div>
    </div>
  );
}

function FooterRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[9px] uppercase flex-shrink-0" style={{ letterSpacing: "0.1em", color: "var(--foreground-faint)" }}>{label}</span>
      <span className="text-[11.5px] text-right truncate" style={{ color: "var(--foreground-secondary)" }}>{value}</span>
    </div>
  );
}

function SystemCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 16, padding: "15px 16px", background: "var(--background-card)", border: "0.5px solid var(--border-card)" }}>
      <p className="text-[9px] font-bold uppercase mb-2.5" style={{ letterSpacing: "0.18em", color: "var(--brass)" }}>
        {title}
      </p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px]" style={{ color: "var(--foreground-muted)" }}>{label}</span>
      <span className="text-[13px] font-semibold text-right" style={{ color: accent ? "var(--brass)" : "var(--foreground)" }}>{value}</span>
    </div>
  );
}
