"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getCourse, courseLessons, passThresholdFor, domainAccent, DOMAINS } from "@/lib/learn/registry";
import { getProgress } from "@/lib/learn/progress";
import { domainsWithReference, referenceByDomain } from "@/lib/learn/reference";
import type { CourseProgress } from "@/lib/learn/types";
import LibraryHeader from "./LibraryHeader";

export default function CourseView({ courseId }: { courseId: string }) {
  const course = getCourse(courseId);
  const [progress, setProgress] = useState<CourseProgress | null>(null);

  useEffect(() => {
    let active = true;
    getProgress(courseId).then((p) => { if (active) setProgress(p); });
    return () => { active = false; };
  }, [courseId]);

  const lessons = useMemo(() => (course ? courseLessons(course) : []), [course]);
  const completedSet = useMemo(() => new Set(progress?.completedLessonIds ?? []), [progress]);

  if (!course) {
    return (
      <main className="min-h-screen lib-felt">
        <LibraryHeader title="Course" />
        <p className="max-w-lg mx-auto px-5 py-10 text-center text-sm" style={{ color: "var(--foreground-muted)" }}>This course couldn&rsquo;t be found.</p>
      </main>
    );
  }

  const isOutline = course.status === "outline";
  const doneCount = lessons.filter((l) => completedSet.has(l.id)).length;
  const allDone = lessons.length > 0 && doneCount === lessons.length;
  const certified = !!progress?.completedAt;

  const accent = domainAccent(course.domain);
  const domainTitle = DOMAINS.find((d) => d.id === course.domain)?.title ?? course.domain;
  const total = lessons.length;
  const pct = total > 0 ? Math.round((Math.min(doneCount, total) / total) * 100) : 0;
  // First not-yet-done lesson = the "current" node on the path (unless certified).
  const currentIndex = certified ? -1 : lessons.findIndex((l) => !completedSet.has(l.id));

  return (
    <main className="min-h-screen lib-felt">
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="cvgrain"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves={2} stitchTiles="stitch" /></filter>
      </svg>
      <LibraryHeader title={course.title} fallback="/library" accent={accent} />
      <div className="max-w-lg mx-auto px-5 py-5 pb-24">
        {/* Course hero (centered) */}
        <div className="text-center px-6 pt-2 pb-1">
          <div className="relative mx-auto mb-3" style={{ width: 74, height: 74 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 40% 34%, ${accent}59, ${accent}26 60%, rgba(11,7,18,0) 82%)` }} />
            <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }} aria-hidden="true">{course.icon}</span>
          </div>
          <p className="text-[9px] uppercase font-semibold" style={{ letterSpacing: "0.2em", color: accent }}>{domainTitle}{!isOutline ? ` · ${course.level}` : ""}</p>
          <h2 className="mt-2 text-[26px] font-medium leading-tight" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>{course.title}</h2>
          <p className="mt-2 text-[11px]" style={{ color: "var(--foreground-muted)" }}>
            {isOutline ? "Curriculum preview" : `${total} ${total === 1 ? "lesson" : "lessons"} · ${course.estMinutes} min · ${course.level}`}
          </p>
          {!isOutline && total > 0 && (
            <>
              <div className="h-[5px] rounded-full overflow-hidden mt-4 mx-7" style={{ background: "var(--lib-track)" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#a88a40,#d4b878)" }} />
              </div>
              <p className="mt-2 text-[10px]" style={{ color: "var(--brass-light)", letterSpacing: "0.06em" }}>{doneCount} of {total} complete</p>
            </>
          )}
        </div>

        <div className="mt-5" />

        {course.safetyNote && (
          <div className="rounded-xl px-4 py-3 mb-4" style={{ backgroundColor: "rgba(122,48,40,0.14)", borderLeft: "3px solid var(--oxblood-light)" }}>
            <p className="text-[10px] uppercase tracking-widest mb-1 font-semibold" style={{ color: "var(--oxblood-light)" }}>Safety first</p>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>{course.safetyNote}</p>
          </div>
        )}

        {domainsWithReference().has(course.domain) && (
          <Link href={`/library/d/${course.domain}`} className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4 active:scale-[0.99] transition-transform" style={{ backgroundColor: "var(--background-card)", border: `1px solid ${accent}55`, boxShadow: "var(--card-shadow)" }}>
            <span className="text-lg" aria-hidden="true">🔎</span>
            <div className="flex-1">
              <p className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>Library — look it up</p>
              <p className="text-[11px]" style={{ color: "var(--foreground-secondary)" }}>Look up any of the {referenceByDomain(course.domain).length} {course.domain === "tarot" ? "cards" : course.domain === "crystals" ? "stones" : course.domain === "herbalism" ? "herbs" : "entries"}</p>
            </div>
            <span className="text-[12px]" style={{ color: accent }}>→</span>
          </Link>
        )}

        {/* Outline-only courses: show roadmap */}
        {isOutline ? (
          <>
            <div className="rounded-xl px-4 py-3 mb-5" style={{ backgroundColor: "var(--tag-bg)", border: "1px dashed var(--border-card)" }}>
              <p className="text-[12px]" style={{ color: "var(--foreground-secondary)" }}>
                The full curriculum is mapped out below. Lessons and the final test for this course are being written and will unlock here soon.
              </p>
            </div>
            <div className="flex flex-col gap-5">
              {course.outline.map((mod, mi) => (
                <div key={mi}>
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--brass)" }}>{mod.module}</p>
                  <ul className="flex flex-col gap-1.5">
                    {mod.lessons.map((title, li) => (
                      <li key={li} className="flex items-center gap-2.5 text-[13px]" style={{ color: "var(--foreground-secondary)" }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "var(--foreground-ghost)" }} aria-hidden="true" />
                        {title}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Zigzag learning path */}
            <div className="relative pt-3">
              {/* dotted spine */}
              <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 0, borderLeft: "2px dotted rgba(201,169,97,0.26)", transform: "translateX(-1px)", pointerEvents: "none" }} />

              {lessons.map((lesson, i) => {
                const done = completedSet.has(lesson.id);
                const current = i === currentIndex;
                const offset = i % 2 === 0 ? -54 : 54;
                return (
                  <div key={lesson.id} className="relative" style={{ height: current ? 116 : 94 }}>
                    <Link
                      href={`/library/${course.id}/${lesson.id}`}
                      className="absolute flex flex-col items-center active:scale-[0.97] transition-transform"
                      style={{ left: "50%", top: current ? 6 : 16, transform: `translateX(calc(-50% + ${offset}px))`, width: 130 }}
                      aria-label={`Lesson ${i + 1}: ${lesson.title}${done ? " (completed)" : current ? " (in progress)" : ""}`}
                    >
                      {current && (
                        <span className="mb-2 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: accent, color: "var(--btn-primary-text)", letterSpacing: "0.1em", boxShadow: `0 6px 16px -4px ${accent}99` }}>START</span>
                      )}
                      {done ? (
                        <span className="flex items-center justify-center text-[19px]" style={{ width: 50, height: 50, borderRadius: "50%", color: "var(--btn-primary-text)", background: "radial-gradient(circle at 38% 32%,#f4e4b8,#d4b878 42%,#a88a40 100%)", boxShadow: "0 6px 18px -4px rgba(212,184,120,0.5), 0 0 0 4px rgba(201,169,97,0.1)" }} aria-hidden="true">✓</span>
                      ) : current ? (
                        <span className="flex items-center justify-center text-[25px]" style={{ width: 60, height: 60, borderRadius: "50%", color: accent, background: "var(--lib-surface)", boxShadow: `0 0 0 3px ${accent}, 0 0 24px -2px ${accent}99` }} aria-hidden="true">{course.icon}</span>
                      ) : (
                        <span className="flex items-center justify-center text-[14px] font-semibold" style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--lib-soft)", border: "0.5px solid rgba(201,169,97,0.16)", color: "var(--foreground-faint)" }} aria-hidden="true">{i + 1}</span>
                      )}
                      <span className="text-center mt-2.5 leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: 13, color: done ? "var(--foreground-secondary)" : current ? "var(--foreground)" : "var(--foreground-faint)" }}>
                        {lesson.title}
                        {current && <span className="block text-[9px] mt-0.5" style={{ fontFamily: "var(--font-body)", color: "var(--foreground-muted)" }}>In progress</span>}
                      </span>
                    </Link>
                  </div>
                );
              })}

              {/* Checkpoint — final test */}
              <div className="relative text-center pt-1.5 pb-2.5">
                {certified || allDone ? (
                  <Link href={`/library/${course.id}/test`} className="inline-flex flex-col items-center active:scale-[0.97] transition-transform" aria-label="Final test">
                    <span className="inline-flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 15, transform: "rotate(45deg)", background: certified ? "var(--sage)" : `${accent}26`, border: `1.5px dashed ${certified ? "var(--sage-light)" : "rgba(201,169,97,0.6)"}`, boxShadow: "0 0 0 6px var(--background)" }}>
                      <span style={{ transform: "rotate(-45deg)", fontSize: 19, color: certified ? "#fff" : "var(--brass-light)" }} aria-hidden="true">✦</span>
                    </span>
                    <span className="text-[9px] uppercase font-semibold mt-3" style={{ letterSpacing: "0.2em", color: accent }}>Checkpoint</span>
                    <span className="mt-0.5 text-[16px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{certified ? "Certified" : "Final test"}</span>
                    <span className="mt-0.5 text-[10px]" style={{ color: "var(--foreground-muted)" }}>{certified ? `${Math.round((progress?.bestScore ?? 0) * 100)}% · view / retake` : `Pass ${Math.round(passThresholdFor(course) * 100)}% to pass · retakes welcome`}</span>
                  </Link>
                ) : (
                  <div className="inline-flex flex-col items-center">
                    <span className="inline-flex items-center justify-center opacity-70" style={{ width: 56, height: 56, borderRadius: 15, transform: "rotate(45deg)", background: "var(--lib-soft)", border: "1.5px dashed rgba(201,169,97,0.3)", boxShadow: "0 0 0 6px var(--background)" }}>
                      <span style={{ transform: "rotate(-45deg)", fontSize: 17, color: "var(--foreground-faint)" }} aria-hidden="true">✦</span>
                    </span>
                    <span className="text-[9px] uppercase font-semibold mt-3" style={{ letterSpacing: "0.2em", color: "var(--foreground-muted)" }}>Checkpoint</span>
                    <span className="mt-0.5 text-[16px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground-secondary)" }}>Final test</span>
                    <span className="mt-0.5 text-[10px]" style={{ color: "var(--foreground-muted)" }}>Finish all {total} lessons to unlock</span>
                    {/* Test-out: already know the material? Skip ahead and prove it. */}
                    <Link href={`/library/${course.id}/test`} className="mt-2.5 text-[11px] font-semibold active:opacity-70" style={{ color: accent }}>
                      Already know this? Test out →
                    </Link>
                  </div>
                )}
              </div>

              {/* Reward — certificate */}
              <div className="relative text-center pt-4 pb-1.5">
                <span className="inline-flex items-center justify-center text-[28px]" style={{ width: 74, height: 74, borderRadius: "50%", background: `radial-gradient(circle at 40% 34%, ${accent}40, rgba(11,7,18,0.92))`, border: `1.5px solid ${certified ? "var(--sage-light)" : "rgba(201,169,97,0.4)"}`, boxShadow: "0 0 0 6px var(--background), 0 0 26px -4px rgba(201,169,97,0.4)" }} aria-hidden="true">🎓</span>
                <div className="text-[9px] uppercase font-semibold mt-3" style={{ letterSpacing: "0.2em", color: accent }}>Reward</div>
                <div className="mt-0.5 text-[17px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Course certificate</div>
                <div className="mt-0.5 text-[10px]" style={{ color: "var(--foreground-muted)" }}>{certified ? "Earned ✓" : "Pass the final test to earn"}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
