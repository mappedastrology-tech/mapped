"use client";

import dynamic from "next/dynamic";

const RitualPageContent = dynamic(() => import("./RitualPageContent"), {
  ssr: false,
});

export default function RitualPage() {
  return <RitualPageContent />;
}
