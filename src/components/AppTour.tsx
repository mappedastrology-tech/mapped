"use client";

/**
 * AppTour — guided walkthrough overlay that appears on top of the real app.
 *
 * After onboarding education cards, this drops the user into the actual app
 * and walks them through each section with floating callout cards.
 * Each step navigates to the relevant tab and highlights what it does.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const TOUR_STEPS = [
  {
    route: "/you",
    title: "Your birth chart",
    description: "Every planet, house, and aspect in your chart — tap any placement to see what it means for you.",
    position: "bottom" as const, // card appears at bottom
  },
  {
    route: "/home",
    title: "Your daily overview",
    description: "Today's horoscope, card pulls, transits, and cosmic weather — refreshed every day based on what's happening in the sky.",
    position: "bottom" as const,
  },
  {
    route: "/maps",
    title: "Your map",
    description: "Add the people in your life — partner, family, friends — and see how your charts connect. Plus your astrocartography world map showing which places activate different energies for you.",
    position: "bottom" as const,
  },
  {
    route: "/tarot",
    title: "Card pulls",
    description: "Pull tarot and oracle cards for daily guidance. Save your pulls to your journal and explore their meaning with Dolly.",
    position: "bottom" as const,
  },
  {
    route: "/dolly",
    title: "Meet Dolly",
    description: "Your AI astrology guide. Ask her anything about your chart, a transit, a relationship, or what's coming up for you.",
    position: "bottom" as const,
  },
];

export default function AppTour({ onComplete }: { onComplete?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tourStep, setTourStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  const currentStep = TOUR_STEPS[tourStep];

  // Navigate to the correct route for the current step
  useEffect(() => {
    if (currentStep && pathname !== currentStep.route) {
      router.push(currentStep.route);
    }
  }, [tourStep, currentStep, pathname, router]);

  // Show the card after a short delay so the page renders first
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timer);
  }, [tourStep]);

  const handleNext = useCallback(() => {
    setVisible(false);
    if (tourStep < TOUR_STEPS.length - 1) {
      setTimeout(() => {
        setTourStep(tourStep + 1);
      }, 250);
    } else {
      // Tour complete
      sessionStorage.removeItem("showAppTour");
      setExiting(true);
      onComplete?.();
    }
  }, [tourStep, onComplete]);

  const handleSkip = useCallback(() => {
    sessionStorage.removeItem("showAppTour");
    setExiting(true);
    onComplete?.();
  }, [onComplete]);

  if (exiting) return null;

  return (
    <>
      {/* Semi-transparent overlay */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="App tour"
        className="fixed inset-0 z-[90] transition-opacity duration-300"
        style={{ backgroundColor: "var(--modal-overlay)", opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
        onClick={handleNext}
      />

      {/* Floating tour card */}
      <div
        className="fixed left-4 right-4 z-[95] max-w-lg mx-auto transition-all duration-300"
        style={{
          bottom: "100px", // above the bottom nav
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <div className="bg-background rounded-2xl border border-foreground/15 p-5 shadow-2xl">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-3">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  flex: i === tourStep ? 2 : 1,
                  backgroundColor: i === tourStep
                    ? "var(--terracotta)"
                    : i < tourStep
                      ? "var(--terracotta)"
                      : "var(--foreground)",
                  opacity: i <= tourStep ? 0.8 : 0.15,
                }}
              />
            ))}
          </div>

          <h3
            className="text-lg text-foreground mb-1.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {currentStep?.title}
          </h3>
          <p className="text-secondary text-sm leading-relaxed mb-4">
            {currentStep?.description}
          </p>

          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-muted text-xs hover:text-foreground transition-colors"
            >
              Skip tour
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-full bg-terracotta text-cream text-sm font-semibold
                         hover:bg-terracotta-light active:scale-[0.97] transition-all"
            >
              {tourStep < TOUR_STEPS.length - 1 ? "Next" : "Get started"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
