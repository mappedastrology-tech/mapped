"use client";

/**
 * Profile — the user's photo, birth details, and their fused ARCHETYPE (drawn
 * from astrology + numerology + Human Design + palmistry), followed by an
 * "everything you are" board that lists their signals across every system.
 * Reached by tapping the avatar next to the theme toggle.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchSetting, saveSetting } from "@/lib/syncedSettings";
import { computeNumerology } from "@/lib/numerology";
import { computeHumanDesign } from "@/lib/humanDesign/engine";
import { computeArchetype } from "@/lib/archetype/engine";
import { ELEMENT_LABEL, STANCE_LABEL, type Element } from "@/lib/archetype/types";
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
}

const MODALITY: Record<string, "Cardinal" | "Fixed" | "Mutable"> = {
  Aries: "Cardinal", Cancer: "Cardinal", Libra: "Cardinal", Capricorn: "Cardinal",
  Taurus: "Fixed", Leo: "Fixed", Scorpio: "Fixed", Aquarius: "Fixed",
  Gemini: "Mutable", Virgo: "Mutable", Sagittarius: "Mutable", Pisces: "Mutable",
};

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
          .select("name, birth_date, birth_time, latitude, longitude, unknown_time, big_three")
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

  const archetype = result?.archetype ?? null;
  const element = result?.element ?? null;

  return (
    <main className="flex-1 flex flex-col px-5 py-7 max-w-lg mx-auto w-full">
      {/* Photo */}
      <div className="flex flex-col items-center text-center mb-6">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative w-28 h-28 rounded-full overflow-hidden active:scale-[0.98] transition-transform"
          style={{ border: "2px solid var(--brass)", backgroundColor: "var(--background-card)" }}
          aria-label="Change profile photo"
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Your profile" className="w-full h-full object-cover" />
          ) : (
            <span
              className="w-full h-full flex items-center justify-center text-[34px]"
              style={{ fontFamily: "var(--font-display)", color: "var(--brass)" }}
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

        <h1
          className="text-[24px] tracking-[0.06em] mt-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--foreground)" }}
        >
          {displayName || "Your Profile"}
        </h1>
        {row && (
          <p className="text-[13px] mt-1" style={{ color: "var(--foreground-secondary)" }}>
            {formatBirth(row.birthDate, row.birthTime, row.unknownTime)}
          </p>
        )}
      </div>

      {!row && (
        <div
          className="rounded-2xl px-4 py-5 text-center"
          style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}
        >
          <p className="text-[13px]" style={{ color: "var(--foreground-secondary)" }}>
            Add your birth details to unlock your archetype and everything you are.
          </p>
        </div>
      )}

      {/* Archetype hero */}
      {archetype && element && (
        <div
          className="rounded-3xl px-5 py-6 mb-6 text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(160deg, ${ELEMENT_TINT[element]}, var(--background-card))`,
            border: "1px solid var(--brass)",
          }}
        >
          <p className="text-[9px] tracking-[0.28em] uppercase font-semibold mb-2" style={{ color: "var(--brass)" }}>
            Your Archetype
          </p>
          <h2
            className="text-[30px] leading-tight mb-1"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--foreground)" }}
          >
            {archetype.name}
          </h2>
          <p className="text-[12px] italic mb-4" style={{ color: "var(--foreground-secondary)" }}>
            {archetype.tagline}
          </p>
          <p className="text-[13.5px] leading-relaxed mb-4" style={{ color: "var(--foreground-secondary)" }}>
            {archetype.description}
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] tracking-[0.1em] uppercase" style={{ color: "var(--foreground-faint)" }}>
            <span>{ELEMENT_LABEL[element]}</span>
            <span>·</span>
            <span>{STANCE_LABEL[archetype.stance]}</span>
          </div>
        </div>
      )}

      {/* Top traits */}
      {archetype && (
        <>
          <SectionLabel>Top traits</SectionLabel>
          <div className="flex flex-wrap gap-2 mb-6">
            {archetype.traits.map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium"
                style={{ backgroundColor: "rgba(201,169,97,0.14)", color: "var(--foreground)" }}
              >
                {t}
              </span>
            ))}
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
    <h2 className="text-[10px] tracking-[0.22em] uppercase font-semibold mb-3" style={{ color: "var(--brass)" }}>
      {children}
    </h2>
  );
}

function SystemCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl px-4 py-3.5"
      style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}
    >
      <p className="text-[10px] tracking-[0.16em] uppercase font-semibold mb-2.5" style={{ color: "var(--foreground-faint)" }}>
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
