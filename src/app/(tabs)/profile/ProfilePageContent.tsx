"use client";

/**
 * Profile — the user's photo, birth details, and their fused ARCHETYPE (drawn
 * from astrology + numerology + Human Design + palmistry), followed by an
 * "everything you are" board that lists their signals across every system.
 * Reached by tapping the avatar next to the theme toggle.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchSetting, saveSetting } from "@/lib/syncedSettings";
import { computeNumerology } from "@/lib/numerology";
import { computeHumanDesign } from "@/lib/humanDesign/engine";
import { computeArchetype } from "@/lib/archetype/engine";
import { ELEMENT_LABEL, type Element } from "@/lib/archetype/types";
import { computeResonance, type Placement } from "@/lib/resonance/engine";
import { persistAllAssignments } from "@/lib/resonance/persist";
import { TRAIT_ORDER } from "@/lib/resonance/traits";
import ResonanceRadar from "@/components/profile/ResonanceRadar";
import { computeAnimalGuide, TIER_LABEL } from "@/lib/resonance/animals";
import { computeDeity, DEITY_TIER_LABEL } from "@/lib/resonance/deities";
import { computeCharacter } from "@/lib/resonance/characters";
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

const MODALITY: Record<string, "Cardinal" | "Fixed" | "Mutable"> = {
  Aries: "Cardinal", Cancer: "Cardinal", Libra: "Cardinal", Capricorn: "Cardinal",
  Taurus: "Fixed", Leo: "Fixed", Scorpio: "Fixed", Aquarius: "Fixed",
  Gemini: "Mutable", Virgo: "Mutable", Sagittarius: "Mutable", Pisces: "Mutable",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Nov 7, 1994 · 9:42 PM · Portland, OR" — the identity line under the archetype. */
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
    // Geocoder display names can be very long ("Portland, Multnomah County,
    // Oregon, United States") — keep the first two segments.
    const short = city.split(",").slice(0, 2).map((s) => s.trim()).join(", ");
    if (short) line += ` · ${short}`;
  }
  return line;
}

export default function ProfilePageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [row, setRow] = useState<ChartRow | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [fullName, setFullName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
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

  return (
    <main className="flex-1 flex flex-col px-5 py-7 max-w-lg mx-auto w-full">
      {/* Photo + name */}
      <div className="flex flex-col items-center text-center mb-6">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative w-28 h-28 rounded-full overflow-hidden active:scale-[0.98] transition-transform"
          style={{ border: "1.5px solid var(--brass)", backgroundColor: "var(--background-card)" }}
          aria-label="Change profile photo"
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Your profile" className="w-full h-full object-cover" />
          ) : (
            <span
              className="w-full h-full flex items-center justify-center text-[34px]"
              style={{ fontFamily: "var(--font-heading)", color: "var(--brass)" }}
            >
              {initials}
            </span>
          )}
          <span
            className="absolute bottom-0 inset-x-0 py-1 text-[9px] tracking-[0.1em] uppercase font-semibold"
            style={{ backgroundColor: "rgba(0,0,0,0.45)", color: "#f0e6d2" }}
          >
            {photo ? "Change" : "Add photo"}
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} className="hidden" />

        <p className="mt-4" style={{ fontFamily: "var(--font-script)", fontSize: 26, lineHeight: 1, color: "var(--brass)", margin: "16px 0 2px" }}>
          This is you,
        </p>
        <h1
          className="text-[30px]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.1, color: "var(--foreground)" }}
        >
          {displayName || "Your Profile"}
        </h1>
        {row && !resonance && (
          <p className="text-[13px] mt-2" style={{ color: "var(--foreground-secondary)" }}>
            {formatBirthLine(row.birthDate, row.birthTime, row.unknownTime, row.cityName)}
          </p>
        )}
      </div>

      {!row && (
        <div
          className="rounded-2xl px-4 py-5 text-center"
          style={{ backgroundColor: "var(--background-card)", border: "0.5px solid var(--border-card)" }}
        >
          <p className="text-[13px]" style={{ color: "var(--foreground-secondary)" }}>
            Add your birth details to unlock your archetype and everything you are.
          </p>
        </div>
      )}

      {/* Archetype hero — celestial ornament, centered reading, radar, identity chips */}
      {resonance && (
        <div
          className="rounded-[22px] px-5 pt-6 pb-[22px] mb-6 text-center relative overflow-hidden"
          style={{
            background: element ? `linear-gradient(160deg, ${ELEMENT_TINT[element]}, var(--background-card))` : "var(--background-card)",
            border: "0.5px solid color-mix(in srgb, var(--brass) 45%, transparent)",
          }}
        >
          {/* scattered sparkles */}
          {[[8, 14, 0.35], [88, 8, 0.5], [14, 78, 0.3], [92, 62, 0.35], [78, 30, 0.25]].map(([x, y, o], i) => (
            <svg key={i} aria-hidden className="absolute" style={{ left: `${x}%`, top: `${y}%`, opacity: o }} width="10" height="10" viewBox="-5 -5 10 10">
              <path d="M0 -5 L1.1 -1.1 L5 0 L1.1 1.1 L0 5 L-1.1 1.1 L-5 0 L-1.1 -1.1 Z" fill="var(--brass)" />
            </svg>
          ))}

          {/* celestial ornament — orbit arcs, apex node, crescent */}
          <div className="flex justify-center mb-2" aria-hidden>
            <svg width="216" height="84" viewBox="0 0 216 84" fill="none">
              <circle cx="108" cy="158" r="126" stroke="var(--brass)" strokeWidth="1.2" opacity="0.55" />
              <circle cx="108" cy="158" r="102" stroke="var(--brass)" strokeWidth="1" opacity="0.3" />
              <line x1="108" y1="32" x2="108" y2="16" stroke="var(--brass)" strokeWidth="1" opacity="0.6" />
              <circle cx="108" cy="10" r="3.4" fill="var(--brass)" opacity="0.9" />
              <g transform="translate(53, 52) scale(0.9)" opacity="0.8">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" stroke="var(--brass)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <circle cx="160" cy="58" r="2" fill="var(--brass)" opacity="0.6" />
            </svg>
          </div>

          <p className="text-[10px] uppercase font-bold mb-2 relative" style={{ letterSpacing: "0.28em", color: "var(--brass)" }}>
            Your Archetype
          </p>
          <h2
            className="text-[32px] leading-tight mb-2 relative"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 500, letterSpacing: "-0.01em", color: "var(--foreground)" }}
          >
            {resonance.primary.name}
          </h2>
          <p
            className="mx-auto mb-4 relative"
            style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontStyle: "italic", fontWeight: 500, fontSize: 19, lineHeight: 1.45, color: "var(--foreground-secondary)", maxWidth: 320, textWrap: "pretty" }}
          >
            {resonance.primary.tagline}
          </p>

          <div className="flex justify-center mb-1 relative">
            <ResonanceRadar facets={resonance.facets} size={244} />
          </div>

          {resonance.secondary && (
            <p className="text-[10px] tracking-[0.14em] uppercase mb-4 relative" style={{ color: "var(--foreground-faint)" }}>
              Shaded by {resonance.secondary.name}
            </p>
          )}

          {/* identity chips — sun · life path · HD type */}
          <div className="flex flex-wrap justify-center gap-2 mb-4 relative">
            {[
              row?.bigThree?.sun ? `${row.bigThree.sun} Sun` : null,
              numerology ? `Life Path ${numerology.lifePath.value}` : null,
              hd?.type || null,
            ].filter((c): c is string => !!c).map((chip) => (
              <span
                key={chip}
                className="px-[13px] py-[7px] rounded-full text-[10px] font-bold uppercase whitespace-nowrap"
                style={{ letterSpacing: "0.12em", color: "var(--brass)", background: "color-mix(in srgb, var(--brass) 10%, transparent)", border: "0.5px solid color-mix(in srgb, var(--brass) 35%, transparent)" }}
              >
                {chip}
              </span>
            ))}
          </div>

          {/* birth line */}
          {row && (
            <p className="text-[13px] relative m-0" style={{ color: "color-mix(in srgb, var(--brass) 75%, var(--foreground))" }}>
              {formatBirthLine(row.birthDate, row.birthTime, row.unknownTime, row.cityName)}
            </p>
          )}

          {resonance.evidence.length > 0 && (
            <div className="text-left flex flex-col gap-2 mt-5 pt-4 relative" style={{ borderTop: "0.5px solid color-mix(in srgb, var(--brass) 25%, transparent)" }}>
              {resonance.evidence.map((e) => {
                const rest = e.copy.startsWith(e.feature)
                  ? e.copy.slice(e.feature.length).replace(/^\s*—\s*/, "")
                  : e.copy;
                return (
                  <p key={e.feature} className="text-[12.5px] leading-relaxed m-0" style={{ color: "var(--foreground-secondary)" }}>
                    <span style={{ color: "var(--brass)", fontWeight: 600 }}>{e.feature}</span> — {rest}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Strongest traits */}
      {resonance && (
        <>
          <SectionLabel>Strongest traits</SectionLabel>
          <div className="flex flex-wrap gap-2 mb-6">
            {TRAIT_ORDER
              .map((t) => ({ t, v: resonance.traits[t] }))
              .sort((a, b) => b.v - a.v)
              .slice(0, 6)
              .map(({ t, v }) => (
                <span
                  key={t}
                  className="px-[13px] py-2 rounded-full text-[11px] font-semibold capitalize"
                  style={{ backgroundColor: "color-mix(in srgb, var(--brass) 12%, transparent)", border: "0.5px solid color-mix(in srgb, var(--brass) 35%, transparent)", color: "var(--foreground)" }}
                >
                  {t} · {v}
                </span>
              ))}
          </div>
        </>
      )}

      {/* Your reading — the composed archetype content */}
      {resonance?.primary.content && (
        <>
          <SectionLabel>Your reading</SectionLabel>
          <div className="flex flex-col gap-3 mb-6">
            {[
              { label: "Essence", text: resonance.primary.content.essence },
              { label: "Your shadow", text: resonance.primary.content.shadowSide, shadow: true },
              { label: "Growth edge", text: resonance.primary.content.growthEdge },
              { label: "In love", text: resonance.primary.content.inRelationship },
              { label: "At work", text: resonance.primary.content.atWork },
            ].map((b) => (
              <div
                key={b.label}
                className="rounded-2xl p-4"
                style={{
                  background: "var(--background-card)",
                  border: `1px solid ${b.shadow ? "color-mix(in srgb, var(--oxblood-light) 30%, transparent)" : "var(--border-card)"}`,
                }}
              >
                <p
                  className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-1.5"
                  style={{ color: b.shadow ? "var(--oxblood-light)" : "var(--brass)" }}
                >
                  {b.label}
                </p>
                <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Animal Guide — matched from the same trait vector; provenance on the card */}
      {animal && (
        <>
          <SectionLabel>Your Animal Guide</SectionLabel>
          <div
            className="rounded-2xl p-4 mb-6"
            style={{ background: "var(--background-card)", border: "0.5px solid var(--border-card)" }}
          >
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <h3
                className="text-[22px] leading-tight"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 500, color: "var(--foreground)" }}
              >
                {animal.guide.name}
              </h3>
              <span
                className="text-[9px] tracking-[0.12em] uppercase font-semibold px-2 py-1 rounded-full whitespace-nowrap"
                style={{ backgroundColor: "rgba(201,169,97,0.16)", color: "var(--brass)" }}
                title={animal.guide.sources[0]}
              >
                {TIER_LABEL[animal.guide.tier]}
              </span>
            </div>
            <p className="text-[12px] italic mb-3" style={{ color: "var(--foreground-secondary)" }}>
              {animal.guide.tagline}
            </p>
            <p className="text-[13.5px] leading-relaxed mb-3" style={{ color: "var(--foreground-secondary)" }}>
              {animal.guide.essence}
            </p>
            <div className="mb-3">
              <p className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-1" style={{ color: "var(--oxblood-light)" }}>
                Its shadow in you
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
                {animal.guide.shadow}
              </p>
            </div>
            <p className="text-[11px] leading-relaxed pt-2" style={{ color: "var(--foreground-faint)", borderTop: "0.5px solid var(--border-card)" }}>
              Source — {animal.guide.tradition}: {animal.guide.sources.join("; ")}.
              {animal.guide.status === "living-open" && " Shown as a comparison, not a claim, out of respect for a living tradition."}
              {animal.alt && <> · Also close: {animal.alt.name}.</>}
            </p>
          </div>
        </>
      )}

      {/* Deity — matched from the same trait vector; provenance + tier on the card */}
      {deity && (
        <>
          <SectionLabel>Your Deity</SectionLabel>
          <div
            className="rounded-2xl p-4 mb-6"
            style={{ background: "var(--background-card)", border: "0.5px solid var(--border-card)" }}
          >
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <h3
                className="text-[22px] leading-tight"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 500, color: "var(--foreground)" }}
              >
                {deity.guide.name}
              </h3>
              <span
                className="text-[9px] tracking-[0.12em] uppercase font-semibold px-2 py-1 rounded-full whitespace-nowrap"
                style={{ backgroundColor: "rgba(201,169,97,0.16)", color: "var(--brass)" }}
              >
                {deity.guide.pantheon}
              </span>
            </div>
            <p className="text-[12px] italic mb-3" style={{ color: "var(--foreground-secondary)" }}>
              {deity.guide.tagline}
            </p>
            <p className="text-[13.5px] leading-relaxed mb-3" style={{ color: "var(--foreground-secondary)" }}>
              {deity.guide.essence}
            </p>
            <div className="mb-3">
              <p className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-1" style={{ color: "var(--oxblood-light)" }}>
                Its shadow in you
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
                {deity.guide.shadow}
              </p>
            </div>
            <p className="text-[11px] leading-relaxed pt-2" style={{ color: "var(--foreground-faint)", borderTop: "0.5px solid var(--border-card)" }}>
              {DEITY_TIER_LABEL[deity.guide.tier]} — {deity.guide.sources.join("; ")}.
              {deity.guide.tier === "living-open" && " Shown as a comparison, not a claim, out of respect for a living tradition."}
              {deity.alt && <> · Also close: {deity.alt.name}.</>}
            </p>
          </div>
        </>
      )}

      {/* Character — public-domain literary/legendary match */}
      {character && (
        <>
          <SectionLabel>Your Character</SectionLabel>
          <div
            className="rounded-2xl p-4 mb-6"
            style={{ background: "var(--background-card)", border: "0.5px solid var(--border-card)" }}
          >
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <h3
                className="text-[22px] leading-tight"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 500, color: "var(--foreground)" }}
              >
                {character.guide.name}
              </h3>
              <span
                className="text-[9px] tracking-[0.12em] uppercase font-semibold px-2 py-1 rounded-full whitespace-nowrap"
                style={{ backgroundColor: "rgba(201,169,97,0.16)", color: "var(--brass)" }}
              >
                {character.guide.work}
              </span>
            </div>
            <p className="text-[12px] italic mb-3" style={{ color: "var(--foreground-secondary)" }}>
              {character.guide.tagline}
            </p>
            <p className="text-[13.5px] leading-relaxed mb-3" style={{ color: "var(--foreground-secondary)" }}>
              {character.guide.essence}
            </p>
            <div className="mb-3">
              <p className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-1" style={{ color: "var(--oxblood-light)" }}>
                Its shadow in you
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
                {character.guide.shadow}
              </p>
            </div>
            <p className="text-[11px] leading-relaxed pt-2" style={{ color: "var(--foreground-faint)", borderTop: "0.5px solid var(--border-card)" }}>
              {character.guide.sources.join("; ")}.
              {character.alt && <> · Also close: {character.alt.name}.</>}
            </p>
          </div>
        </>
      )}

      {/* Secondary — how it colours the primary */}
      {resonance?.secondary && (
        <>
          <SectionLabel>Shaded by {resonance.secondary.name}</SectionLabel>
          <div
            className="rounded-2xl p-4 mb-6"
            style={{ background: "var(--background-card)", border: "0.5px dashed color-mix(in srgb, var(--brass) 60%, transparent)" }}
          >
            <p className="text-[12px] italic mb-3" style={{ color: "var(--foreground-secondary)" }}>
              {resonance.secondary.tagline}
            </p>
            {resonance.secondary.shading && (
              <p className="text-[13.5px] leading-relaxed mb-3" style={{ color: "var(--foreground-secondary)" }}>
                {resonance.secondary.shading}
              </p>
            )}
            {resonance.secondary.content && (
              <div className="flex flex-col gap-3 mt-1">
                <div>
                  <p className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-1" style={{ color: "var(--brass)" }}>
                    What it adds
                  </p>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
                    {resonance.secondary.content.essence}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-1" style={{ color: "var(--oxblood-light)" }}>
                    Its shadow in you
                  </p>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
                    {resonance.secondary.content.shadowSide}
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Everything you are */}
      <SectionLabel>Everything you are</SectionLabel>
      <div className="flex flex-col gap-3">
        {row?.bigThree && (row.bigThree.sun || row.bigThree.moon) && (
          <SystemCard title="Astrology">
            {row.bigThree.sun && <Row label="Sun" value={row.bigThree.sun} />}
            {row.bigThree.moon && <Row label="Moon" value={row.bigThree.moon} />}
            {row.bigThree.rising && !row.unknownTime && <Row label="Rising" value={row.bigThree.rising} />}
            {element && <Row label="Element" value={ELEMENT_LABEL[element]} accent />}
            {row.bigThree.sun && MODALITY[row.bigThree.sun] && (
              <Row label="Modality" value={MODALITY[row.bigThree.sun]} />
            )}
          </SystemCard>
        )}

        {numerology && (
          <SystemCard title="Numerology">
            <Row label="Life Path" value={masterLabel(numerology.lifePath.value)} accent />
            <Row label="Expression" value={masterLabel(numerology.expression.value)} />
            <Row label="Soul Urge" value={masterLabel(numerology.soulUrge.value)} />
            <Row label="Personality" value={masterLabel(numerology.personality.value)} />
            <Row label="Birthday" value={String(numerology.birthday.value)} />
            {/* The name-based numbers (Expression / Soul Urge / Personality) depend
                entirely on the exact name used — show it so a wrong or display-only
                name is visible and fixable, instead of silently producing wrong numbers. */}
            <p className="text-[11px] leading-relaxed pt-2 mt-1" style={{ color: "var(--foreground-faint)", borderTop: "0.5px solid var(--border-card)" }}>
              Name numbers calculated from <span style={{ color: "var(--foreground-secondary)" }}>{fullName.trim()}</span>.{" "}
              <Link href="/numerology" className="underline" style={{ color: "var(--brass)" }}>
                Not your full birth name? Change it
              </Link>
            </p>
          </SystemCard>
        )}

        {hd && (
          <SystemCard title="Human Design">
            <Row label="Type" value={hd.type} accent />
            <Row label="Strategy" value={hd.strategy} />
            <Row label="Authority" value={hd.authorityName.split(" — ")[0]} />
            <Row label="Profile" value={`${hd.profile} · ${hd.profileName.split(" / ")[0]}`} />
            <Row label="Definition" value={hd.definitionName.replace(" Definition", "")} />
          </SystemCard>
        )}

        {row?.unknownTime && (
          <p className="text-[11px] leading-relaxed px-1" style={{ color: "var(--foreground-faint)" }}>
            Your Human Design and Rising sign need an exact birth time — add one to complete the picture.
          </p>
        )}
      </div>

      <div className="h-6" />
    </main>
  );
}

const ELEMENT_TINT: Record<Element, string> = {
  fire: "rgba(122,48,40,0.30)",
  earth: "rgba(45,64,41,0.30)",
  air: "rgba(90,74,138,0.26)",
  water: "rgba(26,37,72,0.34)",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3" style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 500, color: "var(--foreground)", margin: "0 0 12px" }}>
      {children}
    </h2>
  );
}

function SystemCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl px-4 py-3.5"
      style={{ backgroundColor: "var(--background-card)", border: "0.5px solid var(--border-card)" }}
    >
      <p className="text-[10px] tracking-[0.16em] uppercase font-bold mb-2.5" style={{ color: "var(--foreground-faint)" }}>
        {title}
      </p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px]" style={{ color: "var(--foreground-muted)" }}>
        {label}
      </span>
      <span
        className="text-[13px] font-semibold text-right"
        style={{ color: accent ? "var(--brass)" : "var(--foreground)" }}
      >
        {value}
      </span>
    </div>
  );
}
