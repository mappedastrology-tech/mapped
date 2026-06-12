"use client";

// Birth data form — collects name, birthday, birth time, and birth city.
// Optional "Save my chart" checkbox reveals email/password fields to create
// an account and save in one step.

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CitySearch, { LocationResult } from "@/components/CitySearch";
import { supabase } from "@/lib/supabase";
import { saveChart, updateChart } from "@/lib/saveChart";

export default function NewChartWrapper() {
  return (
    <Suspense fallback={
      <main className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" />
      </main>
    }>
      <NewChart />
    </Suspense>
  );
}

function NewChart() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "true";
  const [editLoaded, setEditLoaded] = useState(false);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [unknownTime, setUnknownTime] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [location, setLocation] = useState<LocationResult | null>(null);

  // Pre-fill form with existing chart data when editing
  useEffect(() => {
    if (!isEdit || editLoaded) return;
    setEditLoaded(true);

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data } = await supabase
          .from("charts")
          .select("name, birth_date, birth_time, unknown_time, city_name, latitude, longitude")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!data) return;

        setName(data.name || "");
        setBirthDate(data.birth_date || "");
        setBirthTime(data.birth_time || "12:00");
        setUnknownTime(data.unknown_time || false);
        if (data.city_name && data.latitude != null && data.longitude != null) {
          setCityQuery(data.city_name);
          setLocation({
            display_name: data.city_name,
            lat: String(data.latitude),
            lon: String(data.longitude),
          });
        }
      } catch { /* ignore — just show blank form */ }
    })();
  }, [isEdit, editLoaded]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Save / account fields
  // Zodiac system preference
  const [zodiacSystem, setZodiacSystem] = useState<"tropical" | "sidereal">("tropical");
  const [ayanamsa, setAyanamsa] = useState<"lahiri" | "krishnamurti" | "raman">("lahiri");

  // Save / account fields
  const [wantsSave, setWantsSave] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasAccount, setHasAccount] = useState(false);

  function handleUnknownTimeToggle() {
    setUnknownTime(!unknownTime);
    if (!unknownTime) {
      setBirthTime("12:00");
    }
  }

  const baseValid = name.trim() && birthDate && birthTime && location;
  const saveValid = !wantsSave || (email.trim() && password.length >= 6);
  const isValid = baseValid && saveValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Step 1: Calculate the chart
      const response = await fetch("/api/chart/calculate", {
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

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Chart calculation failed. Please try again.");
      }

      const chartData = await response.json();

      // Step 2a: If editing, user is already logged in — just update
      if (isEdit) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await updateChart(session.user.id, chartData);
          try { sessionStorage.removeItem(`horoscope-v3-${new Date().toISOString().slice(0, 10)}`); } catch {}
          sessionStorage.removeItem("chartResult");
          router.push("/home");
          return;
        }
      }

      // Step 2b: If they want to save, create account (or sign in) and save
      if (wantsSave) {
        let userId: string | null = null;

        if (hasAccount) {
          // Sign in
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) {
            if (signInError.message.includes("Invalid login")) {
              throw new Error("Wrong email or password. Try again.");
            }
            throw signInError;
          }
          userId = data.user?.id || null;
        } else {
          // Sign up
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name: name.trim() } },
          });
          if (signUpError) {
            if (signUpError.message.includes("already registered")) {
              throw new Error("That email already has an account. Check \"I already have an account\" and sign in.");
            }
            if (signUpError.message.includes("Password should be")) {
              throw new Error("Password needs to be at least 6 characters.");
            }
            throw signUpError;
          }

          if (data.user && data.session) {
            userId = data.user.id;
          } else if (data.user && !data.session) {
            // Email confirmation required — save chart to sessionStorage for now
            sessionStorage.setItem("chartResult", JSON.stringify(chartData));
            sessionStorage.setItem("pendingSave", "true");
            router.push("/home");
            return;
          }
        }

        if (userId) {
          if (isEdit) {
            await updateChart(userId, chartData);
          } else {
            await saveChart(userId, chartData);
          }
          // Clear cached horoscope so it regenerates with new chart
          try { sessionStorage.removeItem(`horoscope-v3-${new Date().toISOString().slice(0, 10)}`); } catch {}
          router.push("/home");
          return;
        }
      }

      // No save — just store in sessionStorage
      sessionStorage.setItem("chartResult", JSON.stringify(chartData));
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Shared input class
  const inputClass = `w-full px-4 py-3.5 rounded-xl bg-surface border border-foreground/18
                      text-foreground placeholder:text-muted
                      focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/25
                      text-base`;

  return (
    <main className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
      {/* Top bar: back + sign in */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="text-muted text-sm hover:text-foreground transition-colors"
        >
          &larr; back
        </button>
        <button
          onClick={() => router.push("/account?mode=signin")}
          className="text-amber text-sm hover:text-amber/80 transition-colors font-medium"
        >
          Already have an account? <span className="underline">Sign in</span>
        </button>
      </div>

      {/* Page heading */}
      <h1
        className="text-3xl mb-2 text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {isEdit ? "Edit your chart" : "Your birth data"}
      </h1>
      <p className="text-muted text-sm mb-8">
        {isEdit ? "Update your details and we'll recalculate." : "The more accurate your data, the more accurate your chart."}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Full name */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-muted">
            Full name
          </label>
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
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-muted">
            Birth date
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            aria-label="Birth date"
            className={`${inputClass} [color-scheme:dark]`}
          />
        </div>

        {/* Birth time */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-muted">
            Birth time
          </label>
          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            disabled={unknownTime}
            aria-label="Birth time"
            className={`${inputClass} [color-scheme:dark]
                       ${unknownTime ? "opacity-40 cursor-not-allowed" : ""}`}
          />

          {/* Unknown time toggle */}
          <button
            type="button"
            onClick={handleUnknownTimeToggle}
            className="flex items-center gap-2 mt-1 self-start group"
          >
            <span
              className={`w-4 h-4 rounded border flex items-center justify-center transition-all
                         ${unknownTime
                           ? "bg-terracotta border-terracotta"
                           : "border-foreground/20 group-hover:border-foreground/40"
                         }`}
            >
              {unknownTime && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#F7EDDA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            <span className="text-sm text-muted group-hover:text-foreground transition-colors">
              I don&apos;t know my exact birth time
            </span>
          </button>

          {unknownTime && (
            <p className="text-xs text-amber/50 mt-1 pl-6">
              We&apos;ll use 12:00 PM as a default. Your Rising sign and house placements
              may be approximate.
            </p>
          )}
        </div>

        {/* Birth city */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-muted">
            Birth city
          </label>
          <CitySearch
            value={cityQuery}
            onChange={(val) => {
              setCityQuery(val);
              if (location && val !== location.display_name) {
                setLocation(null);
              }
            }}
            onSelect={(loc) => setLocation(loc)}
          />
          {location && (
            <p className="text-xs text-sage mt-1">
              &#10003; {location.display_name}
            </p>
          )}
        </div>

        {/* Zodiac system selector */}
        <div className="flex flex-col gap-3">
          <label className="text-xs uppercase tracking-widest text-muted">
            Zodiac system
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setZodiacSystem("tropical")}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border
                ${zodiacSystem === "tropical"
                  ? "bg-terracotta/15 border-terracotta/40 text-terracotta"
                  : "bg-surface border-foreground/18 text-muted hover:border-foreground/20"
                }`}
            >
              Western
              <span className="block text-[10px] mt-0.5 opacity-60">Tropical</span>
            </button>
            <button
              type="button"
              onClick={() => setZodiacSystem("sidereal")}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border
                ${zodiacSystem === "sidereal"
                  ? "bg-terracotta/15 border-terracotta/40 text-terracotta"
                  : "bg-surface border-foreground/18 text-muted hover:border-foreground/20"
                }`}
            >
              Vedic
              <span className="block text-[10px] mt-0.5 opacity-60">Sidereal</span>
            </button>
          </div>

          {/* Ayanamsa selector — only shown for sidereal */}
          {zodiacSystem === "sidereal" && (
            <div className="flex flex-col gap-2 animate-in fade-in duration-200">
              <label className="text-xs text-muted">Ayanamsa</label>
              <div className="flex gap-2">
                {([
                  { value: "lahiri", label: "Lahiri" },
                  { value: "krishnamurti", label: "KP" },
                  { value: "raman", label: "Raman" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAyanamsa(opt.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border
                      ${ayanamsa === opt.value
                        ? "bg-amber/15 border-amber/40 text-amber"
                        : "bg-surface border-foreground/18 text-muted hover:border-foreground/20"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted">
                Most Vedic astrologers use Lahiri. Choose based on your tradition.
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-foreground/8" />

        {/* Save my chart checkbox */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setWantsSave(!wantsSave)}
            className="flex items-center gap-3 self-start group"
          >
            <span
              className={`w-5 h-5 rounded border flex items-center justify-center transition-all
                         ${wantsSave
                           ? "bg-terracotta border-terracotta"
                           : "border-foreground/20 group-hover:border-foreground/40"
                         }`}
            >
              {wantsSave && (
                <svg width="12" height="10" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#F7EDDA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            <span className="text-sm text-secondary group-hover:text-foreground transition-colors">
              Save my chart so I don&apos;t have to enter this again
            </span>
          </button>

          {/* Account fields — slide in when checked */}
          {wantsSave && (
            <div className="flex flex-col gap-3 pl-8 animate-in fade-in duration-200">
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
                aria-describedby="password-hint-new"
                minLength={6}
                className={inputClass}
              />
              {password.length > 0 && password.length < 6 && (
                <p id="password-hint-new" className="text-terracotta text-[11px]" role="status">
                  Passwords need at least 6 characters — {6 - password.length} more to go.
                </p>
              )}

              {/* Already have an account toggle */}
              <button
                type="button"
                onClick={() => setHasAccount(!hasAccount)}
                className="flex items-center gap-2 self-start group"
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all
                             ${hasAccount
                               ? "bg-terracotta border-terracotta"
                               : "border-foreground/20 group-hover:border-foreground/40"
                             }`}
                >
                  {hasAccount && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#F7EDDA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span className="text-xs text-muted group-hover:text-foreground transition-colors">
                  I already have an account
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-terracotta text-sm text-center">{error}</p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`w-full py-4 rounded-full font-semibold text-base tracking-wide transition-all duration-200
                     ${isValid && !isSubmitting
                       ? "bg-terracotta text-cream hover:bg-terracotta-light active:scale-[0.98]"
                       : "bg-foreground/10 text-muted cursor-not-allowed"
                     }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" role="status" aria-label="Loading" />
              {wantsSave ? "Calculating & saving..." : "Calculating..."}
            </span>
          ) : wantsSave ? (
            "Calculate & save my chart"
          ) : (
            "Calculate my chart"
          )}
        </button>
      </form>
    </main>
  );
}
