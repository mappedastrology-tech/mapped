"use client";

/**
 * Chart Results Page
 *
 * The full flow on this page:
 * 1. Show the chart wheel, Big 3 pills, all placements
 * 2. Fetch Claude interpretations in the background
 * 3. Show auth prompt to save the chart
 * 4. After auth, save chart + interpretations to Supabase
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ChartWheel, { SIGN_NAMES } from "@/components/ChartWheel";
import Interpretations from "@/components/Interpretations";
import AuthModal from "@/components/AuthModal";
import { saveChart } from "@/lib/saveChart";
import { supabase } from "@/lib/supabase";

// Types for chart data (matches what our Python script returns)
interface Planet {
  name: string;
  sign: string;
  signNum: number;
  position: number;
  absPosition: number;
  house: string | null;
  retrograde: boolean;
}

interface House {
  number: number;
  sign: string;
  signNum: number;
  position: number;
  absPosition: number;
}

interface ChartData {
  name: string;
  birthDate: string;
  birthTime: string;
  unknownTime: boolean;
  cityName: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  bigThree: {
    sun: string;
    moon: string;
    rising: string;
  };
  planets: Planet[];
  houses: House[];
  aspects: Array<{
    p1Name: string;
    p2Name: string;
    aspect: string;
    orbit: number;
    aspectDegrees: number;
  }>;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "\u2609", Moon: "\u263D", Mercury: "\u263F", Venus: "\u2640",
  Mars: "\u2642", Jupiter: "\u2643", Saturn: "\u2644", Uranus: "\u2645",
  Neptune: "\u2646", Pluto: "\u2647",
};

function elementColor(sign: string): string {
  if (["Ari", "Leo", "Sag"].includes(sign)) return "text-terracotta";
  if (["Tau", "Vir", "Cap"].includes(sign)) return "text-sage";
  if (["Gem", "Lib", "Aqu"].includes(sign)) return "text-amber";
  return "text-lavender";
}

function elementBg(sign: string): string {
  if (["Ari", "Leo", "Sag"].includes(sign)) return "bg-terracotta/15 border-terracotta/25";
  if (["Tau", "Vir", "Cap"].includes(sign)) return "bg-sage/15 border-sage/25";
  if (["Gem", "Lib", "Aqu"].includes(sign)) return "bg-amber/15 border-amber/25";
  return "bg-lavender/15 border-lavender/25";
}

function formatHouse(house: string | number | null): string {
  if (house == null) return "";
  if (typeof house === "number") {
    const ord: Record<number, string> = {
      1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th",
      7: "7th", 8: "8th", 9: "9th", 10: "10th", 11: "11th", 12: "12th",
    };
    return `${ord[house] || house} House`;
  }
  const ordinals: Record<string, string> = {
    First: "1st", Second: "2nd", Third: "3rd", Fourth: "4th",
    Fifth: "5th", Sixth: "6th", Seventh: "7th", Eighth: "8th",
    Ninth: "9th", Tenth: "10th", Eleventh: "11th", Twelfth: "12th",
  };
  const word = String(house).split("_")[0];
  return `${ordinals[word] || word} House`;
}

export default function ChartResult() {
  const router = useRouter();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Store interpretations so we can save them with the chart
  const [interpretations, setInterpretations] = useState<{
    sun: string; moon: string; rising: string;
  } | null>(null);

  // Load chart data from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("chartResult");
    if (stored) {
      setChartData(JSON.parse(stored));
    } else {
      router.push("/chart/new");
    }
  }, [router]);

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
    });
  }, []);

  // Save chart after authentication
  const handleSave = useCallback(async (uid: string) => {
    if (!chartData || isSaving || isSaved) return;

    setIsSaving(true);
    setSaveError("");

    try {
      await saveChart(uid, chartData, interpretations);
      setIsSaved(true);
      // Clean up sessionStorage since it's now in the database
      sessionStorage.removeItem("chartResult");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  }, [chartData, interpretations, isSaving, isSaved]);

  // Called when user authenticates
  function handleAuthenticated(uid: string) {
    setUserId(uid);
    handleSave(uid);
  }

  if (!chartData) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" />
      </main>
    );
  }

  const { name, bigThree, planets, houses, unknownTime } = chartData;

  return (
    <main className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-muted text-xs uppercase tracking-widest mb-2">
          Natal Chart
        </p>
        <h1
          className="text-3xl text-foreground mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {name}
        </h1>
        <p className="text-muted text-sm">
          {chartData.birthDate} &middot; {chartData.birthTime}
          {unknownTime && " (approx)"}
        </p>
      </div>

      {/* Chart Wheel — the hero visual */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-terracotta/5 rounded-full blur-2xl" />
        <ChartWheel planets={planets} houses={houses} />
      </div>

      {/* Big 3 pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {[
          { label: "Sun", sign: bigThree.sun },
          { label: "Moon", sign: bigThree.moon },
          { label: "Rising", sign: bigThree.rising },
        ].map(({ label, sign }) => (
          <div
            key={label}
            className={`px-4 py-2 rounded-full border text-sm font-medium ${elementBg(sign)}`}
          >
            <span className="text-muted">{label}</span>
            <span className="text-muted mx-1.5">&middot;</span>
            <span className={elementColor(sign)}>{SIGN_NAMES[sign] || sign}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 h-px bg-foreground/10" />
        <span className="text-terracotta/40 text-lg">&#x2609;</span>
        <div className="flex-1 h-px bg-foreground/10" />
      </div>

      {/* Planetary placements */}
      <h2
        className="text-xl text-foreground mb-4"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Your placements
      </h2>

      <div className="flex flex-col gap-2 mb-10">
        {planets.map((planet) => (
          <div
            key={planet.name}
            className="flex items-center justify-between py-3 px-4 rounded-xl
                       bg-card/50 border border-foreground/15"
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-lg ${elementColor(planet.sign)}`}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {PLANET_SYMBOLS[planet.name] || "?"}
              </span>
              <span className="text-foreground text-sm font-medium">
                {planet.name}
                {planet.retrograde && (
                  <span className="text-terracotta/60 text-xs ml-1">R</span>
                )}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-sm font-medium ${elementColor(planet.sign)}`}>
                {SIGN_NAMES[planet.sign] || planet.sign}
              </span>
              <span className="text-muted text-xs ml-2">
                {planet.position.toFixed(0)}&deg;
                {planet.house && ` · ${formatHouse(planet.house)}`}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Claude-powered interpretations */}
      <Interpretations
        name={name}
        bigThree={bigThree}
        onLoaded={(data) => setInterpretations(data)}
      />

      {/* Divider before auth */}
      <div className="flex items-center gap-3 my-8">
        <div className="flex-1 h-px bg-foreground/10" />
        <span className="text-terracotta/40 text-lg">&#x263D;</span>
        <div className="flex-1 h-px bg-foreground/10" />
      </div>

      {/* Auth + Save section */}
      {isSaved ? (
        // Success state
        <div className="text-center py-8 rounded-2xl bg-sage/10 border border-sage/20">
          <p className="text-sage text-lg mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Chart saved
          </p>
          <p className="text-muted text-sm">
            Your chart is safe. Come back anytime.
          </p>
        </div>
      ) : userId ? (
        // Already logged in — just show a save button
        <div className="text-center">
          {saveError && (
            <p className="text-terracotta text-sm mb-3">{saveError}</p>
          )}
          <button
            onClick={() => handleSave(userId)}
            disabled={isSaving}
            className="px-8 py-3 rounded-full bg-terracotta text-cream font-semibold text-sm
                       tracking-wide hover:bg-terracotta-light active:scale-[0.98]
                       transition-all duration-200 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" role="status" aria-label="Loading" />
                Saving...
              </span>
            ) : (
              "Save my chart"
            )}
          </button>
        </div>
      ) : (
        // Not logged in — show auth form
        <AuthModal
          onAuthenticated={handleAuthenticated}
          defaultName={name}
        />
      )}

      {/* Bottom spacing */}
      <div className="h-12" />
    </main>
  );
}
