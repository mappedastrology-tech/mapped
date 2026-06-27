import type { Course, DomainMeta, LearnDomain, Lesson } from "./types";
import { astrologyFoundations } from "./content/astrologyFoundations";
import { crystalsFoundations } from "./content/crystalsFoundations";
import { tarotFoundations } from "./content/tarotFoundations";
import { numerologyFoundations } from "./content/numerologyFoundations";
import { chakrasFoundations } from "./content/chakrasFoundations";
import { herbalismFoundations } from "./content/herbalismFoundations";
import { essentialOilsFoundations } from "./content/essentialOilsFoundations";
import { almanacFoundations } from "./content/almanacFoundations";
import { meditationFoundations } from "./content/meditationFoundations";
import { dreamsFoundations } from "./content/dreamsFoundations";
import { runesFoundations } from "./content/runesFoundations";
import { astrologyIntermediate } from "./content/astrologyIntermediate";
import { astrologyAdvanced } from "./content/astrologyAdvanced";
import { outlineCourses } from "./content/outlines";

/** Display metadata + ordering for each domain shown on the library home. */
export const DOMAINS: DomainMeta[] = [
  { id: "astrology", title: "Astrology", icon: "☉", blurb: "Read a birth chart as a language for self-reflection.", evidenceTag: "Symbolic system", accent: "#c9a961", cover: "/images/learn/zodiac-wheel-fragment-1.webp" },
  { id: "tarot", title: "Tarot", icon: "🔮", blurb: "78 cards as a tool for reflection and storytelling.", evidenceTag: "Reflective tool", accent: "#a274d6", cover: "/images/learn/cosmic-eye.webp" },
  { id: "numerology", title: "Numerology", icon: "9", blurb: "Meaning in numbers — your life path and core numbers.", evidenceTag: "Symbolic system", accent: "#4a90c2", cover: "/images/learn/parchment-stars-pair.webp" },
  { id: "crystals", title: "Crystals", icon: "💎", blurb: "Real geology, the lore, and how to stay safe.", evidenceTag: "Tradition + geology", accent: "#8e7cc3", cover: "/images/learn/crystal-ball.webp" },
  { id: "chakras", title: "Chakras", icon: "🌀", blurb: "The subtle body, from tantric roots to today.", evidenceTag: "Contemplative tradition", accent: "#4caf93", cover: "/images/learn/halftone-eye.webp" },
  { id: "herbalism", title: "Herbalism", icon: "🌿", blurb: "Herbs, evidence, and — above all — safety.", evidenceTag: "Evidence + safety", accent: "#6a9a4a", cover: "/images/learn/watercolor-botanical-arrangement.webp" },
  { id: "essential-oils", title: "Essential Oils", icon: "🪔", blurb: "Aromatherapy done safely, for people and pets.", evidenceTag: "Evidence + safety", accent: "#d39a3e", cover: "/images/learn/dried-flower-branch-mauve.webp" },
  { id: "almanac", title: "Almanac & Moon", icon: "🌙", blurb: "Real sky science plus lunar & seasonal living.", evidenceTag: "Astronomy + tradition", accent: "#5b6bb5", cover: "/images/learn/paper-sun.webp" },
  { id: "meditation", title: "Meditation", icon: "🧘", blurb: "The most evidence-backed practice in the library.", evidenceTag: "Strong evidence", accent: "#3fa3a3", cover: "/images/learn/cloud-sunset-pink.webp" },
  { id: "dreams", title: "Dreams", icon: "💤", blurb: "Sleep science and the symbolism of dreams.", evidenceTag: "Science + symbolism", accent: "#7b86d6", cover: "/images/learn/cloud-strip-blue.webp" },
  { id: "runes", title: "Runes", icon: "ᚠ", blurb: "The 24 runes of the Elder Futhark.", evidenceTag: "Reflective tool", accent: "#b5654a", cover: "/images/learn/sparkle-stars-sketch.webp" },
];

/** Accent color for a domain (fallback to brass). */
export function domainAccent(id: LearnDomain): string {
  return DOMAINS.find((d) => d.id === id)?.accent ?? "#c9a961";
}

/** Every course in the library (authored + outline). */
export const ALL_COURSES: Course[] = [
  astrologyFoundations,
  crystalsFoundations,
  tarotFoundations,
  numerologyFoundations,
  chakrasFoundations,
  herbalismFoundations,
  essentialOilsFoundations,
  almanacFoundations,
  meditationFoundations,
  dreamsFoundations,
  runesFoundations,
  astrologyIntermediate,
  astrologyAdvanced,
  ...outlineCourses,
];

export function getDomain(id: LearnDomain): DomainMeta | undefined {
  return DOMAINS.find((d) => d.id === id);
}

export function getCoursesByDomain(domain: LearnDomain): Course[] {
  const order = { foundations: 0, intermediate: 1, advanced: 2 };
  return ALL_COURSES.filter((c) => c.domain === domain).sort(
    (a, b) => order[a.level] - order[b.level],
  );
}

export function getCourse(courseId: string): Course | undefined {
  return ALL_COURSES.find((c) => c.id === courseId);
}

/** Flat, ordered list of every lesson in a course. */
export function courseLessons(course: Course): Lesson[] {
  return (course.modules ?? []).flatMap((m) => m.lessons);
}

export function getLesson(course: Course, lessonId: string): Lesson | undefined {
  return courseLessons(course).find((l) => l.id === lessonId);
}

/** The module a lesson belongs to (for breadcrumbs / navigation). */
export function lessonContext(course: Course, lessonId: string) {
  const lessons = courseLessons(course);
  const index = lessons.findIndex((l) => l.id === lessonId);
  return {
    index,
    total: lessons.length,
    prev: index > 0 ? lessons[index - 1] : null,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null,
  };
}

export const DEFAULT_PASS_THRESHOLD = 0.8;

export function passThresholdFor(course: Course): number {
  return course.passThreshold ?? DEFAULT_PASS_THRESHOLD;
}

/** How many lessons a course has (0 for outline-only courses). */
export function lessonCount(course: Course): number {
  return courseLessons(course).length;
}

// Dev guard: course/lesson ids must not collide with reserved library route
// segments, or the page would be permanently shadowed by a static route.
if (process.env.NODE_ENV !== "production") {
  const RESERVED = new Set(["d", "review", "progress"]);
  for (const c of ALL_COURSES) {
    if (RESERVED.has(c.id)) console.warn(`[learn] course id "${c.id}" collides with a reserved /library route segment`);
    for (const l of courseLessons(c)) {
      if (l.id === "test") console.warn(`[learn] lesson id "test" in "${c.id}" collides with the final-test route`);
    }
  }
}
