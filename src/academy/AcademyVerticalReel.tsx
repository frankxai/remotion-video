import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import defaultVerticalReelJson from "./manifests/academy-vertical-reel.json";
import { ACADEMY_THEME } from "./theme";
import { AcademyCaptionCue, AcademyVerticalReelManifest, VerticalReelIcpCard } from "./types";

export type AcademyVerticalReelProps = {
  manifest?: AcademyVerticalReelManifest;
  showCaptions?: boolean;
};

const DEFAULT_VERTICAL_REEL_MANIFEST = defaultVerticalReelJson as AcademyVerticalReelManifest;

function cardAccent(accent: VerticalReelIcpCard["accent"]): {
  fg: string;
  bg: string;
  border: string;
} {
  switch (accent) {
    case "emerald":
      return {
        fg: ACADEMY_THEME.colors.emerald,
        bg: ACADEMY_THEME.colors.emeraldSoft,
        border: ACADEMY_THEME.colors.emeraldBorder,
      };
    case "gold":
      return {
        fg: ACADEMY_THEME.colors.softGold,
        bg: ACADEMY_THEME.colors.softGoldSoft,
        border: ACADEMY_THEME.colors.softGoldBorder,
      };
    case "violet":
      return {
        fg: ACADEMY_THEME.colors.violet,
        bg: ACADEMY_THEME.colors.violetSoft,
        border: "rgba(167, 139, 250, 0.38)",
      };
    case "ice":
    default:
      return {
        fg: ACADEMY_THEME.colors.iceBlue,
        bg: ACADEMY_THEME.colors.iceBlueSoft,
        border: ACADEMY_THEME.colors.iceBlueBorder,
      };
  }
}

const VerticalSubtitleBar: React.FC<{
  cues: AcademyCaptionCue[];
  frame: number;
  showCaptions: boolean;
}> = ({ cues, frame, showCaptions }) => {
  if (!showCaptions || cues.length === 0) {
    return null;
  }
  const activeCue = cues.find((c) => frame >= c.startFrame && frame < c.endFrame);
  if (!activeCue) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        bottom: 92,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(9, 11, 16, 0.94)",
          border: `1px solid ${ACADEMY_THEME.colors.iceBlueBorder}`,
          borderRadius: 18,
          padding: "18px 26px",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.6)",
        }}
      >
        <div
          style={{
            fontFamily: ACADEMY_THEME.fonts.mono,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: ACADEMY_THEME.colors.softGold,
            marginBottom: 6,
          }}
        >
          {activeCue.speaker.toUpperCase()}
        </div>
        <div
          style={{
            fontFamily: ACADEMY_THEME.fonts.sans,
            fontSize: 25,
            fontWeight: 600,
            lineHeight: 1.35,
            color: ACADEMY_THEME.colors.iceWhite,
          }}
        >
          {activeCue.text}
        </div>
      </div>
    </div>
  );
};

export const AcademyVerticalReel: React.FC<AcademyVerticalReelProps> = ({
  manifest = DEFAULT_VERTICAL_REEL_MANIFEST,
  showCaptions = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const beatIndex = frame < 145 ? 0 : frame < 305 ? 1 : 2;
  const beatLocalFrame = beatIndex === 0 ? frame : beatIndex === 1 ? frame - 145 : frame - 305;

  const beatSpring = spring({
    frame: beatLocalFrame,
    fps,
    config: { damping: 18, stiffness: 145, mass: 0.8 },
  });
  const beatY = interpolate(beatSpring, [0, 1], [28, 0]);
  const beatOpacity = interpolate(beatLocalFrame, [0, 12], [0.2, 1], {
    extrapolateRight: "clamp",
  });
  const gridDriftY = interpolate(frame, [0, 450], [0, 36], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: ACADEMY_THEME.colors.obsidian,
        fontFamily: ACADEMY_THEME.fonts.sans,
        color: ACADEMY_THEME.colors.iceWhite,
        overflow: "hidden",
      }}
    >
      {/* Dedicated 1080x1920 Portrait Architectural Grid */}
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="vertical-academy-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke={ACADEMY_THEME.colors.gridLine}
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="v-top-aura" cx="50%" cy="18%" r="55%">
            <stop offset="0%" stopColor="#7CAEFF" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#090B10" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="v-bottom-aura" cx="50%" cy="78%" r="52%">
            <stop
              offset="0%"
              stopColor={beatIndex === 2 ? "#D4AF37" : "#FF5C77"}
              stopOpacity="0.16"
            />
            <stop offset="100%" stopColor="#090B10" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect
          width="1080"
          height="1920"
          fill="url(#vertical-academy-grid)"
          transform={`translate(0, ${gridDriftY * 0.4})`}
        />
        <rect width="1080" height="1920" fill="url(#v-top-aura)" />
        <rect width="1080" height="1920" fill="url(#v-bottom-aura)" />
      </svg>

      {/* Top Gradient Accent Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          background: "linear-gradient(90deg, #7CAEFF 0%, #D4AF37 52%, #34D399 100%)",
        }}
      />

      {/* Mobile Safe Header */}
      <div
        style={{
          position: "absolute",
          top: 96,
          left: 64,
          right: 64,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: ACADEMY_THEME.colors.smokedGlass,
            border: `1px solid ${ACADEMY_THEME.colors.iceBlueBorder}`,
            borderRadius: 999,
            padding: "10px 20px",
          }}
        >
          <span
            style={{
              width: 11,
              height: 11,
              borderRadius: 99,
              backgroundColor: ACADEMY_THEME.colors.softGold,
            }}
          />
          <span
            style={{
              fontFamily: ACADEMY_THEME.fonts.mono,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.07em",
              color: ACADEMY_THEME.colors.iceBlue,
            }}
          >
            {manifest.eyebrow}
          </span>
        </div>

        <div
          style={{
            fontFamily: ACADEMY_THEME.fonts.mono,
            fontSize: 15,
            fontWeight: 700,
            color: ACADEMY_THEME.colors.softGold,
            padding: "8px 16px",
            borderRadius: 999,
            backgroundColor: ACADEMY_THEME.colors.softGoldSoft,
            border: `1px solid ${ACADEMY_THEME.colors.softGoldBorder}`,
          }}
        >
          0{beatIndex + 1} / 03
        </div>
      </div>

      {/* Main 9:16 Stage */}
      <div
        style={{
          position: "absolute",
          top: 196,
          left: 64,
          right: 64,
          bottom: 310,
          opacity: beatOpacity,
          transform: `translateY(${beatY}px)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* BEAT 0: Red-Gate Hook & Non-Compensable Thresholds */}
        {beatIndex === 0 && (
          <>
            <div>
              <div
                style={{
                  fontFamily: ACADEMY_THEME.fonts.mono,
                  fontSize: 18,
                  fontWeight: 700,
                  color: ACADEMY_THEME.colors.crimson,
                  letterSpacing: "0.08em",
                  marginBottom: 16,
                }}
              >
                PRODUCTION REALITY CHECK
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 74,
                  fontWeight: 800,
                  lineHeight: 1.06,
                  letterSpacing: "-0.03em",
                }}
              >
                {manifest.hookHeadline}
              </h1>
              <p
                style={{
                  margin: "24px 0 0 0",
                  fontSize: 30,
                  lineHeight: 1.4,
                  color: ACADEMY_THEME.colors.mutedText,
                }}
              >
                {manifest.hookSubline}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {manifest.statCallouts.map((stat, idx) => {
                const isCrimson = stat.tone === "crimson";
                const isGold = stat.tone === "gold";
                const fg = isCrimson
                  ? ACADEMY_THEME.colors.crimson
                  : isGold
                  ? ACADEMY_THEME.colors.softGold
                  : ACADEMY_THEME.colors.iceBlue;
                const border = isCrimson
                  ? ACADEMY_THEME.colors.crimsonBorder
                  : isGold
                  ? ACADEMY_THEME.colors.softGoldBorder
                  : ACADEMY_THEME.colors.iceBlueBorder;
                const reveal = interpolate(beatLocalFrame, [idx * 8, idx * 8 + 16], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });

                return (
                  <div
                    key={stat.metric}
                    style={{
                      opacity: reveal,
                      backgroundColor: ACADEMY_THEME.colors.smokedGlass,
                      border: `2px solid ${border}`,
                      borderRadius: 22,
                      padding: "28px 32px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: ACADEMY_THEME.fonts.mono,
                          fontSize: 32,
                          fontWeight: 800,
                          color: fg,
                          marginBottom: 6,
                        }}
                      >
                        {stat.metric}
                      </div>
                      <div style={{ fontSize: 22, color: ACADEMY_THEME.colors.iceWhite }}>
                        {stat.rule}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: ACADEMY_THEME.fonts.mono,
                        fontSize: 16,
                        fontWeight: 700,
                        color: fg,
                        padding: "8px 16px",
                        borderRadius: 10,
                        backgroundColor: "rgba(9, 11, 16, 0.8)",
                        border: `1px solid ${border}`,
                      }}
                    >
                      LOCKED
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* BEAT 1: 4-ICP Multi-Track Distribution Matrix */}
        {beatIndex === 1 && (
          <>
            <div>
              <div
                style={{
                  fontFamily: ACADEMY_THEME.fonts.mono,
                  fontSize: 18,
                  fontWeight: 700,
                  color: ACADEMY_THEME.colors.iceBlue,
                  letterSpacing: "0.08em",
                  marginBottom: 10,
                }}
              >
                FOUR BUILDER LENSES · 12 WEEKS
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 58,
                  fontWeight: 800,
                  lineHeight: 1.08,
                  letterSpacing: "-0.025em",
                }}
              >
                Pick your track. Ship verified artifacts.
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {manifest.icpCards.map((card, idx) => {
                const palette = cardAccent(card.accent);
                const cardOpacity = interpolate(
                  beatLocalFrame,
                  [idx * 6, idx * 6 + 15],
                  [0, 1],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }
                );

                return (
                  <div
                    key={card.code}
                    style={{
                      opacity: cardOpacity,
                      backgroundColor: ACADEMY_THEME.colors.smokedGlass,
                      border: `1.5px solid ${palette.border}`,
                      borderRadius: 20,
                      padding: "24px 28px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: ACADEMY_THEME.fonts.mono,
                          fontSize: 17,
                          fontWeight: 700,
                          color: palette.fg,
                        }}
                      >
                        {card.code}
                      </span>
                      <span
                        style={{
                          fontFamily: ACADEMY_THEME.fonts.mono,
                          fontSize: 15,
                          color: palette.fg,
                          backgroundColor: palette.bg,
                          padding: "4px 12px",
                          borderRadius: 999,
                        }}
                      >
                        {card.shippedProof}
                      </span>
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>
                      {card.label}
                    </div>
                    <div style={{ fontSize: 22, color: ACADEMY_THEME.colors.mutedText }}>
                      {card.hook}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* BEAT 2: Portable Capability Receipt & Open Entry Surfaces */}
        {beatIndex === 2 && (
          <>
            <div>
              <div
                style={{
                  fontFamily: ACADEMY_THEME.fonts.mono,
                  fontSize: 18,
                  fontWeight: 700,
                  color: ACADEMY_THEME.colors.softGold,
                  letterSpacing: "0.08em",
                  marginBottom: 12,
                }}
              >
                ZERO VANITY STREAKS · REAL PROOF
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 62,
                  fontWeight: 800,
                  lineHeight: 1.08,
                  letterSpacing: "-0.025em",
                }}
              >
                Carry a digest-bound capability receipt.
              </h2>
            </div>

            <div
              style={{
                backgroundColor: "rgba(212, 175, 55, 0.10)",
                border: `2px solid ${ACADEMY_THEME.colors.softGoldBorder}`,
                borderRadius: 24,
                padding: "34px 34px",
              }}
            >
              <div
                style={{
                  fontFamily: ACADEMY_THEME.fonts.mono,
                  fontSize: 18,
                  fontWeight: 700,
                  color: ACADEMY_THEME.colors.softGold,
                  marginBottom: 12,
                }}
              >
                CONTRACT · {manifest.receiptBanner.contract}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  lineHeight: 1.38,
                  marginBottom: 24,
                }}
              >
                {manifest.receiptBanner.ritualLoop}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {manifest.receiptBanner.ctaUrls.map((url) => (
                  <div
                    key={url}
                    style={{
                      fontFamily: ACADEMY_THEME.fonts.mono,
                      fontSize: 21,
                      color: ACADEMY_THEME.colors.iceBlue,
                      backgroundColor: "rgba(9, 11, 16, 0.78)",
                      border: `1px solid ${ACADEMY_THEME.colors.iceBlueBorder}`,
                      padding: "12px 18px",
                      borderRadius: 12,
                    }}
                  >
                    → {url}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                backgroundColor: ACADEMY_THEME.colors.softGold,
                color: ACADEMY_THEME.colors.obsidian,
                fontFamily: ACADEMY_THEME.fonts.mono,
                fontSize: 24,
                fontWeight: 800,
                textAlign: "center",
                padding: "24px 28px",
                borderRadius: 18,
                letterSpacing: "0.04em",
              }}
            >
              {manifest.receiptBanner.ctaPrimary}
            </div>
          </>
        )}
      </div>

      <VerticalSubtitleBar cues={manifest.cues} frame={frame} showCaptions={showCaptions} />
    </AbsoluteFill>
  );
};
