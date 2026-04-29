import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages edge runtime
  images: {
    unoptimized: true, // Cloudflare doesn't support Next.js image optimization
  },
};

export default nextConfig;
