"use client";

import { useState, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Crop,
  SlidersHorizontal,
  Maximize2,
  Camera,
  FileType,
  ScanSearch,
  ShieldCheck,
  X,
} from "lucide-react";
import { getDemoContent, getDemoVariant } from "@/lib/game/demo-content";
import type {
  ContentItem,
  ManipulationCategory,
  ManipulationIntensity,
  SoloDemoScreen,
} from "@/lib/game/types";
import { MANIPULATION_LABELS, INTENSITY_LABELS } from "@/lib/game/constants";

const CATEGORY_ICONS: Record<ManipulationCategory, React.ReactNode> = {
  crop: <Crop size={18} />,
  filter: <SlidersHorizontal size={18} />,
  resize: <Maximize2 size={18} />,
  screenshot: <Camera size={18} />,
  convert: <FileType size={18} />,
};

interface SoloDemoProps {
  onBack: () => void;
}

export function SoloDemo({ onBack }: SoloDemoProps) {
  const [screen, setScreen] = useState<SoloDemoScreen>("feed");
  const [selectedImage, setSelectedImage] = useState<ContentItem | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<ManipulationCategory | null>(null);
  const [selectedIntensity, setSelectedIntensity] =
    useState<ManipulationIntensity>("medium");
  const [isTracing, setIsTracing] = useState(false);

  const { images } = getDemoContent();

  const handleSelectImage = useCallback((item: ContentItem) => {
    setSelectedImage(item);
    setScreen("steal");
  }, []);

  const handleSteal = useCallback(() => {
    if (!selectedCategory) return;
    setScreen("trace");
    setIsTracing(true);
    // Simulate trace animation
    setTimeout(() => {
      setIsTracing(false);
      setScreen("result");
    }, 2500);
  }, [selectedCategory]);

  const handleReset = useCallback(() => {
    setSelectedImage(null);
    setSelectedCategory(null);
    setSelectedIntensity("medium");
    setIsTracing(false);
    setScreen("feed");
  }, []);

  const variant =
    selectedImage && selectedCategory
      ? getDemoVariant(selectedImage.id, selectedCategory, selectedIntensity)
      : null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <button
          onClick={screen === "feed" ? onBack : handleReset}
          className="btn-ghost p-2 -ml-2"
        >
          {screen === "feed" ? <X size={20} /> : <ArrowLeft size={20} />}
        </button>
        <div className="font-display text-sm font-medium text-muted-foreground">
          Demo Mode
        </div>
        <div className="w-8" />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-6 max-w-2xl mx-auto w-full">
        {/* FEED SCREEN */}
        {screen === "feed" && (
          <div className="w-full space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-semibold">
                The Content Feed
              </h2>
              <p className="text-muted-foreground text-sm">
                Each image is invisibly watermarked by Verda. Pick one to steal.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {images.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectImage(item)}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-200"
                >
                  {/* Placeholder colored rectangle until real images are added */}
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                    <span className="text-3xl opacity-50">
                      {["🌅", "🏙️", "🎨", "🏛️"][images.indexOf(item)]}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="text-xs font-medium text-white">
                      @{item.author.toLowerCase().replace(" ", "")}
                    </div>
                    <div className="text-xs text-white/60 truncate">
                      {item.caption}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="badge-pirate text-xs py-0.5 px-2">
                      Steal
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
              <ShieldCheck size={14} style={{ color: "var(--protector-color)" }} />
              <span>All content protected with invisible watermarks</span>
            </div>
          </div>
        )}

        {/* STEAL SCREEN */}
        {screen === "steal" && selectedImage && (
          <div className="w-full space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-semibold">
                Disguise the Evidence
              </h2>
              <p className="text-muted-foreground text-sm">
                Apply a manipulation to evade detection. Can Verda still find the
                watermark?
              </p>
            </div>

            {/* Selected image preview */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
              <span className="text-5xl opacity-50">
                {["🌅", "🏙️", "🎨", "🏛️"][images.indexOf(selectedImage)]}
              </span>
              <div className="absolute top-3 left-3 badge-pirate text-xs">
                Stolen from @
                {selectedImage.author.toLowerCase().replace(" ", "")}
              </div>
            </div>

            {/* Manipulation categories */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">
                Manipulation Type
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  Object.keys(MANIPULATION_LABELS) as ManipulationCategory[]
                ).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      selectedCategory === cat
                        ? "bg-[rgba(192,132,252,0.15)] text-[var(--pirate-color)] border border-[rgba(192,132,252,0.3)]"
                        : "bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
                    }`}
                  >
                    {CATEGORY_ICONS[cat]}
                    {MANIPULATION_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity slider */}
            {selectedCategory && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <label className="text-sm font-medium text-muted-foreground">
                  Intensity
                </label>
                <div className="flex items-center gap-3">
                  {(["light", "medium", "heavy"] as ManipulationIntensity[]).map(
                    (level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedIntensity(level)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedIntensity === level
                            ? "bg-[rgba(192,132,252,0.2)] text-[var(--pirate-color)] border border-[rgba(192,132,252,0.3)]"
                            : "bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
                        }`}
                      >
                        {INTENSITY_LABELS[level]}
                      </button>
                    )
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedIntensity === "light" &&
                    "Subtle changes. Most watermarks survive this easily."}
                  {selectedIntensity === "medium" &&
                    "Noticeable edits. Tests the watermark's resilience."}
                  {selectedIntensity === "heavy" &&
                    "Aggressive manipulation. Maximum risk, maximum reward."}
                </p>
              </div>
            )}

            {/* Steal button */}
            <button
              onClick={handleSteal}
              disabled={!selectedCategory}
              className={`w-full py-3 rounded-full font-display font-semibold text-base transition-all duration-200 ${
                selectedCategory
                  ? "bg-[var(--pirate-color)] text-white hover:opacity-90"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              }`}
            >
              Post Stolen Content
            </button>
          </div>
        )}

        {/* TRACE SCREEN */}
        {screen === "trace" && (
          <div className="w-full flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                <span className="text-5xl opacity-50">
                  {selectedImage &&
                    ["🌅", "🏙️", "🎨", "🏛️"][images.indexOf(selectedImage)]}
                </span>
              </div>
              {/* Scanning animation */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(180deg,
                    transparent 0%,
                    rgba(255, 166, 43, 0.15) 48%,
                    rgba(255, 166, 43, 0.4) 50%,
                    rgba(255, 166, 43, 0.15) 52%,
                    transparent 100%)`,
                  animation: "scan 1.5s ease-in-out infinite",
                }}
              />
            </div>
            <div className="text-center space-y-2">
              <ScanSearch
                size={24}
                className="mx-auto animate-pulse"
                style={{ color: "var(--verda-amber)" }}
              />
              <h2 className="text-xl font-display font-semibold">
                Verda is scanning...
              </h2>
              <p className="text-sm text-muted-foreground">
                Analyzing for embedded watermarks
              </p>
            </div>

            <style jsx>{`
              @keyframes scan {
                0%,
                100% {
                  transform: translateY(-100%);
                }
                50% {
                  transform: translateY(100%);
                }
              }
            `}</style>
          </div>
        )}

        {/* RESULT SCREEN */}
        {screen === "result" && variant && (
          <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Result header */}
            <div className="text-center space-y-2">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: "rgba(255, 166, 43, 0.15)",
                  color: "var(--verda-amber)",
                  border: "1px solid rgba(255, 166, 43, 0.3)",
                }}
              >
                <ShieldCheck size={18} />
                CAUGHT
              </div>
              <h2 className="text-2xl font-display font-semibold mt-4">
                Watermark Detected
              </h2>
              <p className="text-muted-foreground text-sm">
                Even after a <strong>{selectedIntensity} {selectedCategory}</strong>,
                Verda found the watermark.
              </p>
            </div>

            {/* Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground text-center">
                  Original
                </div>
                <div className="aspect-square rounded-xl overflow-hidden border border-border/50 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                  <span className="text-3xl opacity-50">
                    {selectedImage &&
                      ["🌅", "🏙️", "🎨", "🏛️"][
                        images.indexOf(selectedImage)
                      ]}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground text-center">
                  Stolen + {selectedCategory}
                </div>
                <div className="aspect-square rounded-xl overflow-hidden border border-[rgba(192,132,252,0.3)] bg-gradient-to-br from-secondary to-muted flex items-center justify-center relative">
                  <span className="text-3xl opacity-50">
                    {selectedImage &&
                      ["🌅", "🏙️", "🎨", "🏛️"][
                        images.indexOf(selectedImage)
                      ]}
                  </span>
                  <div className="absolute top-2 right-2 badge-pirate text-[10px] py-0.5 px-1.5">
                    {selectedIntensity}
                  </div>
                </div>
              </div>
            </div>

            {/* Decode result card */}
            <div className="rounded-2xl border border-border/50 p-5 space-y-4 card-raised">
              <div className="text-sm font-display font-semibold">
                Trace Result
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Confidence
                  </div>
                  <div
                    className="text-2xl font-display font-bold"
                    style={{ color: "var(--verda-amber)" }}
                  >
                    {(variant.decodeResult.confidence * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Traced to
                  </div>
                  <div className="text-sm font-medium mt-1">
                    @{selectedImage?.author.toLowerCase().replace(" ", "")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Watermark ID
                  </div>
                  <div className="text-sm font-mono mt-1">
                    {variant.decodeResult.uid
                      ? `0x${variant.decodeResult.uid.toString(16).toUpperCase()}`
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Manipulation
                  </div>
                  <div className="text-sm mt-1 capitalize">
                    {selectedIntensity} {selectedCategory}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3 pt-2">
              <p className="text-sm text-center text-muted-foreground">
                Verda&apos;s watermarks survive manipulation.
                <br />
                Think you can do better against real players?
              </p>
              <button
                onClick={handleReset}
                className="btn-primary w-full py-3 text-base"
              >
                Try Again
              </button>
              <a
                href="https://verda.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline w-full py-3 text-base block text-center"
              >
                Learn About Verda
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
