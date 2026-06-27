"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DOMAINS, getCoursesByDomain, lessonCount } from "@/lib/learn/registry";
import { domainsWithReference, referenceByDomain } from "@/lib/learn/reference";
import { getAllProgress } from "@/lib/learn/progress";
import type { CourseProgress, LearnDomain } from "@/lib/learn/types";
import LibraryHeader from "./LibraryHeader";
import ReferenceList from "./ReferenceList";
import CompletionRing from "./CompletionRing";

export default function DomainHub({ domain, initialTab }: { domain: string; initialTab?: "learn" | "reference" }) {
  const meta = DOMAINS.find((d) => d.id === domain);
  const hasReference = domainsWithReference().has(domain as LearnDomain);
  const refCount = hasReference ? referenceByDomain(domain as LearnDomain).length : 0;
  // Single-course domains reach the hub mainly for the lookup, so open there.
  const singleCourse = getCoursesByDomain(domain as LearnDomain).length === 1;
  const [tab, setTab] = useState<"learn" | "reference">(initialTab ?? (singleCourse && hasReference ? "reference" : "learn"));
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});

  useEffect(() => {
    let active = true;
    getAllProgress().then((p) => { if (active) setProgress(p); });
    return () => { active = false; };
  }, []);

  if (!meta) {
    return (
      <main className="min-h-screen lib-felt">
        <LibraryHeader title="Library" fallback="/library" />
        <p className="max-w-lg mx-auto px-5 py-10 text-center text-sm" style={{ color: "var(--foreground-muted)" }}>That topic couldn&rsquo;t be found.</p>
      </main>
    );
  }

  const courses = getCoursesByDomain(meta.id);

  const accent = meta.accent;

  return (
    <main className="min-h-screen lib-felt">
      <LibraryHeader title={meta.title} fallback="/library" accent={accent} />
      <div className="max-w-lg mx-auto px-5 py-5 pb-24">
        {/* Domain hero */}
        <div className="relative overflow-hidden rounded-2xl p-5 mb-4" style={{ background: `linear-gradient(135deg, ${accent}3a, var(--background-card) 78%)`, border: `1px solid ${accent}66`, boxShadow: "var(--card-shadow)", minHeight: 104 }}>
          {meta.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={meta.cover} alt="" aria-hidden="true" loading="lazy" className="absolute -right-3 -bottom-4 w-28 h-28 object-contain pointer-events-none" style={{ opacity: 0.85 }} />
          )}
          <div className="relative max-w-[72%]">
            <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2" style={{ backgroundColor: `${accent}33`, border: `1px solid ${accent}77` }} aria-hidden="true">{meta.icon}</span>
            <h2 className="text-[18px] font-semibold leading-tight mb-1" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>{meta.title}</h2>
            <p className="text-[12px] leading-snug" style={{ color: "var(--foreground-secondary)" }}>{meta.blurb}</p>
          </div>
        </div>

        {/* Tabs (only show if there's a reference set to switch to) */}
        {hasReference && (
          <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ backgroundColor: "var(--background-elevated)", border: "1px solid var(--border-card)" }}>
            {(["learn", "reference"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-lg text-[12px] font-semibold tracking-wide uppercase transition-colors"
                style={tab === t ? { backgroundColor: accent, color: "var(--lib-surface)", boxShadow: "var(--card-shadow)" } : { color: "var(--foreground-secondary)" }}
              >
                {t === "learn" ? "Lessons" : `Library · ${refCount}`}
              </button>
            ))}
          </div>
        )}

        {tab === "learn" || !hasReference ? (
          <div className="flex flex-col gap-2.5 mt-3">
            {courses.map((course) => {
              const total = lessonCount(course);
              const prog = progress[course.id];
              const doneCount = prog?.completedLessonIds?.length ?? 0;
              const completed = !!prog?.completedAt;
              const allDone = total > 0 && doneCount >= total;
              const isOutline = course.status === "outline";
              const pct = total > 0 ? Math.round((Math.min(doneCount, total) / total) * 100) : 0;
              return (
                <Link key={course.id} href={`/library/${course.id}`} className="flex items-center gap-3 rounded-2xl p-4 active:scale-[0.99] transition-transform" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)", boxShadow: "var(--card-shadow)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>{course.title}</p>
                    <p className="text-[12px] mt-0.5" style={{ color: "var(--foreground-secondary)" }}>{course.subtitle}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px]" style={{ color: "var(--foreground-muted)" }}>
                      <span className="capitalize">{course.level}</span><span>·</span><span>{course.estMinutes} min</span>
                      {!isOutline && <><span>·</span><span>{total} lessons</span></>}
                    </div>
                  </div>
                  {isOutline ? (
                    <span className="shrink-0 text-[9px] uppercase tracking-wider px-2 py-1 rounded-full" style={{ color: "var(--foreground-muted)", backgroundColor: "var(--tag-bg)" }}>Soon</span>
                  ) : (
                    <div className="shrink-0 flex flex-col items-center gap-0.5">
                      <CompletionRing pct={pct} accent={accent} size={42} />
                      <span className="text-[8px] uppercase tracking-wider" style={{ color: completed ? "var(--sage-light)" : allDone ? "var(--brass-light)" : "var(--foreground-muted)" }}>
                        {completed ? "✓ done" : allDone ? "final test" : doneCount > 0 ? "going" : "start"}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <ReferenceList domain={meta.id} placeholder={`Search ${meta.title.toLowerCase()}…`} />
        )}
      </div>
    </main>
  );
}
