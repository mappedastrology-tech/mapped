"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export interface Crumb {
  label: string;
  href: string;
}

/**
 * Header for the library's standalone screens. The back button goes to the
 * logical PARENT (not browser-back), so stepping out of a lesson lands on the
 * course — not the previous lesson. Optional breadcrumbs let you jump further.
 */
export default function LibraryHeader({
  title,
  fallback = "/library",
  crumbs,
  accent = "var(--brass)",
}: {
  title: string;
  fallback?: string;
  crumbs?: Crumb[];
  accent?: string;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm" style={{ borderBottom: "1px solid var(--border-card)" }}>
      <div className="max-w-lg mx-auto px-4 py-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(fallback)}
            className="w-9 h-9 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center active:scale-95 transition-transform shrink-0"
            style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)", boxShadow: "var(--card-shadow)" }}
            aria-label="Back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="min-w-0">
            {crumbs && crumbs.length > 0 && (
              <nav className="flex items-center gap-1 mb-0.5 text-[10px]" aria-label="Breadcrumb">
                {crumbs.map((c, i) => (
                  <span key={c.href} className="flex items-center gap-1 min-w-0">
                    <Link href={c.href} className="truncate hover:underline" style={{ color: "var(--foreground-muted)" }}>{c.label}</Link>
                    <span aria-hidden="true" style={{ color: "var(--foreground-ghost)" }}>›</span>
                  </span>
                ))}
              </nav>
            )}
            <h1 className="text-[15px] font-semibold truncate leading-tight" style={{ color: "var(--foreground)", fontFamily: "var(--font-ui)" }}>
              <span style={{ color: accent }}>—</span> {title}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
