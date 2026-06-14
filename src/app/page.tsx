"use client";

import { useState } from "react";
import { LandingPage } from "@/components/landing/LandingPage";
import { SoloDemo } from "@/components/game/SoloDemo";

type Mode = "landing" | "solo" | "play";

export default function Home() {
  const [mode, setMode] = useState<Mode>("landing");

  if (mode === "solo") {
    return <SoloDemo onBack={() => setMode("landing")} />;
  }

  if (mode === "play") {
    // TODO: Quick Play
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-display font-bold">Quick Play Coming Soon</h2>
          <p style={{ color: "var(--pp-fg3)" }}>Try the solo demo to see watermarks in action.</p>
          <button onClick={() => setMode("landing")} className="btn-outline px-6 py-2.5 text-sm">Back</button>
        </div>
      </div>
    );
  }

  return (
    <LandingPage
      onDemo={() => setMode("solo")}
      onPlay={() => setMode("play")}
    />
  );
}
