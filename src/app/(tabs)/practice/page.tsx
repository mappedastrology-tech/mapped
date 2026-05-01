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

  // ─── Wizard ──────────────────────────────────────────────────────────
  if (showWizard) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>It worked!</h2>
        <button
          onClick={() => setShowWizard(false)}
          style={{ padding: "10px 24px", borderRadius: 12, border: "1px solid #ccc", background: "none", fontSize: 14 }}
        >
          Back
        </button>
      </div>
    );
  }

  // ─── Full page rendering (original JSX) ──────────────────────────────
  return (
    <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full pb-28">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          My Practice
        </h1>
      </div>
      <p className="text-foreground/40 text-sm mb-6">Your cycles, your pace.</p>
      <p style={{ fontSize: 12, color: "red", marginBottom: 16 }}>BUILD: may1-v9-full-jsx</p>

      {/* Wizard entry button */}
      <button
        onClick={() => setShowWizard(true)}
        className="w-full mb-4 rounded-2xl border border-terracotta/20 p-4 flex items-center gap-4 transition-all active:scale-[0.98] hover:bg-terracotta/5"
      >
        <div className="w-11 h-11 rounded-full bg-terracotta/15 border border-terracotta/25 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.5"
               stroke="var(--terracotta)" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          </svg>
        </div>
        <div className="text-left flex-1">
          <p className="text-foreground text-[14px] font-medium">+ Create a custom ritual</p>
          <p className="text-foreground/35 text-[11px] mt-0.5">Built from your chart, the moon, and what you&apos;re working on.</p>
        </div>
      </button>

      {/* Current cycle */}
      <div className="rounded-2xl bg-card/50 border border-foreground/12 p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 relative shrink-0">
            <Image src={getMoonPhaseImage(energy.moonPhase.phase)} alt={energy.moonPhase.label} fill className="object-contain" />
          </div>
          <div>
            <h2 className="text-foreground/80 text-[15px] font-medium">{energy.moonPhase.label}</h2>
            <p className="text-foreground/40 text-[11px]">
              {recentCompletions.length} ritual{recentCompletions.length !== 1 ? "s" : ""} this lunar cycle
            </p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {completions.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-8">
            <p className="text-foreground/50 text-[14px] leading-relaxed mb-2">Nothing here yet.</p>
            <p className="text-foreground/30 text-[12px] leading-relaxed mb-6">
              Complete your first ritual and your practice will start taking shape here.
            </p>
            <Link
              href="/learn"
              className="inline-block px-5 py-3 rounded-xl bg-terracotta/10 text-terracotta text-[13px] font-medium"
            >
              Browse rituals
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
