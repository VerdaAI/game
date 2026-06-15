"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  X,
  Crop,
  SlidersHorizontal,
  Maximize2,
  Camera,
  ScanSearch,
  ShieldCheck,
  Fingerprint,
  Hand,
  Upload,
  RotateCcw,
  RefreshCw,
  Users,
  Sparkles,
  FlaskConical,
  FlipHorizontal2,
  Square,
  AtSign,
  FileMinus,
  Eraser,
} from "lucide-react";
import {
  MANIPULATIONS,
  applyManipulation,
  applyMultipleManipulations,
  loadImage,
  type ManipulationType,
} from "@/lib/game/manipulations";
import { ScanOverlay } from "./ScanOverlay";

interface SoloDemoProps {
  onBack: () => void;
}

type Screen = "feed" | "steal" | "disguise" | "scan" | "result";
const SCREEN_ORDER: Screen[] = ["feed", "steal", "disguise", "scan", "result"];

// All watermarked images — loaded dynamically from manifest
// Fallback to hardcoded list if manifest not loaded
const IMAGES = Array.from({ length: 30 }, (_, i) => {
  const idx = i + 1;
  const creators = [
    { handle: "@sarahchen", name: "Sarah Chen", caption: "Golden hour at the coast" },
    { handle: "@marcusrivera", name: "Marcus Rivera", caption: "Street photography downtown" },
    { handle: "@aishapatel", name: "Aisha Patel", caption: "Morning light in the studio" },
    { handle: "@jamesokafor", name: "James Okafor", caption: "Architecture at dusk" },
    { handle: "@lena.wilde", name: "Lena Wilde", caption: "Portrait session" },
    { handle: "@kofi.builds", name: "Kofi Mensah", caption: "City skyline at night" },
    { handle: "@rin_makes", name: "Rin Tanaka", caption: "Travel photography" },
    { handle: "@dao.studio", name: "Dao Studio", caption: "Creative still life" },
    { handle: "@nova_grabs", name: "Nova Chen", caption: "Festival moments" },
    { handle: "@jules.frame", name: "Jules Martin", caption: "Autumn in the park" },
    { handle: "@aria.lens", name: "Aria Nguyen", caption: "Nature Landscape" },
    { handle: "@maxshot", name: "Max Bergström", caption: "City Street Night" },
    { handle: "@priya.captures", name: "Priya Sharma", caption: "Portrait" },
    { handle: "@tomaso.photo", name: "Tomaso Ricci", caption: "Food Photography" },
    { handle: "@zuri.frames", name: "Zuri Okonkwo", caption: "Ocean Waves" },
    { handle: "@kai.visual", name: "Kai Tanaka", caption: "Mountain Hiking" },
    { handle: "@elena.pix", name: "Elena Petrova", caption: "Coffee Shop" },
    { handle: "@diego.snap", name: "Diego Morales", caption: "Sunset Sky" },
    { handle: "@lina.shoot", name: "Lina Johansson", caption: "Architecture" },
    { handle: "@omar.click", name: "Omar Al-Rashid", caption: "Flowers Garden" },
    { handle: "@sofia.gram", name: "Sofia Costa", caption: "Dog Pet" },
    { handle: "@yuki.raw", name: "Yuki Watanabe", caption: "Concert Music" },
    { handle: "@amara.eye", name: "Amara Diallo", caption: "Rain City" },
    { handle: "@leo.studio", name: "Leo Fischer", caption: "Desert Sand" },
    { handle: "@mei.daily", name: "Mei-Lin Wong", caption: "Snow Winter" },
    { handle: "@sven.wild", name: "Sven Larsson", caption: "Street Art" },
    { handle: "@nadia.art", name: "Nadia Khoury", caption: "Bicycle Urban" },
    { handle: "@ravi.pics", name: "Ravi Patel", caption: "Cat" },
    { handle: "@clara.view", name: "Clara Müller", caption: "Market Fruit" },
    { handle: "@jada.mood", name: "Jada Williams", caption: "Forest Trees" },
  ];
  const c = creators[i] || creators[0];
  return { id: i, ...c, src: `/content/images/demo-${String(idx).padStart(2, "0")}.jpg` };
});

const ICON_MAP: Record<string, React.ElementType> = {
  "sliders-horizontal": SlidersHorizontal,
  camera: Camera,
  crop: Crop,
  "flip-horizontal-2": FlipHorizontal2,
  "maximize-2": Maximize2,
  square: Square,
  "at-sign": AtSign,
  eraser: Eraser,
  "file-minus": FileMinus,
};

const INT_DEFS = [
  { key: "light" as const, label: "Light", mult: "\u00d71" },
  { key: "medium" as const, label: "Medium", mult: "\u00d71.5" },
  { key: "heavy" as const, label: "Heavy", mult: "\u00d72.5" },
];

export function SoloDemo({ onBack }: SoloDemoProps) {
  const [screen, setScreen] = useState<Screen>("feed");
  const [picked, setPicked] = useState(0);
  const [manips, setManips] = useState<ManipulationType[]>(["remove_watermark"]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [manipBlob, setManipBlob] = useState<Blob | null>(null);
  const [decodeResult, setDecodeResult] = useState<{
    match: boolean | null; // null = still scanning
    watermark_ref: string;
  } | null>(null);
  const previewRef = useRef<string | null>(null);

  const stepIdx = SCREEN_ORDER.indexOf(screen);
  const image = IMAGES[picked];

  function doShuffle() {
    const arr = IMAGES.map((im, i) => ({ ...im, originalIdx: i }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  const [shuffledImages, setShuffledImages] = useState(() => doShuffle());
  const refreshFeed = () => setShuffledImages(doShuffle());
  const manipLabels = manips.length === 0 ? "No modifications" : manips.map((m) => MANIPULATIONS.find((d) => d.key === m)!.label).join(" + ");

  const toggleManip = (key: ManipulationType) => {
    setManips((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key); // allow empty
      }
      if (prev.length >= 3) return prev;
      return [...prev, key];
    });
  };

  // Generate live preview
  useEffect(() => {
    if (screen !== "disguise") return;
    let cancelled = false;
    const configs = manips.map((m) => ({ type: m, strength: "medium" as const }));
    (async () => {
      try {
        const img = await loadImage(image.src);
        let blob: Blob;
        if (configs.length === 0) {
          // No manipulations — use original as-is
          const resp = await fetch(image.src);
          blob = await resp.blob();
        } else if (configs.length === 1) {
          blob = await applyManipulation(img, configs[0].type, configs[0].strength);
        } else {
          blob = await applyMultipleManipulations(img, configs);
        }
        if (cancelled) return;
        if (previewRef.current) URL.revokeObjectURL(previewRef.current);
        const url = URL.createObjectURL(blob);
        previewRef.current = url;
        setPreviewUrl(url);
        setManipBlob(blob);
      } catch (e) { console.error("Manipulation failed:", e); }
    })();
    return () => { cancelled = true; };
  }, [screen, manips, image.src]);

  useEffect(() => {
    return () => { if (previewRef.current) URL.revokeObjectURL(previewRef.current); };
  }, []);

  // Post stolen content — go to result immediately, decode in background
  const handleSteal = useCallback(async () => {
    if (!manipBlob) return;
    setDecodeResult({ match: null, watermark_ref: "" }); // null = scanning
    setScreen("result");

    try {
      const formData = new FormData();
      formData.append("file", manipBlob, "stolen.jpg");
      const resp = await fetch("/api/decode", { method: "POST", body: formData });
      const data = await resp.json();
      setDecodeResult({ match: data.match ?? false, watermark_ref: data.watermark_ref ?? "" });
    } catch (e) {
      console.error("Decode failed:", e);
      setDecodeResult({ match: false, watermark_ref: "" });
    }
  }, [manipBlob]);

  const go = useCallback((s: Screen) => setScreen(s), []);
  const backMap: Record<Screen, Screen> = { feed: "feed", steal: "feed", disguise: "steal", scan: "disguise", result: "feed" };
  const handleBack = () => {
    if (screen === "feed") onBack();
    else go(backMap[screen]);
  };
  const reset = () => {
    setPicked(0);
    setManips(["remove_watermark"]);
    setPreviewUrl(null);
    setManipBlob(null);
    setDecodeResult(null);
    setShuffledImages(doShuffle());
    setScreen("feed");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--pp-bg)", color: "var(--pp-text)", fontFamily: "var(--font-body)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "30px 20px 40px" }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", minHeight: 560, borderRadius: 20, border: "1px solid var(--pp-bd)", background: "var(--pp-bg)", overflow: "hidden", boxShadow: "0 30px 80px -40px rgba(0,0,0,0.85)" }}>
          {/* Browser chrome */}
          <div style={{ height: 42, display: "flex", alignItems: "center", gap: 8, padding: "0 16px", borderBottom: "1px solid var(--pp-bd)", background: "var(--pp-bg2)", flex: "0 0 auto" }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#4a4d50" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#4a4d50" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#4a4d50" }} />
            <span style={{ marginLeft: 10, fontFamily: "ui-monospace, monospace", fontSize: 11, color: "var(--pp-fg4)", background: "var(--pp-bg)", border: "1px solid var(--pp-bd)", borderRadius: 8, padding: "3px 12px" }}>
              protect-or-pirate.verda.ai/demo
            </span>
          </div>

          {/* App bar */}
          <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px 12px", borderBottom: "1px solid var(--pp-bd)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={handleBack} style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid var(--pp-bd)", background: "var(--pp-card2)", color: "var(--pp-fg2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                {screen === "feed" ? <X size={17} /> : <ArrowLeft size={17} />}
              </button>
              {screen === "feed" && (
                <button onClick={refreshFeed} style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid var(--pp-bd)", background: "var(--pp-card2)", color: "var(--pp-fg2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <RefreshCw size={15} />
                </button>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--pp-fg3)" }}>
              <FlaskConical size={13} style={{ color: "var(--pp-amber)" }} />
              Demo Mode
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {SCREEN_ORDER.map((s, i) => (
                <span key={s} style={{ borderRadius: 99, transition: "all 0.2s", ...(i === stepIdx ? { width: 16, height: 6, background: "var(--pp-amber)" } : i < stepIdx ? { width: 6, height: 6, background: "var(--pp-amber-bd)" } : { width: 6, height: 6, background: "var(--pp-bd2)" }) }} />
              ))}
            </div>
          </div>

          <div style={{ flex: "1 1 auto", overflowY: "auto", overflowX: "hidden" }}>
            {/* FEED — masonry collage */}
            {screen === "feed" && (
              <div style={{ padding: "16px 12px 20px" }}>
                <div style={{ padding: "0 6px 14px" }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(22px,3vw,30px)", margin: "0 0 6px" }}>The content feed</h2>
                  <p style={{ fontSize: 14, color: "var(--pp-fg3)", margin: 0, lineHeight: 1.45 }}>Every image is invisibly watermarked by Verda. Tap one to steal it.</p>
                </div>
                {/* Masonry columns — preserves aspect ratio, variable sizes */}
                <div style={{ columnCount: 3, columnGap: 4, padding: "0 2px" }}>
                  {shuffledImages.map((im) => (
                    <button
                      key={im.id}
                      onClick={() => { setPicked(im.originalIdx); go("steal"); }}
                      style={{
                        position: "relative",
                        padding: 0,
                        border: "none",
                        cursor: "pointer",
                        display: "block",
                        overflow: "hidden",
                        borderRadius: 6,
                        background: "var(--pp-card2)",
                        width: "100%",
                        marginBottom: 4,
                        breakInside: "avoid",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={im.src}
                        alt={im.caption}
                        style={{ width: "100%", height: "auto", display: "block" }}
                      />
                      {/* Fingerprint badge */}
                      <span style={{ position: "absolute", top: 6, right: 6, width: 20, height: 20, borderRadius: 6, background: "rgba(15,17,18,0.65)", border: "1px solid var(--pp-amber-bd)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--pp-amber)" }}>
                        <Fingerprint size={10} />
                      </span>
                      {/* Handle overlay */}
                      <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px 6px 5px", background: "linear-gradient(180deg,transparent,rgba(0,0,0,0.75))" }}>
                        <span style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#fff", fontFamily: "var(--font-display)" }}>{im.handle}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 14, fontSize: 12, color: "var(--pp-fg4)" }}>
                  <ShieldCheck size={14} style={{ color: "var(--pp-amber)" }} />
                  All content protected with invisible watermarks
                </div>
              </div>
            )}

            {/* STEAL */}
            {screen === "steal" && (
              <div style={{ padding: "20px 18px 28px" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(22px,3vw,30px)", margin: "0 0 6px" }}>Target acquired</h2>
                <p style={{ fontSize: 14, color: "var(--pp-fg3)", margin: "0 0 18px", lineHeight: 1.45 }}>You&apos;re about to lift this post. It&apos;s watermarked — your job is to disguise it.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                  <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", border: "1px solid var(--pp-bd)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.src} alt={image.caption} style={{ width: "100%", height: "auto", maxHeight: "50vh", objectFit: "contain", display: "block", background: "var(--pp-bg)" }} />
                    <span style={{ position: "absolute", top: 11, left: 11, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--pp-purple-text)", background: "rgba(15,17,18,0.78)", border: "1px solid var(--pp-purple-bd)", padding: "4px 10px", borderRadius: 99 }}><Hand size={12} />Stealing from {image.handle}</span>
                    <span style={{ position: "absolute", top: 11, right: 11, width: 28, height: 28, borderRadius: 9, background: "rgba(15,17,18,0.7)", border: "1px solid var(--pp-amber-bd)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--pp-amber)" }}><Fingerprint size={15} /></span>
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 18 }}>
                      <span style={{ width: 44, height: 44, borderRadius: "50%", flex: "0 0 auto", background: `url(${image.src}) center/cover`, border: "1px solid var(--pp-bd)" }} />
                      <div><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>{image.name}</div><div style={{ fontSize: 12.5, color: "var(--pp-fg3)" }}>{image.caption} &middot; posted 3h ago</div></div>
                    </div>
                    <button onClick={() => go("disguise")} className="btn-purple" style={{ width: "100%", padding: 14, fontSize: 15 }}>Choose a disguise<ArrowRight size={17} /></button>
                  </div>
                </div>
              </div>
            )}

            {/* DISGUISE — with live preview */}
            {screen === "disguise" && (
              <div style={{ padding: "20px 18px 28px" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(22px,3vw,30px)", margin: "0 0 6px" }}>Disguise the evidence</h2>
                <p style={{ fontSize: 14, color: "var(--pp-fg3)", margin: "0 0 18px", lineHeight: 1.45 }}>Apply a real manipulation. Can Verda still find the watermark?</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                  {/* Side-by-side: Original vs Live preview */}
                  {/* Labels row — fixed height so images always align */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 6 }}>
                    <div style={{ fontSize: 11, color: "var(--pp-fg4)", textAlign: "center", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 5, minHeight: 32 }}>
                      <Fingerprint size={11} style={{ color: "var(--pp-amber)" }} />
                      Original
                    </div>
                    <div style={{ fontSize: 11, color: "var(--pp-fg4)", textAlign: "center", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 5, minHeight: 32 }}>
                      <span style={{ color: "var(--pp-purple-text)" }}>{manipLabels}</span>
                    </div>
                  </div>
                  {/* Images row — always aligned */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid var(--pp-amber-bd)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.src} alt="Original" style={{ width: "100%", height: "auto", display: "block" }} />
                      <span style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: 8, background: "rgba(15,17,18,0.7)", border: "1px solid var(--pp-amber-bd)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--pp-amber)" }}><Fingerprint size={13} /></span>
                    </div>
                    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid var(--pp-purple-bd)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl || image.src} alt="Manipulated preview" style={{ width: "100%", height: "auto", display: "block" }} />
                      <span style={{ position: "absolute", top: 8, left: 8, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--pp-purple-text)", background: "rgba(15,17,18,0.78)", border: "1px solid var(--pp-purple-bd)", padding: "3px 8px", borderRadius: 99 }}>
                        Live preview
                      </span>
                    </div>
                  </div>
                  <div>
                    {/* 3×3 toggle grid — no intensity, just on/off */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--pp-fg3)" }}>Manipulations</span>
                      <span style={{ fontSize: 11, color: "var(--pp-fg4)" }}>{manips.length}/3</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
                      {MANIPULATIONS.map((m) => {
                        const active = manips.includes(m.key);
                        const Icon = ICON_MAP[m.icon] || SlidersHorizontal;
                        const atMax = manips.length >= 3 && !active;
                        return (
                          <div key={m.key} onClick={() => !atMax && toggleManip(m.key)} style={{ borderRadius: 10, padding: "10px 8px", border: active ? "1px solid var(--pp-purple-bd)" : "1px solid var(--pp-bd)", background: active ? "var(--pp-purple-soft)" : "var(--pp-card2)", opacity: atMax ? 0.35 : 1, cursor: atMax ? "not-allowed" : "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, textAlign: "center" }}>
                            <Icon size={16} style={{ color: active ? "var(--pp-purple-text)" : "var(--pp-fg3)" }} />
                            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10, color: active ? "var(--pp-purple-text)" : "var(--pp-fg2)", lineHeight: 1.2 }}>{m.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={handleSteal} disabled={!manipBlob} className="btn-purple" style={{ width: "100%", padding: 14, fontSize: 15, opacity: manipBlob ? 1 : 0.5 }}>
                      <Upload size={17} />
                      Post stolen content
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SCAN — pixel grid sweep matching the app's VerifyScanOverlay */}
            {screen === "scan" && (
              <div style={{ padding: "40px 22px", minHeight: 340, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
                <div
                  style={{
                    position: "relative",
                    width: 260,
                    borderRadius: 18,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.055)",
                    backgroundColor: "#0d0d11",
                    boxShadow: "0 0 60px rgba(255,166,43,0.15)",
                  }}
                >
                  {/* Dimmed image underneath */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl || image.src}
                    alt="Scanning"
                    style={{ width: "100%", height: "auto", display: "block", opacity: 0.55 }}
                  />
                  {/* Pixel grid scan overlay (same shader as app) */}
                  <ScanOverlay width={260} height={390} />
                  {/* Corner brackets */}
                  {[
                    { top: 18, left: 18, borderTop: "1.5px solid rgba(255,166,43,0.5)", borderLeft: "1.5px solid rgba(255,166,43,0.5)" },
                    { top: 18, right: 18, borderTop: "1.5px solid rgba(255,166,43,0.5)", borderRight: "1.5px solid rgba(255,166,43,0.5)" },
                    { bottom: 18, left: 18, borderBottom: "1.5px solid rgba(255,166,43,0.5)", borderLeft: "1.5px solid rgba(255,166,43,0.5)" },
                    { bottom: 18, right: 18, borderBottom: "1.5px solid rgba(255,166,43,0.5)", borderRight: "1.5px solid rgba(255,166,43,0.5)" },
                  ].map((pos, i) => (
                    <div key={i} style={{ position: "absolute", width: 20, height: 20, zIndex: 3, ...pos }} />
                  ))}
                </div>
                {/* Text + dots below */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, letterSpacing: "-0.01em" }}>
                    Checking authenticity
                  </div>
                  <div style={{ fontSize: 13, color: "var(--pp-fg4)", marginTop: 6, maxWidth: 320, lineHeight: 1.5 }}>
                    We&apos;re verifying your content through Verda&apos;s watermarking system. This may take a few seconds.
                  </div>
                  {/* Pulsing dots */}
                  <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 14 }}>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: "var(--pp-amber)",
                          animation: `pp-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RESULT */}
            {screen === "result" && decodeResult && (() => {
              const scanning = decodeResult.match === null;
              const caught = decodeResult.match === true;
              return (
              <div style={{ padding: "20px 18px 28px" }}>
                {/* Scanning state — prominent visual */}
                {scanning && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", border: "2px solid var(--pp-amber-bd)", boxShadow: "0 0 40px rgba(255,166,43,0.15)", marginBottom: 16 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl || image.src} alt="Scanning" style={{ width: "100%", height: "auto", display: "block", opacity: 0.5, maxHeight: "40vh", objectFit: "contain", background: "#0d0d11" }} />
                      <ScanOverlay width={400} height={500} />
                      {/* Corner brackets */}
                      {[
                        { top: 14, left: 14, borderTop: "2px solid rgba(255,166,43,0.6)", borderLeft: "2px solid rgba(255,166,43,0.6)" },
                        { top: 14, right: 14, borderTop: "2px solid rgba(255,166,43,0.6)", borderRight: "2px solid rgba(255,166,43,0.6)" },
                        { bottom: 14, left: 14, borderBottom: "2px solid rgba(255,166,43,0.6)", borderLeft: "2px solid rgba(255,166,43,0.6)" },
                        { bottom: 14, right: 14, borderBottom: "2px solid rgba(255,166,43,0.6)", borderRight: "2px solid rgba(255,166,43,0.6)" },
                      ].map((pos, i) => (
                        <div key={i} style={{ position: "absolute", width: 22, height: 22, zIndex: 3, ...pos }} />
                      ))}
                      {/* Center fingerprint */}
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 56, height: 56, borderRadius: "50%", background: "rgba(15,17,18,0.65)", border: "1px solid var(--pp-amber-bd)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4 }}>
                        <Fingerprint size={28} style={{ color: "var(--pp-amber)", animation: "pp-pulse 1.4s ease-in-out infinite" }} />
                      </div>
                      {/* Stolen from badge */}
                      <span style={{ position: "absolute", bottom: 12, left: 12, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "var(--pp-purple-text)", background: "rgba(15,17,18,0.8)", border: "1px solid var(--pp-purple-bd)", padding: "4px 10px", borderRadius: 99, zIndex: 4 }}>
                        {manipLabels} applied
                      </span>
                    </div>
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Verda is scanning...</div>
                      <div style={{ fontSize: 13, color: "var(--pp-fg3)", marginBottom: 12 }}>Running live decode on your manipulated image</div>
                      <div style={{ width: 200, height: 5, borderRadius: 99, background: "var(--pp-card2)", border: "1px solid var(--pp-bd)", overflow: "hidden", margin: "0 auto" }}>
                        <div style={{ height: "100%", background: "linear-gradient(90deg,var(--pp-amber),var(--pp-amber-hover))", animation: "pp-prog 8s ease-out forwards" }} />
                      </div>
                    </div>
                    {/* What's happening explainer */}
                    <div style={{ borderRadius: 14, border: "1px solid var(--pp-bd)", background: "var(--pp-card2)", padding: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--pp-fg2)", marginBottom: 10, fontFamily: "var(--font-display)" }}>What&apos;s happening right now</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[
                          { step: "1", text: "Your manipulated image was uploaded to Verda\u2019s cloud API", done: true },
                          { step: "2", text: "The decode engine is scanning every pixel for the invisible watermark pattern", done: false },
                          { step: "3", text: "If found, Verda traces it back to the original creator and post", done: false },
                        ].map((s) => (
                          <div key={s.step} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <span style={{ width: 20, height: 20, borderRadius: 6, background: s.done ? "var(--pp-amber-soft)" : "var(--pp-card)", border: `1px solid ${s.done ? "var(--pp-amber-bd)" : "var(--pp-bd)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: s.done ? "var(--pp-amber-text)" : "var(--pp-fg4)", flex: "0 0 auto" }}>{s.done ? "\u2713" : s.step}</span>
                            <span style={{ fontSize: 12, color: "var(--pp-fg3)", lineHeight: 1.4 }}>{s.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Completed result */}
                {!scanning && (
                  <>
                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: caught ? "var(--pp-amber-soft)" : "rgba(248,113,113,0.15)", border: `1px solid ${caught ? "var(--pp-amber-bd)" : "rgba(248,113,113,0.3)"}`, color: caught ? "var(--pp-amber-text)" : "var(--pp-red)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", marginBottom: 14 }}>
                        <ShieldCheck size={16} />
                        {caught ? "CAUGHT" : "EVADED"}
                      </div>
                      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(23px,3.2vw,32px)", margin: "0 0 6px" }}>
                        {caught ? "Watermark detected" : "No watermark found"}
                      </h2>
                      <p style={{ fontSize: 14, color: "var(--pp-fg3)", margin: 0, lineHeight: 1.45 }}>
                        {caught
                          ? <>Even after <strong style={{ color: "var(--pp-text)" }}>{manipLabels}</strong>, Verda found the mark.</>
                          : "This manipulation was aggressive enough to destroy the watermark."
                        }
                      </p>
                    </div>
                  </>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                  {/* Comparison — only show when done */}
                  {!scanning && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 6 }}>
                        <div style={{ fontSize: 11, color: "var(--pp-fg4)", textAlign: "center", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 5, minHeight: 32 }}>
                          <Fingerprint size={11} style={{ color: "var(--pp-amber)" }} />
                          Original
                        </div>
                        <div style={{ fontSize: 11, color: "var(--pp-fg4)", textAlign: "center", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 5, minHeight: 32 }}>
                          Stolen + <span style={{ color: "var(--pp-purple-text)" }}>{manipLabels}</span>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={{ position: "relative", borderRadius: 13, overflow: "hidden", border: "1px solid var(--pp-bd)" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image.src} alt="Original" style={{ width: "100%", height: "auto", display: "block" }} />
                          <span style={{ position: "absolute", top: 7, right: 7, width: 22, height: 22, borderRadius: 7, background: "rgba(15,17,18,0.7)", border: "1px solid var(--pp-amber-bd)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--pp-amber)" }}><Fingerprint size={12} /></span>
                        </div>
                        <div style={{ position: "relative", borderRadius: 13, overflow: "hidden", border: "1px solid var(--pp-purple-bd)" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={previewUrl || image.src} alt="Manipulated" style={{ width: "100%", height: "auto", display: "block" }} />
                          <span style={{ position: "absolute", top: 7, right: 7, fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--pp-purple-text)", background: "rgba(15,17,18,0.78)", border: "1px solid var(--pp-purple-bd)", padding: "2px 7px", borderRadius: 99 }}>{manipLabels}</span>
                        </div>
                      </div>
                    </>
                  )}
                  {!scanning && (
                  <div>
                    {/* Trace result card */}
                    <div style={{ borderRadius: 18, border: "1px solid var(--pp-bd)", background: "var(--pp-card2)", padding: 18, marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, marginBottom: 14 }}>
                        <Fingerprint size={15} style={{ color: "var(--pp-amber)" }} />
                        Trace result — live from Verda API
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--pp-fg4)", marginBottom: 3 }}>Result</div>
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: caught ? "var(--pp-green)" : "var(--pp-red)", lineHeight: 1 }}>
                            {caught ? "Match" : "No match"}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--pp-fg4)", marginBottom: 3 }}>Traced to</div>
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>{caught ? image.handle : "\u2014"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--pp-fg4)", marginBottom: 3 }}>Manipulation</div>
                          <div style={{ fontSize: 14 }}>{manipLabels}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--pp-fg4)", marginBottom: 3 }}>Watermark</div>
                          <div style={{ fontSize: 14, color: caught ? "var(--pp-green)" : "var(--pp-red)" }}>
                            {caught ? "Survived" : "Destroyed"}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* What happened explainer */}
                    <div style={{ borderRadius: 14, border: "1px solid var(--pp-bd)", background: "var(--pp-card)", padding: 16, marginBottom: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--pp-fg2)", marginBottom: 10, fontFamily: "var(--font-display)" }}>What just happened</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[
                          { text: `You applied ${manipLabels} to disguise the stolen image`, color: "var(--pp-purple-text)" },
                          { text: "The manipulated file was sent to Verda\u2019s decode API", color: "var(--pp-amber-text)" },
                          { text: "Verda scanned every pixel for the invisible watermark pattern", color: "var(--pp-amber-text)" },
                          { text: caught
                            ? `The watermark survived \u2014 traced back to ${image.handle}`
                            : "The watermark was destroyed by the manipulation", color: caught ? "var(--pp-green)" : "var(--pp-red)" },
                        ].map((s, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <span style={{ width: 20, height: 20, borderRadius: 6, background: "var(--pp-card2)", border: "1px solid var(--pp-bd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: s.color, flex: "0 0 auto" }}>{i + 1}</span>
                            <span style={{ fontSize: 12, color: "var(--pp-fg3)", lineHeight: 1.4 }}>{s.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "13px 15px", borderRadius: 14, background: "var(--pp-amber-soft)", border: "1px solid var(--pp-amber-bd)", marginBottom: 16 }}>
                      <Sparkles size={17} style={{ color: "var(--pp-amber)", flex: "0 0 auto", marginTop: 1 }} />
                      <span style={{ fontSize: 13, color: "var(--pp-fg2)", lineHeight: 1.45 }}>
                        {caught
                          ? "Verda\u2019s invisible watermarks are embedded across the entire image \u2014 not just a visible logo. They survive cropping, filtering, screenshotting, and more."
                          : "Some extreme manipulations can destroy the watermark \u2014 but they also degrade the content so much it loses its value."}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <button onClick={reset} className="btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }}><RotateCcw size={16} />Try another image</button>
                      <button onClick={onBack} className="btn-outline" style={{ width: "100%", padding: 14, fontSize: 15 }}><Users size={16} />Back to home</button>
                    </div>
                  </div>
                  )}
                </div>
              </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
