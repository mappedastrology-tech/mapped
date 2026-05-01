"use client";

import { useState } from "react";

export default function PracticePage() {
  const [showWizard, setShowWizard] = useState(false);

  if (showWizard) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>It worked!</h2>
        <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 24 }}>
          The state change didn&apos;t crash.
        </p>
        <button
          onClick={() => setShowWizard(false)}
          style={{ padding: "10px 24px", borderRadius: 12, border: "1px solid #ccc", background: "none", fontSize: 14 }}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>My Practice</h1>
      <p style={{ fontSize: 12, color: "red", marginBottom: 16 }}>BUILD: may1-v7-minimal</p>
      <button
        onClick={() => setShowWizard(true)}
        style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid #ccc", background: "none", fontSize: 14, cursor: "pointer" }}
      >
        + Create a custom ritual
      </button>
    </div>
  );
}
