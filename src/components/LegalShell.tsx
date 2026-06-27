import Link from "next/link";

/**
 * Shared shell for the legal pages (Privacy Policy, Terms of Service).
 * Public, server-rendered, styled to match the app.
 */
export default function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-background">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-muted hover:text-foreground text-sm transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Mapped
        </Link>

        <h1 className="text-3xl text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h1>
        <p className="text-muted text-xs mb-8">Last updated: {updated}</p>

        <div className="legal-body text-secondary text-[15px] leading-relaxed space-y-5">
          {children}
        </div>

        <div className="mt-12 pt-6 border-t border-foreground/10 flex gap-4 text-sm">
          <Link href="/privacy" className="text-terracotta hover:text-terracotta-light transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-terracotta hover:text-terracotta-light transition-colors">Terms of Service</Link>
        </div>
      </div>
    </main>
  );
}

/** Section heading used inside legal pages. */
export function LegalH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-foreground text-lg mt-8 mb-1" style={{ fontFamily: "var(--font-display)" }}>
      {children}
    </h2>
  );
}
