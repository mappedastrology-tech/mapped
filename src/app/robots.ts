import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mapped-olive.vercel.app";

/**
 * Mapped is a personal, authenticated app — only the public marketing and legal
 * pages should be crawled. Everything behind sign-in (and all API routes) is
 * disallowed so private user areas never end up in search results.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/terms"],
      disallow: [
        "/home",
        "/you",
        "/maps",
        "/journal",
        "/learn",
        "/almanac",
        "/tarot",
        "/dolly",
        "/palmistry",
        "/account",
        "/onboarding",
        "/rectification",
        "/chart",
        "/auth",
        "/api",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
