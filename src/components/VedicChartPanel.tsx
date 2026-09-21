"use client";

/**
 * The Vedic tab on the chart screen, shown for sidereal charts only.
 *
 * - South Indian chart (signs fixed in place), Rasi (D1) or Navamsa (D9)
 * - Graha table: sign & degree, nakshatra · pada, nakshatra lord, navamsa
 * - Vimshottari dasha: the running maha/antardasha and what comes next
 *
 * Everything here is derived from `chart.vedic` (lib/astro/vedic/vedicChart.ts),
 * which calculateChart builds from unrounded sidereal positions.
 */

import { useMemo, useState } from "react";
import type { VedicBody, VedicDetails } from "@/lib/astro/vedic/vedicChart";
import { vimshottariDasha, currentDasha, upcomingAntardashas } from "@/lib/astro/vedic/dasha";
import { formatDegreesMinutes } from "@/lib/astro/vedic/ayanamsa";
import { HOUSE_SYSTEM_LABELS } from "@/lib/astro/vedic/houses";
import { NODE_TYPE_LABELS } from "@/lib/astro/vedic/nodes";

const SIGN_FULL: Record<string, string> = {
  Ari: "Aries", Tau: "Taurus", Gem: "Gemini", Can: "Cancer", Leo: "Leo", Vir: "Virgo",
  Lib: "Libra", Sco: "Scorpio", Sag: "Sagittarius", Cap: "Capricorn", Aqu: "Aquarius", Pis: "Pisces",
};

const GRAHA_SHORT: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke",
};

/**
 * South Indian layout: a 4×4 ring with the signs fixed, Pisces top-left,
 * running clockwise. null = the empty centre.
 */
const SOUTH_INDIAN_GRID: (string | null)[][] = [
  ["Pis", "Ari", "Tau", "Gem"],
  ["Aqu", null, null, "Can"],
  ["Cap", null, null, "Leo"],
  ["Sag", "Sco", "Lib", "Vir"],
];

const card: React.CSSProperties = { backgroundColor: "var(--plum)", border: "0.5px solid rgba(201, 169, 97, 0.2)" };
const eyebrow = "text-[9px] tracking-[0.25em] uppercase font-medium";

function monthYear(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function SouthIndianChart({ vedic, division }: { vedic: VedicDetails; division: "D1" | "D9" }) {
  // Which sign each body sits in for this division.
  const bySign = useMemo(() => {
    const map: Record<string, { label: string; retro: boolean; asc?: boolean }[]> = {};
    const add = (sign: string, entry: { label: string; retro: boolean; asc?: boolean }) => {
      (map[sign] ||= []).push(entry);
    };
    if (vedic.ascendant) add(division === "D1" ? vedic.ascendant.sign : vedic.ascendant.navamsaSign, { label: "Asc", retro: false, asc: true });
    for (const g of vedic.grahas) {
      add(division === "D1" ? g.sign : g.navamsaSign, { label: GRAHA_SHORT[g.name] ?? g.name.slice(0, 2), retro: g.retrograde && g.name !== "Rahu" && g.name !== "Ketu" });
    }
    return map;
  }, [vedic, division]);

  return (
    <div
      className="grid grid-cols-4 aspect-square w-full max-w-[340px] mx-auto"
      style={{ border: "0.5px solid rgba(201, 169, 97, 0.45)" }}
      role="img"
      aria-label={`South Indian ${division === "D1" ? "rasi" : "navamsa"} chart`}
    >
      {SOUTH_INDIAN_GRID.flatMap((row, r) =>
        row.map((sign, c) => {
          if (!sign) {
            // One merged centre cell carries the title.
            if (r === 1 && c === 1) {
              return (
                <div key="centre" className="flex flex-col items-center justify-center text-center px-2" style={{ gridRow: "2 / span 2", gridColumn: "2 / span 2" }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 17, color: "var(--foreground)" }}>
                    {division === "D1" ? "Rasi" : "Navamsa"}
                  </span>
                  <span className="text-[9px] tracking-[0.2em] uppercase mt-1" style={{ color: "var(--foreground-faint)" }}>
                    {division === "D1" ? "Birth chart · D1" : "Ninths · D9"}
                  </span>
                </div>
              );
            }
            return null;
          }
          const bodies = bySign[sign] || [];
          return (
            <div
              key={sign}
              className="relative p-1 flex flex-col"
              style={{ border: "0.5px solid rgba(201, 169, 97, 0.3)", gridRow: r + 1, gridColumn: c + 1 }}
            >
              <span className="text-[8px] tracking-[0.12em] uppercase" style={{ color: "var(--foreground-faint)" }}>{sign}</span>
              <div className="flex flex-wrap gap-x-1 leading-tight mt-0.5">
                {bodies.map((b, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-semibold"
                    style={{ color: b.asc ? "var(--brass)" : "var(--foreground)" }}
                  >
                    {b.label}{b.retro && <sup className="text-[7px] ml-px">R</sup>}
                  </span>
                ))}
              </div>
            </div>
          );
        }),
      )}
    </div>
  );
}

function GrahaRow({ b, secondary }: { b: VedicBody; secondary?: boolean }) {
  return (
    <tr style={{ opacity: secondary ? 0.55 : 1, borderTop: "0.5px solid var(--border-card)" }}>
      <td className="py-2 pr-2 text-[13px]" style={{ color: "var(--foreground)" }}>
        {b.name}
        {b.retrograde && b.name !== "Rahu" && b.name !== "Ketu" && <span className="text-[10px] ml-1" style={{ color: "var(--foreground-muted)" }}>R</span>}
      </td>
      <td className="py-2 pr-2 text-[12px]" style={{ color: "var(--foreground-secondary)" }}>
        {SIGN_FULL[b.sign] ?? b.sign} {formatDegreesMinutes(b.position)}
      </td>
      <td className="py-2 pr-2 text-[12px]" style={{ color: "var(--foreground-secondary)" }}>
        {b.nakshatra} <span style={{ color: "var(--foreground-faint)" }}>· {b.pada}</span>
      </td>
      <td className="py-2 pr-2 text-[12px] hidden sm:table-cell" style={{ color: "var(--foreground-muted)" }}>{b.nakshatraLord}</td>
      <td className="py-2 text-[12px]" style={{ color: "var(--foreground-muted)" }}>{SIGN_FULL[b.navamsaSign] ?? b.navamsaSign}</td>
    </tr>
  );
}

export default function VedicChartPanel({ vedic, now: nowProp }: { vedic: VedicDetails; now?: Date }) {
  const [division, setDivision] = useState<"D1" | "D9">("D1");
  // Fixed for the life of the panel so the dasha memo doesn't rerun every render.
  const [now] = useState(() => nowProp ?? new Date());

  const dasha = useMemo(() => {
    if (vedic.unknownTime) return null;
    const timeline = vimshottariDasha(vedic.moonLongitude, new Date(vedic.birthUtc));
    return { timeline, current: currentDasha(timeline, now), next: upcomingAntardashas(timeline, now, 6) };
  }, [vedic, now]);

  const moon = vedic.grahas.find((g) => g.name === "Moon");

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* System + birth star */}
      <div className="rounded-xl px-4 py-4" style={card}>
        <p className={eyebrow} style={{ color: "var(--brass)" }}>Sidereal · {vedic.ayanamsaLabel}</p>
        <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
          Ayanamsa {formatDegreesMinutes(vedic.ayanamsaDegrees)} at your birth · {HOUSE_SYSTEM_LABELS[vedic.houseSystem]} houses · {NODE_TYPE_LABELS[vedic.nodeType].toLowerCase()} for Rahu &amp; Ketu
        </p>
        {moon && (
          <p className="mt-3" style={{ fontFamily: "var(--font-heading)", fontSize: 19, color: "var(--foreground)" }}>
            Moon in {moon.nakshatra}, pada {moon.pada}
            <span className="block text-[11px] mt-0.5" style={{ fontFamily: "var(--font-body)", color: "var(--foreground-muted)" }}>
              Your birth nakshatra (janma nakshatra), ruled by {moon.nakshatraLord}
              {vedic.unknownTime && " — approximate, since your birth time is unknown"}
            </span>
          </p>
        )}
        {vedic.ascendant && (
          <p className="text-[12px] mt-2" style={{ color: "var(--foreground-secondary)" }}>
            Lagna (Ascendant): {SIGN_FULL[vedic.ascendant.sign]} {formatDegreesMinutes(vedic.ascendant.position)} · {vedic.ascendant.nakshatra} {vedic.ascendant.pada}
          </p>
        )}
      </div>

      {/* South Indian chart */}
      <div>
        <div className="flex gap-[5px] p-1 rounded-[13px] mb-3 max-w-[340px] mx-auto" style={{ background: "var(--background-card)" }}>
          {(["D1", "D9"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDivision(d)}
              aria-pressed={division === d}
              className="flex-1 py-[9px] rounded-[10px] text-[10px] tracking-[0.1em] uppercase font-bold transition-colors"
              style={{ background: division === d ? "var(--brass)" : "transparent", color: division === d ? "#1a1230" : "var(--foreground-muted)" }}
            >
              {d === "D1" ? "Rasi" : "Navamsa"}
            </button>
          ))}
        </div>
        <SouthIndianChart vedic={vedic} division={division} />
        {!vedic.ascendant && (
          <p className="text-[11px] text-center mt-2" style={{ color: "var(--foreground-muted)" }}>
            No Lagna shown — it needs an exact birth time.
          </p>
        )}
      </div>

      {/* Graha table */}
      <div>
        <p className={`${eyebrow} mb-2`} style={{ color: "var(--brass)" }}>Grahas</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] tracking-[0.15em] uppercase" style={{ color: "var(--foreground-faint)" }}>
                <th className="pb-1.5 pr-2 font-semibold">Graha</th>
                <th className="pb-1.5 pr-2 font-semibold">Sign</th>
                <th className="pb-1.5 pr-2 font-semibold">Nakshatra · pada</th>
                <th className="pb-1.5 pr-2 font-semibold hidden sm:table-cell">Lord</th>
                <th className="pb-1.5 font-semibold">Navamsa</th>
              </tr>
            </thead>
            <tbody>
              {vedic.grahas.map((g) => <GrahaRow key={g.name} b={g} />)}
              {vedic.outerPlanets.map((g) => <GrahaRow key={g.name} b={g} secondary />)}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] mt-2" style={{ color: "var(--foreground-faint)" }}>
          Uranus, Neptune and Pluto aren&apos;t grahas in classical Jyotish — they&apos;re shown faded for reference.
        </p>
      </div>

      {/* Vimshottari dasha */}
      <div className="rounded-xl px-4 py-4" style={card}>
        <p className={eyebrow} style={{ color: "var(--brass)" }}>Vimshottari dasha</p>
        {!dasha ? (
          <p className="text-[12px] mt-2 leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
            Dasha dates come from the Moon&apos;s exact degree at birth, which moves about half a degree an hour.
            Without a birth time they could be off by years, so they&apos;re not shown. Add your birth time to see them.
          </p>
        ) : (
          <>
            {dasha.current && (
              <div className="mt-2">
                <p style={{ fontFamily: "var(--font-heading)", fontSize: 20, color: "var(--foreground)" }}>
                  {dasha.current.maha.lord} · {dasha.current.antar.lord}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                  {dasha.current.maha.lord} mahadasha {monthYear(dasha.current.maha.start)} – {monthYear(dasha.current.maha.end)} ·
                  {" "}{dasha.current.antar.lord} antardasha until {monthYear(dasha.current.antar.end)}
                </p>
              </div>
            )}
            {dasha.next.length > 0 && (
              <div className="mt-4">
                <p className="text-[9px] tracking-[0.2em] uppercase font-semibold mb-1.5" style={{ color: "var(--foreground-faint)" }}>Coming up</p>
                <ul className="flex flex-col">
                  {dasha.next.map(({ maha, antar }) => (
                    <li key={`${maha}-${antar.lord}-${antar.start.getTime()}`} className="flex justify-between py-1.5 text-[12px]" style={{ borderTop: "0.5px solid var(--border-card)", color: "var(--foreground-secondary)" }}>
                      <span>{maha} · {antar.lord}</span>
                      <span style={{ color: "var(--foreground-muted)" }}>from {monthYear(antar.start)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <details className="mt-3">
              <summary className="text-[11px] cursor-pointer" style={{ color: "var(--brass)" }}>All mahadashas</summary>
              <ul className="flex flex-col mt-1.5">
                {dasha.timeline.mahadashas.map((m) => {
                  const active = dasha.current?.maha === m;
                  return (
                    <li key={m.start.getTime()} className="flex justify-between py-1 text-[12px]" style={{ color: active ? "var(--foreground)" : "var(--foreground-muted)", fontWeight: active ? 600 : 400 }}>
                      <span>{m.lord}</span>
                      <span>{monthYear(m.start)} – {monthYear(m.end)}</span>
                    </li>
                  );
                })}
              </ul>
            </details>
            <p className="text-[10px] mt-3 leading-relaxed" style={{ color: "var(--foreground-faint)" }}>
              Dashas describe which planet&apos;s themes are in the foreground — something to reflect on, not a forecast of events.
              Dates use a 365.25-day year; other software may differ by a few weeks.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
