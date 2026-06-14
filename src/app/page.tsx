"use client";

import { useState } from "react";
import { SplashScreen } from "@/components/game/SplashScreen";
import { SoloDemo } from "@/components/game/SoloDemo";

type Mode = "splash" | "solo" | "multiplayer";

export default function Home() {
  const [mode, setMode] = useState<Mode>("splash");

  if (mode === "solo") {
    return <SoloDemo onBack={() => setMode("splash")} />;
  }

  if (mode === "multiplayer") {
    // TODO: Increment 2
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-display font-semibold">
            Multiplayer Coming Soon
          </h2>
          <p className="text-muted-foreground">
            Play the solo demo to see how watermarks protect content.
          </p>
          <button
            onClick={() => setMode("splash")}
            className="btn-outline px-6 py-2.5 text-sm"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <SplashScreen
      onSoloDemo={() => setMode("solo")}
      onMultiplayer={() => setMode("multiplayer")}
    />
  );
}
