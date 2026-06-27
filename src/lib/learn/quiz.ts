import type { QuizQuestion } from "./types";

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Sample n questions from a bank, shuffled. If n ≥ bank size, returns all (shuffled). */
export function sampleQuestions(bank: QuizQuestion[], n: number): QuizQuestion[] {
  const shuffled = shuffle(bank);
  return n >= bank.length ? shuffled : shuffled.slice(0, n);
}

export interface QuizScore {
  correct: number;
  total: number;
  fraction: number; // 0..1
}

/** Normalize a typed answer for forgiving comparison. */
function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.!?]+$/, "");
}

/** Is a typed answer acceptable for a recall question? */
export function isRecallCorrect(q: QuizQuestion, typed: string): boolean {
  const n = norm(typed);
  if (!n) return false;
  const accepted = [q.answer ?? "", ...(q.accept ?? [])].map(norm).filter(Boolean);
  return accepted.includes(n);
}

/**
 * Was this question answered correctly? For recall the stored answer is the
 * typed string; for mcq/true-false it's the chosen option id.
 */
export function answeredCorrectly(q: QuizQuestion, answer: string | undefined): boolean {
  if (answer == null) return false;
  if (q.type === "recall") return isRecallCorrect(q, answer);
  return !!q.options.find((o) => o.id === answer)?.correct;
}

/** Score answers (map of questionId → chosen optionId, or typed string for recall). */
export function scoreQuiz(
  questions: QuizQuestion[],
  answers: Record<string, string>,
): QuizScore {
  let correct = 0;
  for (const q of questions) {
    if (answeredCorrectly(q, answers[q.id])) correct++;
  }
  const total = questions.length;
  return { correct, total, fraction: total ? correct / total : 0 };
}

export function isCorrect(question: QuizQuestion, optionId: string): boolean {
  return !!question.options.find((o) => o.id === optionId)?.correct;
}
