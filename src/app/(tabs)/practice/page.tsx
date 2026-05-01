"use client";

import { useState, useMemo, useCallback } from "react";
import { getDailyEnergy, getMoonPhaseImage } from "@/lib/celestialCalendar";
import Image from "next/image";
import {
  getAllCompletions,
  getCompletionsSince,
  calculateSeasonalCycles,
  calculateZodiacSeasons,
  calculateTransitsWitnessed,
  generateWeeklyReport,
  generateMonthlyReport,
  detectPractitionerType,
  markCycleAsRest,
  type CompletionRecord,
} from "@/lib/feedback";
import {
  getCustomRituals,
  deleteCustomRitual,
  toggleRitualRotation,
  type CustomRitual,
} from "@/lib/customRituals";
import Link from "next/link";

export default function PracticePage() {
  // All the original data loading
  const today = useMemo(() => new Date(), []);
  const energy = useMemo(() => getDailyEnergy(today), [today]);
  const completions = useMemo(() => getAllCompletions(), []);
  const recentCompletions = useMemo(() => getCompletionsSince(28), []);
  const seasonalCycles = useMemo(() => calculateSeasonalCycles(), []);
  const zodiacSeasons = useMemo(() => calculateZodiacSeasons(), []);
  const transits = useMemo(() => calculateTransitsWitnessed(), []);
  const weeklyReport = useMemo(() => generateWeeklyReport(), []);
  const monthlyReport = useMemo(() => generateMonthlyReport(), []);
  const practitionerType = useMemo(() => detectPractitionerType(completions), [completions]);

  const [showReport, setShowReport] = useState<"weekly" | "monthly" | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [customRituals, setCustomRituals] = useState<CustomRitual[]>(() => getCustomRituals());
  const [expandedRitual, setExpandedRitual] = useState<string | null>(null);

  const refreshCustomRituals = useCallback(() => {
    setCustomRituals(getCustomRituals());
  }, []);

  // Simple wizard toggle — same as minimal test
  if (showWizard) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>It worked!</h2>
        <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 24 }}>
          Imports + useMemo all loaded. State change didn&apos;t crash.
        </p>
        <p style={{ fontSize: 12, opacity: 0.4, marginBottom: 24 }}>
          Moon: {energy.moonPhase.label} | Completions: {completions.length}
        </p>
        <button
          onClick={() => setShowWizard(false)}
          style={{ padding: "10px 24px", borderRadius: 12, border: "1px solid #ccc", background: "none", fontSize: 14 }}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>My Practice</h1>
      <p style={{ fontSize: 12, color: "red", marginBottom: 16 }}>BUILD: may1-v8-imports-test</p>
      <p style={{ fontSize: 12, opacity: 0.5, marginBottom: 16 }}>
        Moon: {energy.moonPhase.label} | Completions: {completions.length}
      </p>
      <button
        onClick={() => setShowWizard(true)}
        style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid #ccc", background: "none", fontSize: 14, cursor: "pointer" }}
      >
        + Create a custom ritual
      </button>
    </div>
  );
}
