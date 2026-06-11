import Link from "next/link";

/**
 * Custom 404 page — branded, warm, and helpful.
 */

export default function NotFound() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#f0e6d2", color: "#3d3328" }}
    >
      <div className="mb-8">
        <h2 className="text-[42px] leading-none tracking-tight mb-1">
          <span style={{ fontFamily: "'Bodoni Moda', serif", fontStyle: "italic", fontWeight: 400 }}>mapp</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}>ed.</span>
        </h2>
      </div>

      <div className="max-w-sm">
        <p className="text-lg mb-2" style={{ fontFamily: "Georgia, serif" }}>
          This page doesn&apos;t exist
        </p>
        <p className="text-sm opacity-60 mb-8 leading-relaxed">
          Maybe the stars rearranged themselves. Let&apos;s get you back on track.
        </p>

        <Link
          href="/home"
          className="inline-block px-8 py-3 rounded-full text-sm font-semibold tracking-wide
                     active:scale-[0.98] transition-all"
          style={{
            backgroundColor: "#b8a068",
            color: "#1a1a1a",
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
