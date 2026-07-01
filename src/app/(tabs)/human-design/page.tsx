"use client";

import dynamic from "next/dynamic";

const HumanDesignPageContent = dynamic(() => import("./HumanDesignPageContent"), { ssr: false });

export default function HumanDesignPage() {
  return <HumanDesignPageContent />;
}
