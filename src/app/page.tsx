"use client";

import { useState } from "react";
import { LandingPage } from "@/components/landing/LandingPage";
import { SoloDemo } from "@/components/game/SoloDemo";
import { DailyChallenge } from "@/components/game/DailyChallenge";

type Mode = "landing" | "solo" | "challenge" | "play";

export default function Home() {
  const [mode, setMode] = useState<Mode>("landing");

  if (mode === "solo") {
    return <SoloDemo onBack={() => setMode("landing")} />;
  }

  if (mode === "challenge") {
    return <DailyChallenge onBack={() => setMode("landing")} />;
  }

  if (mode === "play") {
    // TODO: Quick Play multiplayer
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-display font-bold">Quick Play Coming Soon</h2>
          <p style={{ color: "var(--pp-fg3)" }}>Try the Daily Challenge to play against Verda.</p>
          <button onClick={() => setMode("challenge")} className="btn-purple px-6 py-2.5 text-sm">Daily Challenge</button>
        </div>
      </div>
    );
  }

  return (
    <LandingPage
      onDemo={() => setMode("solo")}
      onPlay={() => setMode("challenge")}
    />
  );
}
