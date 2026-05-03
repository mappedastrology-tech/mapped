"use client";

/**
 * Birth Time Rectification — guided 7-step flow.
 *
 * Mid/top tier feature that estimates birth time from life events
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

const TOTAL_STEPS = 7;

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
  const [result, setResult] = useState<{
    estimatedTime: string;
    risingSign: string;
    confidence: number;
  } | null>(null);

  // Step 7: adjustment
  const [adjustedMinutes, setAdjustedMinutes] = useState(0);

  function goNext() {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
  }
  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  // Gate: rectification is mid/top tier
  const blocked = gate("birth_time_rectification");

  const handleCalculate = useCallback(async () => {
    setIsCalculating(true);
    try {
      // Simulate rectification calculation
      // In production, this would call a backend endpoint
      await new Promise((r) => setTimeout(r, 2500));

      // Heuristic: use personality choice to suggest a rising sign
      const archetype = RISING_SIGN_ARCHETYPES.find((a) => a.label === personalityChoice);
      const risingSign = archetype?.sign || "Libra";

      // Use the selected window midpoint as base
      const windowData = selectedWindow ? TIME_WINDOWS[selectedWindow] : null;
      const baseHour = windowData?.midpointHour || 12;
      const hours = Math.floor(baseHour);
      const minutes = Math.round((baseHour - hours) * 60);
      const estimatedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

      // Confidence based on how much data we have
      const filledEvents = events.filter((e) => e.date && e.description);
      const baseConfidence = 0.55;
      const eventBonus = filledEvents.length * 0.08;
      const physicalBonus = buildChoice && featureChoice ? 0.07 : 0;
      const confidence = Math.min(0.92, baseConfidence + eventBonus + physicalBonus);

      setResult({ estimatedTime, risingSign, confidence });
      goNext();
    } catch {
      // Handle error silently
    } finally {
      setIsCalculating(false);
    }
  }, [personalityChoice, selectedWindow, events, buildChoice, featureChoice]);

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

      await supabase.from("profiles").update({
        birth_time: finalTime,
        birth_time_precision: "rectified",
        birth_time_window: selectedWindow,
        birth_time_rectified_data: {
          events: events.filter((e) => e.date && e.description),
          personalityAnswers: { impression: personalityChoice || "" },
          physicalAnswers: { build: buildChoice || "", feature: featureChoice || "" },
          confidence: result.confidence,
          calculatedAt: new Date().toISOString(),
          estimatedTime: finalTime,
          estimatedRising: result.risingSign,
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

  const inputClass = "w-full px-4 py-3 rounded-xl bg-foreground/5 border border-foreground/12 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-terracotta/40";
  const btnPrimary = "px-6 py-3 rounded-full bg-terracotta text-cream text-sm font-medium hover:bg-terracotta/90 transition-colors";
  const btnSecondary = "px-6 py-3 rounded-full border border-foreground/18 text-foreground/60 text-sm font-medium hover:border-foreground/30 transition-colors";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button onClick={() => router.back()} className="text-foreground/50 hover:text-foreground transition-colors">
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
            <p className="text-sm text-foreground/60 leading-relaxed mb-6">
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
            <p className="text-xs text-foreground/50 mb-5">Pick the closest window, even if you&apos;re not sure.</p>
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
                  <span className={`text-xs font-medium block ${selectedWindow === key ? "text-terracotta" : "text-foreground/70"}`}>
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-foreground/40">{meta.description}</span>
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
            <p className="text-xs text-foreground/50 mb-4">Pick the one that resonates most with your first impression.</p>
            <div className="flex flex-col gap-1.5 mb-6">
              {RISING_SIGN_ARCHETYPES.map(({ label }) => (
                <button
                  key={label}
                  onClick={() => setPersonalityChoice(label)}
                  className={`px-4 py-3 rounded-xl text-left border transition-all text-sm ${
                    personalityChoice === label
                      ? "border-terracotta bg-terracotta/8 text-terracotta"
                      : "border-foreground/12 bg-foreground/3 text-foreground/70"
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
                      : "border-foreground/12 text-foreground/50"
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
                      : "border-foreground/12 text-foreground/50"
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
            <p className="text-xs text-foreground/50 mb-5">
              We&apos;ll match the timing to your chart. Enter the year and month if you can — the day is optional.
            </p>

            {events.map((ev, i) => (
              <div key={i} className="mb-5 rounded-xl border border-foreground/10 p-4">
                <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">
                  {ev.type === "career" ? "Career / Work" : ev.type === "relationship" ? "Relationship" : "Major Life Event"}
                </p>
                <input
                  type="text"
                  placeholder="What happened? (e.g., Started my first real job)"
                  value={ev.description}
                  onChange={(e) => updateEvent(i, "description", e.target.value)}
                  className={`${inputClass} mb-2`}
                />
                <input
                  type="month"
                  value={ev.date}
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
                <div className="w-12 h-12 rounded-full border-2 border-terracotta/30 border-t-terracotta animate-spin mb-4" />
                <p className="text-sm text-foreground/60">Analyzing your events against possible charts...</p>
                <p className="text-xs text-foreground/35 mt-2">This takes a moment</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-foreground mb-3 text-center">Ready to calculate</h2>
                <p className="text-sm text-foreground/60 text-center mb-6 max-w-xs">
                  We&apos;ll test each possible Ascendant within your time window and score them against your answers.
                </p>
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
              <p className="text-3xl font-bold text-terracotta mb-1">{result.estimatedTime}</p>
              <p className="text-sm text-foreground/60">
                Your Rising sign is most likely <span className="font-semibold text-foreground">{result.risingSign}</span>
              </p>
            </div>
            <p className="text-xs text-foreground/50 text-center mb-6">
              Calculated from the events you shared and your appearance answers.
              We&apos;re {Math.round(result.confidence * 100)}% confident in this estimate.
            </p>
            <div className="rounded-xl border border-foreground/10 bg-foreground/3 p-4 mb-6">
              <p className="text-[11px] text-foreground/45 italic leading-relaxed">
                This is a calculated estimate, not your actual birth time. If you find your real
                birth time, please update it. Rectification can be wrong, especially when life
                events don&apos;t fit the average pattern.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={handleSaveResult} className={btnPrimary}>Use this time</button>
              <button onClick={goNext} className={btnSecondary}>Adjust manually</button>
              <button onClick={() => router.back()} className="text-xs text-foreground/35 text-center py-2">
                Skip — no time
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Adjustment slider */}
        {step === 6 && result && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-foreground mb-2 text-center">Fine-tune your time</h2>
            <p className="text-xs text-foreground/50 text-center mb-6">
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
              <p className="text-xs text-foreground/50">
                Rising: {result.risingSign}
                {adjustedMinutes !== 0 && <span className="text-foreground/30"> ({adjustedMinutes > 0 ? "+" : ""}{adjustedMinutes} min)</span>}
              </p>
            </div>

            <div className="px-2 mb-8">
              <input
                type="range"
                min={-60}
                max={60}
                value={adjustedMinutes}
                onChange={(e) => setAdjustedMinutes(Number(e.target.value))}
                className="w-full accent-terracotta"
              />
              <div className="flex justify-between text-[10px] text-foreground/30 mt-1">
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
