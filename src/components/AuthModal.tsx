"use client";

/**
 * AuthModal — sign up or sign in to save your chart.
 *
 * This appears as a card at the bottom of the results page after
 * the user sees their chart. It's not a popup — it's inline.
 * Supports email/password + Google + Apple social login.
 */

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  // Called after successful auth, with the user's ID
  onAuthenticated: (userId: string) => void;
  // The person's name from their chart (pre-fills the name field)
  defaultName?: string;
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export default function AuthModal({ onAuthenticated, defaultName }: AuthModalProps) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(defaultName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          if (data.session) {
            onAuthenticated(data.user.id);
          } else {
            setSuccessMessage(
              "Check your email to confirm your account, then sign in below."
            );
            setMode("signin");
          }
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          onAuthenticated(data.user.id);
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("already registered")) {
          setError("This email already has an account. Try signing in instead.");
        } else if (err.message.includes("Invalid login")) {
          setError("Wrong email or password. Give it another try.");
        } else if (err.message.includes("Password should be")) {
          setError("Password needs to be at least 6 characters.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSocialLogin(provider: "google" | "apple") {
    setError("");
    try {
      // Store chart data before redirecting (OAuth will navigate away)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong with social login.");
      }
    }
  }

  const inputClass = `w-full px-4 py-3 rounded-xl bg-surface border border-foreground/18
                      text-foreground placeholder:text-foreground/30
                      focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/25
                      text-sm`;

  return (
    <div className="rounded-2xl bg-surface border border-foreground/15 p-6">
      {/* Header */}
      <h3
        className="text-xl text-foreground mb-1"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {mode === "signup" ? "Save your chart" : "Welcome back"}
      </h3>
      <p className="text-foreground/40 text-sm mb-5">
        {mode === "signup"
          ? "Create an account so your chart is always here."
          : "Sign in to see your saved charts."}
      </p>

      {/* Success message */}
      {successMessage && (
        <p className="text-sage text-sm mb-4 p-3 rounded-xl bg-sage/10 border border-sage/20">
          {successMessage}
        </p>
      )}

      {/* Social login buttons */}
      <div className="flex gap-2.5 mb-4">
        <button
          onClick={() => handleSocialLogin("google")}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                     bg-card border border-foreground/15 text-foreground/80 text-xs font-medium
                     hover:bg-elevated active:scale-[0.98] transition-all duration-200"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-foreground/10" />
        <span className="text-foreground/30 text-[11px]">or</span>
        <div className="flex-1 h-px bg-foreground/10" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Name field — only for sign up */}
        {mode === "signup" && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={inputClass}
          />
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className={inputClass}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (6+ characters)"
          required
          minLength={6}
          className={inputClass}
        />

        {/* Error */}
        {error && (
          <p className="text-terracotta text-xs">{error}</p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-full bg-terracotta text-cream font-semibold text-sm
                     tracking-wide hover:bg-terracotta-light active:scale-[0.98]
                     transition-all duration-200 disabled:opacity-50 mt-1"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              {mode === "signup" ? "Creating account..." : "Signing in..."}
            </span>
          ) : mode === "signup" ? (
            "Create account & save"
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {/* Toggle between sign up and sign in */}
      <p className="text-center text-foreground/40 text-xs mt-4">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button
              onClick={() => { setMode("signin"); setError(""); }}
              className="text-terracotta hover:text-terracotta-light transition-colors"
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            Need an account?{" "}
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className="text-terracotta hover:text-terracotta-light transition-colors"
            >
              Sign up
            </button>
          </>
        )}
      </p>
    </div>
  );
}
