"use client";

import { Shield, Skull } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface SplashScreenProps {
  onSoloDemo: () => void;
  onMultiplayer: () => void;
}

export function SplashScreen({ onSoloDemo, onMultiplayer }: SplashScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Ambient glow */}
      <div
        className="fixed pointer-events-none"
        style={{
          width: 720,
          height: 520,
          filter: "blur(90px)",
          opacity: 0.3,
          background:
            "radial-gradient(ellipse at 70% 30%, var(--verda-amber-glow) 0%, transparent 70%)",
          right: -180,
          top: -220,
          transform: "rotate(15deg)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        {/* Logo */}
        <Logo width={100} height={18} className="mb-6" />

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-display font-bold tracking-tight gradient-text mb-4">
          Protect or Pirate
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg mb-10 max-w-md"
          style={{ color: "var(--verda-fg-3)" }}
        >
          Can you steal content without getting caught?
          <br />
          Play the watermark game and find out.
        </p>

        {/* Role preview cards */}
        <div className="flex gap-4 mb-10 w-full max-w-sm">
          <div className="flex-1 rounded-2xl p-4 text-center border border-[rgba(255,166,43,0.2)] bg-[rgba(255,166,43,0.05)]">
            <Shield
              size={32}
              className="mx-auto mb-2"
              style={{ color: "var(--protector-color)" }}
            />
            <div
              className="font-display font-semibold text-sm"
              style={{ color: "var(--protector-color)" }}
            >
              Protector
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Catch the thieves
            </div>
          </div>
          <div className="flex-1 rounded-2xl p-4 text-center border border-[rgba(192,132,252,0.2)] bg-[rgba(192,132,252,0.05)]">
            <Skull
              size={32}
              className="mx-auto mb-2"
              style={{ color: "var(--pirate-color)" }}
            />
            <div
              className="font-display font-semibold text-sm"
              style={{ color: "var(--pirate-color)" }}
            >
              Pirate
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Steal undetected
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={onSoloDemo}
            className="btn-primary w-full py-3 text-base"
          >
            Try the Demo
          </button>
          <button
            onClick={onMultiplayer}
            className="btn-outline w-full py-3 text-base"
          >
            Join a Game
          </button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-muted-foreground">
          Powered by{" "}
          <a
            href="https://verda.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            Verda&apos;s watermarking technology
          </a>
        </p>
      </div>
    </div>
  );
}
