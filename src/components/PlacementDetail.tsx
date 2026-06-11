"use client";

/**
 * PlacementDetail — slide-up sheet showing Dolly's full interpretation
 * for a tapped placement.
 *
 * Shows up to three sections:
 *   1. Planet in Sign  (e.g. "Sun in Aries")
 *   2. Planet in House  (e.g. "Sun in the 1st House")
 *   3. Sign on House   (e.g. "Aries on the 1st House")
 */

import { useEffect, useState, useCallback } from "react";
import {
  fetchPlacementKnowledge,
  SIGN_FULL,
  type PlanetInSign,
  type PlanetInHouse,
  type SignOnHouse,
} from "@/lib/knowledge";

interface PlacementDetailProps {
  planet: string;
  sign: string;
  house: string | null;
  onClose: () => void;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "\u2609", Moon: "\u263D", Mercury: "\u263F", Venus: "\u2640",
  Mars: "\u2642", Jupiter: "\u2643", Saturn: "\u2644", Uranus: "\u2645",
  Neptune: "\u2646", Pluto: "\u2647",
};

function elementAccent(sign: string): string {
  if (["Ari", "Leo", "Sag"].includes(sign)) return "terracotta";
  if (["Tau", "Vir", "Cap"].includes(sign)) return "sage";
  if (["Gem", "Lib", "Aqu"].includes(sign)) return "amber";
  return "ink";
}

const ORDINALS: Record<number, string> = {
  1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th",
  7: "7th", 8: "8th", 9: "9th", 10: "10th", 11: "11th", 12: "12th",
};

export default function PlacementDetail({ planet, sign, house, onClose }: PlacementDetailProps) {
  const [loading, setLoading] = useState(true);
  const [pisData, setPisData] = useState<PlanetInSign | null>(null);
  const [pihData, setPihData] = useState<PlanetInHouse | null>(null);
  const [sohData, setSohData] = useState<SignOnHouse | null>(null);
  const [houseNum, setHouseNum] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  const signFull = SIGN_FULL[sign] || sign;
  const accent = elementAccent(sign);

  useEffect(() => {
    // Trigger slide-up animation
    requestAnimationFrame(() => setVisible(true));

    async function load() {
      const result = await fetchPlacementKnowledge(planet, sign, house);
      setPisData(result.planetInSign);
      setPihData(result.planetInHouse);
      setSohData(result.signOnHouse);
      setHouseNum(result.houseNumber);
      setLoading(false);
    }
    load();
  }, [planet, sign, house]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  // Close on backdrop tap
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) handleClose();
    },
    [handleClose]
  );

  const shimmer = (
    <div className="flex flex-col gap-2 mt-2">
      <div className="h-3 bg-foreground/5 rounded-full animate-pulse w-full" />
      <div className="h-3 bg-foreground/5 rounded-full animate-pulse w-11/12" />
      <div className="h-3 bg-foreground/5 rounded-full animate-pulse w-4/5" />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center transition-colors duration-300"
      style={{ backgroundColor: visible ? "var(--modal-overlay)" : "transparent" }}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-lg bg-background rounded-t-3xl border-t border-foreground/18
                     transition-transform duration-300 ease-out
                     ${visible ? "translate-y-0" : "translate-y-full"}
                     max-h-[85vh] overflow-y-auto`}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-foreground/20" />
        </div>

        <div className="px-6 pb-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pt-2">
            <span
              className={`text-${accent} text-2xl`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {PLANET_SYMBOLS[planet] || "?"}
            </span>
            <div>
              <h2
                className="text-xl text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {planet} in {signFull}
              </h2>
              {houseNum && (
                <p className="text-secondary text-sm">
                  {ORDINALS[houseNum]} House
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col gap-6">
              {shimmer}
              {shimmer}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Section 1: Planet in Sign */}
              {pisData && (
                <section>
                  <h3 className={`text-${accent} text-xs uppercase tracking-widest mb-3 font-semibold`}>
                    {planet} in {signFull}
                  </h3>
                  <p className="text-secondary text-sm leading-relaxed mb-4">
                    {pisData.summary}
                  </p>

                  <div className="rounded-xl bg-card/50 border border-foreground/15 p-4 mb-3">
                    <p className={`text-${accent} text-xs uppercase tracking-widest mb-2 font-semibold`}>
                      Life patterns
                    </p>
                    <p className="text-secondary text-sm leading-relaxed">
                      {pisData.life_patterns}
                    </p>
                  </div>

                  <div className="rounded-xl bg-card/50 border border-foreground/15 p-4 mb-3">
                    <p className={`text-${accent} text-xs uppercase tracking-widest mb-2 font-semibold`}>
                      Relationships
                    </p>
                    <p className="text-secondary text-sm leading-relaxed">
                      {pisData.relationships}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-card/50 border border-foreground/15 p-4">
                      <p className="text-secondary text-xs uppercase tracking-widest mb-2 font-semibold">
                        Challenges
                      </p>
                      <p className="text-secondary text-sm leading-relaxed">
                        {pisData.challenges}
                      </p>
                    </div>
                    <div className="rounded-xl bg-card/50 border border-foreground/15 p-4">
                      <p className={`text-${accent} text-xs uppercase tracking-widest mb-2 font-semibold`}>
                        Growth
                      </p>
                      <p className="text-secondary text-sm leading-relaxed">
                        {pisData.growth}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Section 2: Planet in House */}
              {pihData && houseNum && (
                <section>
                  <div className="h-px bg-foreground/8 mb-6" />
                  <h3 className={`text-${accent} text-xs uppercase tracking-widest mb-3 font-semibold`}>
                    {planet} in the {ORDINALS[houseNum]} House
                  </h3>
                  <p className="text-secondary text-sm leading-relaxed mb-4">
                    {pihData.summary}
                  </p>

                  <div className="rounded-xl bg-card/50 border border-foreground/15 p-4 mb-3">
                    <p className={`text-${accent} text-xs uppercase tracking-widest mb-2 font-semibold`}>
                      Life patterns
                    </p>
                    <p className="text-secondary text-sm leading-relaxed">
                      {pihData.life_patterns}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-card/50 border border-foreground/15 p-4">
                      <p className={`text-${accent} text-xs uppercase tracking-widest mb-2 font-semibold`}>
                        Strengths
                      </p>
                      <p className="text-secondary text-sm leading-relaxed">
                        {pihData.strengths}
                      </p>
                    </div>
                    <div className="rounded-xl bg-card/50 border border-foreground/15 p-4">
                      <p className="text-secondary text-xs uppercase tracking-widest mb-2 font-semibold">
                        Challenges
                      </p>
                      <p className="text-secondary text-sm leading-relaxed">
                        {pihData.challenges}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Section 3: Sign on House */}
              {sohData && houseNum && (
                <section>
                  <div className="h-px bg-foreground/8 mb-6" />
                  <h3 className={`text-${accent} text-xs uppercase tracking-widest mb-3 font-semibold`}>
                    {signFull} on the {ORDINALS[houseNum]} House
                  </h3>
                  <p className="text-secondary text-sm leading-relaxed mb-4">
                    {sohData.summary}
                  </p>

                  <div className="rounded-xl bg-card/50 border border-foreground/15 p-4">
                    <p className={`text-${accent} text-xs uppercase tracking-widest mb-2 font-semibold`}>
                      Your approach
                    </p>
                    <p className="text-secondary text-sm leading-relaxed">
                      {sohData.approach}
                    </p>
                  </div>
                </section>
              )}

              {/* No data fallback */}
              {!pisData && !pihData && !sohData && (
                <p className="text-secondary text-sm">
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
