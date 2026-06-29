"use client";

/**
 * Onboarding — 10-screen flow.
 *
 * Screens:
 *  0  Welcome
 *  1  Birth data capture + account creation
 *  2  Sect reveal (immediately after chart — the payoff)
 *  3  Headline cards (big three + chart ruler, sect light, lord of the year)
 *  4  Demographics (optional)
 *  5  Meet Dolly
 *  6  Pick your free deck
 *  7  Notifications opt-in
 *  8  Moon practice prompt
 *  9  Final orientation
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import CitySearch, { LocationResult } from "@/components/CitySearch";
import { supabase } from "@/lib/supabase";
import { saveChart } from "@/lib/saveChart";
import { SIGN_FULL } from "@/lib/knowledge";
import { getSectLight, getLordOfTheYear } from "@/lib/rulers";
import { getChartRuler } from "@/lib/chartRuler";
import Logo from "@/components/Logo";

const TOTAL_STEPS = 10;
const LS_KEY = "mapped:onboarding-step";

/* ── palette ── */
const PAPER = "var(--background)";
const PAPER_DEEP = "var(--background-elevated)";
const INK = "var(--foreground)";
const TERRACOTTA = "var(--terracotta)";
const AMBER = "var(--amber)";
const SAGE = "var(--sage)";
const CREAM = "var(--cream)";

function fullSign(s?: string | null): string {
  if (!s) return "?";
  return SIGN_FULL[s] || s;
}

/* ── Types for chart data ── */
interface ChartPlanet {
  name: string;
  sign: string;
  house: string | null;
}
interface ChartHouse {
  number: number;
  sign: string;
}
interface ChartData {
  planets: ChartPlanet[];
  houses: ChartHouse[];
  bigThree?: { sun?: string; moon?: string; rising?: string };
  [key: string]: unknown;
}

export default function OnboardingPage() {
  const router = useRouter();

  /* ── navigation state ── */
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [animating, setAnimating] = useState(false);

  /* ── birth data form ── */
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [unknownTime, setUnknownTime] = useState(false);
  const [timePrecision, setTimePrecision] = useState<"exact" | "approximate" | "unknown">("exact");
  const [timeWindow, setTimeWindow] = useState<string | null>(null);
  const [dayNightKnown, setDayNightKnown] = useState(false);
  const [isDaytime, setIsDaytime] = useState<boolean | null>(null);
  const [cityQuery, setCityQuery] = useState("");
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [zodiacSystem, setZodiacSystem] = useState<"tropical" | "sidereal">("tropical");
  const [ayanamsa, setAyanamsa] = useState<"lahiri" | "krishnamurti" | "raman">("lahiri");
  const [showAdvanced, setShowAdvanced] = useState(false);

  /* ── account fields ── */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasAccount, setHasAccount] = useState(false);
  const [existingUserId, setExistingUserId] = useState<string | null>(null);
  const [existingUserName, setExistingUserName] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [birthDataDone, setBirthDataDone] = useState(false);

  /* ── chart results (for screens 3-4) ── */
  const [chartData, setChartData] = useState<ChartData | null>(null);

  /* ── demographics ── */
  const [pronouns, setPronouns] = useState("");
  const [lifeStage, setLifeStage] = useState<string[]>([]);
  const [familySituation, setFamilySituation] = useState<string[]>([]);
  const [professionalStatus, setProfessionalStatus] = useState("");

  /* ── deck choice ── */
  const [deckChoice, setDeckChoice] = useState<"classic_tarot" | "mapped_oracle" | null>(null);

  /* ── notifications (richer model) ── */
  const [notifPref, setNotifPref] = useState<"all" | "important" | "none" | null>(null);
  const [notifSubStep, setNotifSubStep] = useState<0 | 1 | 2>(0); // 0=philosophy, 1=preferences, 2=time
  const [notifToggles, setNotifToggles] = useState<Record<string, boolean>>({
    daily_content: false,
    full_moon: true,
    new_moon: true,
    quarter_moon: false,
    major_transits: true,
    retrograde_stations: true,
    birthday_week: true,
    solar_return: true,
    eclipses: true,
    mercury_retrograde: true,
    major_ingresses: true,
    practice_reminders: true,
    re_engagement: true,
  });
  const [notifHour, setNotifHour] = useState(19); // 7 PM default

  /* ── headline cards swipe index ── */
  const [cardIndex, setCardIndex] = useState(0);

  /* ── swipe handling ── */
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Restore step from localStorage ── */
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < TOTAL_STEPS) {
        // Only restore if we have chart data for later screens
        const storedChart = sessionStorage.getItem("mapped:chartData");
        if (parsed >= 2 && storedChart) {
          setChartData(JSON.parse(storedChart));
          setBirthDataDone(true);
          setStep(parsed);
        } else if (parsed < 2) {
          setStep(parsed);
        }
      }
    }
  }, []);

  /* ── Persist step changes ── */
  useEffect(() => {
    localStorage.setItem(LS_KEY, String(step));
  }, [step]);

  /* ── check if user is already signed in ── */
  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setExistingUserId(session.user.id);
          const userName = session.user.user_metadata?.name ||
                           session.user.user_metadata?.full_name || "";
          setExistingUserName(userName);
          if (userName && !name) setName(userName);
        }
      } catch { /* not blocking */ }
    }
    checkSession();
  }, []);

  /* ── navigation helpers ── */
  // Screen 6 (Pick your free deck) is disabled until paid features are built.
  // Skip it in both directions.
  const SKIP_SCREENS = new Set([6]);

  const goTo = useCallback(
    (next: number, dir: "left" | "right") => {
      if (animating) return;
      if (next < 0 || next >= TOTAL_STEPS) return;
      // Auto-skip disabled screens
      let target = next;
      while (SKIP_SCREENS.has(target) && target >= 0 && target < TOTAL_STEPS) {
        target += dir === "left" ? 1 : -1;
      }
      if (target < 0 || target >= TOTAL_STEPS) return;
      setDirection(dir);
      setAnimating(true);
      setTimeout(() => {
        setStep(target);
        setAnimating(false);
      }, 280);
    },
    [animating],
  );

  const goNext = useCallback(() => goTo(step + 1, "left"), [goTo, step]);
  const goPrev = useCallback(() => goTo(step - 1, "right"), [goTo, step]);

  const touchStartY = useRef(0);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
  }
  function onTouchMove(e: React.TouchEvent) {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    // Only navigate if swipe was mostly horizontal (not a scroll gesture)
    if (Math.abs(touchDeltaX.current) > 50 && Math.abs(touchDeltaX.current) > deltaY * 1.5) {
      if (touchDeltaX.current < 0 && step < TOTAL_STEPS - 1) goNext();
      else if (touchDeltaX.current > 0 && step > 0) goPrev();
    }
  }

  /* ── finish onboarding ── */
  async function finishOnboarding() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", session.user.id);
    }
    localStorage.removeItem(LS_KEY);
    router.replace("/you");
  }

  /* ── birth data submit ── */
  const birthValid = name.trim() && birthDate && location && (
    timePrecision === "unknown" || birthTime
  ) && (
    timePrecision !== "approximate" || timeWindow
  );
  const accountValid = existingUserId ? true : (email.trim() && password.length >= 6);

  async function handleBirthSubmit() {
    if (!birthValid || !accountValid) return;
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/chart/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          birthDate,
          birthTime: timePrecision === "unknown" ? null : birthTime,
          unknownTime: timePrecision === "unknown",
          birthTimePrecision: timePrecision,
          birthTimeWindow: timeWindow,
          dayNightKnown,
          isDaytime,
          latitude: parseFloat(location!.lat),
          longitude: parseFloat(location!.lon),
          cityName: location!.display_name,
          zodiacSystem,
          ...(zodiacSystem === "sidereal" ? { ayanamsa } : {}),
        }),
      });
      if (!res.ok) throw new Error("Chart calculation failed. Try again.");
      const result = await res.json();

      setChartData(result as ChartData);
      sessionStorage.setItem("mapped:chartData", JSON.stringify(result));

      let userId: string | null = existingUserId;
      let isReturningUser = false;
      if (existingUserId) {
        // Already signed in (e.g. via Google)
        isReturningUser = true;
      } else if (hasAccount) {
        const { data, error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw new Error(e.message.includes("Invalid login") ? "Wrong email or password." : e.message);
        userId = data.user?.id || null;
        isReturningUser = true;
      } else {
        const { data, error: e } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() } },
        });
        if (e) {
          if (
            e.message.includes("already registered") ||
            e.message.toLowerCase().includes("user already")
          ) {
            const { data: signInData, error: signInErr } =
              await supabase.auth.signInWithPassword({ email, password });
            if (signInErr) {
              if (signInErr.message.includes("Invalid login")) {
                setHasAccount(true);
                throw new Error(
                  "Looks like you already have an account! Check the \"I already have an account\" box and enter your password to sign in.",
                );
              }
              throw new Error(signInErr.message);
            }
            userId = signInData.user?.id || null;
            isReturningUser = true;
          } else {
            throw new Error(e.message);
          }
        } else if (data.user && data.session) {
          userId = data.user.id;
        } else if (data.user && !data.session) {
          sessionStorage.setItem("chartResult", JSON.stringify(result));
          sessionStorage.setItem("pendingSave", "true");
          setBirthDataDone(true);
          goNext();
          return;
        }
      }

      // If returning user already completed onboarding, skip straight to the app
      if (isReturningUser && userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", userId)
          .single();
        if (profile?.onboarding_completed === true) {
          router.replace("/home");
          return;
        }
      }

      if (userId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await saveChart(userId, result as any);
        // Save birth time precision data
        await supabase.from("profiles").update({
          birth_time_precision: timePrecision,
          birth_time_window: timeWindow,
          day_night_known: dayNightKnown,
          is_daytime: isDaytime,
        }).eq("id", userId);
      }

      setBirthDataDone(true);
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── demographics save ── */
  async function saveDemographics() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from("profiles").update({
        pronouns: pronouns || null,
        life_stage: lifeStage.length ? lifeStage : null,
        family_situation: familySituation.length ? familySituation : null,
        professional_status: professionalStatus || null,
      }).eq("id", session.user.id);
    }
    goNext();
  }

  /* ── deck save ── */
  async function saveDeck() {
    if (!deckChoice) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from("profiles").update({
        free_deck: deckChoice,
      }).eq("id", session.user.id);
    }
    goNext();
  }

  /* ── notification pref save (granular) ── */
  async function saveNotifPref() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from("profiles").update({
        notification_preferences: {
          ...notifToggles,
          preferred_hour: notifHour,
          paused_until: null,
          email_marketing: false,
        },
      }).eq("id", session.user.id);
    }
    goNext();
  }

  /* ── moon practice save ── */
  async function saveMoonPractice(wantIt: boolean) {
    if (wantIt) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from("profiles").update({
          wants_moon_practice: true,
        }).eq("id", session.user.id);
      }
    }
    goNext();
  }

  /* ── computed chart insights ── */
  const sectInfo = chartData
    ? getSectLight(chartData.planets, chartData.houses)
    : null;
  const chartRulerInfo = chartData
    ? getChartRuler(chartData.planets, chartData.houses, chartData.bigThree?.rising)
    : null;
  const lordInfo = chartData && birthDate
    ? getLordOfTheYear(birthDate, chartData.planets, chartData.houses)
    : null;

  /* ── multi-select helper ── */
  function toggleMulti(arr: string[], val: string, setter: (v: string[]) => void) {
    if (arr.includes(val)) {
      setter(arr.filter((x) => x !== val));
    } else {
      setter([...arr, val]);
    }
  }

  /* ── progress dots (skip disabled screens) ── */
  const dots = Array.from({ length: TOTAL_STEPS }, (_, i) => i).filter((i) => !SKIP_SCREENS.has(i));

  /* ── shared styles ── */
  const inputClass = `w-full px-4 py-2.5 rounded-xl
                      bg-card/50 border border-foreground/15
                      text-foreground placeholder:text-muted
                      focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20
                      text-sm`;
  const labelClass = "text-[10px] uppercase tracking-widest text-secondary font-semibold";

  const slideClass = animating
    ? direction === "left"
      ? "translate-x-[-100%] opacity-0"
      : "translate-x-[100%] opacity-0"
    : "translate-x-0 opacity-100";

  const pillBtn = (active: boolean) =>
    `px-3 py-2 rounded-full text-xs font-semibold border transition-all ${
      active
        ? "border-terracotta text-terracotta bg-terracotta/10"
        : "border-foreground/15 text-secondary bg-card/40"
    }`;

  const ctaBtn = (enabled: boolean) =>
    `w-full py-3.5 rounded-full font-bold text-sm tracking-wide transition-all ${
      enabled
        ? "bg-terracotta hover:opacity-90 active:scale-[0.98]"
        : "bg-foreground/15 text-muted cursor-not-allowed"
    }`;
  const ctaTextColor = { color: "var(--terracotta-text)" }; // dark brown — readable on brass/gold

  const ctaShadow = {
    boxShadow: "0 8px 20px -6px rgba(180, 81, 40, 0.4), 0 3px 8px -3px rgba(180, 81, 40, 0.25)",
  };

  /* ── headline cards data ── */
  const headlineCards = [
    chartRulerInfo
      ? {
          title: "Your chart ruler",
          planet: chartRulerInfo.planet,
          sign: fullSign(chartRulerInfo.rulerSign),
          house: chartRulerInfo.rulerHouse || "?",
          summary: chartRulerInfo.summary,
        }
      : null,
    sectInfo
      ? {
          title: "Your sect light",
          planet: sectInfo.sectLight,
          sign: fullSign(sectInfo.sectLightSign),
          house: sectInfo.sectLightHouse || "?",
          summary: sectInfo.summary,
        }
      : null,
    lordInfo
      ? {
          title: "Lord of the year",
          planet: lordInfo.lordPlanet,
          sign: fullSign(lordInfo.lordSign),
          house: lordInfo.lordHouse || "?",
          summary: lordInfo.summary,
        }
      : null,
  ].filter(Boolean) as Array<{
    title: string;
    planet: string;
    sign: string;
    house: string;
    summary: string;
  }>;

  return (
    <main
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        background:
          step === 2 && sectInfo
            ? sectInfo.sect === "day"
              ? "linear-gradient(180deg, #d4a853 0%, #c49234 100%)"
              : "linear-gradient(180deg, #1a2744 0%, #0f1a30 100%)"
            : step === 0
            ? `var(--cream)`
            : `radial-gradient(ellipse at top, ${PAPER} 0%, ${PAPER_DEEP} 100%)`,
        color: step === 2 && sectInfo?.sect === "night" ? "#e8e0d4" : step === 0 ? "#3d3328" : INK,
      }}
    >
      {/* Paper grain (hidden on sect reveal) */}
      {step !== 2 && (
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-multiply"
          style={{
            backgroundImage: `radial-gradient(${INK} 0.5px, transparent 0.5px)`,
            backgroundSize: "3px 3px",
          }}
        />
      )}

      {/* ── Mobile-width column ── */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative z-10 w-full max-w-[440px] mx-auto flex-1 flex flex-col overflow-hidden"
      >
        {/* ── Progress bar ── */}
        {step > 0 && (
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-4 pt-4">
            {dots.map((i) => (
              <div
                key={i}
                className="flex-1 h-0.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    i < step
                      ? TERRACOTTA
                      : i === step
                      ? step === 2 && sectInfo?.sect === "night"
                        ? "#e8e0d4"
                        : INK
                      : "rgba(42,31,24,0.15)",
                }}
              />
            ))}
          </div>
        )}

        {/* ── Card area ── */}
        <div className={`flex-1 min-h-0 flex flex-col transition-all duration-280 ease-out ${slideClass}`}>

          {/* ══════════ Screen 0: Welcome ══════════ */}
          {step === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="mb-10">
                <h2 className="text-[52px] leading-none tracking-tight" aria-label="Mapped">
                  <span style={{ fontFamily: "'Bodoni Moda', serif", fontStyle: "italic", fontWeight: 400 }}>mapp</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}>ed.</span>
                </h2>
              </div>
              <p
                className="text-foreground text-base leading-relaxed max-w-xs mb-10"
              >
                Hi. We&apos;re Mapped. Most astrology apps will tell you your sun sign. We do something different.
              </p>
              <button
                onClick={goNext}
                className="px-12 py-3.5 rounded-full font-bold text-sm tracking-wide active:scale-[0.98] transition-all"
                style={{ ...ctaShadow, ...ctaTextColor, backgroundColor: "var(--brass)" }}
              >
                Begin
              </button>
            </div>
          )}

          {/* ══════════ Screen 1: Birth Data ══════════ */}
          {step === 1 && (
            <div className="flex-1 flex flex-col px-5 pt-12 pb-5 overflow-y-auto">
              <h1
                className="text-[28px] text-foreground mb-1 tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Your birth data
              </h1>
              <p className="text-secondary text-xs mb-1">
                We&apos;ll map your whole chart — Sun, Moon, Rising, and more — not just your sun sign. The more accurate your details, the sharper it gets.
              </p>
              <p className="text-muted text-[11px] mb-4">
                Private — your birth details are only used to build your chart, never shared.
              </p>

              <div className="flex flex-col gap-3">
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Full name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Taylor"
                    aria-label="Full name"
                    className={inputClass}
                  />
                </div>

                {/* Birth date */}
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Birth date</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    aria-label="Birth date"
                    className={inputClass}
                  />
                </div>

                {/* Birth time — 3-option system */}
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Birth time</label>

                  {/* Precision selector */}
                  <div className="flex rounded-xl overflow-hidden border border-foreground/18">
                    {([
                      { key: "exact", label: "Exact" },
                      { key: "approximate", label: "Rough idea" },
                      { key: "unknown", label: "Don’t know" },
                    ] as const).map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setTimePrecision(key);
                          setUnknownTime(key === "unknown");
                          if (key === "unknown") { setBirthTime("12:00"); setTimeWindow(null); }
                          if (key === "exact") setTimeWindow(null);
                        }}
                        className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
                          timePrecision === key
                            ? "bg-ink text-cream"
                            : "bg-foreground/5 text-muted"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Exact: time picker */}
                  {timePrecision === "exact" && (
                    <input
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      aria-label="Birth time"
                      className={inputClass}
                    />
                  )}

                  {/* Approximate: time window grid */}
                  {timePrecision === "approximate" && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {([
                        { key: "early_morning", label: "Early morning", desc: "5–8 AM" },
                        { key: "morning", label: "Morning", desc: "8–11 AM" },
                        { key: "midday", label: "Midday", desc: "11 AM–2 PM" },
                        { key: "afternoon", label: "Afternoon", desc: "2–5 PM" },
                        { key: "early_evening", label: "Early evening", desc: "5–8 PM" },
                        { key: "evening", label: "Evening", desc: "8–11 PM" },
                        { key: "late_night", label: "Late night", desc: "11 PM–2 AM" },
                        { key: "overnight", label: "Overnight", desc: "2–5 AM" },
                      ] as const).map(({ key, label, desc }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setTimeWindow(key);
                            // Set midpoint for calculation
                            const midpoints: Record<string, string> = {
                              early_morning: "06:30", morning: "09:30", midday: "12:30",
                              afternoon: "15:30", early_evening: "18:30", evening: "21:30",
                              late_night: "00:30", overnight: "03:30",
                            };
                            setBirthTime(midpoints[key] || "12:00");
                          }}
                          className={`p-2 rounded-lg text-left border transition-all ${
                            timeWindow === key
                              ? "border-terracotta bg-terracotta/10"
                              : "border-foreground/12 bg-foreground/3"
                          }`}
                        >
                          <span className={`text-[11px] font-medium block ${timeWindow === key ? "text-terracotta" : "text-secondary"}`}>
                            {label}
                          </span>
                          <span className="text-[10px] text-muted">{desc}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Unknown: day/night checkbox */}
                  {timePrecision === "unknown" && (
                    <div className="rounded-xl border border-foreground/12 bg-foreground/3 p-3">
                      <p className="text-[11px] text-secondary mb-2">
                        Don&apos;t know your birth time? We&apos;ll calculate everything we can without it — a lot, actually.
                      </p>
                      <button
                        type="button"
                        onClick={() => setDayNightKnown(!dayNightKnown)}
                        className="flex items-center gap-2"
                      >
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            dayNightKnown ? "border-sage bg-sage" : "border-foreground/30"
                          }`}
                        >
                          {dayNightKnown && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke={PAPER} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className="text-[11px] text-secondary">I know if it was day or night</span>
                      </button>
                      {dayNightKnown && (
                        <div className="flex gap-2 mt-2 ml-6">
                          <button
                            type="button"
                            onClick={() => setIsDaytime(true)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                              isDaytime === true ? "border-amber bg-amber/10 text-amber" : "border-foreground/15 text-muted"
                            }`}
                          >
                            ☀️ Daytime
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsDaytime(false)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                              isDaytime === false ? "border-sage bg-sage/10 text-sage" : "border-foreground/15 text-muted"
                            }`}
                          >
                            🌙 Nighttime
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* City */}
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Birth city</label>
                  <CitySearch
                    value={cityQuery}
                    onChange={(val) => {
                      setCityQuery(val);
                      if (location && val !== location.display_name) setLocation(null);
                    }}
                    onSelect={(loc) => setLocation(loc)}
                  />
                  {location && <p className="text-[11px]" style={{ color: SAGE }}>&#10003; {location.display_name}</p>}
                </div>

                {/* Advanced — zodiac system. Hidden by default; nearly everyone wants
                    Western (tropical), so we don't make newcomers face the choice. */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="text-[11px] text-muted self-start hover:text-secondary transition-colors py-1"
                >
                  {showAdvanced ? "− Hide advanced options" : "+ Advanced options"}
                </button>
                {showAdvanced && (
                  <div className="flex flex-col gap-1.5 -mt-1">
                    <label className={labelClass}>Zodiac system</label>
                    <div className="flex gap-2">
                      {(["tropical", "sidereal"] as const).map((sys) => (
                        <button
                          key={sys}
                          type="button"
                          onClick={() => setZodiacSystem(sys)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${
                            zodiacSystem === sys
                              ? "border-terracotta text-terracotta bg-terracotta/10"
                              : "border-foreground/15 text-muted bg-card/40"
                          }`}
                        >
                          {sys === "tropical" ? "Western" : "Vedic"}
                          <span className="block text-[9px] mt-0.5 opacity-60 capitalize font-normal">{sys}</span>
                        </button>
                      ))}
                    </div>
                    {zodiacSystem === "sidereal" && (
                      <div className="flex gap-2 mt-1">
                        {([{ v: "lahiri", l: "Lahiri" }, { v: "krishnamurti", l: "KP" }, { v: "raman", l: "Raman" }] as const).map((o) => (
                          <button
                            key={o.v}
                            type="button"
                            onClick={() => setAyanamsa(o.v as "lahiri" | "krishnamurti" | "raman")}
                            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                              ayanamsa === o.v
                                ? "border-terracotta/60 text-terracotta bg-terracotta/10"
                                : "border-foreground/15 text-muted bg-card/40"
                            }`}
                          >
                            {o.l}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-muted leading-relaxed">
                      Most people use Western (tropical). Choose Vedic only if you specifically follow sidereal astrology.
                    </p>
                  </div>
                )}

                {/* Account */}
                {existingUserId ? (
                  <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-sage/10 border border-sage/25">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SAGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span className="text-[12px] text-secondary">
                      Signed in{existingUserName ? ` as ${existingUserName}` : ""}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="h-px bg-foreground/12 my-1" />
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>Create your account</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        aria-label="Email"
                        className={inputClass}
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password (6+ characters)"
                        aria-label="Password"
                        aria-describedby="password-hint"
                        className={inputClass}
                      />
                      {password.length > 0 && password.length < 6 && (
                        <p id="password-hint" className="text-terracotta text-[11px] -mt-1" role="status">
                          Passwords need at least 6 characters — {6 - password.length} more to go.
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => setHasAccount(!hasAccount)}
                        className="flex items-center gap-2 self-start"
                      >
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            hasAccount ? "border-terracotta" : "border-foreground/30"
                          }`}
                          style={{ backgroundColor: hasAccount ? TERRACOTTA : "transparent" }}
                        >
                          {hasAccount && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke={PAPER} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className="text-[11px] text-secondary">I already have an account</span>
                      </button>
                      {!hasAccount && (
                        <p className="text-[11px] text-muted/80 leading-relaxed">
                          By creating an account, you agree to our{" "}
                          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-terracotta hover:text-terracotta-light transition-colors">Terms</a>{" "}
                          and{" "}
                          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-terracotta hover:text-terracotta-light transition-colors">Privacy Policy</a>.
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Error */}
                {error && <p className="text-terracotta text-xs text-center font-semibold">{error}</p>}

                {/* Submit */}
                <button
                  onClick={handleBirthSubmit}
                  disabled={!birthValid || !accountValid || isSubmitting}
                  className={ctaBtn(!!birthValid && !!accountValid && !isSubmitting)}
                  style={birthValid && accountValid && !isSubmitting ? { ...ctaShadow, ...ctaTextColor } : undefined}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 rounded-full animate-spin" role="status" aria-label="Loading" style={{ borderColor: "rgba(61,36,21,0.3)", borderTopColor: "#3d2415" }} />
                      Calculating your chart...
                    </span>
                  ) : (
                    "Calculate & save my chart"
                  )}
                </button>

                {!existingUserId && (
                  <button
                    onClick={() => router.push("/account?mode=signin")}
                    className="text-terracotta text-xs hover:opacity-80 transition-colors self-center pb-2"
                  >
                    Already have an account?{" "}
                    <span className="underline underline-offset-2">Sign in</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ══════════ Screen 4: Demographics (after the reveal) ══════════ */}
          {step === 4 && (
            <div className="flex-1 flex flex-col px-5 pt-12 pb-5 overflow-y-auto">
              <h1
                className="text-[28px] text-foreground mb-1 tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Tell us about you
              </h1>
              <p className="text-secondary text-xs mb-4">
                All optional. Helps us personalize what you see.
              </p>

              <div className="flex flex-col gap-4">
                {/* Pronouns */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Pronouns</label>
                  <div className="flex flex-wrap gap-2">
                    {["she/her", "he/him", "they/them", "other/prefer not to say"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPronouns(pronouns === p ? "" : p)}
                        className={pillBtn(pronouns === p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Life stage */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Where you are in life</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Single", "Dating", "In a partnership", "Married",
                      "Going through a breakup or divorce", "Recently widowed", "It's complicated",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleMulti(lifeStage, opt, setLifeStage)}
                        className={pillBtn(lifeStage.includes(opt))}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Family */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Family situation</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "No kids", "Pregnant or expecting", "Parent of young kids",
                      "Parent of older kids / adult kids", "Caretaker for a parent or family member",
                      "Prefer not to say",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleMulti(familySituation, opt, setFamilySituation)}
                        className={pillBtn(familySituation.includes(opt))}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Professional */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Professional</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Student", "Corporate", "Creative/arts", "Self-employed",
                      "Between jobs", "Stay-at-home parent", "Retired", "Other",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setProfessionalStatus(professionalStatus === opt ? "" : opt)}
                        className={pillBtn(professionalStatus === opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={saveDemographics}
                    className={ctaBtn(true)}
                    style={{ ...ctaShadow, ...ctaTextColor }}
                  >
                    Use this to personalize
                  </button>
                  <button
                    onClick={goNext}
                    className="text-secondary text-xs font-semibold py-2 hover:text-foreground transition-colors"
                  >
                    Skip — I&apos;ll fill in later
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ Screen 2: Sect Reveal (immediately after chart) ══════════ */}
          {step === 2 && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <h1
                className="text-[38px] mb-1 tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {name ? name.split(" ")[0] : "You"}
              </h1>
              <p className="text-xs uppercase tracking-widest opacity-60 mb-5">Here&apos;s your chart</p>

              {/* Big three — the recognizable Sun / Moon / Rising reveal */}
              <div className="flex flex-col gap-2 mb-6 w-full max-w-[280px]">
                {([
                  { label: "Sun", sign: chartData?.bigThree?.sun, glyph: "☉" },
                  { label: "Moon", sign: chartData?.bigThree?.moon, glyph: "☾" },
                  { label: "Rising", sign: chartData?.bigThree?.rising, glyph: "↑" },
                ] as const).map((b) => (
                  <div
                    key={b.label}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}
                  >
                    <span className="text-[11px] uppercase tracking-widest opacity-70 flex items-center gap-2">
                      <span aria-hidden="true" className="text-[14px] opacity-90">{b.glyph}</span>{b.label}
                    </span>
                    <span className="text-[18px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                      {b.sign ? fullSign(b.sign) : "add birth time"}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-base leading-relaxed max-w-xs mb-3 opacity-90">
                {sectInfo?.sect === "day"
                  ? "You were born during the day."
                  : "You were born at night."}
              </p>
              <p className="text-sm leading-relaxed max-w-xs opacity-75 mb-10">
                {sectInfo?.sect === "day"
                  ? "Your Sun leads the team. Day charts are externally driven, visible, action-oriented."
                  : "Your Moon leads the team. Night charts are internal, reflective, emotionally driven."}
              </p>
              <button
                onClick={goNext}
                className="px-10 py-3.5 rounded-full font-bold text-sm tracking-wide active:scale-[0.98] transition-all"
                style={{
                  backgroundColor: sectInfo?.sect === "day" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                  color: sectInfo?.sect === "day" ? "#2a1f18" : "#e8e0d4",
                }}
              >
                Tell me more
              </button>
            </div>
          )}

          {/* ══════════ Screen 3: Headline Cards ══════════ */}
          {step === 3 && (
            <div className="flex-1 flex flex-col items-center justify-center px-5 pt-14 pb-8">
              <h1
                className="text-[24px] text-foreground mb-5 tracking-tight text-center"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Three things to know
              </h1>

              {headlineCards.length > 0 && (
                <>
                  <div className="w-full max-w-sm overflow-hidden">
                    <div
                      className="flex transition-transform duration-300 ease-out"
                      style={{ transform: `translateX(-${cardIndex * 100}%)` }}
                    >
                      {headlineCards.map((card, idx) => (
                        <div key={idx} className="w-full flex-shrink-0 px-1">
                          <div className="rounded-2xl border border-foreground/12 bg-card/60 p-5">
                            <p className="text-terracotta text-[10px] font-bold uppercase tracking-widest mb-2">
                              {card.title}
                            </p>
                            <p className="text-foreground text-lg font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
                              {card.planet}
                            </p>
                            <p className="text-secondary text-xs mb-3">
                              in {card.sign} &middot; house {card.house}
                            </p>
                            <p className="text-secondary text-[13px] leading-relaxed">
                              {card.summary}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dots */}
                  <div className="flex gap-2 mt-4">
                    {headlineCards.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCardIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === cardIndex ? "bg-terracotta" : "bg-foreground/20"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Nav arrows for cards */}
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() => setCardIndex(Math.max(0, cardIndex - 1))}
                      disabled={cardIndex === 0}
                      className="w-8 h-8 min-w-[44px] min-h-[44px] rounded-full border border-foreground/20 flex items-center justify-center text-muted disabled:opacity-30"
                      aria-label="Previous card"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCardIndex(Math.min(headlineCards.length - 1, cardIndex + 1))}
                      disabled={cardIndex === headlineCards.length - 1}
                      className="w-8 h-8 min-w-[44px] min-h-[44px] rounded-full border border-foreground/20 flex items-center justify-center text-muted disabled:opacity-30"
                      aria-label="Next card"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </>
              )}

              <button
                onClick={goNext}
                className={`mt-6 ${ctaBtn(true)}`}
                style={{ ...ctaShadow, ...ctaTextColor }}
              >
                Continue
              </button>
            </div>
          )}

          {/* ══════════ Screen 5: Meet Dolly ══════════ */}
          {step === 5 && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="text-4xl mb-4">&#x1F4AC;</div>
              <h1
                className="text-[30px] text-foreground mb-3 tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Meet Dolly
              </h1>
              <p className="text-secondary text-sm leading-relaxed max-w-xs mb-3">
                Dolly is your AI astrology guide. She knows your chart, your transits, and the context you gave us.
              </p>
              <p className="text-secondary text-sm leading-relaxed max-w-xs mb-3">
                She does not predict the future. She helps you think clearly about what is happening right now and what options you have.
              </p>
              <p className="text-secondary text-xs leading-relaxed max-w-xs mb-8">
                Ask her anything about your chart, your relationships, your timing. She is specific, grounded, and won&apos;t waste your time.
              </p>
              <button
                onClick={goNext}
                className="px-12 py-3.5 rounded-full bg-terracotta text-cream font-bold text-sm tracking-wide active:scale-[0.98] transition-all"
                style={{ ...ctaShadow, ...ctaTextColor }}
              >
                Got it
              </button>
            </div>
          )}

          {/* ══════════ Screen 6: Pick Your Free Deck ══════════ */}
          {step === 6 && (
            <div className="flex-1 flex flex-col items-center justify-center px-5 pt-14 pb-8">
              <h1
                className="text-[26px] text-foreground mb-2 tracking-tight text-center"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Pick your free deck
              </h1>
              <p className="text-secondary text-xs mb-6 text-center">
                You can buy more anytime, $5.55 each.
              </p>

              <div className="flex gap-3 w-full max-w-sm mb-8">
                {/* Classic Tarot */}
                <button
                  onClick={() => setDeckChoice("classic_tarot")}
                  className={`flex-1 rounded-2xl border-2 p-4 text-center transition-all ${
                    deckChoice === "classic_tarot"
                      ? "border-terracotta bg-terracotta/10"
                      : "border-foreground/15 bg-card/40"
                  }`}
                >
                  <div className="text-3xl mb-2">&#x1F0CF;</div>
                  <p className="text-foreground font-bold text-sm mb-1">Classic Tarot</p>
                  <p className="text-secondary text-[11px]">78 cards</p>
                </button>

                {/* Mapped Oracle */}
                <button
                  onClick={() => setDeckChoice("mapped_oracle")}
                  className={`flex-1 rounded-2xl border-2 p-4 text-center transition-all ${
                    deckChoice === "mapped_oracle"
                      ? "border-terracotta bg-terracotta/10"
                      : "border-foreground/15 bg-card/40"
                  }`}
                >
                  <div className="text-3xl mb-2">&#x2728;</div>
                  <p className="text-foreground font-bold text-sm mb-1">Mapped Starter Oracle</p>
                  <p className="text-secondary text-[11px]">22 cards</p>
                </button>
              </div>

              <button
                onClick={saveDeck}
                disabled={!deckChoice}
                className={ctaBtn(!!deckChoice)}
                style={deckChoice ? { ...ctaShadow, ...ctaTextColor } : undefined}
              >
                Continue
              </button>
            </div>
          )}

          {/* ══════════ Screen 7: Notifications ══════════ */}
          {step === 7 && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="text-4xl mb-5">&#x1F514;</div>
              <h1
                className="text-[26px] text-foreground mb-3 tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Stay in the loop
              </h1>
              <p className="text-secondary text-sm mb-2 max-w-xs leading-relaxed">
                Get notified for full moons, transits to your chart, and other moments that matter.
              </p>
              <p className="text-muted text-xs mb-8 max-w-xs leading-relaxed">
                Max a few per week. You can change this anytime in settings.
              </p>

              <div className="flex flex-col gap-3 w-full max-w-sm">
                <button
                  onClick={async () => {
                    try {
                      const { requestPermission, registerServiceWorker, subscribeToPush } = await import("@/lib/notifications");
                      const result = await requestPermission();
                      if (result === "granted") {
                        await registerServiceWorker();
                        await subscribeToPush();
                      }
                      // Save default preferences
                      const { data: { session } } = await supabase.auth.getSession();
                      if (session?.user) {
                        await supabase.from("profiles").update({
                          notification_preferences: {
                            full_moon: true, new_moon: true, quarter_moon: false,
                            major_transits: true, retrograde_stations: true,
                            birthday_week: true, solar_return: true,
                            eclipses: true, mercury_retrograde: true, major_ingresses: true,
                            daily_content: false, practice_reminders: true, re_engagement: true,
                            preferred_hour: 19, paused_until: null, email_marketing: false,
                          },
                        }).eq("id", session.user.id);
                      }
                    } catch (err) {
                      console.error("Notification setup failed:", err);
                    }
                    goNext();
                  }}
                  className={ctaBtn(true)}
                  style={{ ...ctaShadow, ...ctaTextColor }}
                >
                  Allow notifications
                </button>
                <button
                  onClick={goNext}
                  className="text-secondary text-xs font-semibold py-2 hover:text-foreground transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
          )}

          {/* ══════════ Screen 8: Moon Practice ══════════ */}
          {step === 8 && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="text-4xl mb-4">&#x1F319;</div>
              <h1
                className="text-[26px] text-foreground mb-3 tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Moon practice
              </h1>
              <p className="text-secondary text-sm leading-relaxed max-w-xs mb-8">
                A moon practice sends you a short check-in at each new and full moon. It takes two minutes and builds self-awareness over time.
              </p>

              <div className="flex flex-col gap-3 w-full max-w-sm">
                <button
                  onClick={() => saveMoonPractice(true)}
                  className={ctaBtn(true)}
                  style={{ ...ctaShadow, ...ctaTextColor }}
                >
                  Yes, set it up now
                </button>
                <button
                  onClick={() => saveMoonPractice(false)}
                  className="text-secondary text-xs font-semibold py-2 hover:text-foreground transition-colors"
                >
                  Maybe later — I&apos;ll explore first
                </button>
              </div>
            </div>
          )}

          {/* ══════════ Screen 9: Final Orientation ══════════ */}
          {step === 9 && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <h1
                className="text-[30px] text-foreground mb-4 tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                You&apos;re set up.
              </h1>
              <p className="text-secondary text-sm leading-relaxed max-w-xs mb-6">
                Here is where everything lives:
              </p>

              <div className="grid grid-cols-3 gap-2 w-full max-w-xs mb-8">
                {[
                  { label: "You", desc: "Your chart" },
                  { label: "Home", desc: "Daily guidance" },
                  { label: "Tarot", desc: "Card pulls" },
                  { label: "Ritual", desc: "Moon work" },
                  { label: "Maps", desc: "Connections" },
                  { label: "Dolly", desc: "AI guide" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-foreground/12 bg-card/50 py-3 px-2 text-center"
                  >
                    <p className="text-foreground text-xs font-bold">{item.label}</p>
                    <p className="text-muted text-[10px] mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={finishOnboarding}
                className="px-12 py-3.5 rounded-full bg-terracotta text-cream font-bold text-sm tracking-wide active:scale-[0.98] transition-all"
                style={{ ...ctaShadow, ...ctaTextColor }}
              >
                Open my chart
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
