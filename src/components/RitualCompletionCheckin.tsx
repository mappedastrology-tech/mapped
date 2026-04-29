"use client";

/**
 * Post-ritual completion check-in — 3 micro-steps:
 * 1. Mood word picker (20-word tappable grid)
 * 2. Fit rating (3 buttons: not really / some / yes)
 * 3. Optional journal
 *
 * Takes 10 seconds minimum, 60 seconds if journaling.
 * Gentle, dismissible, no "great job!" copy.
 * All colors use CSS custom properties for light/dark theme support.
 */

import { useState } from "react";
import { useToast } from "@/components/Toast";
import {
  MOOD_PALETTE,
  FIT_RATING_OPTIONS,
  saveCompletion,
  type MoodWord,
  type FitRating,
  type MoodCategory,
} from "@/lib/feedback";

interface Props {
  ritualId: string;
  ritualTitle: string;
  moonPhase: string;
  zodiacSeason: string;
  wasRecommendation?: boolean;
  wasOverride?: boolean;
  wasUserSearched?: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function RitualCompletionCheckin({
  ritualId,
  ritualTitle,
  moonPhase,
  zodiacSeason,
  wasRecommendation = false,
  wasOverride = false,
  wasUserSearched = false,
  onClose,
  onComplete,
}: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3 | "done">(1);
  const [selectedMood, setSelectedMood] = useState<MoodWord | null>(null);
  const [customWord, setCustomWord] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [fitRating, setFitRating] = useState<FitRating | null>(null);
  const [journal, setJournal] = useState("");

  function handleMoodSelect(mood: MoodWord) {
    setSelectedMood(mood);
    setShowCustom(false);
    setTimeout(() => setStep(2), 300);
  }

  function handleCustomSubmit() {
    if (!customWord.trim()) return;
    const custom: MoodWord = {
      word: customWord.trim(),
      category: "neutral" as MoodCategory,
      color: "bg-gray-400/20",
    };
    setSelectedMood(custom);
    setShowCustom(false);
    setTimeout(() => setStep(2), 300);
  }

  function handleFitSelect(rating: FitRating) {
    setFitRating(rating);
    setTimeout(() => setStep(3), 300);
  }

  function handleSubmit() {
    if (!selectedMood || !fitRating) return;
    try {
      saveCompletion({
        ritualId,
        ritualTitle,
        moodWord: selectedMood.word,
        moodCategory: selectedMood.category,
        fitRating,
        journalEntry: journal.trim() || undefined,
        moonPhase,
        zodiacSeason,
        wasRecommendation,
        wasOverride,
        wasUserSearched,
      });
    } catch {
      toast.error("Couldn't save — try again");
      return;
    }
    setStep("done");
    setTimeout(() => {
      onComplete?.();
      onClose();
    }, 1200);
  }

  function handleSkipJournal() {
    handleSubmit();
  }

  // ─── Done state: warm acknowledgment with streak ─────────────────

  if (step === "done") {
    // Count completions for streak
    let streakCount = 1;
    try {
      const history = JSON.parse(localStorage.getItem("mapped:ritual-completions") || "[]");
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const uniqueDays = [...new Set(history.map((h: { date: string }) => new Date(h.date).toDateString()))];
      // Count consecutive days including today
      streakCount = 1;
      for (let i = 0; i < uniqueDays.length; i++) {
        const checkDate = new Date(Date.now() - (i + 1) * 86400000).toDateString();
        if (uniqueDays.includes(checkDate)) streakCount++;
        else break;
      }
    } catch {}

    const messages = [
      "You showed up for yourself today.",
      "That was a gift to your future self.",
      "Small rituals, big shifts.",
      "Your practice is building something.",
      "The work you can't see is the work that matters most.",
    ];
    const msg = messages[Math.floor(Date.now() / 86400000) % messages.length];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
           style={{ backgroundColor: "var(--modal-overlay)" }}>
        <div className="rounded-3xl p-8 mx-6 max-w-sm w-full text-center animate-in fade-in zoom-in duration-300"
             style={{ backgroundColor: "var(--modal-bg)" }}>
          <div className="text-4xl mb-4" style={{ animation: "pulse 1.5s ease-in-out infinite" }}>✦</div>
          <p className="text-[15px] font-medium mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
            {msg}
          </p>
          {streakCount > 1 && (
            <p className="text-[12px] mt-2" style={{ color: "var(--terracotta)" }}>
              {streakCount} day streak
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm"
         style={{ backgroundColor: "var(--modal-overlay)" }}>
      <div className="rounded-t-3xl sm:rounded-3xl p-5 pb-8 mx-0 sm:mx-6 max-w-md w-full max-h-[85vh] overflow-y-auto"
           style={{ backgroundColor: "var(--modal-bg)" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] uppercase tracking-wider font-semibold"
             style={{ color: "var(--foreground-faint)" }}>
            {step === 1 ? "Step 1 of 3" : step === 2 ? "Step 2 of 3" : "Step 3 of 3"}
          </p>
          <button
            onClick={onClose}
            className="text-[12px] transition-colors"
            style={{ color: "var(--foreground-faint)" }}
          >
            Skip
          </button>
        </div>

        {/* ─── STEP 1: Mood Word Picker ─── */}
        {step === 1 && (
          <div>
            <h3 className="text-[15px] font-medium mb-4" style={{ color: "var(--foreground)" }}>
              How are you, in one word?
            </h3>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {MOOD_PALETTE.map((mood) => (
                <button
                  key={mood.word}
                  onClick={() => handleMoodSelect(mood)}
                  className={`px-2 py-2.5 rounded-xl text-[12px] font-medium transition-all ${
                    selectedMood?.word === mood.word
                      ? "scale-[1.05]"
                      : "hover:scale-[1.03]"
                  }`}
                  style={{
                    backgroundColor: "var(--tag-bg)",
                    color: "var(--foreground-secondary)",
                    border: selectedMood?.word === mood.word ? "2px solid var(--terracotta)" : "2px solid transparent",
                  }}
                >
                  {mood.word}
                </button>
              ))}
            </div>
            {!showCustom ? (
              <button
                onClick={() => setShowCustom(true)}
                className="text-[11px]"
                style={{ color: "var(--foreground-faint)" }}
              >
                + Other (type your own)
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                  placeholder="Your word..."
                  className="flex-1 px-3 py-2 rounded-xl text-[12px] focus:outline-none"
                  style={{
                    backgroundColor: "var(--background-elevated)",
                    color: "var(--foreground)",
                    border: "1px solid var(--border-card)",
                  }}
                  autoFocus
                  maxLength={20}
                />
                <button
                  onClick={handleCustomSubmit}
                  className="px-3 py-2 rounded-xl text-[12px] font-medium"
                  style={{ backgroundColor: "var(--terracotta-bg)", color: "var(--terracotta)" }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 2: Fit Rating ─── */}
        {step === 2 && (
          <div>
            <h3 className="text-[15px] font-medium mb-2" style={{ color: "var(--foreground)" }}>
              Did this ritual meet you where you were?
            </h3>
            <p className="text-[11px] mb-5" style={{ color: "var(--foreground-muted)" }}>Not &ldquo;did it work&rdquo; — just, did it meet you.</p>
            <div className="flex gap-3">
              {FIT_RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleFitSelect(opt.value)}
                  className={`flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-2xl transition-all ${
                    fitRating === opt.value ? "scale-[1.03]" : ""
                  }`}
                  style={{
                    backgroundColor: fitRating === opt.value ? "var(--terracotta-bg)" : "var(--background-card)",
                    border: fitRating === opt.value ? "1px solid var(--border-accent)" : "1px solid var(--border-card)",
                  }}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="text-[12px] font-medium" style={{ color: "var(--foreground-secondary)" }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── STEP 3: Optional Journal ─── */}
        {step === 3 && (
          <div>
            <h3 className="text-[15px] font-medium mb-1" style={{ color: "var(--foreground)" }}>
              Anything else?
            </h3>
            <p className="text-[11px] mb-4" style={{ color: "var(--foreground-faint)" }}>Optional. Skip if nothing came up.</p>
            <textarea
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="What came up? Skip if nothing."
              rows={3}
              className="w-full px-3 py-3 rounded-xl text-[13px] leading-relaxed focus:outline-none resize-none mb-4"
              style={{
                backgroundColor: "var(--background-elevated)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={handleSkipJournal}
                className="flex-1 py-3 rounded-xl text-[13px] font-medium"
                style={{ backgroundColor: "var(--background-elevated)", color: "var(--foreground-muted)" }}
              >
                {journal.trim() ? "Save" : "Skip"}
              </button>
              {journal.trim() && (
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 rounded-xl text-[13px] font-medium"
                  style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
                >
                  Save & close
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
