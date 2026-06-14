"use client";

import {
  Play,
  ScanSearch,
  Users,
  Fingerprint,
  Shield,
  ShieldCheck,
  Skull,
  Check,
  Plus,
  Minus,
  SlidersHorizontal,
  Camera,
  Crop,
  Sparkles,
  LogIn,
  Split,
  Swords,
  Flag,
  Trophy,
  ArrowRight,
  RefreshCw,
  Image,
  AlertTriangle,
  Heart,
  MessageCircle,
  Send,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface LandingPageProps {
  onDemo: () => void;
  onPlay: () => void;
}

const FEED_ITEMS = [
  { handle: "@sarahchen", kind: "coast" },
  { handle: "@marcusrivera", kind: "street" },
  { handle: "@aishapatel", kind: "studio" },
  { handle: "@jamesokafor", kind: "dusk" },
  { handle: "@lena.wilde", kind: "portrait" },
  { handle: "@kofi.builds", kind: "city" },
  { handle: "@rin_makes", kind: "travel" },
  { handle: "@dao.studio", kind: "street" },
];

const PROOFS = [
  {
    icon: SlidersHorizontal,
    label: "Filtered",
    tag: "filter \u00b7 heavy grade",
    conf: "94%",
    desc: "Color graded, sharpened and re-toned",
  },
  {
    icon: Camera,
    label: "Screenshot",
    tag: "screenshot \u00b7 re-captured",
    conf: "90%",
    desc: "Photographed straight off a screen",
  },
  {
    icon: Crop,
    label: "Cropped",
    tag: "crop \u00b7 ~10% max",
    conf: "88%",
    desc: "Only a slim trim is possible before the frame breaks",
  },
];

const STEPS = [
  { icon: LogIn, num: "01", title: "Join instantly", desc: "Tap Quick Play — no room codes needed" },
  { icon: Split, num: "02", title: "Pick your side", desc: "Protector or Pirate \u2014 15 seconds" },
  { icon: Swords, num: "03", title: "Steal & trace", desc: "Pirates disguise, Protectors hunt \u2014 5 rounds" },
  { icon: Flag, num: "04", title: "End screen", desc: "Team winner, your stats & a shareable card" },
  { icon: Trophy, num: "05", title: "Climb the board", desc: "Points roll into the weekly leaderboard" },
];

const LEADERBOARD = [
  { rank: 1, name: "@nova_grabs", side: "pirate" as const, traces: 18, score: 2480 },
  { rank: 2, name: "@sarahchen", side: "protector" as const, traces: 41, score: 2110 },
  { rank: 3, name: "@kofi.builds", side: "protector" as const, traces: 37, score: 1905 },
  { rank: 4, name: "@rin_makes", side: "pirate" as const, traces: 12, score: 1740 },
  { rank: 5, name: "@aishapatel", side: "protector" as const, traces: 33, score: 1620 },
  { rank: 6, name: "@dao.studio", side: "pirate" as const, traces: 9, score: 1485 },
];

const MEDAL_COLORS = ["#FFD66B", "#D7DCE0", "#E0A878"];

export function LandingPage({ onDemo, onPlay }: LandingPageProps) {
  return (
    <div style={{ background: "var(--pp-bg)", color: "var(--pp-text)", minHeight: "100vh" }}>
      {/* NAV */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          background: "var(--pp-nav)",
          borderBottom: "1px solid var(--pp-bd)",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "13px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <Logo width={82} height={15} />
            <span style={{ width: 1, height: 18, background: "var(--pp-bd2)" }} />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: "-0.01em",
                color: "var(--pp-fg2)",
                whiteSpace: "nowrap",
              }}
            >
              Protect or Pirate
            </span>
          </div>
          <button onClick={onPlay} className="btn-primary" style={{ padding: "9px 20px", fontSize: 14 }}>
            <Play size={15} />
            Play
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            width: 720,
            height: 560,
            right: -180,
            top: -200,
            filter: "blur(90px)",
            opacity: 0.9,
            background: "radial-gradient(ellipse at 60% 40%, var(--pp-glow) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 440,
            left: -160,
            top: 120,
            filter: "blur(100px)",
            opacity: 0.7,
            background: "radial-gradient(ellipse at 50% 50%, var(--pp-glow2) 0%, transparent 72%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            maxWidth: 1180,
            margin: "0 auto",
            padding: "clamp(32px,6vw,84px) 24px clamp(32px,4vw,56px)",
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(28px,5vw,64px)",
            alignItems: "center",
          }}
        >
          {/* Hero copy */}
          <div style={{ flex: "1 1 420px", minWidth: 240 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 13px",
                borderRadius: 999,
                background: "var(--pp-amber-soft)",
                border: "1px solid var(--pp-amber-bd)",
                color: "var(--pp-amber-text)",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 22,
              }}
            >
              <Fingerprint size={14} />
              The invisible-watermark game
            </div>
            <h1
              className="gradient-text"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(33px,6vw,64px)",
                lineHeight: 0.98,
                letterSpacing: "-0.03em",
                margin: "0 0 20px",
              }}
            >
              Steal the photo.
              <br />
              Verda still finds it.
            </h1>
            <p
              style={{
                fontSize: "clamp(15px,1.7vw,19px)",
                lineHeight: 1.5,
                color: "var(--pp-fg3)",
                maxWidth: 460,
                margin: "0 0 30px",
              }}
            >
              Play Protector or Pirate in a live social feed. Disguise content or trace it — and watch
              invisible watermarks survive every crop, filter and screenshot.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 26 }}>
              <button
                onClick={onDemo}
                className="btn-primary"
                style={{
                  padding: "14px 26px",
                  fontSize: 16,
                  boxShadow: "0 8px 30px -8px var(--pp-glow)",
                }}
              >
                <ScanSearch size={18} />
                Try the 30-sec demo
              </button>
              <button onClick={onPlay} className="btn-outline" style={{ padding: "14px 26px", fontSize: 16 }}>
                <Users size={18} />
                Quick Play
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {[
                  "linear-gradient(135deg,#FFA62B,#E59422)",
                  "linear-gradient(135deg,#C084FC,#9d5be0)",
                  "linear-gradient(135deg,#5a5f62,#34383a)",
                ].map((bg, i) => (
                  <span
                    key={i}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      border: "2px solid var(--pp-bg)",
                      background: bg,
                      marginLeft: i > 0 ? -10 : 0,
                    }}
                  />
                ))}
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: "2px solid var(--pp-bg)",
                    background: "var(--pp-card2)",
                    marginLeft: -10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--pp-fg2)",
                  }}
                >
                  +9
                </span>
              </div>
              <span style={{ fontSize: 13, color: "var(--pp-fg4)", lineHeight: 1.4 }}>
                Powered by{" "}
                <span style={{ color: "var(--pp-amber-text)", fontWeight: 600 }}>Verda watermarking</span>
                <br />
                survives crop &middot; filter &middot; resize &middot; screenshot
              </span>
            </div>
          </div>

          {/* Phone mock */}
          <div style={{ flex: "1 1 300px", minWidth: 250, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: 300,
                maxWidth: "100%",
                borderRadius: 42,
                border: "1px solid #34383a",
                background: "#0f1112",
                padding: 11,
                boxShadow: "0 40px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset",
                position: "relative",
              }}
            >
              {/* Notch */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 96,
                  height: 6,
                  borderRadius: 99,
                  background: "#26292b",
                  zIndex: 3,
                }}
              />
              <div style={{ borderRadius: 32, overflow: "hidden", background: "#17191A" }}>
                {/* Feed header */}
                <div
                  style={{
                    padding: "30px 16px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>Feed</span>
                  <span
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#FFA62B" }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#FFA62B",
                        display: "inline-block",
                        animation: "pp-pulse 2s ease-in-out infinite",
                      }}
                    />
                    live
                  </span>
                </div>
                {/* Feed post */}
                <div style={{ padding: "13px 14px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#C084FC,#7c3aed)",
                        flex: "0 0 auto",
                      }}
                    />
                    <div style={{ lineHeight: 1.15 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>
                        @nova_grabs
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>reposted &middot; 2m ago</div>
                    </div>
                    <span
                      style={{
                        marginLeft: "auto",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#C084FC",
                        background: "rgba(192,132,252,0.14)",
                        border: "1px solid rgba(192,132,252,0.3)",
                        padding: "3px 8px",
                        borderRadius: 99,
                      }}
                    >
                      <AlertTriangle size={11} />
                      flagged
                    </span>
                  </div>
                  {/* Image placeholder with scan */}
                  <div
                    style={{
                      position: "relative",
                      borderRadius: 14,
                      overflow: "hidden",
                      height: 200,
                      background: "url(/content/images/demo-01.jpg) center/cover",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        height: 60,
                        background:
                          "linear-gradient(180deg,transparent,rgba(255,166,43,0.55),transparent)",
                        boxShadow: "0 0 30px rgba(255,166,43,0.4)",
                        animation: "pp-scan 2.4s ease-in-out infinite",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 10,
                        bottom: 10,
                        right: 10,
                        background: "rgba(15,17,18,0.92)",
                        backdropFilter: "blur(6px)",
                        border: "1px solid rgba(255,166,43,0.4)",
                        borderRadius: 12,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                        <ShieldCheck size={15} style={{ color: "#FFA62B" }} />
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#FFA62B",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          Watermark traced
                        </span>
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#FFA62B",
                            fontFamily: "ui-monospace, monospace",
                          }}
                        >
                          97.2%
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                        Original by <span style={{ color: "#FCFDFD", fontWeight: 600 }}>@sarahchen</span> &middot;
                        posted 3h ago
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "11px 2px 4px",
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    <Heart size={18} />
                    <MessageCircle size={18} />
                    <Send size={18} />
                    <span
                      style={{
                        marginLeft: "auto",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#FFA62B",
                        background: "rgba(255,166,43,0.14)",
                        border: "1px solid rgba(255,166,43,0.32)",
                        padding: "5px 12px",
                        borderRadius: 99,
                      }}
                    >
                      <ScanSearch size={13} />
                      Trace
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feed marquee */}
        <div style={{ position: "relative", padding: "8px 0 clamp(36px,5vw,64px)" }}>
          <div
            style={{
              maxWidth: 1180,
              margin: "0 auto",
              padding: "0 24px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Image size={15} style={{ color: "var(--pp-fg4)" }} />
            <span
              style={{
                fontSize: 13,
                color: "var(--pp-fg4)",
                fontFamily: "ui-monospace, monospace",
                letterSpacing: "0.02em",
              }}
            >
              the feed everyone&apos;s fighting over — every post watermarked
            </span>
          </div>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              WebkitMask: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
              mask: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 14,
                width: "max-content",
                animation: "pp-marquee 38s linear infinite",
                padding: "0 7px",
              }}
            >
              {[...FEED_ITEMS, ...FEED_ITEMS, ...FEED_ITEMS, ...FEED_ITEMS].map((f, i) => (
                <div
                  key={i}
                  style={{
                    flex: "0 0 158px",
                    height: 106,
                    borderRadius: 13,
                    border: "1px solid var(--pp-bd)",
                    position: "relative",
                    overflow: "hidden",
                    background: `url(/content/images/demo-${String((i % 10) + 1).padStart(2, "0")}.jpg) center/cover`,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 9,
                      bottom: 8,
                      fontSize: 11,
                      color: "var(--pp-mono)",
                      fontFamily: "ui-monospace, monospace",
                      textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    {f.handle}
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      top: 7,
                      right: 7,
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: "var(--pp-amber-soft)",
                      border: "1px solid var(--pp-amber-bd)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--pp-amber)",
                    }}
                  >
                    <Fingerprint size={11} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROOF: SURVIVES MANIPULATION */}
      <section
        style={{
          background: "var(--pp-bg2)",
          borderTop: "1px solid var(--pp-bd)",
          borderBottom: "1px solid var(--pp-bd)",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(46px,7vw,88px) 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 40px" }}>
            <div className="section-eyebrow">The whole point</div>
            <h2
              style={{
                fontSize: "clamp(26px,4.4vw,44px)",
                lineHeight: 1.04,
                margin: "0 0 14px",
              }}
            >
              The watermark survives manipulation
            </h2>
            <p style={{ fontSize: "clamp(15px,1.7vw,18px)", lineHeight: 1.5, color: "var(--pp-fg3)", margin: 0 }}>
              Filter it, screenshot it, resize it — Verda still reads the invisible mark and traces the file back
              to its creator.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 16,
            }}
          >
            {PROOFS.map((p) => (
              <div
                key={p.label}
                style={{
                  borderRadius: 18,
                  border: "1px solid var(--pp-bd)",
                  background: "var(--pp-card)",
                  padding: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 11,
                      background: "var(--pp-card2)",
                      border: "1px solid var(--pp-bd)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--pp-fg2)",
                    }}
                  >
                    <p.icon size={19} />
                  </span>
                  <span className="badge-protector" style={{ gap: 5, fontSize: 12, fontWeight: 700, padding: "5px 11px" }}>
                    <ShieldCheck size={12} />
                    Still traced
                  </span>
                </div>
                <div
                  style={{
                    position: "relative",
                    borderRadius: 12,
                    overflow: "hidden",
                    height: 120,
                    background: `url(/content/images/demo-${String(PROOFS.indexOf(p) + 2).padStart(2, "0")}.jpg) center/cover`,
                    marginBottom: 15,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      height: 34,
                      background: "linear-gradient(180deg,transparent,var(--pp-glow),transparent)",
                      animation: "pp-scan 2.8s ease-in-out infinite",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      left: 10,
                      bottom: 9,
                      fontSize: 10,
                      color: "var(--pp-mono)",
                      fontFamily: "ui-monospace, monospace",
                      textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    {p.tag}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
                    {p.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "var(--pp-amber-text)",
                    }}
                  >
                    {p.conf}
                  </span>
                </div>
                <div
                  style={{
                    height: 7,
                    borderRadius: 99,
                    background: "var(--pp-bg2)",
                    border: "1px solid var(--pp-bd)",
                    overflow: "hidden",
                    marginBottom: 9,
                  }}
                >
                  <div
                    style={{
                      width: p.conf,
                      height: "100%",
                      background: "linear-gradient(90deg,var(--pp-amber),var(--pp-amber-hover))",
                    }}
                  />
                </div>
                <div style={{ fontSize: 13, color: "var(--pp-fg3)" }}>{p.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 26, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 11,
                padding: "13px 22px",
                borderRadius: 999,
                background: "var(--pp-amber-soft)",
                border: "1px solid var(--pp-amber-bd)",
                maxWidth: 700,
              }}
            >
              <Sparkles size={18} style={{ color: "var(--pp-amber)", flex: "0 0 auto" }} />
              <span style={{ fontSize: 14, color: "var(--pp-fg2)", lineHeight: 1.4 }}>
                Cropping only buys a thief about 10% before the frame breaks — everything else, the watermark
                shrugs off.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(46px,7vw,88px) 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 40px" }}>
          <div className="section-eyebrow" style={{ color: "var(--pp-fg4)" }}>Choose your side</div>
          <h2 style={{ fontSize: "clamp(26px,4.4vw,44px)", lineHeight: 1.04, margin: 0 }}>Two ways to play</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20 }}>
          {/* Protector card */}
          <div
            style={{
              position: "relative",
              borderRadius: 22,
              border: "1px solid var(--pp-amber-bd)",
              background: "var(--pp-card)",
              padding: "clamp(22px,3vw,32px)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 320,
                height: 260,
                right: -120,
                top: -120,
                filter: "blur(70px)",
                opacity: 0.5,
                background: "radial-gradient(circle,var(--pp-glow) 0%,transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
                <span
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "var(--pp-amber-soft)",
                    border: "1px solid var(--pp-amber-bd)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--pp-amber)",
                  }}
                >
                  <Shield size={24} />
                </span>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--pp-amber-text)" }}>
                    Protector
                  </div>
                  <div style={{ fontSize: 13, color: "var(--pp-fg3)" }}>Defend creators &middot; catch the thieves</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 20 }}>
                {[
                  "Your work is invisibly watermarked by Verda",
                  "Watch the feed for suspicious reposts of your content",
                  <>
                    <strong style={{ color: "var(--pp-text)" }}>Trace</strong> a thief — detection runs and confirms
                    the match
                  </>,
                ].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Check size={17} style={{ color: "var(--pp-amber)", flex: "0 0 auto", marginTop: 1 }} />
                    <span style={{ fontSize: 14, color: "var(--pp-fg2)", lineHeight: 1.45 }}>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
                <span className="badge-protector" style={{ gap: 6, fontSize: 13, fontWeight: 700, padding: "5px 12px" }}>
                  <Plus size={13} />
                  30 correct trace
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--pp-fg3)",
                    background: "var(--pp-card2)",
                    border: "1px solid var(--pp-bd)",
                    padding: "5px 12px",
                    borderRadius: 99,
                  }}
                >
                  <Minus size={13} />
                  10 false accusation
                </span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { title: "Creator", desc: "Protect your own original work" },
                  { title: "Journalist", desc: "Verify sources & trace leaks" },
                ].map((s) => (
                  <div
                    key={s.title}
                    style={{
                      flex: 1,
                      borderRadius: 13,
                      border: "1px solid var(--pp-bd)",
                      background: "var(--pp-card2)",
                      padding: 13,
                    }}
                  >
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--pp-fg3)", lineHeight: 1.35 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pirate card */}
          <div
            style={{
              position: "relative",
              borderRadius: 22,
              border: "1px solid var(--pp-purple-bd)",
              background: "var(--pp-card)",
              padding: "clamp(22px,3vw,32px)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 320,
                height: 260,
                right: -120,
                top: -120,
                filter: "blur(70px)",
                opacity: 0.5,
                background: "radial-gradient(circle,var(--pp-glow2) 0%,transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
                <span
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "var(--pp-purple-soft)",
                    border: "1px solid var(--pp-purple-bd)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--pp-purple)",
                  }}
                >
                  <Skull size={24} />
                </span>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--pp-purple-text)" }}>
                    Pirate
                  </div>
                  <div style={{ fontSize: 13, color: "var(--pp-fg3)" }}>Steal content &middot; disguise &middot; evade</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 20 }}>
                {[
                  "Browse the feed and pick content to steal",
                  "Disguise it: filter, screenshot, resize, convert",
                  <>
                    Pick an intensity — heavier edits = more points <em style={{ color: "var(--pp-fg3)" }}>if you evade</em>
                  </>,
                ].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Check size={17} style={{ color: "var(--pp-purple)", flex: "0 0 auto", marginTop: 1 }} />
                    <span style={{ fontSize: 14, color: "var(--pp-fg2)", lineHeight: 1.45 }}>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
                {["Light \u00d71", "Medium \u00d71.5", "Heavy \u00d72.5"].map((label) => (
                  <span key={label} className="badge-pirate" style={{ fontSize: 12, fontWeight: 700, padding: "5px 11px" }}>
                    {label}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { title: "Reposter", desc: "Quick grabs, low risk" },
                  { title: "Stealer", desc: "Heavy edits, high reward" },
                ].map((s) => (
                  <div
                    key={s.title}
                    style={{
                      flex: 1,
                      borderRadius: 13,
                      border: "1px solid var(--pp-bd)",
                      background: "var(--pp-card2)",
                      padding: 13,
                    }}
                  >
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--pp-fg3)", lineHeight: 1.35 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW A MATCH RUNS */}
      <section
        style={{
          background: "var(--pp-bg2)",
          borderTop: "1px solid var(--pp-bd)",
          borderBottom: "1px solid var(--pp-bd)",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(46px,7vw,88px) 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 40px" }}>
            <div className="section-eyebrow" style={{ color: "var(--pp-fg4)" }}>
              3–5 minutes, start to finish
            </div>
            <h2 style={{ fontSize: "clamp(26px,4.4vw,44px)", lineHeight: 1.04, margin: 0 }}>How a match runs</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
            {STEPS.map((s) => (
              <div
                key={s.num}
                style={{
                  borderRadius: 18,
                  border: "1px solid var(--pp-bd)",
                  background: "var(--pp-card)",
                  padding: "20px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 11,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 11,
                      background: "var(--pp-amber-soft)",
                      border: "1px solid var(--pp-amber-bd)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--pp-amber)",
                    }}
                  >
                    <s.icon size={19} />
                  </span>
                  <span
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--pp-fg4)",
                    }}
                  >
                    {s.num}
                  </span>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, lineHeight: 1.15 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 13, color: "var(--pp-fg3)", lineHeight: 1.4 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERBOARD */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(46px,7vw,88px) 24px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 34,
          }}
        >
          <div>
            <div className="section-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Trophy size={14} />
              This week
            </div>
            <h2 style={{ fontSize: "clamp(26px,4.4vw,44px)", lineHeight: 1.04, margin: 0 }}>Leaderboard</h2>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontSize: 13,
              color: "var(--pp-fg3)",
              background: "var(--pp-card2)",
              border: "1px solid var(--pp-bd)",
              padding: "8px 14px",
              borderRadius: 99,
            }}
          >
            <RefreshCw size={13} style={{ color: "var(--pp-amber)" }} />
            resets every Monday
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* Team standings */}
          <div style={{ borderRadius: 22, border: "1px solid var(--pp-bd)", background: "var(--pp-card)", padding: 26 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
              Teams this week
            </div>
            <div style={{ fontSize: 13, color: "var(--pp-fg3)", marginBottom: 22 }}>
              Total points across every match
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  color: "var(--pp-amber-text)",
                }}
              >
                <Shield size={16} />
                Protectors
              </span>
              <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700, color: "var(--pp-amber-text)" }}>
                12,480
              </span>
            </div>
            <div
              style={{
                height: 14,
                borderRadius: 99,
                overflow: "hidden",
                background: "var(--pp-bg2)",
                border: "1px solid var(--pp-bd)",
                display: "flex",
                marginBottom: 18,
              }}
            >
              <div style={{ width: "53%", background: "linear-gradient(90deg,#FFA62B,#E59422)" }} />
              <div style={{ width: "47%", background: "linear-gradient(90deg,#9d5be0,#C084FC)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  color: "var(--pp-purple-text)",
                }}
              >
                <Skull size={16} />
                Pirates
              </span>
              <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700, color: "var(--pp-purple-text)" }}>
                11,090
              </span>
            </div>
            <div
              style={{
                marginTop: 22,
                paddingTop: 20,
                borderTop: "1px solid var(--pp-bd)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "var(--pp-amber-soft)",
                  border: "1px solid var(--pp-amber-bd)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--pp-amber)",
                }}
              >
                <Flag size={20} />
              </span>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>
                  Protectors lead by 1,390
                </div>
                <div style={{ fontSize: 12, color: "var(--pp-fg3)" }}>defense is winning… for now</div>
              </div>
            </div>
          </div>

          {/* Player table */}
          <div style={{ borderRadius: 22, border: "1px solid var(--pp-bd)", background: "var(--pp-card)", padding: 8, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "44px 1fr auto auto",
                gap: 12,
                padding: "14px 18px 10px",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--pp-fg4)",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              <span>#</span>
              <span>Player</span>
              <span style={{ textAlign: "right" }}>Traces</span>
              <span style={{ textAlign: "right" }}>Score</span>
            </div>
            {LEADERBOARD.map((pl) => {
              const isProt = pl.side === "protector";
              const isFirst = pl.rank === 1;
              const top = pl.rank <= 3;
              return (
                <div
                  key={pl.rank}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "44px 1fr auto auto",
                    gap: 12,
                    alignItems: "center",
                    padding: "11px 18px",
                    borderRadius: 13,
                    ...(isFirst
                      ? {
                          background: "var(--pp-amber-soft)",
                          border: "1px solid var(--pp-amber-bd)",
                        }
                      : { border: "1px solid transparent" }),
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <span
                      style={
                        top
                          ? {
                              width: 26,
                              height: 26,
                              borderRadius: 8,
                              background: MEDAL_COLORS[pl.rank - 1],
                              color: "#17191A",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "var(--font-display)",
                              fontWeight: 700,
                              fontSize: 13,
                            }
                          : {
                              width: 26,
                              height: 26,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "ui-monospace, monospace",
                              fontWeight: 500,
                              fontSize: 14,
                              color: "var(--pp-fg4)",
                            }
                      }
                    >
                      {pl.rank}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        flex: "0 0 auto",
                        background: `url(/content/images/demo-${String(pl.rank).padStart(2, "0")}.jpg) center/cover`,
                        border: "1px solid var(--pp-bd)",
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 600,
                          fontSize: 14,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {pl.name}
                      </div>
                      <span className={isProt ? "badge-protector" : "badge-pirate"} style={{ marginTop: 2 }}>
                        {isProt ? <Shield size={10} /> : <Skull size={10} />}
                        {isProt ? "Protector" : "Pirate"}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      fontFamily: "ui-monospace, monospace",
                      fontSize: 13,
                      color: "var(--pp-fg3)",
                      alignSelf: "center",
                    }}
                  >
                    {pl.traces}
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      alignSelf: "center",
                      fontFamily: "ui-monospace, monospace",
                      fontWeight: 700,
                      fontSize: 15,
                      color: isFirst ? "var(--pp-amber-text)" : "var(--pp-text)",
                    }}
                  >
                    {pl.score.toLocaleString()}
                  </div>
                </div>
              );
            })}
            <div
              style={{
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                borderTop: "1px solid var(--pp-bd)",
                marginTop: 4,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--pp-fg3)" }}>
                Your best this week: <span style={{ color: "var(--pp-fg4)" }}>— not ranked yet</span>
              </span>
              <button onClick={onPlay} className="btn-primary" style={{ padding: "9px 18px", fontSize: 13 }}>
                Climb the board
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO CTA BAND */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px clamp(36px,5vw,64px)" }}>
        <div
          style={{
            position: "relative",
            borderRadius: 26,
            overflow: "hidden",
            border: "1px solid var(--pp-amber-bd)",
            background: "linear-gradient(135deg,var(--pp-bg2),var(--pp-card2))",
            padding: "clamp(26px,4vw,44px)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 520,
              height: 360,
              right: -120,
              top: -120,
              filter: "blur(90px)",
              opacity: 0.8,
              background: "radial-gradient(ellipse,var(--pp-glow) 0%,transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", maxWidth: 560, minWidth: 240 }}>
            <div className="section-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={14} />
              No signup &middot; 30 seconds
            </div>
            <h2
              style={{
                fontSize: "clamp(24px,3.6vw,38px)",
                lineHeight: 1.05,
                margin: "0 0 12px",
              }}
            >
              Not sure yet? Take the demo.
            </h2>
            <p style={{ fontSize: "clamp(15px,1.6vw,17px)", lineHeight: 1.5, color: "var(--pp-fg3)", margin: 0 }}>
              Steal one image, disguise it however you like, and watch Verda trace it straight back to the creator.
              Then jump into a real game.
            </p>
          </div>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>
            <button
              onClick={onDemo}
              className="btn-primary"
              style={{
                padding: "15px 30px",
                fontSize: 16,
                boxShadow: "0 8px 30px -8px var(--pp-glow)",
              }}
            >
              <ScanSearch size={18} />
              Start the demo
            </button>
            <button onClick={onPlay} className="btn-outline" style={{ padding: "15px 30px", fontSize: 16 }}>
              <Users size={18} />
              Quick Play
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid var(--pp-bd)",
          background: "var(--pp-bg2)",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "34px 24px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <Logo width={74} height={14} style={{ opacity: 0.9 }} />
            <span style={{ fontSize: 13, color: "var(--pp-fg4)" }}>
              Protect or Pirate — a watermarking demo by Verda
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 13, color: "var(--pp-fg3)" }}>
            <a
              href="https://verda.ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--pp-fg3)", textDecoration: "none" }}
            >
              verda.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
