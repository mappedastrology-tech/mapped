"use client";

/**
 * Interpretations component
 *
 * Fetches and displays Claude's personalized interpretations for the Big 3.
 * Each interpretation card has:
 * - The placement label (e.g. "Sun in Gemini")
 * - A loading shimmer while Claude is writing
 * - The interpretation text once ready
 */

import { useEffect, useState } from "react";

const SIGN_FULL: Record<string, string> = {
  Ari: "Aries", Tau: "Taurus", Gem: "Gemini", Can: "Cancer",
  Leo: "Leo", Vir: "Virgo", Lib: "Libra", Sco: "Scorpio",
  Sag: "Sagittarius", Cap: "Capricorn", Aqu: "Aquarius", Pis: "Pisces",
};

// Element-based accent colors
function accentColor(sign: string): string {
  if (["Ari", "Leo", "Sag"].includes(sign)) return "terracotta";
  if (["Tau", "Vir", "Cap"].includes(sign)) return "sage";
  if (["Gem", "Lib", "Aqu"].includes(sign)) return "amber";
  return "ink";
}

interface InterpretationsProps {
  name: string;
  bigThree: {
    sun: string;
    moon: string;
    rising: string;
  };
  // Optional callback — called when interpretations are loaded,
  // so the parent page can save them with the chart
  onLoaded?: (data: InterpretationData) => void;
}

interface InterpretationData {
  sun: string;
  moon: string;
  rising: string;
}

export default function Interpretations({ name, bigThree, onLoaded }: InterpretationsProps) {
  const [interpretations, setInterpretations] = useState<InterpretationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInterpretations() {
      try {
        const response = await fetch("/api/chart/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, bigThree }),
        });

        if (!response.ok) {
          throw new Error("Failed to load interpretations.");
        }

        const data = await response.json();
        setInterpretations(data.interpretations);
        if (onLoaded) onLoaded(data.interpretations);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInterpretations();
  }, [name, bigThree]);

  const placements = [
    { key: "sun" as const, label: "Sun", sign: bigThree.sun, icon: "\u2609" },
    { key: "moon" as const, label: "Moon", sign: bigThree.moon, icon: "\u263D" },
    { key: "rising" as const, label: "Rising", sign: bigThree.rising, icon: "ASC" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2
        className="text-xl text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Your Big 3
      </h2>
      <p className="text-muted text-sm -mt-2 mb-2">
        The three placements that shape your core self.
      </p>

      {placements.map(({ key, label, sign, icon }) => {
        const color = accentColor(sign);

        return (
          <div
            key={key}
            className="rounded-2xl bg-surface border border-foreground/15 p-5"
          >
            {/* Placement header */}
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`text-${color} text-xl`}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {icon}
              </span>
              <div>
                <span className={`text-${color} font-semibold text-sm`}>
                  {label} in {SIGN_FULL[sign] || sign}
                </span>
              </div>
            </div>

            {/* Interpretation text or loading state */}
            {isLoading ? (
              // Shimmer loading animation — three lines that pulse
              <div className="flex flex-col gap-2">
                <div className="h-3 bg-foreground/5 rounded-full animate-pulse w-full" />
                <div className="h-3 bg-foreground/5 rounded-full animate-pulse w-11/12" />
                <div className="h-3 bg-foreground/5 rounded-full animate-pulse w-4/5" />
                <div className="h-3 bg-foreground/5 rounded-full animate-pulse w-9/12" />
              </div>
            ) : error ? (
              <p className="text-terracotta/70 text-sm">{error}</p>
            ) : interpretations ? (
              <p className="text-secondary text-sm leading-relaxed">
                {interpretations[key]}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
