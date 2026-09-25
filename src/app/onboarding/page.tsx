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
 *  6  Pick your free deck (one oracle deck, free, granted server-side)
 *  7  Notifications opt-in
 *  8  Moon practice prompt
 *  9  Final orientation
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import CitySearch, { LocationResult } from "@/components/CitySearch";
import SignPlate from "@/components/SignPlate";
import { supabase } from "@/lib/supabase";
import { saveChart } from "@/lib/saveChart";
import { SIGN_FULL } from "@/lib/knowledge";
import { getSectLight, getLordOfTheYear } from "@/lib/rulers";
import { TRIAL_DAYS } from "@/lib/tier";
import { getChartRuler } from "@/lib/chartRuler";
import Logo from "@/components/Logo";
import { STORE_DECKS, formatPrice } from "@/lib/deckStore";
import { claimFreeDeck } from "@/lib/freeDeck";
import DeckStack from "@/components/tarot/DeckStack";
import { friendlyAuthError } from "@/lib/authErrors";

/**
 * Eleven, not ten: the account ask is its own screen now (step 4).
 *
 * It used to sit at the bottom of screen 1, so a stranger had to hand over an
 * email and a password before seeing a single thing the app does — the button
 * even said "Calculate & save my chart" rather than admitting it created an
 * account. That is the classic top-of-funnel leak, and chart/result already
 * had the better pattern built: show the chart, then offer to keep it.
 *
 * Birth details now calculate the chart with no account at all (the chart API
 * needs no auth), the reveal and the headline cards land, and only then does
 * anyone get asked to sign up — for something they can already see.
 */
const TOTAL_STEPS = 11;
const LS_KEY = "mapped:onboarding-step-v2";

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
  /**
   * Empty, not "12:00".
   *
   * The field was pre-filled with noon AND the "Exact" tab was pre-selected,
   * and birthValid only checked that birthTime was truthy. So someone who did
   * not know their time — or simply did not notice the field — could submit
   * noon, asserted as exact, and be given a rising sign, houses and a sect
   * reading built on it. Unlike the "Don't know" path nothing downstream
   * knows to hedge, because unknownTime is false: calculateChart emits the
   * Ascendant and all twelve houses as real. That is precisely the fabricated
   * precision the astro library goes out of its way to refuse, manufactured
   * by a default value.
   */
  const [birthTime, setBirthTime] = useState("");
  const [unknownTime, setUnknownTime] = useState(false);
  /** null until they choose. Pre-selecting "Exact" asserted a precision
   *  nobody had claimed — see birthTime above. */
  const [timePrecision, setTimePrecision] = useState<"exact" | "approximate" | "unknown" | null>(null);
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
  /**
   * Set to the address we just sent a confirmation link to. While this holds
   * a value the flow stops and shows the "check your inbox" screen rather
   * than advancing into a signed-out dead end.
   */
  const [awaitingConfirm, setAwaitingConfirm] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

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
  // A deck id from the real catalog (src/lib/deckStore), not a hand-written
  // label — this screen used to offer "Classic Tarot" (free for everyone
  // already) and a "Mapped Starter Oracle" that does not exist.
  const [deckChoice, setDeckChoice] = useState<string | null>(null);
  const [deckError, setDeckError] = useState("");
  const [claimingDeck, setClaimingDeck] = useState(false);

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
    practice_reminders: false,
    re_engagement: false,
  });
  const [notifHour, setNotifHour] = useState(19); // 7 PM default

  /* ── headline cards swipe index ── */
  const [cardIndex, setCardIndex] = useState(0);

  /* ── swipe handling ── */
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Restore step from localStorage ──
     restoreTarget holds the step we are on our way back to. It exists because
     the persist effect below runs in the same commit as this one, while `step`
     is still 0 — so it used to write 0 over the saved step immediately. On the
     next mount the restore then read that 0 and put the user back at the
     welcome screen, losing their place in a ten-screen signup. Traced writes:
       read step => 6   (restore)
       write   => 0     (persist, same commit, step not updated yet)
       read step => 0   (restore, next mount — the value is gone) */
  const restoreTarget = useRef<number | null>(null);

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
          restoreTarget.current = parsed;
          setStep(parsed);
        } else if (parsed < 2) {
          restoreTarget.current = parsed;
          setStep(parsed);
        }
      }
    }
  }, []);

  /* ── Persist step changes ── */
  useEffect(() => {
    // Hold off until the restored step has actually rendered; writing before
    // then is what destroyed it.
    if (restoreTarget.current !== null && step !== restoreTarget.current) return;
    restoreTarget.current = null;
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
  // Screen 6 (pick your free deck) used to be skipped: it offered decks that
  // were not in the catalog and saved to profiles.free_deck, a column that does
  // not exist, so the write silently failed and nobody got anything. It now
  // grants a real deck through /api/decks/claim-free and is shown again.
  const SKIP_SCREENS = new Set<number>([]);

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
        /**
         * Put focus on the new screen's heading.
         *
         * Every goNext() swapped the entire screen and left focus on <body>,
         * announcing nothing. A screen-reader user pressed a button and heard
         * silence, then had to re-read from the top to work out whether
         * anything had happened — ten times in a row. The live region below
         * says which step it is; this puts them at the start of it.
         */
        requestAnimationFrame(() => {
          const heading = containerRef.current?.querySelector<HTMLElement>("h1, h2");
          heading?.focus();
        });
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
  const birthValid = name.trim() && birthDate && location && timePrecision !== null && (
    timePrecision === "unknown" || birthTime
  ) && (
    timePrecision !== "approximate" || timeWindow
  );
  const accountValid = existingUserId ? true : (email.trim() && password.length >= 6);

  /**
   * Send another confirmation link.
   *
   * There was no way to do this anywhere in the app, so anyone whose email was
   * delayed, filtered or lost was stuck for good: signing in told them to
   * confirm first, and nothing could issue a new link.
   */
  async function resendConfirmation() {
    if (!awaitingConfirm) return;
    setResendState("sending");
    try {
      const { error: err } = await supabase.auth.resend({ type: "signup", email: awaitingConfirm });
      setResendState(err ? "failed" : "sent");
    } catch {
      setResendState("failed");
    }
  }

  async function handleBirthSubmit() {
    if (isSubmitting) return;

    /**
     * Say what is missing, rather than doing nothing.
     *
     * The button used to be `disabled`, so this early return was unreachable
     * and silence was the whole experience: nothing happened, nothing was
     * announced, and nothing named the field at fault. The city is the one
     * that actually traps people, because it is only set by choosing a
     * suggestion and there was no way to do that without a mouse.
     */
    if (!birthValid) {
      const missing =
        !name.trim() ? { msg: "Please add your name.", id: "signup-name" }
        : !birthDate ? { msg: "Please add your birth date.", id: "signup-birthdate" }
        : timePrecision === null ? { msg: "Please say how sure you are of your birth time \u2014 exact, a rough idea, or you don\u2019t know.", id: "signup-birthtime" }
        : timePrecision !== "unknown" && !birthTime ? { msg: "Please add your birth time, or choose \u201cDon\u2019t know\u201d.", id: "signup-birthtime" }
        : { msg: "Please choose your birth city from the list of suggestions.", id: "signup-city" };
      setError(missing.msg);
      // Focus the field at fault, so the message is not just read out but
      // acted on — otherwise they hear it and are still nowhere near it.
      requestAnimationFrame(() => {
        document.getElementById(missing.id)?.focus();
      });
      return;
    }

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
      // Kept so the account step can save it once there is someone to save
      // it for, and so a confirmation-email round trip does not lose it.
      sessionStorage.setItem("chartResult", JSON.stringify(result));

      goNext();
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Step 4: make the account, now that they have seen what it is for.
   *
   * Everything below used to run inside handleBirthSubmit, before the chart
   * had been shown to anybody.
   */
  async function handleAccountSubmit() {
    if (isSubmitting) return;
    if (!accountValid) {
      const missing = !email.trim()
        ? { msg: "Please add your email address.", id: "signup-email" }
        : { msg: "Please add a password of at least 6 characters.", id: "signup-password" };
      setError(missing.msg);
      requestAnimationFrame(() => { document.getElementById(missing.id)?.focus(); });
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const stored = sessionStorage.getItem("chartResult");
      const result = stored ? JSON.parse(stored) : chartData;
      if (!result) throw new Error("We lost your chart — please go back a step and rebuild it.");

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
              // Raw Supabase text used to reach the screen from here.
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
          /**
           * Supabase made the account but wants the email confirmed first, so
           * there is no session yet.
           *
           * This used to call goNext() and say nothing. The person then walked
           * the next six screens signed out, and every write on the way
           * silently did nothing — demographics, notification preferences,
           * moon practice and the free deck are all wrapped in a session
           * check. At the end, onboarding_completed was never set, so the tab
           * layout bounced them back to /welcome. Ten screens of work, thrown
           * away, with no explanation at any point.
           *
           * Stop here instead and tell them. The chart is already calculated
           * and kept, so confirming the link resumes rather than restarts.
           */
          sessionStorage.setItem("chartResult", JSON.stringify(result));
          sessionStorage.setItem("pendingSave", "true");
          setAwaitingConfirm(email.trim());
          setIsSubmitting(false);
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
      setError(friendlyAuthError(err));
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
    if (!deckChoice || claimingDeck) return;
    setDeckError("");
    setClaimingDeck(true);
    const res = await claimFreeDeck(deckChoice);
    setClaimingDeck(false);
    if (!res.ok) {
      // Never trap someone in onboarding over a free extra. Show what happened
      // and let them move on; the Deck Store offers the same pick later.
      setDeckError(res.error ?? "Could not add that deck. You can pick one later in the Deck Store.");
      return;
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
  // --on-brass: dark ink on the dark theme's light gold, cream on the light
  // theme's dark gold. The old dark brown was ~2:1 on light-theme brass.
  const ctaTextColor = { color: "var(--on-brass)" };

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
      // The onboarding is a fixed light/paper experience (INK = var(--foreground),
      // text-foreground on cream). Pin the light theme so it stays legible even when
      // the app's saved theme is dark — otherwise --foreground flips to cream and the
      // copy disappears against the parchment. The step-2 sect reveal sets its own
      // explicit colors, so pinning light doesn't affect it.
      data-theme="light"
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
        {/*
          Back.
          A horizontal swipe was the ONLY way to return, which is a path-based
          gesture and needs a single-pointer alternative (WCAG 2.5.1) — and on
          desktop there was no way back at all. Someone who mistyped their
          birth date on step 1 and moved on could not return to fix it.

          Not on step 1: there is nothing before it, and not on the sect
          reveal, which paints its own colours.
        */}
        {step > 1 && !awaitingConfirm && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Go back a step"
            className="absolute top-8 left-3 z-30 w-11 h-11 rounded-full flex items-center justify-center"
            style={{ color: step === 2 && sectInfo?.sect === "night" ? "#e8e0d4" : INK }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        {/* Announced on every step change; see goTo. */}
        <p role="status" aria-live="polite" className="sr-only">
          {step > 0 ? `Step ${step} of ${dots.length - 1}` : ""}
        </p>

        {/* ── Progress bar ── */}
        {step > 0 && (
          <div
            className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-4 pt-4"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={dots.length - 1}
            aria-valuenow={step}
            aria-valuetext={`Step ${step} of ${dots.length - 1}`}
            aria-label="Setup progress"
          >
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
                      // 0.15 was 1.34:1 — the remaining segments were
                      // invisible, so there was no track to read progress
                      // against. 0.45 measures 3.06:1.
                      : "rgba(42,31,24,0.45)",
                }}
              />
            ))}
          </div>
        )}

        {/* ── Card area ── */}
        <div className={`flex-1 min-h-0 flex flex-col transition-all duration-280 ease-out ${slideClass}`}>

          {/* ══════════ Screen 0: Welcome ══════════ */}
          {!awaitingConfirm && step === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="mb-10">
                <h2 tabIndex={-1} className="text-[52px] leading-none tracking-tight" aria-label="Mapped">
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

          {/*
            ══════════ Check your inbox ══════════
            Takes over the whole flow. Supabase made the account but there is
            no session until the link is clicked, and advancing past this is
            what used to throw away everything the person did next.
          */}
          {awaitingConfirm && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <h1 tabIndex={-1} className="text-[28px] text-foreground mb-3 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                Check your inbox
              </h1>
              <p className="text-secondary text-sm leading-relaxed max-w-xs mb-2">
                We sent a confirmation link to <strong>{awaitingConfirm}</strong>.
              </p>
              <p className="text-secondary text-sm leading-relaxed max-w-xs mb-8">
                Open it on this device and we&rsquo;ll pick up where you left off &mdash; your chart is
                already built and waiting.
              </p>

              <button
                onClick={resendConfirmation}
                disabled={resendState === "sending" || resendState === "sent"}
                className="px-8 min-h-[44px] rounded-full bg-terracotta text-cream font-bold text-sm tracking-wide active:scale-[0.98] transition-all disabled:opacity-50"
                style={{ ...ctaShadow, ...ctaTextColor }}
              >
                {resendState === "sending" ? "Sending…" : resendState === "sent" ? "Link sent" : "Resend the link"}
              </button>

              {/* Announced, not just drawn. */}
              <p role="status" aria-live="polite" className="text-muted text-xs mt-3 min-h-[1rem]">
                {resendState === "sent"
                  ? "On its way. It can take a minute — check spam too."
                  : resendState === "failed"
                  ? "That didn't send. Give it a moment and try again."
                  : ""}
              </p>

              <button
                onClick={() => { setAwaitingConfirm(null); setResendState("idle"); }}
                className="mt-6 text-muted text-xs underline underline-offset-2 min-h-[44px]"
              >
                Use a different email
              </button>
            </div>
          )}

          {/* ══════════ Screen 1: Birth Data ══════════ */}
          {!awaitingConfirm && step === 1 && (
            <div className="flex-1 flex flex-col px-5 pt-12 pb-5 overflow-y-auto">
              <h1 tabIndex={-1}
                className="text-[28px] text-foreground mb-1 tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Your birth data
              </h1>
              <p className="text-secondary text-xs mb-1">
                We&apos;ll map your whole chart — Sun, Moon, Rising, and more — not just your sun sign. The more precise your details, the more precise your chart.
              </p>
              {/*
                "Never shared" was an absolute the app cannot defend, sitting
                two fields above a link to a privacy page that says the
                opposite in detail: the city goes to OpenStreetMap as you type
                it, and the chart goes to Anthropic whenever Dolly answers. An
                absolute is the one shape of this sentence that gets quoted
                back at you. This keeps the reassurance and drops the claim.
              */}
              <p className="text-muted text-[11px] mb-4">
                Your birth details are used to build your chart and answer your questions &mdash; nothing
                else. We don&rsquo;t sell them or advertise against them.{" "}
                <a href="/privacy" className="underline underline-offset-2">What we do with your data</a>
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
                    id="signup-name"
                    autoComplete="name"
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
                    id="signup-birthdate"
                    autoComplete="bday"
                    aria-label="Birth date"
                    className={inputClass}
                  />
                </div>

                {/* Birth time — 3-option system */}
                {/* A real group. These were three unrelated buttons to a
                    screen reader — no group name, no "1 of 3", and selection
                    conveyed only by a colour swap. */}
                <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
                  <legend className={labelClass}>Birth time</legend>
                  {/* Shown beside the choice, not after it: the reassurance
                      used to appear only once someone had already picked
                      "Don't know", which is after the moment of hesitation. */}
                  <p className="text-muted text-[11px] -mt-1">
                    Plenty of people don&rsquo;t know theirs. Your Sun and Moon barely move in a day.
                  </p>

                  {/* Precision selector */}
                  <div role="radiogroup" aria-label="How sure are you of your birth time?" className="flex rounded-xl overflow-hidden border border-foreground/18">
                    {([
                      { key: "exact", label: "Exact" },
                      { key: "approximate", label: "Rough idea" },
                      { key: "unknown", label: "Don’t know" },
                    ] as const).map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={timePrecision === key}
                        id={key === "exact" ? "signup-birthtime" : undefined}
                        onClick={() => {
                          setTimePrecision(key);
                          setUnknownTime(key === "unknown");
                          // Noon only when they have SAID they don't know, so
                          // unknownTime travels with it and everything
                          // downstream hedges. It is never an assumed default.
                          if (key === "unknown") { setBirthTime("12:00"); setTimeWindow(null); }
                          if (key === "exact") { setBirthTime(""); setTimeWindow(null); }
                        }}
                        className={`flex-1 py-2.5 min-h-[44px] text-[11px] font-medium transition-colors ${
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
                      id="signup-birthtime"
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
                        Don&apos;t know your birth time? We&apos;ll build everything that doesn&apos;t depend on it — which is more than you&apos;d think.
                      </p>
                      {/* Same as the other one: a styled <button> that never
                          said whether it was checked. */}
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={dayNightKnown}
                        onClick={() => setDayNightKnown(!dayNightKnown)}
                        className="flex items-center gap-2 py-2 min-h-[44px]"
                      >
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            dayNightKnown ? "border-sage bg-sage" : "border-foreground/55"
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
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all inline-flex items-center gap-1.5 ${
                              isDaytime === true ? "border-amber bg-amber/10 text-amber" : "border-foreground/15 text-muted"
                            }`}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
                            </svg>
                            Daytime
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsDaytime(false)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all inline-flex items-center gap-1.5 ${
                              isDaytime === false ? "border-sage bg-sage/10 text-sage" : "border-foreground/15 text-muted"
                            }`}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                            Nighttime
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </fieldset>

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

                {/*
                  role="alert", and coloured as an error rather than as the
                  brand gold — which is the same colour as the Terms and
                  Privacy links beside it. Nothing announced this before, so a
                  blind user pressed the button, heard the spinner come and
                  go, and never learned why no account was made.
                */}
                {error && (
                  <p
                    id="signup-error"
                    role="alert"
                    className="text-xs text-center font-semibold"
                    style={{ color: "var(--danger-text)" }}
                  >
                    {error}
                  </p>
                )}

                {/*
                  Submit.
                  NOT `disabled` any more. A disabled button leaves the tab
                  order, so someone who could not select a city — which was
                  everybody using a keyboard, see CitySearch — tabbed past the
                  password straight out of the page. The control that creates
                  the account simply did not exist for them, with no error and
                  nothing to explain it. It stays reachable now and says what
                  is missing when pressed.
                */}
                <button
                  onClick={handleBirthSubmit}
                  aria-disabled={!birthValid || isSubmitting}
                  aria-describedby={error ? "signup-error" : undefined}
                  className={ctaBtn(!!birthValid && !isSubmitting)}
                  style={birthValid && !isSubmitting ? { ...ctaShadow, ...ctaTextColor } : undefined}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 rounded-full animate-spin" role="status" aria-label="Loading" style={{ borderColor: "rgba(61,36,21,0.3)", borderTopColor: "#3d2415" }} />
                      Calculating your chart...
                    </span>
                  ) : (
                    "Build my chart"
                  )}
                </button>

                {!existingUserId && (
                  <button
                    // Was router.push("/welcome?mode=signin"), which discarded the
                      // name, date, time and city they had already typed — none
                      // of it is persisted — and landed them on a different
                      // screen. The checkbox above does the same job in place.
                      onClick={() => { setHasAccount(true); requestAnimationFrame(() => document.getElementById("signup-email")?.focus()); }}
                    className="text-terracotta text-xs hover:opacity-80 transition-colors self-center pb-2"
                  >
                    Already have an account?{" "}
                    <span className="underline underline-offset-2">Sign in</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ══════════ Screen 4: Keep this (account) ══════════
              The account ask, after the chart rather than before it. */}
          {!awaitingConfirm && step === 4 && (
            <div className="flex-1 overflow-y-auto px-5 pt-16 pb-8">
              <h1 tabIndex={-1} className="text-[26px] text-foreground mb-2 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                Keep this
              </h1>
              <p className="text-secondary text-xs mb-1">
                Your chart&rsquo;s built. Make an account and it&rsquo;s here whenever you open Mapped.
              </p>
              <p className="text-muted text-[11px] mb-5 leading-relaxed">
                Your first {TRIAL_DAYS} days include everything, Dolly and all &mdash; no card, no charge.
              </p>

              <div className="flex flex-col gap-3">
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
                        id="signup-email"
                        autoComplete="email"
                        inputMode="email"
                        aria-label="Email"
                        className={inputClass}
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password (6+ characters)"
                        id="signup-password"
                        autoComplete={hasAccount ? "current-password" : "new-password"}
                        minLength={6}
                        aria-label="Password"
                        aria-describedby="password-hint"
                        className={inputClass}
                      />
                      {/*
                        Rendered whenever the field is empty OR short, not
                        only while short. The input declares
                        aria-describedby="password-hint" permanently, so on an
                        empty field it pointed at nothing — and an empty field
                        is exactly when someone needs to hear the rule.
                      */}
                      {password.length < 6 && (
                        <p id="password-hint" className="text-terracotta text-[11px] -mt-1" role="status">
                          {password.length === 0
                            ? "At least 6 characters. A few unrelated words beats one clever one."
                            : `Passwords need at least 6 characters — ${6 - password.length} more to go.`}
                        </p>
                      )}
                      {/*
                        A real checkbox, semantically.
                        This was a <button> styled as one, with no role and no
                        aria-checked, so a screen reader said "I already have
                        an account, button" and never whether it was on. It
                        decides whether the flow calls signUp or
                        signInWithPassword, so a returning user who cannot
                        perceive its state gets "already registered" errors
                        they have no way to explain. py-2 takes the row past
                        the 24px minimum target, which its 17px height failed.
                      */}
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={hasAccount}
                        onClick={() => setHasAccount(!hasAccount)}
                        className="flex items-center gap-2 self-start py-2 min-h-[44px]"
                      >
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            hasAccount ? "border-terracotta" : "border-foreground/55"
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


                {error && (
                  <p id="account-error" role="alert" className="text-xs text-center font-semibold" style={{ color: "var(--danger-text)" }}>
                    {error}
                  </p>
                )}

                <button
                  onClick={handleAccountSubmit}
                  aria-disabled={!accountValid || isSubmitting}
                  aria-describedby={error ? "account-error" : undefined}
                  className={ctaBtn(!!accountValid && !isSubmitting)}
                  style={accountValid && !isSubmitting ? { ...ctaShadow, ...ctaTextColor } : undefined}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" role="status" aria-label="Saving your chart" />
                      Saving your chart…
                    </span>
                  ) : hasAccount ? "Sign in & keep my chart" : "Create my account"}
                </button>
              </div>
            </div>
          )}

          {/* ══════════ Screen 5: Demographics (after the reveal) ══════════ */}
          {!awaitingConfirm && step === 5 && (
            <div className="flex-1 flex flex-col px-5 pt-12 pb-5 overflow-y-auto">
              <h1 tabIndex={-1}
                className="text-[28px] text-foreground mb-1 tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Tell us about you
              </h1>
              {/*
                Say who reads it and what it buys.
                These options include bereavement, pregnancy, divorce, caring
                for a parent and being out of work — health, grief and
                relationship data — collected four screens into a signup and
                justified by five words. It also goes to Dolly with every
                question she answers, which was disclosed only on the privacy
                page. Someone handing this over deserves to know both before
                they tap, not after.
              */}
              <p className="text-secondary text-xs mb-1">
                Only if you want to &mdash; every one of these can stay blank.
              </p>
              <p className="text-muted text-[11px] mb-4 leading-relaxed">
                Dolly reads this when she answers, so a transit to your seventh house lands as
                something about your actual life rather than a textbook. You can change or clear any
                of it in Settings.
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
                      // Family situation offered this and Life stage did not,
                      // so the one asking about breakups and bereavement was
                      // the one with no way to decline explicitly.
                      "Prefer not to say",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        aria-pressed={lifeStage.includes(opt)}
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
                        aria-pressed={familySituation.includes(opt)}
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
          {!awaitingConfirm && step === 2 && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <h1 tabIndex={-1}
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
                    <span className="flex items-center gap-2.5">
                      <SignPlate sign={b.sign} size={42} tile />
                      <span className="text-[18px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                        {b.sign ? fullSign(b.sign) : "needs a birth time"}
                      </span>
                    </span>
                  </div>
                ))}
              </div>

              {/*
                Three states, not two.
                This used to be a bare day/night ternary, so a reader with no
                birth time — for whom sect is unknowable, because it is
                entirely a question of whether the Sun was above the horizon —
                fell into the "night" branch and was told as plain fact that
                they were born at night and their Moon was in charge. It was
                the first thing they saw after handing over their details, and
                for about half of them it was false. getSectLight now returns
                null rather than guessing; this says so out loud.
              */}
              {!sectInfo ? (
                <>
                  <p className="text-base leading-relaxed max-w-xs mb-3 opacity-90">
                    Whether you&rsquo;re a day chart or a night chart, we can&rsquo;t say yet.
                  </p>
                  <p className="text-sm leading-relaxed max-w-xs opacity-75 mb-10">
                    It depends on where the Sun sat at your birth hour, so it&rsquo;s the one thing a
                    birth time is genuinely needed for. Everything else below holds without it &mdash;
                    and if you find your time later, add it in Settings and this fills itself in.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base leading-relaxed max-w-xs mb-3 opacity-90">
                    {sectInfo.sect === "day"
                      ? "You were born during the day."
                      : "You were born at night."}
                  </p>
                  <p className="text-sm leading-relaxed max-w-xs opacity-75 mb-10">
                    {sectInfo.sect === "day"
                      ? "Your Sun is in charge. Day charts run outward — visible, driven, oriented toward action."
                      : "Your Moon is in charge. Night charts run inward — reflective, intuitive, led by feeling."}
                  </p>
                </>
              )}
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
          {!awaitingConfirm && step === 3 && (
            <div className="flex-1 flex flex-col items-center justify-center px-5 pt-14 pb-8">
              {/*
                Counted from what is actually there.
                This said "Three things to know" unconditionally. Chart ruler
                and lord of the year both need houses, and sect needs a birth
                hour, so a reader without a time saw a heading promising three
                things above an empty space and a Continue button — a heading
                that counts what is not there is the worst kind of empty state.
              */}
              <h1 tabIndex={-1}
                className="text-[24px] text-foreground mb-5 tracking-tight text-center"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {headlineCards.length === 0
                  ? "What we can read without a time"
                  : headlineCards.length === 1
                  ? "One thing to know"
                  : headlineCards.length === 2
                  ? "Two things to know"
                  : "Three things to know"}
              </h1>

              {headlineCards.length === 0 && (
                <p className="text-secondary text-sm leading-relaxed max-w-xs text-center mb-8">
                  Your Sun and Moon are solid &mdash; they barely move in a day, so they hold whether or
                  not you know your birth hour. Your rising sign, your houses and your sect all need one.
                  If you find it later, add it in Settings and the rest of your chart fills in.
                </p>
              )}

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

          {/* ══════════ Screen 6: Meet Dolly ══════════ */}
          {!awaitingConfirm && step === 6 && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="mb-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={TERRACOTTA} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <h1 tabIndex={-1}
                className="text-[30px] text-foreground mb-3 tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Meet Dolly
              </h1>
              {/*
                Three paragraphs to two, and two claims removed.
                "Ask her anything" is the absolute lib/ai/dailyLimits exists to
                retire — there is a real daily cap, and the plan copy was
                rewritten to stop implying otherwise. This was the last screen
                still making the promise. "Tells you the truth" is not
                something anyone can say about a language model, and it is the
                sentence that gets quoted back after her first confident
                mistake. The screen also never said she was the paid tier, so
                someone met her as an ordinary part of the app and lost her on
                day eight.
              */}
              <p className="text-secondary text-sm leading-relaxed max-w-xs mb-3">
                Dolly is your AI guide. She reads your chart against the current sky &mdash; your transits,
                your timing, the people you add &mdash; and answers in plain language. Less
                fortune-telling, more a sharp second opinion on what&apos;s actually in front of you.
              </p>
              <p className="text-secondary text-xs leading-relaxed max-w-xs mb-8">
                She&apos;s an AI, so she gets things wrong sometimes &mdash; Skeptic Mode will show you the
                tradition behind any answer. She&apos;s on us for your first {TRIAL_DAYS}{" "}
                days, then she lives in Mapped+. The rest of Mapped stays free either way.
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

          {/* ══════════ Screen 7: Pick Your Free Deck ══════════ */}
          {!awaitingConfirm && step === 7 && (
            <div className="flex-1 flex flex-col items-center justify-center px-5 pt-14 pb-8">
              <h1 tabIndex={-1}
                className="text-[26px] text-foreground mb-2 tracking-tight text-center"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Pick your free deck
              </h1>
              <p className="text-secondary text-xs mb-6 text-center max-w-xs">
                One oracle deck is on us — yours forever. You can buy the others
                any time for {formatPrice(STORE_DECKS[0]?.priceCents ?? 555)} each.
              </p>

              {/* The real catalog, with the real card art, so what you choose
                  here is the thing that shows up in My Decks. */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-6">
                {STORE_DECKS.filter((d) => d.status === "available").map((deck) => {
                  const picked = deckChoice === deck.id;
                  return (
                    <button
                      key={deck.id}
                      onClick={() => { setDeckChoice(deck.id); setDeckError(""); }}
                      aria-pressed={picked}
                      className={`rounded-2xl border-2 overflow-hidden text-left transition-all ${
                        picked ? "border-terracotta" : "border-foreground/15"
                      }`}
                    >
                      {/* Same fanned stack the store uses, so a deck looks
                          like itself wherever you meet it. */}
                      <div className="w-full" style={{ aspectRatio: "20 / 23", background: "var(--background-card)" }}>
                        <DeckStack deckId={deck.id} fallbackImage={deck.coverImage} alt={deck.name} />
                      </div>
                      <div className="px-2.5 py-2">
                        <p className="text-foreground font-bold text-[12.5px] leading-snug line-clamp-2">{deck.name}</p>
                        <p className="text-secondary text-[11px] mt-0.5">{deck.cardCount} cards</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {deckError && (
                <p className="text-[12px] text-center mb-3 max-w-xs" role="alert" style={{ color: "var(--oxblood-light)" }}>
                  {deckError}
                </p>
              )}

              <button
                onClick={saveDeck}
                disabled={!deckChoice || claimingDeck}
                className={ctaBtn(!!deckChoice && !claimingDeck)}
                style={deckChoice && !claimingDeck ? { ...ctaShadow, ...ctaTextColor } : undefined}
              >
                {claimingDeck ? "Adding it to your decks…" : "This one, please"}
              </button>

              <button
                onClick={goNext}
                className="text-secondary text-xs font-semibold py-3 mt-1 hover:text-foreground transition-colors"
              >
                Skip — I&apos;ll choose later
              </button>
            </div>
          )}

          {/* ══════════ Screen 8: Notifications ══════════ */}
          {!awaitingConfirm && step === 8 && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="mb-5">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={TERRACOTTA} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <h1 tabIndex={-1}
                className="text-[26px] text-foreground mb-3 tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Stay in the loop
              </h1>
              <p className="text-secondary text-sm mb-2 max-w-xs leading-relaxed">
                New and full moons, eclipses, and the transits that actually hit your chart.
              </p>
              <p className="text-muted text-xs mb-8 max-w-xs leading-relaxed">
                A few a week, at 7pm your time. Nothing chasing you to come back. Change any of it
                in Settings.
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
                            // practice_reminders and re_engagement default OFF.
                            // The button above promises "a few a week" and
                            // "moments that matter"; a re-engagement nudge is
                            // a retention ping, not a moment that matters, and
                            // switching it on under that sentence is the
                            // sentence not being true. Both are still
                            // available in Settings for anyone who wants them.
                            daily_content: false, practice_reminders: false, re_engagement: false,
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

          {/* ══════════ Screen 9: Moon Practice ══════════ */}
          {!awaitingConfirm && step === 9 && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="mb-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={TERRACOTTA} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
              <h1 tabIndex={-1}
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

          {/* ══════════ Screen 10: Final Orientation ══════════ */}
          {!awaitingConfirm && step === 10 && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <h1 tabIndex={-1}
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
                  { label: "Rituals", desc: "Moon work" },
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
