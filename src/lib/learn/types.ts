/**
 * Learning Library — content + progress type model.
 *
 * Content is authored, static TypeScript (like the rest of the app's data), so
 * quizzes have definitive answers and everything works offline. Progress, quiz
 * attempts, and certificates persist to Supabase (see supabase/learning_library_schema.sql).
 *
 * Pedagogy baked into these types (from the research blueprint in
 * docs/learning-library-research.md):
 *   - one lesson = one objective; a retrieval quiz follows every lesson
 *   - final test pulls a randomized subset from a larger question bank
 *   - 80% mastery threshold by default; generous retakes
 */

export type LearnDomain =
  | "astrology"
  | "tarot"
  | "numerology"
  | "crystals"
  | "chakras"
  | "herbalism"
  | "essential-oils"
  | "almanac"
  | "meditation"
  | "dreams"
  | "runes";

export type CourseLevel = "foundations" | "intermediate" | "advanced";

/** "published" = lessons authored & takeable. "outline" = curriculum roadmap only. */
export type CourseStatus = "published" | "outline";

/** Callout tones keep TRADITION / HISTORY / EVIDENCE / SAFETY / CULTURE visibly distinct. */
export type CalloutTone =
  | "evidence"
  | "safety"
  | "tradition"
  | "history"
  | "culture"
  | "tip";

export type LessonBlock =
  | { kind: "text"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "callout"; tone: CalloutTone; title?: string; text: string }
  | { kind: "list"; ordered?: boolean; items: string[] }
  | { kind: "keyfacts"; items: string[] }
  | { kind: "table"; headers: string[]; rows: string[][] }
  // ── Interactive blocks ──
  /** Tap an item, then tap the group it belongs to. Self-checking categorisation. */
  | {
      kind: "sort";
      prompt: string;
      instructions?: string;
      groups: { name: string; accent?: string; items: string[] }[];
    }
  /** Flip a grid of cards to reveal art + a caption. */
  | {
      kind: "flip";
      prompt: string;
      instructions?: string;
      cards: { img: string; name: string; caption?: string }[];
    }
  /** Tap a cue (image or glyph), then tap its meaning. Self-checking recall. */
  | {
      kind: "match";
      prompt: string;
      instructions?: string;
      pairs: { cue: string; img?: string; match: string }[];
    }
  /** Tap glyph nodes arranged around a wheel to reveal each one's detail. */
  | {
      kind: "explore";
      prompt: string;
      instructions?: string;
      image?: string;
      items: { glyph: string; name: string; meta?: string; blurb: string; accent?: string }[];
    }
  /** A teaching diagram with numbered pins; tap each to reveal its annotation. */
  | {
      kind: "annotated";
      prompt: string;
      instructions?: string;
      image: string;
      /** Pin positions as percentages (0–100) of the diagram box. */
      pins: { x: number; y: number; title: string; body: string }[];
    };

export type QuizQuestionType = "mcq" | "true-false" | "recall";

export interface QuizOption {
  id: string;
  text: string;
  correct: boolean;
  /** Shown after answering — why this option is right or wrong. */
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  /** For mcq/true-false: the choices. For recall, leave empty. */
  options: QuizOption[];
  /** Recall (type-the-answer): the canonical answer. */
  answer?: string;
  /** Recall: extra accepted spellings/synonyms (matched case/space-insensitively). */
  accept?: string[];
  /** Recall: short note shown after answering. */
  explanation?: string;
}

export interface Lesson {
  id: string;
  title: string;
  /** Single measurable objective: "By the end you'll be able to…" */
  objective: string;
  estMinutes: number;
  blocks: LessonBlock[];
  /** Retrieval quiz after the lesson (3–5 items). */
  quiz: QuizQuestion[];
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

/** A single module's worth of the curriculum roadmap (titles only). */
export interface CourseOutlineItem {
  module: string;
  lessons: string[];
}

export interface Course {
  id: string;
  domain: LearnDomain;
  title: string;
  subtitle: string;
  level: CourseLevel;
  icon: string; // emoji
  summary: string;
  estMinutes: number;
  status: CourseStatus;

  /** Always present — the curriculum roadmap shown on every course. */
  outline: CourseOutlineItem[];

  /** Authored lessons (present when status === "published"). */
  modules?: CourseModule[];

  /** Final-exam question bank; engine randomly samples `finalTestSize` per attempt. */
  finalTest?: QuizQuestion[];
  finalTestSize?: number;
  /** Pass mark, 0..1. Defaults to 0.8. */
  passThreshold?: number;

  /** Prominent safety line for health-adjacent courses (herbs, oils, etc.). */
  safetyNote?: string;
}

export interface DomainMeta {
  id: LearnDomain;
  title: string;
  icon: string;
  blurb: string;
  /** Evidence-forward one-liner shown on the domain card. */
  evidenceTag?: string;
  /** Accent color (hex) — drives tiles, chips, and borders for this domain. */
  accent: string;
  /** Decorative cover image (path under /public) for tiles and the domain hero. */
  cover?: string;
}

/* ─── Progress (mirrors Supabase rows, camelCased for the client) ─── */

export interface CourseProgress {
  courseId: string;
  completedLessonIds: string[];
  lastLessonId: string | null;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  /** Best final-test score, 0..1. */
  bestScore: number | null;
}

export interface QuizAttemptRecord {
  courseId: string;
  /** null for a final-test attempt. */
  lessonId: string | null;
  score: number; // 0..1
  passed: boolean;
  createdAt: string;
}

export interface CertificateRecord {
  id: string;
  courseId: string;
  courseTitle: string;
  score: number; // 0..1
  code: string;
  issuedAt: string;
}

/* ─── Quick Reference (lookup / encyclopedia) ─── */

export interface ReferenceField {
  label: string;
  value: string;
  /** Optional tone for fields that should stand out (e.g. "safety"). */
  tone?: CalloutTone;
}

export interface ReferenceEntry {
  id: string;
  domain: LearnDomain;
  name: string;
  /** Alternate names / spellings, used for search only. */
  aka?: string[];
  /** Grouping label, e.g. "Quartz family" or "Major Arcana". */
  category?: string;
  /** One-line "what it is / what it does" shown on the card. */
  summary: string;
  /** Structured detail rows shown in the entry sheet. */
  fields: ReferenceField[];
  /** Short, prominent safety flag (toxic minerals, etc.). */
  safety?: string;
  /** Extra searchable keywords. */
  tags?: string[];
  /** Optional illustrative image (path under /public), e.g. zodiac art. */
  image?: string;
}
