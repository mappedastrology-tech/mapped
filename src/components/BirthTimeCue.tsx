"use client";

/**
 * BirthTimeCue — UI components for time-dependent feature gating.
 *
 * TierABadge: small inline badge for features that show with caveats
 * TierBPlaceholder: full card replacement for hidden features
 * ApproximateBadge: badge shown on chart wheel for approximate time
 */

import { useRouter } from "next/navigation";
import { useBirthTime } from "@/components/BirthTimeProvider";
import { BIRTH_TIME_COPY } from "@/lib/birth-time";

/**
 * Small inline badge for Tier A features (visible with soft cue).
 * Shows "Needs exact birth time" with a refine link.
 */
export function TierABadge({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { precision } = useBirthTime();

  if (precision === "exact") return null;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber/10 border border-amber/20">
        <span className="text-[9px] text-amber font-medium italic">approximate</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-[10px] italic text-foreground/40">Needs exact birth time</span>
      <button
        onClick={() => router.push("/account#birth-time")}
        className="text-[10px] text-terracotta/70 hover:text-terracotta transition-colors underline"
      >
        Refine
      </button>
    </div>
  );
}

/**
 * Full card placeholder for Tier B features (hidden entirely).
 * Replaces the feature with a gentle explainer + CTAs.
 */
export function TierBPlaceholder({
  feature,
  customCopy,
  showRectification = true,
  showSkip = false,
  onSkip,
}: {
  feature: "astrocartography" | "profections" | "lord_of_year" | "zr_timeline" | "generic";
  customCopy?: string;
  showRectification?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
}) {
  const router = useRouter();

  const copy = customCopy || getCopyForFeature(feature);

  return (
    <div className="rounded-2xl border border-foreground/10 bg-foreground/3 p-5">
      <p className="text-sm text-foreground/60 leading-relaxed mb-4">{copy}</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => router.push("/account#birth-time")}
          className="px-4 py-2 rounded-full bg-terracotta/10 border border-terracotta/25 text-terracotta text-xs font-medium hover:bg-terracotta/15 transition-colors"
        >
          Add my birth time
        </button>
        {showRectification && (
          <button
            onClick={() => router.push("/rectification")}
            className="px-4 py-2 rounded-full border border-foreground/15 text-foreground/50 text-xs font-medium hover:border-foreground/25 transition-colors"
          >
            Try rectification
          </button>
        )}
        {showSkip && onSkip && (
          <button
            onClick={onSkip}
            className="px-4 py-2 text-foreground/35 text-xs hover:text-foreground/50 transition-colors"
          >
            Skip — show me other things
          </button>
        )}
      </div>
    </div>
  );
}

function getCopyForFeature(feature: string): string {
  switch (feature) {
    case "astrocartography":
      return BIRTH_TIME_COPY.feature_hidden_astrocartography;
    case "profections":
    case "lord_of_year":
      return BIRTH_TIME_COPY.feature_hidden_profections;
    default:
      return BIRTH_TIME_COPY.feature_hidden_generic("This feature");
  }
}

/**
 * Badge shown on chart wheel or Rising sign card.
 * Taps open an explainer sheet.
 */
export function PrecisionBadge() {
  const { precision } = useBirthTime();

  if (precision === "exact") return null;

  const label = precision === "rectified" ? "Rectified time" : "Time approximate";
  const color = precision === "rectified" ? "sage" : "amber";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-${color}/10 border border-${color}/20`}>
      <span className={`text-[9px] text-${color} font-medium italic`}>{label}</span>
    </span>
  );
}

/**
 * Re-prompt banner that shows on appropriate days.
 * Includes "Stop asking me about this" one-tap dismiss.
 */
export function BirthTimeRepromptBanner() {
  const { precision, repromptDay, dismissReprompts, markRepromptShown } = useBirthTime();
  const router = useRouter();

  if (precision !== "unknown" || !repromptDay) return null;

  // Mark as shown
  markRepromptShown(repromptDay);

  const copy = getRepromptCopyLocal(repromptDay);

  return (
    <div className="mx-4 mb-3 rounded-xl border border-amber/20 bg-amber/5 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <p className="text-sm font-medium text-foreground/80 mb-0.5">{copy.title}</p>
      <p className="text-xs text-foreground/50 mb-3">{copy.body}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/account#birth-time")}
          className="text-xs text-terracotta font-medium"
        >
          Add birth time
        </button>
        <button
          onClick={dismissReprompts}
          className="text-[10px] text-foreground/30 hover:text-foreground/50 transition-colors"
        >
          Stop asking me about this
        </button>
      </div>
    </div>
  );
}

function getRepromptCopyLocal(day: number) {
  switch (day) {
    case 3: return { title: "Found your birth time?", body: "Add it for the full chart experience." };
    case 7: return { title: "A quick tip", body: "Try asking a parent about your birth time — even an approximate is helpful." };
    case 14: return { title: "Your chart has more to show", body: "Want to refine your birth time? Even a rough window helps." };
    case 30: return { title: "Last time we'll ask", body: "We won't keep asking. Add your time anytime in Settings." };
    default: return { title: "", body: "" };
  }
}
