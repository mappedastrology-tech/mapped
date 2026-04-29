"use client";

/**
 * Onboarding — full-screen swipeable cards, paper aesthetic.
 *
 * Steps:
 *  0  Birth data (required — no skip until complete)
 *  1  "Your Big Three" education
 *  2  "Houses & Aspects" education
 *  3  Tour — Your Chart (You tab)
 *  4  Tour — Your Connections (Maps tab)
 *  5  Tour — Daily Guidance (Home + Rituals)
 *  6  All set — CTA to enter app
 *
 * After birth data is submitted, a Skip button appears on every
 * remaining card. Swipe left/right or tap arrows to navigate.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import CitySearch, { LocationResult } from "@/components/CitySearch";
import { supabase } from "@/lib/supabase";
import { saveChart } from "@/lib/saveChart";

const TOTAL_STEPS = 3;

/* ── palette ── */
const PAPER = "var(--background)";
const PAPER_DEEP = "var(--background-elevated)";
const INK = "var(--foreground)";
const TERRACOTTA = "var(--terracotta)";
const AMBER = "var(--amber)";
const SAGE = "var(--sage)";

/* ── sign abbreviation → full name ── */
const SIGN_FULL: Record<string, string> = {
  Ari: "Aries",
  Tau: "Taurus",
  Gem: "Gemini",
  Can: "Cancer",
  Leo: "Leo",
  Vir: "Virgo",
  Lib: "Libra",
  Sco: "Scorpio",
  Sag: "Sagittarius",
  Cap: "Capricorn",
  Aqu: "Aquarius",
  Pis: "Pisces",
};

function fullSign(s?: string): string {
  if (!s) return "?";
  return SIGN_FULL[s] || s;
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
  const [cityQuery, setCityQuery] = useState("");
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [zodiacSystem, setZodiacSystem] = useState<"tropical" | "sidereal">("tropical");
  const [ayanamsa, setAyanamsa] = useState<"lahiri" | "krishnamurti" | "raman">("lahiri");

  /* ── account fields ── */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasAccount, setHasAccount] = useState(false);
  const [existingUserId, setExistingUserId] = useState<string | null>(null);
  const [existingUserName, setExistingUserName] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [birthDataDone, setBirthDataDone] = useState(false);

  /* ── check if user is already signed in (e.g. via Google OAuth) ── */
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

  /* ── big three (for personalizing education cards) ── */
  const [bigThree, setBigThree] = useState<{ sun?: string; moon?: string; rising?: string } | null>(null);

  /* ── swipe handling ── */
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const canGoNext = step < TOTAL_STEPS - 1 && (step !== 0 || birthDataDone);
  const canGoPrev = step > 0;

  const goTo = useCallback(
    (next: number, dir: "left" | "right") => {
      if (animating) return;
      if (next < 0 || next >= TOTAL_STEPS) return;
      if (next > 0 && !birthDataDone) return;
      setDirection(dir);
      setAnimating(true);
      setTimeout(() => {
        setStep(next);
        setAnimating(false);
      }, 280);
    },
    [animating, birthDataDone],
  );

  const next = useCallback(() => canGoNext && goTo(step + 1, "left"), [canGoNext, goTo, step]);
  const prev = useCallback(() => canGoPrev && goTo(step - 1, "right"), [canGoPrev, goTo, step]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }
  function onTouchMove(e: React.TouchEvent) {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }
  function onTouchEnd() {
    if (Math.abs(touchDeltaX.current) > 50) {
      if (touchDeltaX.current < 0) next();
      else prev();
    }
  }

  /* ── skip to app ── */
  async function finishOnboarding() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", session.user.id);
    }
    router.replace("/home");
  }

  /* ── launch guided tour inside the real app ── */
  async function launchTour() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", session.user.id);
    }
    sessionStorage.setItem("showAppTour", "true");
    router.replace("/you");
  }

  /* ── birth data submit ── */
  const birthValid = name.trim() && birthDate && birthTime && location;
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
          birthTime,
          unknownTime,
          latitude: parseFloat(location!.lat),
          longitude: parseFloat(location!.lon),
          cityName: location!.display_name,
          zodiacSystem,
          ...(zodiacSystem === "sidereal" ? { ayanamsa } : {}),
        }),
      });
      if (!res.ok) throw new Error("Chart calculation failed. Try again.");
      const chartData = await res.json();

      if (chartData.bigThree) setBigThree(chartData.bigThree);

      let userId: string | null = existingUserId;
      if (existingUserId) {
        // Already signed in (e.g. via Google) — skip auth
      } else if (hasAccount) {
        const { data, error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw new Error(e.message.includes("Invalid login") ? "Wrong email or password." : e.message);
        userId = data.user?.id || null;
      } else {
        const { data, error: e } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() } },
        });
        if (e) {
          // Self-heal: if the email is already registered (e.g. from a
          // previous failed attempt where signup succeeded but saveChart
          // crashed), try to sign in with the same password instead of
          // forcing the user to toggle a checkbox.
          if (
            e.message.includes("already registered") ||
            e.message.toLowerCase().includes("user already")
          ) {
            const { data: signInData, error: signInErr } =
              await supabase.auth.signInWithPassword({ email, password });
            if (signInErr) {
              if (signInErr.message.includes("Invalid login")) {
                throw new Error(
                  "This email is already registered, but the password doesn't match. Try a different email, or sign in from the link below.",
                );
              }
              throw new Error(signInErr.message);
            }
            userId = signInData.user?.id || null;
          } else {
            throw new Error(e.message);
          }
        } else if (data.user && data.session) {
          userId = data.user.id;
        } else if (data.user && !data.session) {
          sessionStorage.setItem("chartResult", JSON.stringify(chartData));
          sessionStorage.setItem("pendingSave", "true");
          setBirthDataDone(true);
          next();
          return;
        }
      }

      if (userId) {
        await saveChart(userId, chartData);
      }

      setBirthDataDone(true);
      // auto-advance to Big Three (step 1)
      setDirection("left");
      setAnimating(true);
      setTimeout(() => {
        setStep(1);
        setAnimating(false);
      }, 280);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── progress dots ── */
  const dots = Array.from({ length: TOTAL_STEPS }, (_, i) => i);

  /* ── shared input style (paper aesthetic) ── */
  const inputClass = `w-full px-4 py-2.5 rounded-xl
                      bg-card/50 border border-foreground/15
                      text-foreground placeholder:text-foreground/35
                      focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20
                      text-sm`;

  const labelClass = "text-[10px] uppercase tracking-widest text-foreground/55 font-semibold";

  /* ── animation classes ── */
  const slideClass = animating
    ? direction === "left"
      ? "translate-x-[-100%] opacity-0"
      : "translate-x-[100%] opacity-0"
    : "translate-x-0 opacity-100";

  /* ── section ghost card — used across all education/tour steps ── */
  const ghostCard = "rounded-2xl border border-foreground/12 bg-card/45 px-4 py-3";

  return (
    <main
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at top, ${PAPER} 0%, ${PAPER_DEEP} 100%)`,
        color: INK,
      }}
    >
      {/* Paper grain */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(${INK} 0.5px, transparent 0.5px)`,
          backgroundSize: "3px 3px",
        }}
      />

      {/* ── Mobile-width column, centered ── */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative z-10 w-full max-w-[440px] mx-auto flex-1 flex flex-col overflow-hidden"
      >
        {/* ── Progress bar ── */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-4 pt-4">
          {dots.map((i) => (
            <div
              key={i}
              className="flex-1 h-0.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  i < step ? TERRACOTTA : i === step ? INK : "rgba(42,31,24,0.15)",
              }}
            />
          ))}
        </div>

        {/* ── Skip button (only after birth data) ── */}
        {birthDataDone && step < TOTAL_STEPS - 1 && (
          <button
            onClick={finishOnboarding}
            className="absolute top-8 right-5 z-30 text-foreground/55 text-xs font-semibold uppercase tracking-widest hover:text-foreground transition-colors"
          >
            Skip
          </button>
        )}

        {/* ── Card area ── */}
        <div className={`flex-1 flex flex-col transition-all duration-280 ease-out ${slideClass}`}>
          {/* ══════════ Step 0: Birth Data ══════════ */}
          {step === 0 && (
            <div className="flex-1 flex flex-col px-5 pt-12 pb-5 overflow-y-auto">
              <h1
                className="text-[28px] text-foreground mb-1 tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Your birth data
              </h1>
              <p className="text-foreground/55 text-xs mb-4">
                The more accurate your info, the more accurate your chart.
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
                    className={inputClass}
                  />
                </div>

                {/* Birth time */}
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Birth time</label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    disabled={unknownTime}
                    className={`${inputClass} ${unknownTime ? "opacity-40" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUnknownTime(!unknownTime);
                      if (!unknownTime) setBirthTime("12:00");
                    }}
                    className="flex items-center gap-2 mt-1 self-start"
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        unknownTime ? "border-terracotta" : "border-foreground/30"
                      }`}
                      style={{ backgroundColor: unknownTime ? TERRACOTTA : "transparent" }}
                    >
                      {unknownTime && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke={PAPER} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="text-[11px] text-foreground/55">I don&apos;t know my exact birth time</span>
                  </button>
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
                  {location && <p className="text-[11px]" style={{ color: SAGE }}>✓ {location.display_name}</p>}
                </div>

                {/* Zodiac system */}
                <div className="flex flex-col gap-1.5">
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
                            : "border-foreground/15 text-foreground/50 bg-card/40"
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
                              : "border-foreground/15 text-foreground/45 bg-card/40"
                          }`}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account — hidden if already signed in */}
                {existingUserId ? (
                  <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-sage/10 border border-sage/25">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SAGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span className="text-[12px] text-foreground/70">
                      Signed in{existingUserName ? ` as ${existingUserName}` : ""}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Divider */}
                    <div className="h-px bg-foreground/12 my-1" />

                    {/* Account */}
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>Create your account</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className={inputClass}
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password (6+ characters)"
                        className={inputClass}
                      />
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
                        <span className="text-[11px] text-foreground/55">I already have an account</span>
                      </button>
                    </div>
                  </>
                )}

                {/* Error */}
                {error && <p className="text-terracotta text-xs text-center font-semibold">{error}</p>}

                {/* Submit */}
                <button
                  onClick={handleBirthSubmit}
                  disabled={!birthValid || !accountValid || isSubmitting}
                  className={`w-full py-3.5 rounded-full font-bold text-sm tracking-wide transition-all mt-1 ${
                    birthValid && accountValid && !isSubmitting
                      ? "bg-terracotta text-cream hover:bg-terracotta-light active:scale-[0.98]"
                      : "bg-foreground/15 text-foreground/40 cursor-not-allowed"
                  }`}
                  style={
                    birthValid && accountValid && !isSubmitting
                      ? {
                          boxShadow:
                            "0 8px 20px -6px rgba(180, 81, 40, 0.4), 0 3px 8px -3px rgba(180, 81, 40, 0.25)",
                        }
                      : undefined
                  }
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                      Calculating your chart...
                    </span>
                  ) : (
                    "Calculate & save my chart"
                  )}
                </button>

                {/* Sign in link — hidden if already signed in */}
                {!existingUserId && (
                  <button
                    onClick={() => router.push("/account?mode=signin")}
                    className="text-terracotta text-xs hover:text-terracotta-light transition-colors self-center pb-2"
                  >
                    Already have an account?{" "}
                    <span className="underline underline-offset-2">Sign in</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ══════════ Step 1: Your Big Three ══════════ */}
          {step === 1 && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-14 pb-16">
              <div
                className="text-3xl mb-4 opacity-60"
                style={{ fontFamily: "'Noto Sans Symbols 2'", color: TERRACOTTA }}
              >
                ☉ ☽ ↑
              </div>
              <h1
                className="text-[34px] text-foreground mb-3 tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Your Big Three
              </h1>

              {bigThree && (
                <div className="flex gap-2 mb-5 w-full max-w-sm">
                  {[
                    { label: "Sun", sign: bigThree.sun },
                    { label: "Moon", sign: bigThree.moon },
                    { label: "Rising", sign: bigThree.rising },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex-1 min-w-0 text-center py-2.5 px-2 rounded-xl border border-terracotta/30 bg-terracotta/10"
                    >
                      <p className="text-foreground text-[13px] font-bold tracking-tight truncate">
                        {fullSign(item.sign)}
                      </p>
                      <p className="text-foreground/50 text-[9px] uppercase tracking-widest mt-0.5 font-semibold">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2.5 text-left w-full max-w-sm">
                <div className={ghostCard}>
                  <p className="text-terracotta text-[11px] font-bold mb-1 uppercase tracking-wide">☉ Sun Sign</p>
                  <p className="text-foreground/70 text-[11px] leading-relaxed">
                    Your core identity — who you are at the deepest level. This is what most people know as their &ldquo;sign.&rdquo; It shapes your ego, willpower, and life direction.
                  </p>
                </div>
                <div className={ghostCard}>
                  <p className="text-terracotta text-[11px] font-bold mb-1 uppercase tracking-wide">☽ Moon Sign</p>
                  <p className="text-foreground/70 text-[11px] leading-relaxed">
                    Your emotional inner world — how you process feelings, what you need to feel safe, and how you nurture yourself and others.
                  </p>
                </div>
                <div className={ghostCard}>
                  <p className="text-terracotta text-[11px] font-bold mb-1 uppercase tracking-wide">↑ Rising Sign</p>
                  <p className="text-foreground/70 text-[11px] leading-relaxed">
                    Your outward persona — the energy you project to the world, your first impression, and the lens through which you approach new experiences.
                  </p>
                </div>
              </div>

              <button
                onClick={next}
                className="mt-6 px-8 py-2.5 rounded-full border-2 border-foreground text-foreground text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background active:scale-95 transition-all"
              >
                Next
              </button>
            </div>
          )}

          {/* ══════════ Step 2: Houses & Aspects ══════════ */}
          {step === 2 && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-14 pb-16">
              <div className="text-2xl mb-4 opacity-60">🏠 ⚡</div>
              <h1
                className="text-[34px] text-foreground mb-2 tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Houses & Aspects
              </h1>
              <p className="text-foreground/55 text-xs mb-5 max-w-xs">
                Two more building blocks that make your chart uniquely yours.
              </p>

              <div className="space-y-2.5 text-left w-full max-w-sm">
                <div className={ghostCard}>
                  <p className="text-terracotta text-[11px] font-bold mb-1 uppercase tracking-wide">The 12 Houses</p>
                  <p className="text-foreground/70 text-[11px] leading-relaxed">
                    Houses are life areas — career, relationships, home, creativity, spirituality. Where a planet lands in your chart tells you which area of life it activates. Your chart has all 12, and we'll show you exactly where each one falls.
                  </p>
                </div>
                <div className={ghostCard}>
                  <p className="text-terracotta text-[11px] font-bold mb-1 uppercase tracking-wide">Aspects</p>
                  <p className="text-foreground/70 text-[11px] leading-relaxed">
                    Aspects are angles between planets. Harmonious (trines, sextiles) — things flow. Tense (squares, oppositions) — they create friction but drive growth. Tension builds character.
                  </p>
                </div>
                <div className={ghostCard}>
                  <p className="text-terracotta text-[11px] font-bold mb-1 uppercase tracking-wide">Putting it together</p>
                  <p className="text-foreground/70 text-[11px] leading-relaxed">
                    Planet = what energy. Sign = how it expresses. House = where in life. Aspects = how planets talk to each other. That&apos;s the whole framework.
                  </p>
                </div>
              </div>

              <button
                onClick={launchTour}
                className="mt-6 px-10 py-3.5 rounded-full bg-terracotta text-cream font-bold text-sm tracking-wide hover:bg-terracotta-light active:scale-95 transition-all"
                style={{
                  boxShadow:
                    "0 12px 24px -8px rgba(180, 81, 40, 0.4), 0 4px 8px -4px rgba(180, 81, 40, 0.25)",
                }}
              >
                Show me around →
              </button>
            </div>
          )}
        </div>

        {/* ── Bottom nav arrows (not on birth data) ── */}
        {step >= 1 && step < TOTAL_STEPS - 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-between px-6 z-20">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-foreground/25 bg-card/40 flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-foreground/50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-foreground/25 bg-card/40 flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-foreground/50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
