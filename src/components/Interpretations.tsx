"use client";

/**
 * Interpretations component
 *
 * Shows a reading for the Big 3. Each card has:
 * - The placement label (e.g. "Sun in Gemini")
 * - A loading shimmer while the reading is being prepared
 * - The reading text once ready
 *
 * Two sources, and which one is a privacy decision, not a style one:
 * - Signed in AND agreed to AI → Dolly writes it (/api/chart/interpret).
 * - Anyone else — including everyone on chart/result before signup → a
 *   reading assembled on the device from Mapped's own library text
 *   (lib/bigThreeReading.ts). Nothing is sent anywhere.
 * Guideline 5.1.2(i): personal data reaches a third-party AI only after
 * explicit permission. The server refuses too; this just never asks it to.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { authedFetch } from "@/lib/authedFetch";
import { readAiConsent } from "@/lib/aiConsent";
import { composeBigThreeReading } from "@/lib/bigThreeReading";

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
  // Optional callback — called when Dolly's interpretations are loaded, so
  // the parent page can save them with the chart. Not called for the
  // in-house reading, which is rebuilt from the signs whenever it is needed.
  onLoaded?: (data: InterpretationData) => void;
  // Changes when the person signs in on the same page, so a reading shown
  // before signup can be replaced by Dolly's once they have agreed.
  signedIn?: boolean;
}

interface InterpretationData {
  sun: string;
  moon: string;
  rising: string;
}

export default function Interpretations({ name, bigThree, onLoaded, signedIn }: InterpretationsProps) {
  const [interpretations, setInterpretations] = useState<InterpretationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [byDolly, setByDolly] = useState(false);

  // The Big 3 never change, so the interpretation is stable — cache it and reuse
  // it instead of paying Claude to regenerate the same thing on every visit.
  const cacheKey = `mapped:big3-interp:${(name || "").trim().toLowerCase()}:${bigThree.sun}-${bigThree.moon}-${bigThree.rising}`;

  useEffect(() => {
    let cancelled = false;

    // Dolly's reading from an earlier visit, kept on this device. Showing it
    // sends nothing anywhere. (Only her readings are cached — the in-house
    // one is rebuilt instantly, and caching it would stop hers ever arriving.)
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as InterpretationData;
        if (parsed?.sun && parsed?.moon && parsed?.rising) {
          setInterpretations(parsed);
          setByDolly(true);
          setIsLoading(false);
          if (onLoaded) onLoaded(parsed);
          return;
        }
      }
    } catch { /* ignore bad cache */ }

    function showInHouseReading() {
      if (cancelled) return;
      setInterpretations(composeBigThreeReading(bigThree));
      setByDolly(false);
      setIsLoading(false);
    }

    async function load() {
      // No account, or no "yes" to AI: the in-house reading, and no request.
      const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
      if (!session?.user) return showInHouseReading();
      if ((await readAiConsent()) !== "granted") return showInHouseReading();

      try {
        const response = await authedFetch("/api/chart/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, bigThree }),
        });
        // A refusal (consent changed elsewhere, rate limit, outage) still
        // leaves them with a reading rather than an error card.
        if (!response.ok) return showInHouseReading();

        const data = await response.json();
        const got = data?.interpretations as InterpretationData | undefined;
        if (!got?.sun || !got?.moon || !got?.rising) return showInHouseReading();
        if (cancelled) return;
        setInterpretations(got);
        setByDolly(true);
        setIsLoading(false);
        try { localStorage.setItem(cacheKey, JSON.stringify(got)); } catch { /* quota */ }
        if (onLoaded) onLoaded(got);
      } catch {
        showInHouseReading();
      }
    }

    void load();
    return () => { cancelled = true; };
    // Keyed on the stable cacheKey (name + Big 3), not the bigThree object
    // reference, so it doesn't re-fire — or re-pay — on re-render. signedIn
    // re-runs it once after signing in on this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, signedIn]);

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
      {!isLoading && !byDolly && (
        <p className="text-muted text-xs -mt-3 mb-1">
          From Mapped&rsquo;s library. With an account and Dolly switched on, she can write one
          that&rsquo;s yours alone.
        </p>
      )}

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
