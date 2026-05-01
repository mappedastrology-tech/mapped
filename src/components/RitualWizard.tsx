"use client";

/**
 * Ritual Wizard — 5-question conversational ritual creator.
 *
 * Lives inside My Practice tab. Pulls from the user's chart, current sky,
 * and the ritual correspondence knowledge base to compose personalized rituals.
 *
 * Flow: Onboarding → Q1 (intent) → Q2 (body) → Q3 (tools) → Q4 (time) → Q5 (when) → Generate → Output
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { getDailyEnergy } from "@/lib/celestialCalendar";
import {
  type CustomRitual,
  parseWizardOutput,
  saveCustomRitual,
  addToWizardHistory,
} from "@/lib/customRituals";

// ─── Types ─────────────────────────────────────────────────────────────────────

type WizardStep =
  | "onboarding"
  | "q1_intent"
  | "q2_body"
  | "q3_tools"
  | "q4_time"
  | "q5_when"
  | "generating"
  | "result"
  | "crisis";

interface ChartData {
  bigThree?: { sun: string; moon: string; rising: string };
  planets?: { name: string; sign: string; position: number; house: string | null; retrograde: boolean }[];
  houses?: { number: number; sign: string; position: number }[];
  birthDate?: string;
}

interface TransitData {
  transitDate?: string;
  transitAspects?: {
    transitPlanet: string;
    transitSign: string;
    natalPlanet: string;
    aspect: string;
    orb: number;
    transitHouse: number;
  }[];
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface RitualWizardProps {
  onClose: () => void;
  onSave: (ritual: CustomRitual) => void;
}

export default function RitualWizard({ onClose, onSave }: RitualWizardProps) {
  const [step, setStep] = useState<WizardStep>("onboarding");

  // Wizard inputs
  const [intention, setIntention] = useState("");
  const [bodyLevel, setBodyLevel] = useState<"mostly_body" | "mostly_mind" | "both" | null>(null);
  const [tools, setTools] = useState<string[]>([]);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [timing, setTiming] = useState<string | null>(null);

  // Chart context
  const [chart, setChart] = useState<ChartData | null>(null);
  const [transits, setTransits] = useState<TransitData | null>(null);
  const [userName, setUserName] = useState("");

  // Generation state
  const [streamedText, setStreamedText] = useState("");
  const [generatedRitual, setGeneratedRitual] = useState<CustomRitual | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [spinsUsed, setSpinsUsed] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chart context on mount
  useEffect(() => {
    async function loadChart() {
      // Try Supabase first (dynamic import to avoid module-level crash if env vars missing)
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: chartData } = await supabase
            .from("charts")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (chartData) {
            setChart({
              bigThree: chartData.big_three,
              planets: chartData.planets || [],
              houses: chartData.houses || [],
              birthDate: chartData.birth_date,
            });
            setUserName(chartData.name || "");

            // Fetch transits
            try {
              const today = new Date().toISOString().split("T")[0];
              const res = await fetch("/api/transits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  natalPlanets: chartData.planets || [],
                  natalHouses: chartData.houses || [],
                  transitDate: today,
                  latitude: chartData.latitude || 30.27,
                  longitude: chartData.longitude || -97.74,
                  zodiacSystem: chartData.zodiac_system || "tropical",
                }),
              });
              if (res.ok) setTransits(await res.json());
            } catch { /* continue without transits */ }
            return;
          }
        }
      } catch { /* continue with sessionStorage fallback */ }

      // Fallback to sessionStorage
      try {
        const saved = sessionStorage.getItem("chartResult");
        if (saved) {
          const parsed = JSON.parse(saved);
          setChart({
            bigThree: parsed.bigThree,
            planets: parsed.planets,
            houses: parsed.houses,
            birthDate: parsed.birthDate || parsed.birth_date,
          });
          setUserName(parsed.name || "");
        }
      } catch { /* no chart available */ }
    }
    loadChart();
  }, []);

  // Auto-focus intent input
  useEffect(() => {
    if (step === "q1_intent") {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [step]);

  // ─── Generate ritual ──────────────────────────────────────────────────

  const generateRitual = useCallback(async () => {
    setStep("generating");
    setStreamedText("");
    setError(null);
    setGeneratedRitual(null);
    setSaved(false);

    let energy;
    try {
      energy = getDailyEnergy(new Date());
    } catch {
      energy = { moonPhase: { label: "Unknown", phase: "full" } };
    }
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch("/api/wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intention,
          bodyLevel,
          tools,
          minutes,
          timing,
          chart,
          transits,
          userName,
          moonPhase: energy.moonPhase.label,
          dayOfWeek: dayNames[new Date().getDay()],
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errBody.error || `Error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setStreamedText(fullText);
              }
            } catch { /* skip malformed chunks */ }
          }
        }
      }

      // Check for crisis response
      if (fullText.startsWith("CRISIS:")) {
        setStreamedText(fullText.replace("CRISIS:", "").trim());
        setStep("crisis");
        return;
      }

      // Parse the output — guard against null values
      if (!bodyLevel || minutes === null || !timing) {
        setError("Missing inputs. Please go back and complete all steps.");
        setStep("result");
        return;
      }

      const ritual = parseWizardOutput(fullText, {
        intentionText: intention,
        bodyLevel,
        tools,
        minutes,
        timing,
      });

      if (ritual) {
        setGeneratedRitual(ritual);
        addToWizardHistory(ritual, false);
        setStep("result");
      } else {
        setError("Couldn't parse the ritual output. Try again?");
        setStep("result");
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("result");
    }
  }, [intention, bodyLevel, tools, minutes, timing, chart, transits, userName]);

  // ─── Handlers ──────────────────────────────────────────────────────────

  function handleSaveRitual() {
    if (!generatedRitual) return;
    saveCustomRitual(generatedRitual);
    addToWizardHistory(generatedRitual, true);
    setSaved(true);
    onSave(generatedRitual);
  }

  function handleRespin() {
    if (spinsUsed >= 3) return;
    setSpinsUsed(s => s + 1);
    generateRitual();
  }

  function handleToolToggle(tool: string) {
    setTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  }

  // ─── Render helpers ────────────────────────────────────────────────────

  const wizardBubble = (text: string) => (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-5 h-5 rounded-full bg-terracotta/10 border border-terracotta/15 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" strokeWidth="2"
               stroke="var(--terracotta)" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          </svg>
        </div>
        <span className="text-foreground/25 text-[10px] uppercase tracking-widest">Wizard</span>
      </div>
      <p className="text-foreground/70 text-[14px] leading-relaxed pl-7">{text}</p>
    </div>
  );

  const optionButton = (
    label: string,
    selected: boolean,
    onClick: () => void,
    icon?: string,
  ) => (
    <button
      key={label}
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border text-[13px] transition-all active:scale-[0.98] ${
        selected
          ? "bg-terracotta/10 border-terracotta/25 text-foreground"
          : "bg-card/40 border-foreground/12 text-foreground/60 hover:border-foreground/20"
      }`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );

  const nextButton = (onClick: () => void, disabled?: boolean) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-4 w-full py-3 rounded-xl text-[13px] font-medium transition-all active:scale-[0.98] disabled:opacity-30"
      style={{ backgroundColor: "var(--terracotta)", color: "#F2E8D5" }}
    >
      Next
    </button>
  );

  // ─── Step: Onboarding ──────────────────────────────────────────────────

  if (step === "onboarding") {
    return (
      <div className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full">
        {/* Back button */}
        <button onClick={onClose} className="text-foreground/30 text-[12px] mb-6 self-start flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-16 h-16 rounded-full bg-terracotta/10 border border-terracotta/20 flex items-center justify-center mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.5"
                 stroke="var(--terracotta)" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
            </svg>
          </div>

          <h2 className="text-foreground text-xl mb-2" style={{ fontFamily: "var(--font-display)" }}>
            The wizard knows things.
          </h2>

          <p className="text-foreground/45 text-[13px] leading-relaxed text-center max-w-[300px] mb-2">
            Pick what you need, what you&apos;ve got on hand, and how much time — she&apos;ll write you something real.
          </p>
          <p className="text-foreground/35 text-[12px] leading-relaxed text-center max-w-[280px] mb-8">
            The moon and the day pick the materials. You pick the goal.
          </p>

          <p className="text-foreground/25 text-[11px] italic mb-8">No two rituals are the same.</p>

          <button
            onClick={() => setStep("q1_intent")}
            className="px-8 py-3.5 rounded-xl text-[14px] font-medium transition-all active:scale-[0.97]"
            style={{ backgroundColor: "var(--terracotta)", color: "#F2E8D5" }}
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  // ─── Step: Q1 — Intent ─────────────────────────────────────────────────

  const INTENTION_OPTIONS = [
    { id: "love", label: "Love", icon: "💗" },
    { id: "money", label: "Money", icon: "💰" },
    { id: "protection", label: "Protection", icon: "🛡" },
    { id: "luck", label: "Luck", icon: "🍀" },
    { id: "job", label: "Career / Job", icon: "💼" },
    { id: "confidence", label: "Confidence", icon: "🔥" },
    { id: "healing", label: "Healing", icon: "🩹" },
    { id: "letting_go", label: "Letting go", icon: "🍂" },
    { id: "clarity", label: "Clarity", icon: "🔮" },
    { id: "peace", label: "Peace / Calm", icon: "🕊" },
    { id: "creativity", label: "Creativity", icon: "🎨" },
    { id: "grief", label: "Grief / Loss", icon: "🖤" },
  ];

  if (step === "q1_intent") {
    return (
      <div className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full">
        <button onClick={onClose} className="text-foreground/30 text-[12px] mb-6 self-start flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        {wizardBubble("What's this ritual for?")}

        <div className="pl-7">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {INTENTION_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setIntention(opt.id)}
                className={`flex flex-col items-center gap-1.5 py-3.5 rounded-xl border text-[12px] transition-all active:scale-[0.97] ${
                  intention === opt.id
                    ? "bg-terracotta/10 border-terracotta/25 text-foreground"
                    : "bg-card/40 border-foreground/12 text-foreground/55 hover:border-foreground/20"
                }`}
              >
                <span className="text-[20px]">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {nextButton(
            () => setStep("q2_body"),
            !intention
          )}
        </div>
      </div>
    );
  }

  // ─── Step: Q2 — Body level ─────────────────────────────────────────────

  if (step === "q2_body") {
    return (
      <div className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full">
        <button onClick={() => setStep("q1_intent")} className="text-foreground/30 text-[12px] mb-6 self-start flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        {wizardBubble("Want this to involve your body — actual movement, water, breath — or stay mostly in your head and heart?")}

        <div className="pl-7 space-y-2.5">
          {optionButton("Mostly body", bodyLevel === "mostly_body", () => setBodyLevel("mostly_body"), "🫀")}
          {optionButton("Mostly mind", bodyLevel === "mostly_mind", () => setBodyLevel("mostly_mind"), "🧠")}
          {optionButton("Both", bodyLevel === "both", () => setBodyLevel("both"), "✨")}

          {nextButton(
            () => setStep("q3_tools"),
            !bodyLevel
          )}
        </div>
      </div>
    );
  }

  // ─── Step: Q3 — Tools ──────────────────────────────────────────────────

  if (step === "q3_tools") {
    const TOOL_OPTIONS = [
      { id: "none", label: "Just me (no tools)", icon: "🙏" },
      { id: "candle", label: "Candle (any color)", icon: "🕯" },
      { id: "paper", label: "Paper + pen", icon: "✏️" },
      { id: "bath", label: "A bath/shower", icon: "🛁" },
      { id: "music", label: "Music", icon: "🎵" },
      { id: "stones", label: "Stones/crystals", icon: "💎" },
      { id: "oils", label: "Essential oils", icon: "💧" },
      { id: "full_kit", label: "The full kit", icon: "🧰" },
    ];

    return (
      <div className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full">
        <button onClick={() => setStep("q2_body")} className="text-foreground/30 text-[12px] mb-6 self-start flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        {wizardBubble("What can you actually use right now?")}

        <div className="pl-7 space-y-2">
          {TOOL_OPTIONS.map(opt => {
            const isNone = opt.id === "none";
            const selected = isNone ? tools.length === 0 : tools.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => {
                  if (isNone) {
                    setTools([]);
                  } else {
                    handleToolToggle(opt.id);
                  }
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl border text-[13px] transition-all active:scale-[0.98] flex items-center gap-2 ${
                  selected
                    ? "bg-terracotta/10 border-terracotta/25 text-foreground"
                    : "bg-card/40 border-foreground/12 text-foreground/60 hover:border-foreground/20"
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
                {selected && !isNone && (
                  <span className="ml-auto text-terracotta text-[11px]">✓</span>
                )}
              </button>
            );
          })}

          {nextButton(() => setStep("q4_time"))}
        </div>
      </div>
    );
  }

  // ─── Step: Q4 — Time ───────────────────────────────────────────────────

  if (step === "q4_time") {
    const TIME_OPTIONS = [
      { value: 5, label: "5 minutes" },
      { value: 15, label: "15 minutes" },
      { value: 30, label: "30 minutes" },
      { value: 60, label: "An hour or more" },
    ];

    return (
      <div className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full">
        <button onClick={() => setStep("q3_tools")} className="text-foreground/30 text-[12px] mb-6 self-start flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        {wizardBubble("How much time do you actually have?")}

        <div className="pl-7 space-y-2.5">
          {TIME_OPTIONS.map(opt => (
            optionButton(opt.label, minutes === opt.value, () => setMinutes(opt.value))
          ))}

          {nextButton(
            () => setStep("q5_when"),
            minutes === null
          )}
        </div>
      </div>
    );
  }

  // ─── Step: Q5 — When ───────────────────────────────────────────────────

  if (step === "q5_when") {
    const TIMING_OPTIONS = [
      { value: "now", label: "Right now" },
      { value: "tonight", label: "Tonight after sunset" },
      { value: "next_new_moon", label: "Next new moon" },
      { value: "next_full_moon", label: "Next full moon" },
    ];

    return (
      <div className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full">
        <button onClick={() => setStep("q4_time")} className="text-foreground/30 text-[12px] mb-6 self-start flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        {wizardBubble("Doing this now, or planning ahead?")}

        <div className="pl-7 space-y-2.5">
          {TIMING_OPTIONS.map(opt => (
            optionButton(opt.label, timing === opt.value, () => setTiming(opt.value))
          ))}

          <button
            onClick={() => {
              if (timing && bodyLevel && minutes !== null && intention.trim()) generateRitual();
            }}
            disabled={!timing || !bodyLevel || minutes === null || !intention.trim()}
            className="mt-4 w-full py-3.5 rounded-xl text-[14px] font-medium transition-all active:scale-[0.97] disabled:opacity-30"
            style={{ backgroundColor: "var(--terracotta)", color: "#F2E8D5" }}
          >
            Create my ritual
          </button>
        </div>
      </div>
    );
  }

  // ─── Step: Generating ──────────────────────────────────────────────────

  if (step === "generating") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-6 max-w-lg mx-auto w-full">
        <div className="w-12 h-12 rounded-full bg-terracotta/10 border border-terracotta/20 flex items-center justify-center mb-4 animate-pulse">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.5"
               stroke="var(--terracotta)" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          </svg>
        </div>
        <p className="text-foreground/50 text-[14px] mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Pulling this together.
        </p>
        <p className="text-foreground/25 text-[12px]">One sec.</p>

        {streamedText && (
          <div className="mt-6 w-full max-h-[200px] overflow-y-auto px-4">
            <p className="text-foreground/30 text-[11px] leading-relaxed whitespace-pre-wrap">
              {streamedText.slice(0, 200)}...
            </p>
          </div>
        )}
      </div>
    );
  }

  // ─── Step: Crisis response ─────────────────────────────────────────────

  if (step === "crisis") {
    return (
      <div className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full">
        <button onClick={onClose} className="text-foreground/30 text-[12px] mb-6 self-start flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="rounded-2xl bg-card/60 border border-foreground/12 p-6 max-w-[340px]">
            <p className="text-foreground/70 text-[14px] leading-relaxed">
              {streamedText || "What you're describing sounds heavy. A ritual isn't going to be enough for this — and you deserve more than enough."}
            </p>
            <div className="mt-4 pt-4 border-t border-foreground/8">
              <p className="text-foreground/50 text-[13px] font-medium">
                988 Suicide & Crisis Lifeline
              </p>
              <p className="text-foreground/35 text-[12px] mt-1">
                Available 24/7. Call or text 988.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-6 text-foreground/30 text-[12px]"
          >
            Back to My Practice
          </button>
        </div>
      </div>
    );
  }

  // ─── Step: Result ──────────────────────────────────────────────────────

  if (step === "result") {
    // Error state
    if (error && !generatedRitual) {
      return (
        <div className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full">
          <button onClick={onClose} className="text-foreground/30 text-[12px] mb-6 self-start flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <p className="text-foreground/50 text-[14px] mb-4">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={generateRitual}
                className="px-5 py-2.5 rounded-xl text-[13px] font-medium border border-terracotta/25 text-terracotta"
              >
                Try again
              </button>
              <button
                onClick={() => setStep("q1_intent")}
                className="px-5 py-2.5 rounded-xl text-[13px] text-foreground/40 border border-foreground/12"
              >
                Change answers
              </button>
            </div>
          </div>
        </div>
      );
    }

    const r = generatedRitual;
    if (!r) return null;

    return (
      <div className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full pb-28 overflow-y-auto">
        <button onClick={onClose} className="text-foreground/30 text-[12px] mb-4 self-start flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        {/* Ritual card */}
        <div className="rounded-2xl border border-foreground/12 overflow-hidden"
             style={{ background: "var(--card)" }}>

          {/* Header with star icon */}
          <div className="px-5 pt-5 pb-3 border-b border-foreground/8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-foreground/25 text-[10px] uppercase tracking-widest">Custom · Built {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
            <h2 className="text-foreground text-lg" style={{ fontFamily: "var(--font-display)" }}>
              ✶ {r.title}
            </h2>
            {(r.duration || r.materials) && (
              <p className="text-foreground/35 text-[12px] mt-1">
                {r.duration}{r.materials ? ` · ${r.materials}` : ""}
              </p>
            )}
          </div>

          {/* Why this for you */}
          {r.whyThisForYou && (
            <div className="px-5 py-4 border-b border-foreground/6">
              <p className="text-foreground/50 text-[13px] leading-relaxed italic">
                {r.whyThisForYou}
              </p>
            </div>
          )}

          {/* Steps */}
          <div className="px-5 py-4 space-y-3">
            {r.steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-terracotta/50 text-[13px] font-medium tabular-nums flex-shrink-0 w-5 text-right">
                  {i + 1}.
                </span>
                <p className="text-foreground/65 text-[13px] leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>

          {/* Affirmation */}
          {r.affirmation && (
            <div className="px-5 py-4 border-t border-foreground/6">
              <p className="text-foreground/25 text-[9px] uppercase tracking-widest mb-1.5">
                Affirmation to carry
              </p>
              <p className="text-foreground/60 text-[14px] font-medium italic">
                &ldquo;{r.affirmation}&rdquo;
              </p>
            </div>
          )}

          {/* Astro footnote */}
          {r.astroFootnote && (
            <div className="px-5 py-3 border-t border-foreground/6" style={{ background: "var(--background-elevated)" }}>
              <p className="text-foreground/30 text-[11px] leading-relaxed italic">
                {r.astroFootnote}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          {!saved ? (
            <button
              onClick={handleSaveRitual}
              className="flex-1 py-3 rounded-xl text-[13px] font-medium transition-all active:scale-[0.98]"
              style={{ backgroundColor: "var(--terracotta)", color: "#F2E8D5" }}
            >
              Save to my practice
            </button>
          ) : (
            <div className="flex-1 py-3 rounded-xl text-[13px] font-medium text-center border border-sage/30 text-sage">
              ✓ Saved
            </div>
          )}

          {spinsUsed < 3 && (
            <button
              onClick={handleRespin}
              className="px-5 py-3 rounded-xl text-[13px] text-foreground/50 border border-foreground/12 hover:border-foreground/20 transition-all active:scale-[0.98]"
            >
              Re-spin
            </button>
          )}
        </div>

        {saved && (
          <button
            onClick={onClose}
            className="mt-3 w-full py-3 rounded-xl text-[13px] text-foreground/40 border border-foreground/10"
          >
            Done
          </button>
        )}
      </div>
    );
  }

  return null;
}
