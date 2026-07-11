"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DOMAINS, ALL_COURSES, getCourse, courseLessons } from "@/lib/learn/registry";
import { searchReference } from "@/lib/learn/reference";
import { getAllProgress } from "@/lib/learn/progress";
import { getDueReviewCount } from "@/lib/learn/reviewStore";
import { loadEngagement, type Engagement } from "@/lib/learn/engagement";
import { getDailyGoal } from "@/lib/learn/goals";
import { evaluateAchievements } from "@/lib/learn/achievements";
import type { Course, CourseProgress, ReferenceEntry } from "@/lib/learn/types";
import TopBar from "@/components/TopBar";
import ReferenceSheet from "./ReferenceSheet";

/** Deterministic-ish starfield for the hero (positions fixed so it doesn't reflow). */
const STARS = [
  [231, 53, 1.7, 0.69, 4.1], [206, 138, 2.4, 0.24, 5.0], [88, 37, 2.5, 0.23, 3.4],
  [21, 19, 1.9, 0.66, 4.5], [284, 18, 1.9, 0.45, 2.9], [340, 18, 2.2, 0.27, 2.5],
  [275, 119, 2.3, 0.61, 4.6], [152, 53, 2.1, 0.36, 4.7], [216, 38, 1.6, 0.49, 3.5],
  [120, 134, 1.8, 0.38, 4.3], [227, 68, 1.8, 0.32, 2.6], [39, 124, 1.1, 0.26, 4.6],
  [233, 101, 2.4, 0.32, 3.6], [156, 103, 2.0, 0.32, 2.9], [60, 80, 1.5, 0.4, 3.9],
] as const;

/** Big radial "level orb" with progress ring. */
function LevelOrb({ level, frac, size = 176 }: { level: number; frac: number; size?: number }) {
  const cx = size / 2;
  const r = cx - 6;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "24px auto 0" }}>
      <div style={{ position: "absolute", inset: "-6%", borderRadius: "50%", overflow: "hidden", filter: "blur(1.2px)" }}>
        <div style={{ position: "absolute", inset: "-25%", background: "radial-gradient(circle at 50% 44%, #f4ead2 0%, #d4b878 16%, #a88a40 33%, #6a3a60 55%, #281d38 74%, rgba(11,7,18,0) 88%)" }} />
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.4, mixBlendMode: "overlay" }}><rect width="100%" height="100%" filter="url(#lgrain)" /></svg>
      </div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }} aria-hidden="true">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--lib-track)" strokeWidth="1.5" />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--foreground)" strokeWidth="1.5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, Math.max(0, frac)))} transform={`rotate(-90 ${cx} ${cx})`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "0.34em", textTransform: "uppercase", color: "rgba(40,20,34,0.7)", fontWeight: 600 }}>Level</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 76, lineHeight: 0.85, color: "var(--lib-orb-text)", textShadow: "0 1px 16px rgba(255,236,200,0.5)" }}>{level}</span>
      </div>
    </div>
  );
}

function searchCourses(q: string): Course[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  return ALL_COURSES.filter((c) =>
    [c.title, c.subtitle, c.summary, c.domain].join(" ").toLowerCase().includes(query),
  );
}

export default function LibraryHome() {
  const router = useRouter();
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [dueCount, setDueCount] = useState(0);
  const [eng, setEng] = useState<Engagement | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ReferenceEntry | null>(null);

  useEffect(() => {
    let active = true;
    getAllProgress().then((p) => { if (active) setProgress(p); });
    getDueReviewCount().then((n) => { if (active) setDueCount(n); });
    loadEngagement().then((e) => { if (active) setEng(e); });
    return () => { active = false; };
  }, []);

  const courseResults = useMemo(() => searchCourses(query), [query]);
  const refResults = useMemo(() => (query.trim() ? searchReference(query) : []), [query]);
  const searching = query.trim().length > 0;

  // "Jump back in" — in-progress, not-yet-certified courses.
  const inProgress = useMemo(
    () =>
      Object.values(progress)
        .filter((p) => !p.completedAt && (p.completedLessonIds?.length ?? 0) > 0)
        .map((p) => ({ p, course: getCourse(p.courseId) }))
        .filter((x): x is { p: CourseProgress; course: Course } => !!x.course)
        .slice(0, 3),
    [progress],
  );

  // Next locked achievement → milestone teaser.
  const nextMilestone = useMemo(() => {
    if (!eng) return null;
    return evaluateAchievements(eng.ctx).find((a) => !a.unlocked)?.achievement ?? null;
  }, [eng]);

  // The single "next step" for the path card: resume an in-progress course, else
  // the first course you haven't finished. Always deep-links to the next lesson
  // you actually need — never a course you've already completed.
  const pathTarget = useMemo(() => {
    const started = Object.values(progress)
      .filter((p) => !p.completedAt && (p.completedLessonIds?.length ?? 0) > 0)
      .map((p) => getCourse(p.courseId))
      .find((c) => c && c.status === "published");
    const course =
      started ??
      ALL_COURSES.find((c) => c.status === "published" && !progress[c.id]?.completedAt);
    if (!course) return null;
    const lessons = courseLessons(course);
    if (lessons.length === 0) return null;
    const doneSet = new Set(progress[course.id]?.completedLessonIds ?? []);
    const doneCount = lessons.filter((l) => doneSet.has(l.id)).length;
    const ready = doneCount === lessons.length; // all lessons done → final test
    const nextLesson = lessons.find((l) => !doneSet.has(l.id)) ?? lessons[lessons.length - 1];
    const href = ready ? `/library/${course.id}/test` : `/library/${course.id}/${nextLesson.id}`;
    return { course, total: lessons.length, doneCount, nextLesson, started: doneCount > 0, ready, href };
  }, [progress]);

  return (
    <main className="min-h-screen lib-felt">
      <style>{`@keyframes lib-twinkle { 0%,100% { opacity:.25 } 50% { opacity:.9 } }`}</style>
      {/* Grain filter used by the orb + topic glows */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="lgrain"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves={2} stitchTiles="stitch" /></filter>
      </svg>

      <TopBar />

      <h1 className="sr-only">Learn</h1>

      <div className="max-w-lg mx-auto px-5 pb-24 relative">
        {/* Starfield (decorative) */}
        {!searching && (
          <div aria-hidden="true" style={{ position: "absolute", inset: "0 0 auto 0", height: 260, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
            {STARS.map(([x, y, s, o, d], i) => (
              <span key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: "var(--foreground)", opacity: o, animation: `lib-twinkle ${d}s ease-in-out infinite` }} />
            ))}
          </div>
        )}

        <div className="relative" style={{ zIndex: 1 }}>
          {/* Decorative eyebrow */}
          <div className="flex items-center justify-center gap-2.5 pt-2 pb-3.5">
            <span style={{ width: 16, height: 1, background: "rgba(201,169,97,0.45)" }} />
            <span className="text-[9px] font-semibold uppercase" style={{ letterSpacing: "0.2em", color: "var(--foreground-muted)", fontFamily: "var(--font-body)" }}>Learn</span>
            <span style={{ width: 16, height: 1, background: "rgba(201,169,97,0.45)" }} />
          </div>

          {/* Search */}
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-[14px]" style={{ background: "var(--lib-surface)", border: "0.5px solid rgba(201,169,97,0.22)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the library…"
              aria-label="Search the library"
              className="flex-1 bg-transparent outline-none text-[14px]"
              style={{ color: "var(--foreground)" }}
            />
            {query && <button onClick={() => setQuery("")} aria-label="Clear search" className="text-[12px]" style={{ color: "var(--foreground-muted)" }}>✕</button>}
          </div>

          {searching ? (
            /* ─── Search results ─── */
            <div className="flex flex-col gap-5 mt-4">
              {refResults.length > 0 && (
                <section>
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--brass)" }}>Library · {refResults.length}</p>
                  <div className="flex flex-col gap-1.5">
                    {refResults.slice(0, 12).map((entry) => (
                      <button key={entry.id} onClick={() => setSelected(entry)} className="text-left px-4 py-2.5 rounded-xl active:scale-[0.99] transition-transform" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)", boxShadow: "var(--card-shadow)" }}>
                        <p className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>{entry.name}</p>
                        <p className="text-[12px] mt-0.5 leading-snug" style={{ color: "var(--foreground-secondary)" }}>{entry.summary}</p>
                      </button>
                    ))}
                  </div>
                </section>
              )}
              {courseResults.length > 0 && (
                <section>
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--brass)" }}>Courses · {courseResults.length}</p>
                  <div className="flex flex-col gap-1.5">
                    {courseResults.map((c) => (
                      <Link key={c.id} href={`/library/${c.id}`} className="block px-4 py-2.5 rounded-xl active:scale-[0.99] transition-transform" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)", boxShadow: "var(--card-shadow)" }}>
                        <p className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>{c.icon} {c.title}</p>
                        <p className="text-[12px] mt-0.5" style={{ color: "var(--foreground-secondary)" }}>{c.subtitle}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
              {refResults.length === 0 && courseResults.length === 0 && (
                <p className="text-center text-[13px] py-10" style={{ color: "var(--foreground-muted)" }}>No matches for &ldquo;{query}&rdquo;.</p>
              )}
            </div>
          ) : (
            /* ─── Browse ─── */
            <>
              {/* Level orb */}
              {eng && (() => {
                const s = eng.stats;
                const goalXp = getDailyGoal().xp;
                const toGo = Math.max(0, goalXp - s.todayXp);
                const goalPct = Math.min(100, (s.todayXp / goalXp) * 100);
                const toLevel = s.xpForLevel - s.xpIntoLevel;
                // Always show the level/streak/XP dashboard — even for brand-new
                // users (Level 1, 0-day streak, 0 XP). The dashboard itself is the
                // welcome; the "begin your path" card + topics carry the first action.
                const streakMsg = s.streak === 0
                  ? "Begin a streak today"
                  : s.atRisk
                    ? "A rest day is on us — finish today to keep it"
                    : "Keep the candle lit";
                return (
                  <>
                    <Link href="/library/progress" className="block active:opacity-90 transition-opacity">
                      <LevelOrb level={s.level} frac={s.xpIntoLevel / s.xpForLevel} />
                      <div className="text-center mt-4 text-[14px]" style={{ color: "var(--foreground-secondary)" }}>
                        <span style={{ fontFamily: "var(--font-display)", color: "var(--brass-light)", fontWeight: 700 }}>{toLevel} XP</span> to level {s.level + 1}
                      </div>
                    </Link>

                    {/* Streak card */}
                    <div className="mt-5 px-4.5 py-4 rounded-[18px]" style={{ background: "var(--lib-surface)", border: "0.5px solid rgba(201,169,97,0.12)", padding: "16px 18px" }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[22px]" aria-hidden="true">🔥</span>
                          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: "var(--foreground)", lineHeight: 0.85 }}>{s.streak}</span>
                          <span className="text-[9px] uppercase leading-tight" style={{ letterSpacing: "0.1em", color: "var(--foreground-muted)" }}>day<br />streak</span>
                        </div>
                        <span className="italic text-[12px] text-right" style={{ color: s.atRisk ? "var(--brass-light)" : "var(--brass)", maxWidth: 140, lineHeight: 1.35 }}>{streakMsg}</span>
                      </div>
                      <div className="flex justify-between mt-4">
                        {s.weekly.map((w, i) => {
                          const letter = (w.label?.[0] ?? "·").toUpperCase();
                          return (
                            <div key={i} className="flex flex-col items-center gap-1.5">
                              {w.isToday ? (
                                <span className="w-[26px] h-[26px] rounded-full flex items-center justify-center" style={{ background: "var(--lib-soft)", boxShadow: "0 0 0 2px #c9a961, 0 0 12px rgba(201,169,97,0.6)" }}>
                                  <span className="w-2 h-2 rounded-full" style={{ background: "var(--brass)" }} />
                                </span>
                              ) : w.items > 0 ? (
                                <span className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px]" style={{ color: "var(--btn-primary-text)", background: "linear-gradient(135deg,#d4b878,#a88a40)" }}>✓</span>
                              ) : (
                                <span className="w-[26px] h-[26px] rounded-full" style={{ background: "var(--lib-track)" }} />
                              )}
                              <span className="text-[9px]" style={{ color: w.isToday ? "var(--brass-light)" : "var(--foreground-muted)", fontWeight: w.isToday ? 700 : 400 }}>{letter}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Daily goal */}
                    <div className="mt-4">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-[9px] font-semibold uppercase" style={{ letterSpacing: "0.2em", color: "var(--foreground-muted)" }}>Today&rsquo;s goal</span>
                        <span className="text-[12px] font-semibold" style={{ color: toGo === 0 ? "var(--sage-light)" : "var(--brass-light)" }}>{toGo === 0 ? "Complete ✓" : `${toGo} XP to go`}</span>
                      </div>
                      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "var(--lib-track)" }}>
                        <div className="h-full rounded-full" style={{ width: `${goalPct}%`, background: toGo === 0 ? "var(--sage)" : "linear-gradient(90deg,#a88a40,#d4b878)" }} />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-5">
                      <div className="flex-1 flex items-baseline gap-1.5">
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--foreground)", lineHeight: 0.9 }}>{eng.ctx.lessonsCompleted}</span>
                        <span className="text-[9px] uppercase" style={{ letterSpacing: "0.08em", color: "var(--foreground-muted)" }}>lessons</span>
                      </div>
                      <span style={{ width: 5, height: 5, transform: "rotate(45deg)", background: "var(--brass)" }} />
                      <div className="flex-1 flex items-baseline gap-1.5 justify-end">
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--foreground)", lineHeight: 0.9 }}>{s.totalXp.toLocaleString()}</span>
                        <span className="text-[9px] uppercase" style={{ letterSpacing: "0.08em", color: "var(--foreground-muted)" }}>total xp</span>
                      </div>
                    </div>

                    {/* Milestone teaser */}
                    {nextMilestone && (
                      <Link href="/library/progress" className="flex items-center gap-2.5 mt-4 px-3.5 py-3 rounded-[14px] active:scale-[0.99] transition-transform" style={{ background: "rgba(201,169,97,0.1)", border: "0.5px solid rgba(201,169,97,0.2)" }}>
                        <span className="text-[16px]" aria-hidden="true">{nextMilestone.icon}</span>
                        <span className="text-[12px] flex-1 leading-snug" style={{ color: "var(--foreground-secondary)" }}>
                          <span style={{ color: "var(--foreground)", fontWeight: 600 }}>{nextMilestone.title}</span> — {nextMilestone.description.toLowerCase()}
                        </span>
                        <span className="text-[13px]" style={{ color: "var(--brass-light)" }}>→</span>
                      </Link>
                    )}
                  </>
                );
              })()}

              {/* Daily review banner */}
              {dueCount > 0 && (
                <Link href="/library/review" className="flex items-center gap-3 px-4 py-3 rounded-2xl mt-5 active:scale-[0.99] transition-transform" style={{ background: "linear-gradient(135deg, var(--plum), var(--plum-deep))", border: "1px solid var(--brass)" }}>
                  <span className="text-xl" aria-hidden="true">🔁</span>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold" style={{ color: "var(--lib-on-plum)" }}>Daily review</p>
                    <p className="text-[11px]" style={{ color: "rgba(240,230,210,0.7)" }}>A 2-minute refresher to lock in what you&rsquo;ve learned</p>
                  </div>
                  <span className="text-[12px]" style={{ color: "var(--brass-light)" }}>Review →</span>
                </Link>
              )}

              {/* Your path — always points at the next lesson you actually need */}
              {pathTarget && (() => {
                const { course, total, doneCount, nextLesson, started, ready, href } = pathTarget;
                const pct = total > 0 ? Math.round((Math.min(doneCount, total) / total) * 100) : 0;
                return (
                  <Link href={href} className="block rounded-[18px] mt-6 active:scale-[0.99] transition-transform" style={{ background: "var(--lib-plum)", boxShadow: "inset 0 0 0 0.5px rgba(201,169,97,0.16)", padding: "20px 20px 18px" }}>
                    <div className="text-[9px] font-semibold uppercase" style={{ letterSpacing: "0.2em", color: "var(--brass)" }}>{ready ? "Ready for your final test" : started ? "Continue your path" : "Begin your path"}</div>
                    <div className="mt-2.5" style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 500, color: "var(--foreground)", lineHeight: 1.22 }}>{course.title}</div>
                    <div className="text-[12px] mt-1.5" style={{ color: "var(--foreground)", opacity: 0.65 }}>{ready ? "All lessons complete · pass the test to finish" : started ? `Up next · ${nextLesson.title}` : `${total} lessons · ${course.estMinutes} min`}</div>
                    {started && (
                      <div className="h-1 rounded-full overflow-hidden mt-3.5" style={{ background: "rgba(0,0,0,0.3)" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#a88a40,#d4b878)" }} />
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-2 mt-4 py-3 rounded-full" style={{ background: "var(--brass)", color: "var(--btn-primary-text)" }}>
                      <span className="text-[11px] font-bold uppercase" style={{ letterSpacing: "0.18em" }}>{ready ? "Take the final test" : started ? "Resume lesson" : "Start learning"}</span>
                      <span className="text-[13px]">→</span>
                    </div>
                  </Link>
                );
              })()}

              {/* Jump back in (secondary in-progress) */}
              {inProgress.length > 1 && (
                <section className="mt-6">
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--brass)" }}>Jump back in</p>
                  <div className="flex flex-col gap-1.5">
                    {inProgress.slice(1).map(({ course }) => (
                      <Link key={course.id} href={`/library/${course.id}`} className="flex items-center gap-3 px-4 py-2.5 rounded-xl active:scale-[0.99] transition-transform" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)", boxShadow: "var(--card-shadow)" }}>
                        <span className="text-lg" aria-hidden="true">{course.icon}</span>
                        <span className="text-[13px] font-medium flex-1" style={{ color: "var(--foreground)" }}>{course.title}</span>
                        <span className="text-[11px]" style={{ color: "var(--brass)" }}>Continue →</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Browse all topics */}
              <div className="flex items-center gap-3 mt-8 mb-4">
                <span className="text-[9px] font-semibold uppercase" style={{ letterSpacing: "0.2em", color: "var(--foreground-secondary)" }}>Browse all topics</span>
                <span className="flex-1 h-px" style={{ borderTop: "0.5px solid rgba(138,125,107,0.28)" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DOMAINS.map((d) => {
                  const domainCourses = ALL_COURSES.filter((c) => c.domain === d.id);
                  const target = domainCourses.length === 1 ? `/library/${domainCourses[0].id}` : `/library/d/${d.id}`;
                  return (
                    <button
                      key={d.id}
                      onClick={() => router.push(target)}
                      className="relative overflow-hidden text-left rounded-[18px] flex flex-col active:scale-[0.98] transition-transform"
                      style={{ background: "var(--lib-surface)", minHeight: 132, padding: "16px 15px", border: "0.5px solid rgba(201,169,97,0.1)" }}
                    >
                      {/* accent glow blob */}
                      <span aria-hidden="true" style={{ position: "absolute", right: -26, top: -26, width: 98, height: 98, borderRadius: "50%", overflow: "hidden", opacity: 0.85 }}>
                        <span style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, ${d.accent} 0%, ${d.accent}66 42%, transparent 70%)` }} />
                        <span style={{ position: "absolute", inset: 0, opacity: 0.4, mixBlendMode: "overlay" }}>
                          <svg style={{ width: "100%", height: "100%" }}><rect width="100%" height="100%" filter="url(#lgrain)" /></svg>
                        </span>
                      </span>
                      {d.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.cover} alt="" aria-hidden="true" loading="lazy" style={{ position: "relative", width: 58, height: 58, objectFit: "contain", filter: "drop-shadow(0 4px 9px rgba(0,0,0,0.55))" }} />
                      ) : (
                        <span className="relative text-3xl" aria-hidden="true">{d.icon}</span>
                      )}
                      <span className="flex-1" />
                      <span className="relative" style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500, color: "var(--foreground)", lineHeight: 1.05 }}>{d.title}</span>
                      {d.evidenceTag && <span className="relative text-[8.5px] uppercase mt-1.5" style={{ letterSpacing: "0.1em", color: "var(--foreground-muted)" }}>{d.evidenceTag}</span>}
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] leading-relaxed mt-7 text-center px-4" style={{ color: "var(--foreground-muted)" }}>
                Evidence-first, with honest safety notes. For learning and reflection — not medical, legal, or financial advice.
              </p>
            </>
          )}
        </div>
      </div>

      <ReferenceSheet entry={selected} onClose={() => setSelected(null)} onOpenEntry={setSelected} />
    </main>
  );
}
