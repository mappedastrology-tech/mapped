"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DOMAINS, ALL_COURSES, getCourse, courseLessons } from "@/lib/learn/registry";
import { getAllProgress } from "@/lib/learn/progress";
import { getDueReviewCount } from "@/lib/learn/reviewStore";
import { loadEngagement, emptyEngagement, type Engagement } from "@/lib/learn/engagement";
import { getWeakTopics } from "@/lib/learn/weakTopics";
import type { Course, CourseProgress } from "@/lib/learn/types";
import TopBar from "@/components/TopBar";
import { useTheme } from "@/components/ThemeProvider";
import OfflineNotice from "./OfflineNotice";
import { PrimaryPill } from "./LessonChrome";

/**
 * Decorative starfield for the top of the screen, dark mode only.
 *
 * Positions are a fixed table rather than Math.random() at render: a random
 * field would land differently on the server and the client and trip a
 * hydration mismatch, and would also reshuffle on every re-render.
 * [x, y, size, opacity, duration]
 */
const STARS = [
  [231, 53, 1.7, 0.69, 4.1], [206, 138, 2.4, 0.24, 5.0], [88, 37, 2.5, 0.23, 3.4],
  [21, 19, 1.9, 0.66, 4.5], [284, 18, 1.9, 0.45, 2.9], [340, 18, 2.2, 0.27, 2.5],
  [275, 119, 2.3, 0.61, 4.6], [152, 53, 2.1, 0.36, 4.7], [216, 38, 1.6, 0.49, 3.5],
  [120, 134, 1.8, 0.38, 4.3], [227, 68, 1.8, 0.32, 2.6], [39, 124, 1.1, 0.26, 4.6],
  [233, 101, 2.4, 0.32, 3.6], [156, 103, 2.0, 0.32, 2.9], [60, 80, 1.5, 0.4, 3.9],
  [300, 74, 1.6, 0.35, 3.2], [180, 18, 1.4, 0.55, 4.8], [66, 160, 2.1, 0.28, 3.7],
  [258, 172, 1.5, 0.44, 4.2], [128, 196, 1.9, 0.3, 2.8],
] as const;

/* ── The gauge ──────────────────────────────────────────────────────────── */

/**
 * Level gauge: a 270° arc with the gap at the bottom.
 *
 * The geometry is fixed by the design rather than derived: r=92 in a 220 box
 * gives a circumference of 578.05, and 3/4 of that is 433.54 — so a dash array
 * of "433.54 578.05" paints three quarters and leaves the rest empty, and
 * rotating by 135° puts that empty quarter at the bottom. The fill is the same
 * arc scaled by progress.
 */
function LevelGauge({ level, progress, nextLevel }: { level: number; progress: number; nextLevel: number }) {
  const ARC = 433.54;
  const CIRC = 578.05;
  const frac = Math.min(1, Math.max(0, progress));
  const pct = Math.round(frac * 100);

  return (
    <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto" }}>
      <svg width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">
        <defs>
          <linearGradient id="lgauge" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--lib-gauge-from)" />
            <stop offset="100%" stopColor="#e2c785" />
          </linearGradient>
        </defs>
        <g transform="rotate(135 110 110)">
          <circle
            cx="110" cy="110" r="92" fill="none"
            stroke="rgba(255,255,255,0.16)" strokeWidth="16" strokeLinecap="round"
            strokeDasharray={`${ARC} ${CIRC}`}
          />
          {frac > 0 && (
            <circle
              cx="110" cy="110" r="92" fill="none"
              stroke="url(#lgauge)" strokeWidth="16" strokeLinecap="round"
              strokeDasharray={`${ARC * frac} ${CIRC}`}
              style={{ transition: "stroke-dasharray .45s cubic-bezier(.34,1.56,.64,1)" }}
            />
          )}
        </g>
      </svg>

      <div
        style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700,
            letterSpacing: "0.24em", textTransform: "uppercase",
            color: "rgba(245,239,224,0.72)",
          }}
        >
          Level
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)", fontSize: 68, lineHeight: 1,
            letterSpacing: "0.02em", color: "#f5efe0", marginTop: 4, fontWeight: 500,
          }}
        >
          {level}
        </span>
        <span
          style={{
            fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600,
            color: "#e2c785", marginTop: 6,
          }}
        >
          {pct}% to Level {nextLevel}
        </span>
      </div>
    </div>
  );
}

/* ── Small shared pieces ────────────────────────────────────────────────── */

/** A section label followed by a hairline that fills the rest of the row. */
function SectionLabel({ children, style }: { children: string; style?: React.CSSProperties }) {
  return (
    <div className="flex items-center gap-3" style={style}>
      <span
        className="uppercase"
        style={{
          fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.18em", color: "var(--lib-muted)",
        }}
      >
        {children}
      </span>
      <span style={{ flex: 1, height: 1, background: "var(--lib-rule)" }} />
    </div>
  );
}

/**
 * One of the two brand blocks under the streak strip.
 *
 * Forest and oxblood keep their colours in both themes — they are brand
 * islands, like .do-block and .dont-block elsewhere in the app, so the cream
 * ink on them stays readable without a light variant.
 */
function StatBlock({
  href, eyebrow, eyebrowColor, count, caption, background, border,
}: {
  href: string; eyebrow: string; eyebrowColor: string; count: number;
  caption: string; background: string; border: string;
}) {
  return (
    <Link
      href={href}
      className="lib-press flex flex-col"
      style={{ background, border, borderRadius: 20, padding: "15px 16px 16px", minHeight: 104 }}
    >
      <span
        className="uppercase"
        style={{
          fontFamily: "var(--font-body)", fontSize: 8.5, fontWeight: 700,
          letterSpacing: "0.2em", color: eyebrowColor,
        }}
      >
        {eyebrow}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)", fontSize: 26, lineHeight: 1,
          letterSpacing: "0.02em", color: "#f0e6d2", marginTop: 9,
        }}
      >
        {count}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 500,
          color: "rgba(240,230,210,0.8)", marginTop: 6, lineHeight: 1.3,
        }}
      >
        {caption}
      </span>
    </Link>
  );
}

/* ── Screen ─────────────────────────────────────────────────────────────── */

export default function LibraryHome() {
  const router = useRouter();
  const { theme } = useTheme();
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [dueCount, setDueCount] = useState(0);
  const [weakCount, setWeakCount] = useState(0);
  // Seeded with the zero state so the hero is present on the first paint. It
  // used to be gated on the fetch, so it appeared a few hundred ms in and
  // pushed the whole page down — a 0.38 CLS on its own, where Google calls
  // anything over 0.25 poor.
  const [eng, setEng] = useState<Engagement>(() => emptyEngagement());

  useEffect(() => {
    let active = true;
    getAllProgress().then((p) => { if (active) setProgress(p); });
    getDueReviewCount().then((n) => { if (active) setDueCount(n); });
    loadEngagement().then((e) => { if (active) setEng(e); });
    getWeakTopics().then((w) => { if (active) setWeakCount(w.length); });
    return () => { active = false; };
  }, []);

  /** In-progress, not-yet-certified courses. */
  const inProgress = useMemo(
    () =>
      Object.values(progress)
        .filter((p) => !p.completedAt && (p.completedLessonIds?.length ?? 0) > 0)
        .map((p) => ({ p, course: getCourse(p.courseId) }))
        .filter((x): x is { p: CourseProgress; course: Course } => !!x.course),
    [progress],
  );

  /**
   * The single next step, which the hero's CTA resumes.
   *
   * Unchanged from the previous layout — it deep-links to the lesson you
   * actually need next, never a course you have already finished.
   */
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
    return {
      course, total: lessons.length, doneCount, nextLesson,
      started: doneCount > 0, ready, href,
      // 1-based position of the lesson you are about to do.
      lessonNumber: Math.min(doneCount + 1, lessons.length),
    };
  }, [progress]);

  /** "Jump back in" shows the in-progress courses OTHER than the hero's. */
  const alsoInProgress = useMemo(
    () => inProgress.filter(({ course }) => course.id !== pathTarget?.course.id).slice(0, 3),
    [inProgress, pathTarget],
  );

  const s = eng.stats;
  /**
   * Edge state 1 — a learner with no history at all.
   *
   * A streak of zero and two blocks reading "0" is a discouraging thing to
   * open an app on, and it tells a newcomer nothing about what those numbers
   * will mean. One card explaining what is about to start reads better and
   * takes the same room.
   */
  const brandNew = eng.ctx.lessonsCompleted === 0 && inProgress.length === 0 && dueCount === 0;

  return (
    <main className="min-h-screen lib-felt">
      {/* Grain overlay: a single noise filter reused by the page wash. */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="lgrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves={2} stitchTiles="stitch" />
        </filter>
      </svg>

      <TopBar />
      <h1 className="sr-only">Learn</h1>
      <OfflineNotice />

      <div className="max-w-lg mx-auto relative" style={{ paddingLeft: 22, paddingRight: 22, paddingBottom: 96 }}>
        {/* Starfield — decorative, dark only. In light mode it would read as
            ink specks on parchment rather than stars. */}
        {theme === "dark" && (
          <div
            aria-hidden="true"
            style={{ position: "absolute", inset: "0 0 auto 0", height: 230, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}
          >
            {STARS.map(([x, y, size, opacity, dur], i) => (
              <span
                key={i}
                style={{
                  position: "absolute", left: x, top: y, width: size, height: size,
                  borderRadius: "50%", background: "#f0e6d2", opacity,
                  animation: `twinkle ${dur}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative" style={{ zIndex: 1 }}>
          {/* 2 — Wordmark */}
          <div className="flex items-center justify-center" style={{ gap: 9, paddingTop: 16, paddingBottom: 14 }}>
            <span style={{ width: 16, height: 1, background: "var(--lib-wordmark-rule)" }} />
            <span
              className="uppercase"
              style={{
                fontFamily: "var(--font-display)", fontSize: 22,
                letterSpacing: "0.16em", color: "var(--lib-ink)", fontWeight: 500,
              }}
            >
              Learn
            </span>
            <span style={{ width: 16, height: 1, background: "var(--lib-wordmark-rule)" }} />
          </div>

          {/* 3 — Plum hero: gauge + resume */}
          <section
            style={{
              marginTop: 18, padding: "26px 22px 22px", borderRadius: 26,
              background: "var(--plum)", border: "1px solid rgba(201,169,97,0.4)",
              boxShadow: "0 10px 26px -10px rgba(40,15,35,0.55)",
            }}
          >
            <LevelGauge
              level={s.level}
              progress={s.xpForLevel > 0 ? s.xpIntoLevel / s.xpForLevel : 0}
              nextLevel={s.level + 1}
            />

            {pathTarget && !brandNew ? (
              <>
                <Link
                  href={pathTarget.href}
                  className="lib-press flex items-center justify-center"
                  style={{
                    marginTop: 18, padding: 16, borderRadius: 16,
                    background: "var(--lib-gold-cta)", color: "#1a1420", gap: 8,
                  }}
                >
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 800, letterSpacing: "0.02em" }}>
                    {pathTarget.ready ? "Take the final test" : pathTarget.started ? "Resume lesson" : "Start learning"}
                  </span>
                  <span style={{ fontSize: 14 }} aria-hidden="true">→</span>
                </Link>
                <p
                  className="text-center"
                  style={{
                    fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 500,
                    color: "rgba(245,239,224,0.72)", marginTop: 11,
                  }}
                >
                  {pathTarget.course.title} ·{" "}
                  {pathTarget.ready
                    ? "final test"
                    : `Lesson ${pathTarget.lessonNumber} of ${pathTarget.total}`}
                </p>
              </>
            ) : brandNew ? (
              /* A newcomer gets ONE starting action, in the card below. The
                 design puts a CTA in both, but they point at the same lesson,
                 and two gold pills stacked read as two different offers. */
              null
            ) : (
              /* Edge state: every published course is finished. */
              <p
                className="text-center"
                style={{
                  fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 500,
                  color: "rgba(245,239,224,0.72)", marginTop: 18, lineHeight: 1.5,
                }}
              >
                You&rsquo;ve finished every course here. New ones are on the way.
              </p>
            )}
          </section>

          {brandNew ? (
            /* Edge state 1 — new learner. */
            <section
              style={{
                marginTop: 12, padding: "20px 20px 22px", borderRadius: 20,
                background: "var(--lib-plum-island)",
                boxShadow: "inset 0 0 0 0.5px rgba(201,169,97,0.4)",
              }}
            >
              <p className="uppercase" style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "var(--brass)" }}>
                Your path starts here
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.6, color: "var(--lib-on-plum)", marginTop: 10 }}>
                Finish your first lesson and this fills in — a streak, cards to review, and the topics you want more practice on.
              </p>
              {pathTarget && (
                <div style={{ marginTop: 16 }}>
                  <PrimaryPill full onClick={() => router.push(pathTarget.href)}>Begin</PrimaryPill>
                </div>
              )}
            </section>
          ) : (
            <>
          {/* 4 — Streak strip */}
            <div
              className="flex items-center"
              style={{
                marginTop: 12, padding: "13px 16px", borderRadius: 18, gap: 9,
                background: "var(--lib-card)", border: "1px solid var(--lib-card-border)",
                boxShadow: "var(--lib-card-shadow)",
              }}
            >
              <span className="lib-flame" style={{ fontSize: 19 }} aria-hidden="true">🔥</span>
              <span
                style={{
                  fontFamily: "var(--font-display)", fontSize: 21, lineHeight: 1,
                  letterSpacing: "0.02em", color: "var(--lib-ink)",
                }}
              >
                {s.streak}
              </span>
              <span
                className="uppercase"
                style={{
                  fontFamily: "var(--font-body)", fontSize: 9.5, fontWeight: 700,
                  letterSpacing: "0.16em", color: "var(--lib-body)",
                }}
              >
                Day streak
              </span>
              <span style={{ flex: 1 }} />
              <span
                style={{
                  fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600,
                  color: "var(--lib-body)", whiteSpace: "nowrap",
                }}
              >
                {eng.ctx.lessonsCompleted} lessons done
              </span>
            </div>

            {/* 5 — Review due / Weak spots */}
            <div className="grid grid-cols-2" style={{ gap: 12, marginTop: 12 }}>
              <StatBlock
                href="/library/review"
                eyebrow="Review due"
                eyebrowColor="#c9a961"
                count={dueCount}
                caption="cards ready now"
                background="var(--forest)"
                border="1px solid rgba(123,160,85,0.42)"
              />
              <StatBlock
                href="/library/review?scope=weak"
                eyebrow="Weak spots"
                eyebrowColor="#d4b878"
                count={weakCount}
                caption="topics to shore up"
                background="var(--oxblood-deep)"
                border="1px solid rgba(181,101,74,0.42)"
              />
            </div>

            </>
          )}

          {/* 6/7 — Topic grid */}
          <SectionLabel style={{ marginTop: 26, marginBottom: 14 }}>Browse all topics</SectionLabel>
          <div className="grid grid-cols-2" style={{ gap: 13 }}>
            {DOMAINS.map((d) => {
              const domainCourses = ALL_COURSES.filter((c) => c.domain === d.id);
              const target = domainCourses.length === 1 ? `/library/${domainCourses[0].id}` : `/library/d/${d.id}`;
              return (
                <button
                  key={d.id}
                  onClick={() => router.push(target)}
                  className="lib-press relative overflow-hidden text-left flex flex-col"
                  style={{
                    borderRadius: 22, padding: "16px 15px", minHeight: 138,
                    border: `1.5px solid color-mix(in srgb, ${d.accent} calc(var(--lib-tile-border) * 100%), transparent)`,
                    background: `linear-gradient(0deg, color-mix(in srgb, ${d.accent} calc(var(--lib-tile-tint) * 100%), transparent), color-mix(in srgb, ${d.accent} calc(var(--lib-tile-tint) * 100%), transparent)), var(--lib-card)`,
                  }}
                >
                  {/* Solid domain disc with the illustration sitting on it. */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute", left: 13, top: 13, width: 60, height: 60,
                      borderRadius: "50%", background: d.accent,
                    }}
                  />
                  {d.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.cover} alt="" aria-hidden="true" loading="lazy"
                      style={{
                        position: "absolute", left: 19, top: 19, width: 50, height: 50,
                        objectFit: "contain", filter: "drop-shadow(0 2px 5px rgba(0,0,0,.4))",
                      }}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      style={{ position: "absolute", left: 19, top: 19, width: 50, height: 50, fontSize: 30, lineHeight: "50px", textAlign: "center" }}
                    >
                      {d.icon}
                    </span>
                  )}

                  <span style={{ height: 60 }} />
                  <span style={{ flex: 1 }} />
                  <span
                    style={{
                      fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700,
                      color: "var(--lib-ink)", lineHeight: 1.15,
                    }}
                  >
                    {d.title}
                  </span>
                  {d.evidenceTag && (
                    <span
                      style={{
                        fontFamily: "var(--font-body)", fontSize: 10.5, fontWeight: 500,
                        color: "var(--lib-muted)", marginTop: 4, lineHeight: 1.25,
                      }}
                    >
                      {d.evidenceTag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 8/9 — Jump back in. Hidden entirely when there is nothing else. */}
          {alsoInProgress.length > 0 && (
            <>
              <SectionLabel style={{ marginTop: 26, marginBottom: 12 }}>Jump back in</SectionLabel>
              <div className="flex flex-col" style={{ gap: 9 }}>
                {alsoInProgress.map(({ course, p }) => {
                  const total = courseLessons(course).length;
                  const done = p.completedLessonIds?.length ?? 0;
                  const accent = DOMAINS.find((d) => d.id === course.domain)?.accent ?? "var(--brass)";
                  return (
                    <Link
                      key={course.id}
                      href={`/library/${course.id}`}
                      className="lib-press flex items-center"
                      style={{
                        padding: "13px 15px", borderRadius: 16, gap: 12,
                        background: "var(--lib-card)", border: "1px solid var(--lib-card-border)",
                        boxShadow: "var(--lib-card-shadow)",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                          background: `color-mix(in srgb, ${accent} 30%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${accent} 55%, transparent)`,
                        }}
                      />
                      <span className="flex-1 min-w-0">
                        <span
                          className="block truncate"
                          style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 700, color: "var(--lib-ink)" }}
                        >
                          {course.title}
                        </span>
                        <span
                          className="block"
                          style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 500, color: "var(--lib-muted)", marginTop: 2 }}
                        >
                          Lesson {Math.min(done + 1, total)} of {total}
                        </span>
                      </span>
                      <span
                        style={{ fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 700, color: "var(--brass)", whiteSpace: "nowrap" }}
                      >
                        Continue →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          <div style={{ height: 14 }} />
        </div>
      </div>
    </main>
  );
}
