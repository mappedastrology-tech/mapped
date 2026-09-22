"use client";

/**
 * Birth Time Rectification — guided 7-step flow.
 *
 * Mapped+ tier feature that estimates birth time from life events
 * and personality/appearance questions.
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { usePaywall } from "@/hooks/usePaywall";
import {
  TIME_WINDOWS,
  type TimeWindow,
  RISING_SIGN_ARCHETYPES,
  PHYSICAL_BUILD_OPTIONS,
  NOTABLE_FEATURE_OPTIONS,
  type RectificationEvent,
} from "@/lib/birth-time";
import type { RectificationResult } from "@/lib/birthTimeRectification";

const TOTAL_STEPS = 7;

/** "3:12 – 4:48 AM" style label for a span that may run past midnight. */
function spanLabel(r: RectificationResult): string {
  const fmt = (h: number) => {
    const hh = ((Math.floor(h) % 24) + 24) % 24;
    const mm = Math.round((h - Math.floor(h)) * 60) % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };
  return `${fmt(r.startHour)} – ${fmt(r.endHour)}`;
}

export default function RectificationPage() {
  const router = useRouter();
  const { gate, PaywallModal } = usePaywall();

  const [step, setStep] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Step 2: time window
  const [selectedWindow, setSelectedWindow] = useState<TimeWindow | null>(null);

  // Step 3: personality + physical
  const [personalityChoice, setPersonalityChoice] = useState<string | null>(null);
  const [buildChoice, setBuildChoice] = useState<string | null>(null);
  const [featureChoice, setFeatureChoice] = useState<string | null>(null);

  // Step 4: life events
  const [events, setEvents] = useState<RectificationEvent[]>([
    { type: "career", description: "", date: "" },
    { type: "relationship", description: "", date: "" },
    { type: "life", description: "", date: "" },
  ]);

  // Step 6: result
  const [result, setResult] = useState<RectificationResult | null>(null);
  const [method, setMethod] = useState<string>("");
  const [noBirthData, setNoBirthData] = useState(false);

  // Step 7: adjustment
  const [adjustedMinutes, setAdjustedMinutes] = useState(0);

  function goNext() {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
  }
  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  // Gate: rectification is Mapped+ tier
  const blocked = gate("birth_time_rectification");

  const handleCalculate = useCallback(async () => {
    setIsCalculating(true);
    setNoBirthData(false);
    try {
      // The birth date and place are what make this computable at all: the
      // ascendant depends on both. Without them there is nothing to rectify,
      // and saying so beats returning a confident-looking guess.
      const { data: { user } } = await supabase.auth.getUser();
      const { data: chart } = user
        ? await supabase
            .from("charts")
            .select("birth_date, latitude, longitude, zodiac_system, ayanamsa")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : { data: null };

      if (!chart?.birth_date || chart.latitude == null || chart.longitude == null) {
        setNoBirthData(true);
        return;
      }

      const archetype = RISING_SIGN_ARCHETYPES.find((a) => a.label === personalityChoice);
      const { rectifyBirthTime, describeMethod } = await import("@/lib/birthTimeRectification");
      const r = rectifyBirthTime({
        birthDate: chart.birth_date,
        latitude: chart.latitude,
        longitude: chart.longitude,
        zodiacSystem: chart.zodiac_system ?? undefined,
        ayanamsa: chart.ayanamsa ?? undefined,
        window: selectedWindow,
        candidateSigns: archetype?.sign ? [archetype.sign] : [],
      });

      setResult(r);
      setMethod(describeMethod(r));
      goNext();
    } catch {
      setNoBirthData(true);
    } finally {
      setIsCalculating(false);
    }
    // goNext is stable enough for this flow; the deps below are the real inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalityChoice, selectedWindow]);

  const handleSaveResult = useCallback(async () => {
    if (!result) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Apply adjustment
      const [h, m] = result.estimatedTime.split(":").map(Number);
      const totalMin = h * 60 + m + adjustedMinutes;
      const adjH = Math.floor(((totalMin % 1440) + 1440) % 1440 / 60);
      const adjM = ((totalMin % 1440) + 1440) % 1440 % 60;
      const finalTime = `${String(adjH).padStart(2, "0")}:${String(adjM).padStart(2, "0")}`;

      // Rebuild the chart around the new time before recording it. Storing a
      // rectified time without recalculating — which is all this did — left the
      // chart every other screen reads still built on the old one, so the whole
      // rectification produced a number in settings and changed nothing else.
      const { applyBirthTime } = await import("@/lib/chartSystemSync");
      await applyBirthTime(user.id, finalTime);

      // No birth_time here: profiles has no such column, and including it made
      // PostgREST reject this entire statement — which is why no account has
      // ever had birth_time_rectified_data saved. The time itself belongs to
      // the chart, which applyBirthTime above has already written.
      await supabase.from("profiles").update({
        birth_time_precision: "rectified",
        birth_time_window: selectedWindow,
        birth_time_rectified_data: {
          events: events.filter((e) => e.date && e.description),
          personalityAnswers: { impression: personalityChoice || "" },
          physicalAnswers: { build: buildChoice || "", feature: featureChoice || "" },
          calculatedAt: new Date().toISOString(),
          estimatedTime: finalTime,
          estimatedRising: result.risingSign,
          // The span IS the uncertainty; a percentage was never measured.
          spanMinutes: result.spanMinutes,
          outcome: result.outcome,
        },
      }).eq("id", user.id);

      router.push("/account#birth-time");
    } catch {
      // Handle error
    }
  }, [result, adjustedMinutes, selectedWindow, events, personalityChoice, buildChoice, featureChoice, router]);

  const updateEvent = (index: number, field: keyof RectificationEvent, value: string) => {
    setEvents((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const inputClass = "w-full px-4 py-3 rounded-xl bg-foreground/5 border border-foreground/12 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-terracotta/40";
  const btnPrimary = "px-6 py-3 rounded-full bg-terracotta text-cream text-sm font-medium hover:bg-terracotta/90 transition-colors";
  const btnSecondary = "px-6 py-3 rounded-full border border-foreground/18 text-secondary text-sm font-medium hover:border-foreground/30 transition-colors";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button onClick={() => router.back()} className="text-muted hover:text-foreground transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
        <h1 className="text-base font-semibold text-foreground">Birth Time Rectification</h1>
      </div>

      {/* Progress */}
      <div className="px-5 mb-6">
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? "bg-terracotta" : "bg-foreground/10"}`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-8 overflow-y-auto">
        {/* Step 0: Set expectations */}
        {step === 0 && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-foreground mb-4">How this works</h2>
            <p className="text-sm text-secondary leading-relaxed mb-6">
              Birth time rectification estimates your time by matching major events in your life to
              expected astrological timing. It&apos;s an educated guess, not a certainty. Mapped will
              give you a most-likely time, and you can always update it if you find your real one.
            </p>
            <div className="rounded-xl border border-amber/20 bg-amber/5 p-4 mb-8">
              <p className="text-xs text-amber/80 leading-relaxed">
                This process takes about 10 minutes. You&apos;ll need to recall 3 major life events
                with approximate dates.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={goNext} className={btnPrimary}>I understand</button>
              <button onClick={() => router.back()} className={btnSecondary}>Skip</button>
            </div>
          </div>
        )}

        {/* Step 1: Birth-day window */}
        {step === 1 && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-foreground mb-2">What part of the day were you born?</h2>
            <p className="text-xs text-muted mb-5">Pick the closest window, even if you&apos;re not sure.</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {(Object.entries(TIME_WINDOWS) as [TimeWindow, typeof TIME_WINDOWS[TimeWindow]][]).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setSelectedWindow(key)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    selectedWindow === key
                      ? "border-terracotta bg-terracotta/8"
                      : "border-foreground/12 bg-foreground/3"
                  }`}
                >
                  <span className={`text-xs font-medium block ${selectedWindow === key ? "text-terracotta" : "text-secondary"}`}>
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-muted">{meta.description}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={goNext} disabled={!selectedWindow} className={`${btnPrimary} ${!selectedWindow ? "opacity-40" : ""}`}>
                Continue
              </button>
              <button onClick={goBack} className={btnSecondary}>Back</button>
            </div>
          </div>
        )}

        {/* Step 2: Personality/physical */}
        {step === 2 && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-foreground mb-2">When you walk into a room, people see you as...</h2>
            <p className="text-xs text-muted mb-4">Pick the one that resonates most with your first impression.</p>
            <div className="flex flex-col gap-1.5 mb-6">
              {RISING_SIGN_ARCHETYPES.map(({ label }) => (
                <button
                  key={label}
                  onClick={() => setPersonalityChoice(label)}
                  className={`px-4 py-3 rounded-xl text-left border transition-all text-sm ${
                    personalityChoice === label
                      ? "border-terracotta bg-terracotta/8 text-terracotta"
                      : "border-foreground/12 bg-foreground/3 text-secondary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-foreground mb-2 mt-6">Your physical build tends toward...</h3>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {PHYSICAL_BUILD_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setBuildChoice(opt)}
                  className={`px-3 py-2 rounded-lg text-xs border transition-all ${
                    buildChoice === opt
                      ? "border-sage bg-sage/10 text-sage"
                      : "border-foreground/12 text-muted"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-foreground mb-2">People often comment on your...</h3>
            <div className="flex flex-wrap gap-1.5 mb-6">
              {NOTABLE_FEATURE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFeatureChoice(opt)}
                  className={`px-3 py-2 rounded-lg text-xs border transition-all ${
                    featureChoice === opt
                      ? "border-sage bg-sage/10 text-sage"
                      : "border-foreground/12 text-muted"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={goNext} disabled={!personalityChoice} className={`${btnPrimary} ${!personalityChoice ? "opacity-40" : ""}`}>
                Continue
              </button>
              <button onClick={goBack} className={btnSecondary}>Back</button>
            </div>
          </div>
        )}

        {/* Step 3: Life events */}
        {step === 3 && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-foreground mb-2">Three big events in your life</h2>
            <p className="text-xs text-muted mb-5">
              We&apos;ll match the timing to your chart. Enter the year and month if you can — the day is optional.
            </p>

            {events.map((ev, i) => (
              <div key={i} className="mb-5 rounded-xl border border-foreground/10 p-4">
                <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                  {ev.type === "career" ? "Career / Work" : ev.type === "relationship" ? "Relationship" : "Major Life Event"}
                </p>
                <input
                  type="text"
                  placeholder="What happened? (e.g., Started my first real job)"
                  aria-label={`${ev.type === "career" ? "Career" : ev.type === "relationship" ? "Relationship" : "Life"} event description`}
                  value={ev.description}
                  onChange={(e) => updateEvent(i, "description", e.target.value)}
                  className={`${inputClass} mb-2`}
                />
                <input
                  type="month"
                  value={ev.date}
                  aria-label={`${ev.type === "career" ? "Career" : ev.type === "relationship" ? "Relationship" : "Life"} event date`}
                  onChange={(e) => updateEvent(i, "date", e.target.value)}
                  className={inputClass}
                />
              </div>
            ))}

            <div className="flex gap-3">
              <button
                onClick={() => { setStep(4); }}
                disabled={!events.some((e) => e.date && e.description)}
                className={`${btnPrimary} ${!events.some((e) => e.date && e.description) ? "opacity-40" : ""}`}
              >
                Continue
              </button>
              <button onClick={goBack} className={btnSecondary}>Back</button>
            </div>
          </div>
        )}

        {/* Step 4: Calculation */}
        {step === 4 && (
          <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center min-h-[300px]">
            {isCalculating ? (
              <>
                <div className="w-12 h-12 rounded-full border-2 border-terracotta/30 border-t-terracotta animate-spin mb-4" role="status" aria-label="Loading" />
                <p className="text-sm text-secondary">Working out which signs rose that day where you were born…</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-foreground mb-3 text-center">Ready to calculate</h2>
                <p className="text-sm text-secondary text-center mb-6 max-w-xs">
                  We&apos;ll work out exactly which signs were rising over your birthplace that day, then narrow to the stretch that matches what you told us.
                </p>
                {noBirthData && (
                  <p className="text-sm text-red-400 text-center mb-4 max-w-xs">
                    We need your birth date and birthplace first — this is worked out from where the sky was over that spot. Add them in your chart, then come back.
                  </p>
                )}
                <div className="flex gap-3">
                  <button onClick={handleCalculate} className={btnPrimary}>Calculate my time</button>
                  <button onClick={goBack} className={btnSecondary}>Back</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 5: Result */}
        {step === 5 && result && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-foreground mb-4 text-center">Best estimate</h2>
            <div className="rounded-2xl border border-terracotta/20 bg-terracotta/5 p-6 text-center mb-4">
              <p className="text-3xl font-bold text-terracotta mb-1">{spanLabel(result)}</p>
              <p className="text-sm text-secondary">
                {result.risingSign
                  ? <>Rising sign across that span: <span className="font-semibold text-foreground">{result.risingSign}</span></>
                  : <>More than one sign rises in that span.</>}
              </p>
              <p className="text-[11px] text-muted mt-2">
                Narrowed to {result.spanMinutes} minutes · we&apos;ll store the midpoint, {result.estimatedTime}
              </p>
            </div>
            <p className="text-xs text-muted text-center mb-6">{method}</p>
            <div className="rounded-xl border border-foreground/10 bg-foreground/3 p-4 mb-6">
              <p className="text-[11px] text-muted italic leading-relaxed">
                This is a calculated estimate, not your actual birth time. If you find your real
                birth time, please update it. Rectification can be wrong, especially when life
                events don&apos;t fit the average pattern.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={handleSaveResult} className={btnPrimary}>Use this time</button>
              <button onClick={goNext} className={btnSecondary}>Adjust manually</button>
              <button onClick={() => router.back()} className="text-xs text-muted text-center py-2">
                Skip — no time
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Adjustment slider */}
        {step === 6 && result && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-foreground mb-2 text-center">Fine-tune your time</h2>
            <p className="text-xs text-muted text-center mb-6">
              Slide to shift the estimate. Watch how the Rising sign changes.
            </p>

            <div className="rounded-2xl border border-foreground/12 bg-foreground/3 p-6 text-center mb-4">
              <p className="text-2xl font-bold text-foreground mb-1">
                {(() => {
                  const [h, m] = result.estimatedTime.split(":").map(Number);
                  const totalMin = h * 60 + m + adjustedMinutes;
                  const adjH = Math.floor(((totalMin % 1440) + 1440) % 1440 / 60);
                  const adjM = ((totalMin % 1440) + 1440) % 1440 % 60;
                  return `${String(adjH).padStart(2, "0")}:${String(adjM).padStart(2, "0")}`;
                })()}
              </p>
              <p className="text-xs text-muted">
                Rising: {result.risingSign}
                {adjustedMinutes !== 0 && <span className="text-muted"> ({adjustedMinutes > 0 ? "+" : ""}{adjustedMinutes} min)</span>}
              </p>
            </div>

            <div className="px-2 mb-8">
              <input
                type="range"
                min={-60}
                max={60}
                value={adjustedMinutes}
                onChange={(e) => setAdjustedMinutes(Number(e.target.value))}
                aria-label="Adjust birth time in minutes"
                className="w-full accent-terracotta"
              />
              <div className="flex justify-between text-[10px] text-muted mt-1">
                <span>-60 min</span>
                <span>0</span>
                <span>+60 min</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={handleSaveResult} className={btnPrimary}>Save this time</button>
              <button onClick={goBack} className={btnSecondary}>Back to result</button>
            </div>
          </div>
        )}
      </div>

      {PaywallModal}
    </div>
  );
}
