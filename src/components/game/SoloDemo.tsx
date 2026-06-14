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
  type Strength = "light" | "medium" | "heavy";
  type ManipConfig = { type: ManipulationType; strength: Strength };
  const [manipConfigs, setManipConfigs] = useState<ManipConfig[]>([{ type: "remove_watermark", strength: "medium" }]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [manipBlob, setManipBlob] = useState<Blob | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodeResult, setDecodeResult] = useState<{
    match: boolean;
    watermark_ref: string;
  } | null>(null);
  const previewRef = useRef<string | null>(null);

  const stepIdx = SCREEN_ORDER.indexOf(screen);
  const image = IMAGES[picked];

  // Shuffle feed order — reshuffle on refresh
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
  const manipLabels = manipConfigs.map((c) => MANIPULATIONS.find((d) => d.key === c.type)!.label).join(" + ");
  const manips = manipConfigs.map((c) => c.type);

  const toggleManip = (key: ManipulationType) => {
    setManipConfigs((prev) => {
      if (prev.some((c) => c.type === key)) {
        const next = prev.filter((c) => c.type !== key);
        return next.length === 0 ? [{ type: key, strength: "medium" as Strength }] : next;
      }
      if (prev.length >= 3) return prev;
      return [...prev, { type: key, strength: "medium" as Strength }];
    });
  };

  const setManipStrength = (key: ManipulationType, strength: Strength) => {
    setManipConfigs((prev) => prev.map((c) => c.type === key ? { ...c, strength } : c));
  };

  // Generate live preview when manipulation configs change
  useEffect(() => {
    if (screen !== "disguise") return;
    let cancelled = false;

    (async () => {
      try {
        const img = await loadImage(image.src);
        const blob = manipConfigs.length === 1
          ? await applyManipulation(img, manipConfigs[0].type, manipConfigs[0].strength)
          : await applyMultipleManipulations(img, manipConfigs);
        if (cancelled) return;
        if (previewRef.current) URL.revokeObjectURL(previewRef.current);
        const url = URL.createObjectURL(blob);
        previewRef.current = url;
        setPreviewUrl(url);
        setManipBlob(blob);
      } catch (e) {
        console.error("Manipulation failed:", e);
      }
    })();

    return () => { cancelled = true; };
  }, [screen, manipConfigs, image.src]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const handleSteal = useCallback(async () => {
    if (!manipBlob) return;
    setScreen("scan");
    setIsDecoding(true);
    setDecodeResult(null);

    try {
      const formData = new FormData();
      formData.append("file", manipBlob, "stolen.jpg");

      const resp = await fetch("/api/decode", { method: "POST", body: formData });
      const data = await resp.json();

      setDecodeResult({
        match: data.match ?? false,
        watermark_ref: data.watermark_ref ?? "",
      });
    } catch (e) {
      console.error("Decode failed:", e);
      setDecodeResult({ match: false, watermark_ref: "" });
    } finally {
      setIsDecoding(false);
      setScreen("result");
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
    setManipConfigs([{ type: "remove_watermark", strength: "medium" }]);
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
                    {/* 2×4 grid — all manipulations visible, each with controls */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--pp-fg3)" }}>Manipulations</span>
                      <span style={{ fontSize: 11, color: "var(--pp-fg4)" }}>{manips.length}/3 selected</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
                      {MANIPULATIONS.map((m) => {
                        const active = manips.includes(m.key);
                        const cfg = manipConfigs.find((c) => c.type === m.key);
                        const Icon = ICON_MAP[m.icon] || SlidersHorizontal;
                        const atMax = manips.length >= 3 && !active;
                        const hasIntensity = !["mirror"].includes(m.key);
                        return (
                          <div
                            key={m.key}
                            onClick={() => !atMax && toggleManip(m.key)}
                            style={{
                              borderRadius: 10,
                              padding: "8px 8px 6px",
                              border: active ? "1px solid var(--pp-purple-bd)" : "1px solid var(--pp-bd)",
                              background: active ? "var(--pp-purple-soft)" : "var(--pp-card2)",
                              opacity: atMax ? 0.35 : 1,
                              transition: "all 0.15s",
                              cursor: atMax ? "not-allowed" : "pointer",
                            }}
                          >
                            {/* Header — icon + label + toggle */}
                            <div
                              style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", color: active ? "var(--pp-purple-text)" : "var(--pp-fg2)", textAlign: "left" }}
                            >
                              <Icon size={13} />
                              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10.5, flex: 1, lineHeight: 1.2 }}>{m.label}</span>
                              {m.limited && <span style={{ fontSize: 8, fontWeight: 700, color: "var(--pp-amber-text)", background: "var(--pp-amber-soft)", border: "1px solid var(--pp-amber-bd)", padding: "1px 4px", borderRadius: 99 }}>~10%</span>}
                              {/* Checkbox */}
                              <span style={{ width: 14, height: 14, borderRadius: 3, border: active ? "1px solid var(--pp-purple)" : "1px solid var(--pp-bd2)", background: active ? "var(--pp-purple)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", flexShrink: 0 }}>
                                {active && "✓"}
                              </span>
                            </div>
                            {/* Per-card intensity — only when active and has intensity */}
                            {active && hasIntensity && (
                              <div style={{ display: "flex", gap: 3, marginTop: 6 }} onClick={(e) => e.stopPropagation()}>
                                {INT_DEFS.map((it) => {
                                  const sel = cfg?.strength === it.key;
                                  return (
                                    <button key={it.key} onClick={() => setManipStrength(m.key, it.key)} style={{ flex: 1, padding: "3px 1px", borderRadius: 5, cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 9, border: sel ? "1px solid var(--pp-purple-bd)" : "1px solid transparent", background: sel ? "rgba(192,132,252,0.2)" : "transparent", color: sel ? "var(--pp-purple-text)" : "var(--pp-fg4)", textAlign: "center" }}>
                                      {m.key === "overlay_watermark" ? ["S", "M", "L"][INT_DEFS.indexOf(it)] : it.label}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
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
            {screen === "result" && decodeResult && (
              <div style={{ padding: "20px 18px 28px" }}>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: decodeResult.match ? "var(--pp-amber-soft)" : "rgba(248,113,113,0.15)", border: `1px solid ${decodeResult.match ? "var(--pp-amber-bd)" : "rgba(248,113,113,0.3)"}`, color: decodeResult.match ? "var(--pp-amber-text)" : "var(--pp-red)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", marginBottom: 14 }}>
                    <ShieldCheck size={16} />
                    {decodeResult.match ? "CAUGHT" : "EVADED"}
                  </div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(23px,3.2vw,32px)", margin: "0 0 6px" }}>
                    {decodeResult.match ? "Watermark detected" : "No watermark found"}
                  </h2>
                  <p style={{ fontSize: 14, color: "var(--pp-fg3)", margin: 0, lineHeight: 1.45 }}>
                    {decodeResult.match
                      ? <>Even after a <strong style={{ color: "var(--pp-text)" }}>{manipLabels}</strong>, Verda found the mark.</>
                      : "This manipulation was aggressive enough to destroy the watermark."
                    }
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                  {/* Comparison — labels and images in separate rows for alignment */}
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
                  <div>
                    {/* Trace result */}
                    <div style={{ borderRadius: 18, border: "1px solid var(--pp-bd)", background: "var(--pp-card2)", padding: 18, marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, marginBottom: 14 }}>
                        <Fingerprint size={15} style={{ color: "var(--pp-amber)" }} />
                        Trace result — live from Verda API
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--pp-fg4)", marginBottom: 3 }}>Result</div>
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: decodeResult.match ? "var(--pp-green)" : "var(--pp-red)", lineHeight: 1 }}>
                            {decodeResult.match ? "Match" : "No match"}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--pp-fg4)", marginBottom: 3 }}>Traced to</div>
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>{decodeResult.match ? image.handle : "\u2014"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--pp-fg4)", marginBottom: 3 }}>Manipulation</div>
                          <div style={{ fontSize: 14 }}>{manipLabels}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--pp-fg4)", marginBottom: 3 }}>Watermark</div>
                          <div style={{ fontSize: 14, color: decodeResult.match ? "var(--pp-green)" : "var(--pp-red)" }}>
                            {decodeResult.match ? "Survived" : "Destroyed"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "13px 15px", borderRadius: 14, background: "var(--pp-amber-soft)", border: "1px solid var(--pp-amber-bd)", marginBottom: 16 }}>
                      <Sparkles size={17} style={{ color: "var(--pp-amber)", flex: "0 0 auto", marginTop: 1 }} />
                      <span style={{ fontSize: 13, color: "var(--pp-fg2)", lineHeight: 1.45 }}>
                        {decodeResult.match
                          ? "Verda\u2019s watermarks survive real manipulation. The content always traces back to its creator."
                          : "Some extreme manipulations can break the watermark \u2014 but they also destroy the content quality."}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <button onClick={reset} className="btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }}><RotateCcw size={16} />Try another image</button>
                      <button onClick={onBack} className="btn-outline" style={{ width: "100%", padding: 14, fontSize: 15 }}><Users size={16} />Back to home</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
