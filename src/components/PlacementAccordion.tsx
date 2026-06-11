"use client";

/**
 * PlacementAccordion — a single planet row that expands inline
 * to show Dolly's interpretation from the knowledge base.
 *
 * Layout priority:
 *   1. Dignity badge (if applicable) — domicile/exalted/detriment/fall
 *   2. Planet in Sign (hero section) — the main interpretation
 *   3. Life markers (fame, fortune, marriage, etc.) — special callouts
 *   4. Retrograde interpretation (if natal Rx)
 *   5. House context — one compact note combining planet-in-house + sign-on-house
 */

import { useEffect, useState, useRef } from "react";
import { SIGN_NAMES } from "@/components/ChartWheel";
import InfoTip from "@/components/InfoTip";
import { getGlossaryEntry } from "@/lib/glossary";
import {
  fetchPlacementKnowledge,
  SIGN_FULL,
  type PlanetInSign,
  type PlanetInHouse,
  type SignOnHouse,
  type Dignity,
  type LifeMarker,
  type Retrograde,
} from "@/lib/knowledge";

interface PlacementAccordionProps {
  planetName: string;
  planetSymbol: string;
  sign: string;
  position: number;
  house: string | number | null;
  retrograde: boolean;
  isOpen: boolean;
  onToggle: () => void;
  /** Small inline tags like "CHART RULER", "LORD OF THE YEAR", "SECT LIGHT" */
  tags?: string[];
}

function elementColor(sign: string): string {
  if (["Ari", "Leo", "Sag"].includes(sign)) return "text-terracotta";
  if (["Tau", "Vir", "Cap"].includes(sign)) return "text-sage";
  if (["Gem", "Lib", "Aqu"].includes(sign)) return "text-lavender";
  return "text-lavender-light";
}

function formatHouse(house: string | number | null): string {
  if (house == null) return "";
  // house can be a number (1-12) from calculateChart or a string like "First_House"
  if (typeof house === "number") {
    const ordinals: Record<number, string> = {
      1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th",
      7: "7th", 8: "8th", 9: "9th", 10: "10th", 11: "11th", 12: "12th",
    };
    return `${ordinals[house] || house} House`;
  }
  const ordinals: Record<string, string> = {
    First: "1st", Second: "2nd", Third: "3rd", Fourth: "4th",
    Fifth: "5th", Sixth: "6th", Seventh: "7th", Eighth: "8th",
    Ninth: "9th", Tenth: "10th", Eleventh: "11th", Twelfth: "12th",
  };
  const word = String(house).split("_")[0];
  return `${ordinals[word] || word} House`;
}

const ORDINALS: Record<number, string> = {
  1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th",
  7: "7th", 8: "8th", 9: "9th", 10: "10th", 11: "11th", 12: "12th",
};

const DIGNITY_COLORS: Record<string, { bg: string; text: string }> = {
  domicile: { bg: "bg-sage/20", text: "text-sage" },
  exalted: { bg: "bg-amber/20", text: "text-amber" },
  detriment: { bg: "bg-terracotta/15", text: "text-terracotta/70" },
  fall: { bg: "bg-lavender/10", text: "placement-card-text-secondary" },
};

const DIGNITY_LABELS: Record<string, string> = {
  domicile: "At Home",
  exalted: "Exalted",
  detriment: "In Detriment",
  fall: "In Fall",
};

const MARKER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  fame: { bg: "bg-amber/10", text: "text-amber", border: "border-amber/20" },
  fortune: { bg: "bg-sage/10", text: "text-sage", border: "border-sage/20" },
  marriage: { bg: "bg-terracotta/10", text: "text-terracotta", border: "border-terracotta/20" },
  psychic: { bg: "bg-ink/10", text: "text-ink", border: "border-ink/20" },
  healing: { bg: "bg-sage/10", text: "text-sage", border: "border-sage/20" },
  leadership: { bg: "bg-terracotta/10", text: "text-terracotta", border: "border-terracotta/20" },
  creativity: { bg: "bg-amber/10", text: "text-amber", border: "border-amber/20" },
  karmic: { bg: "bg-lavender/10", text: "placement-card-text-secondary", border: "border-lavender/20" },
};

export default function PlacementAccordion({
  planetName,
  planetSymbol,
  sign,
  position,
  house,
  retrograde,
  isOpen,
  onToggle,
  tags,
}: PlacementAccordionProps) {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [pisData, setPisData] = useState<PlanetInSign | null>(null);
  const [pihData, setPihData] = useState<PlanetInHouse | null>(null);
  const [sohData, setSohData] = useState<SignOnHouse | null>(null);
  const [houseNum, setHouseNum] = useState<number | null>(null);
  const [dignity, setDignity] = useState<Dignity | null>(null);
  const [markers, setMarkers] = useState<LifeMarker[]>([]);
  const [rxData, setRxData] = useState<Retrograde | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const signFull = SIGN_FULL[sign] || sign;
  const color = elementColor(sign);

  // Scroll the header into view when opened
  useEffect(() => {
    if (isOpen && headerRef.current) {
      setTimeout(() => {
        headerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !loaded && !loading) {
      setLoading(true);
      fetchPlacementKnowledge(planetName, sign, house, retrograde).then((result) => {
        setPisData(result.planetInSign);
        setPihData(result.planetInHouse);
        setSohData(result.signOnHouse);
        setHouseNum(result.houseNumber);
        setDignity(result.dignity);
        setMarkers(result.lifeMarkers);
        setRxData(result.retrograde);
        setLoading(false);
        setLoaded(true);
      });
    }
  }, [isOpen, loaded, loading, planetName, sign, house, retrograde]);

  const shimmer = (
    <div className="flex flex-col gap-2">
      <div className="h-3 bg-lavender/10 rounded-full animate-pulse w-full" />
      <div className="h-3 bg-lavender/10 rounded-full animate-pulse w-11/12" />
      <div className="h-3 bg-lavender/10 rounded-full animate-pulse w-4/5" />
    </div>
  );

  return (
    <div
      ref={headerRef}
      className="placement-card transition-colors duration-200"
    >
      {/* Header row */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between py-3 px-4 w-full text-left
                   active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-3">
          <span className={`text-lg ${color}`} style={{ fontFamily: "var(--font-heading)" }}>
            {planetSymbol}
          </span>
          <span className="text-sm font-medium placement-card-text">
            {planetName}
            {retrograde && (
              <span className="text-lavender text-xs ml-1">R</span>
            )}
          </span>
          {tags && tags.length > 0 && (
            <span className="flex gap-1 ml-1">
              {tags.map(tag => (
                <span key={tag} className="text-[9px] uppercase tracking-wider font-bold text-lavender bg-lavender/10 px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className={`text-sm font-medium ${color}`}>
              {SIGN_NAMES[sign] || sign}
            </span>
            <span className="text-xs ml-2 placement-card-text-secondary">
              {position.toFixed(0)}&deg;
              {house && ` · ${formatHouse(house)}`}
            </span>
          </div>
          <svg
            className={`w-4 h-4 placement-card-text-muted flex-shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* Expandable content */}
      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-3 mb-3 px-4 pb-5 pt-4 placement-card-expanded">
          <div className="h-px bg-lavender/15 mb-5" />

          {loading ? (
            <div className="flex flex-col gap-4">{shimmer}{shimmer}</div>
          ) : (
            <div className="flex flex-col">

              {/* ━━━ DIGNITY BADGE ━━━ */}
              {dignity && (() => {
                const g = getGlossaryEntry(dignity.dignity_type === "fall" ? "In Fall" : dignity.dignity_type.charAt(0).toUpperCase() + dignity.dignity_type.slice(1));
                return (
                  <div className="inline-flex self-start items-center mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                      ${DIGNITY_COLORS[dignity.dignity_type]?.bg || "bg-foreground/5"}
                      ${DIGNITY_COLORS[dignity.dignity_type]?.text || "text-secondary"}`}
                    >
                      <span className="text-[10px] uppercase tracking-widest font-semibold">
                        {DIGNITY_LABELS[dignity.dignity_type] || dignity.dignity_type}
                      </span>
                    </span>
                    {g && <InfoTip term={g.term} explanation={g.short} />}
                  </div>
                );
              })()}

              {/* ━━━ HERO: Planet in Sign ━━━ */}
              {pisData && (
                <section>
                  <span className="flex items-center placement-card-text-secondary text-[10px] uppercase tracking-widest mb-1">
                    The sign
                    <InfoTip term="Sign" explanation={getGlossaryEntry("Sign")?.short || ""} />
                  </span>
                  <h3
                    className={`text-xl ${color} mb-3`}
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {planetName} in {signFull}
                  </h3>
                  <p className="placement-card-text text-[15px] leading-relaxed mb-5">
                    {pisData.summary}
                  </p>

                  {/* Dignity explanation (if present) */}
                  {dignity && (
                    <div className={`rounded-lg border px-3 py-2.5 mb-5
                      ${DIGNITY_COLORS[dignity.dignity_type]?.bg || "bg-foreground/5"}
                      border-lavender/15`}
                    >
                      <p className="placement-card-text-secondary text-sm leading-relaxed">
                        {dignity.what_it_means}
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className={`${color} text-[11px] uppercase tracking-widest mb-1.5 font-semibold opacity-80`}>
                      Life patterns
                    </p>
                    <p className="placement-card-text-secondary text-sm leading-relaxed">
                      {pisData.life_patterns}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className={`${color} text-[11px] uppercase tracking-widest mb-1.5 font-semibold opacity-80`}>
                      In relationships
                    </p>
                    <p className="placement-card-text-secondary text-sm leading-relaxed">
                      {pisData.relationships}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="placement-card-text-secondary text-[11px] uppercase tracking-widest mb-1.5 font-semibold">
                        The shadow
                      </p>
                      <p className="placement-card-text-secondary text-sm leading-relaxed">
                        {pisData.challenges}
                      </p>
                    </div>
                    <div>
                      <p className={`${color} text-[11px] uppercase tracking-widest mb-1.5 font-semibold opacity-80`}>
                        Where you grow
                      </p>
                      <p className="placement-card-text-secondary text-sm leading-relaxed">
                        {pisData.growth}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* ━━━ LIFE MARKERS ━━━ */}
              {markers.length > 0 && (
                <div className="mt-6 pt-5 border-t border-lavender/15">
                  <span className="flex items-center placement-card-text-secondary text-[10px] uppercase tracking-widest mb-3">
                    Special in your chart
                  </span>
                  <div className="flex flex-col gap-3">
                    {markers.map((m, i) => {
                      const mColor = MARKER_COLORS[m.marker_type] || MARKER_COLORS.karmic;
                      return (
                        <div
                          key={i}
                          className={`rounded-lg border px-3 py-3 ${mColor.bg} ${mColor.border}`}
                        >
                          <div className="flex items-center gap-1 mb-1.5">
                            <span className={`text-[10px] uppercase tracking-widest font-bold ${mColor.text}`}>
                              {m.label}
                            </span>
                            {(() => {
                              const g = getGlossaryEntry(m.label) || getGlossaryEntry(m.marker_type.charAt(0).toUpperCase() + m.marker_type.slice(1) + " Marker");
                              return g ? <InfoTip term={g.term} explanation={g.short} /> : null;
                            })()}
                          </div>
                          <p className="placement-card-text-secondary text-sm leading-relaxed">
                            {m.summary}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ━━━ RETROGRADE ━━━ */}
              {rxData && (
                <div className="mt-6 pt-5 border-t border-lavender/15">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lavender text-xs font-bold">R</span>
                    <span className="flex items-center placement-card-text-secondary text-[10px] uppercase tracking-widest">
                      Natal retrograde
                      <InfoTip term="Retrograde" explanation={getGlossaryEntry("Retrograde")?.short || ""} />
                    </span>
                  </div>
                  <p className="placement-card-text-secondary text-sm leading-relaxed mb-3">
                    {rxData.summary}
                  </p>
                  <div className="mb-3">
                    <p className="placement-card-text-secondary text-[10px] uppercase tracking-widest mb-1 font-semibold">
                      How it shows up
                    </p>
                    <p className="placement-card-text-secondary text-xs leading-relaxed">
                      {rxData.life_patterns}
                    </p>
                  </div>
                  <div>
                    <p className={`${color} text-[10px] uppercase tracking-widest mb-1 font-semibold opacity-70`}>
                      Working with it
                    </p>
                    <p className="placement-card-text-secondary text-xs leading-relaxed">
                      {rxData.growth}
                    </p>
                  </div>
                </div>
              )}

              {/* ━━━ HOUSE CONTEXT (single compact note) ━━━ */}
              {houseNum && (pihData || sohData) && (
                <div className="mt-6 pt-5 border-t border-lavender/15">
                  <span className="flex items-center placement-card-text-secondary text-[10px] uppercase tracking-widest mb-2">
                    Where it plays out · {ORDINALS[houseNum]} house
                    <InfoTip term="House" explanation={getGlossaryEntry("House")?.short || ""} />
                  </span>
                  <p className="placement-card-text-secondary text-xs leading-relaxed">
                    {pihData?.summary}
                    {pihData && sohData ? " " : ""}
                    {sohData?.approach}
                  </p>
                </div>
              )}

              {/* No data fallback */}
              {!pisData && !pihData && !sohData && !loading && (
                <p className="placement-card-text-secondary text-sm">
                  No interpretation available for this placement yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
