"use client";

import dynamic from "next/dynamic";

const NumerologyPageContent = dynamic(() => import("./NumerologyPageContent"), { ssr: false });

export default function NumerologyPage() {
  return <NumerologyPageContent />;
}
