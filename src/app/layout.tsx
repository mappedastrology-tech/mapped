import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import ToastProvider from "@/components/Toast";
import ErrorMonitorInit from "@/components/ErrorMonitorInit";

// NOTE: We're using system fonts + CSS @import for Google Fonts
// instead of next/font, because next/font downloads fonts at build time
// and some build environments block that. This works just as well.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mapped-olive.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Mapped — astrology for your actual life",
  description:
    "Understand your birth chart. Understand your life. Mapped gives you real, grounded astrology — not personality quizzes.",
  applicationName: "Mapped",
  appleWebApp: { capable: true, title: "Mapped", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    siteName: "Mapped",
    url: SITE_URL,
    title: "Mapped — astrology for your actual life",
    description:
      "Understand your birth chart. Understand your life. Mapped gives you real, grounded astrology — not personality quizzes.",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "Mapped" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mapped — astrology for your actual life",
    description:
      "Understand your birth chart. Understand your life. Mapped gives you real, grounded astrology — not personality quizzes.",
    images: ["/icon-512.png"],
  },
};

// This tells mobile browsers to render at phone width and sets the
// status bar color to match our dark background
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0e0a14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Typography system:
             Bodoni Moda — primary display/header (Palmore-like retro condensed)
             Playfair Display — secondary header (Il Dolce book-cover serif)
             DM Sans — body text (clean modern sans-serif) */}
        {/* PWA — allows "Add to Home Screen" on mobile */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mapped" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Theme script — runs before React hydrates to prevent flash */}
        <Script id="theme-init" src="/theme-init.js" strategy="beforeInteractive" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,600;0,6..96,700;0,6..96,800;0,6..96,900;1,6..96,400;1,6..96,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Noto+Sans+Symbols+2&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="min-h-dvh flex flex-col antialiased" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        <ErrorMonitorInit />
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
