import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import trailerManifestJson from "./manifests/academy-trailer.manifest.json";
import { ACADEMY_THEME, AcademySubtitleBar, IllustrativeBadge, ObsidianBackdrop } from "./theme";
import { AcademyTrailerManifest, TrailerIcpTrack } from "./types";

export type AcademyTrailerProps = {
  manifest?: AcademyTrailerManifest;
  showCaptions?: boolean;
};

const DEFAULT_TRAILER_MANIFEST = trailerManifestJson as AcademyTrailerManifest;

function accentColors(accent: TrailerIcpTrack["accent"]): {
  fg: string;
  bg: string;
  border: string;
} {
  switch (accent) {
    case "gold":
      return {
        fg: ACADEMY_THEME.colors.softGold,
        bg: ACADEMY_THEME.colors.softGoldSoft,
        border: ACADEMY_THEME.colors.softGoldBorder,
      };
    case "emerald":
      return {
        fg: ACADEMY_THEME.colors.emerald,
        bg: ACADEMY_THEME.colors.emeraldSoft,
        border: ACADEMY_THEME.colors.emeraldBorder,
      };
    case "violet":
      return {
        fg: ACADEMY_THEME.colors.violet,
        bg: ACADEMY_THEME.colors.violetSoft,
        border: "rgba(167, 139, 250, 0.34)",
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

export const AcademyTrailer: React.FC<AcademyTrailerProps> = ({
  manifest = DEFAULT_TRAILER_MANIFEST,
  showCaptions = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIndex = frame < 160 ? 0 : frame < 380 ? 1 : 2;
  const localFrame = sceneIndex === 0 ? frame : sceneIndex === 1 ? frame - 160 : frame - 380;

  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 130, mass: 0.8 },
  });
  const sectionOpacity = interpolate(localFrame, [0, 14], [0.25, 1], {
    extrapolateRight: "clamp",
  });
  const sectionY = interpolate(enterSpring, [0, 1], [18, 0]);

  return (
    <AbsoluteFill style={{ fontFamily: ACADEMY_THEME.fonts.sans, color: ACADEMY_THEME.colors.iceWhite }}>
      <ObsidianBackdrop frame={frame} goldGlow={sceneIndex === 2} />

      {/* Top Architectural Header Bar */}
      <div
        style={{
          position: "absolute",
          top: 42,
          left: 76,
          right: 76,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              backgroundColor: ACADEMY_THEME.colors.softGold,
              boxShadow: "0 0 14px rgba(212, 175, 55, 0.7)",
            }}
          />
          <span
            style={{
              fontFamily: ACADEMY_THEME.fonts.mono,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.09em",
              color: ACADEMY_THEME.colors.iceBlue,
            }}
          >
            {manifest.eyebrow}
          </span>
        </div>

        {/* Persistent 4-ICP Lens Indicator */}
        <div style={{ display: "flex", gap: 10 }}>
          {manifest.icpTracks.map((track) => {
            const palette = accentColors(track.accent);
            return (
              <div
                key={track.id}
                style={{
                  fontFamily: ACADEMY_THEME.fonts.mono,
                  fontSize: 12,
                  fontWeight: 600,
                  color: palette.fg,
                  backgroundColor: palette.bg,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 999,
                  padding: "5px 12px",
                }}
              >
                {track.code} · {track.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Stage Body */}
      <div
        style={{
          position: "absolute",
          top: 104,
          left: 76,
          right: 76,
          bottom: 118,
          opacity: sectionOpacity,
          transform: `translateY(${sectionY}px)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* SCENE 0: 4-ICP Entry Matrix */}
        {sceneIndex === 0 && (
          <>
            <div style={{ maxWidth: 1420 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 60,
                  fontWeight: 800,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.08,
                  color: ACADEMY_THEME.colors.iceWhite,
                }}
              >
                {manifest.headline}
              </h1>
              <p
                style={{
                  margin: "16px 0 0 0",
                  fontSize: 24,
                  lineHeight: 1.45,
                  color: ACADEMY_THEME.colors.mutedText,
                  maxWidth: 1280,
                }}
              >
                {manifest.subheadline}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 22,
                marginTop: 28,
                flex: 1,
              }}
            >
              {manifest.icpTracks.map((track, idx) => {
                const palette = accentColors(track.accent);
                const cardOpacity = interpolate(localFrame, [idx * 6, idx * 6 + 18], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <div
                    key={track.id}
                    style={{
                      opacity: cardOpacity,
                      backgroundColor: ACADEMY_THEME.colors.smokedGlass,
                      border: `1px solid ${palette.border}`,
                      borderRadius: 18,
                      padding: "26px 30px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: ACADEMY_THEME.fonts.mono,
                            fontSize: 14,
                            fontWeight: 700,
                            color: palette.fg,
                            letterSpacing: "0.06em",
                          }}
                        >
                          {track.code}
                        </span>
                        <span
                          style={{
                            fontFamily: ACADEMY_THEME.fonts.mono,
                            fontSize: 12,
                            color: ACADEMY_THEME.colors.mutedText,
                          }}
                        >
                          12-WEEK VERIFIED TRACK
                        </span>
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>
                        {track.label}
                      </div>
                      <div
                        style={{
                          fontSize: 19,
                          lineHeight: 1.42,
                          color: ACADEMY_THEME.colors.mutedText,
                        }}
                      >
                        {track.focus}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 18,
                        paddingTop: 14,
                        borderTop: "1px solid rgba(124, 174, 255, 0.14)",
                        fontFamily: ACADEMY_THEME.fonts.mono,
                        fontSize: 15,
                        color: palette.fg,
                      }}
                    >
                      Exit artifact → {track.artifact}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* SCENE 1 (Covers mid-frame 270): 12-Week 3-Act Spine + Non-Compensable Red-Gate Matrix */}
        {sceneIndex === 1 && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: ACADEMY_THEME.fonts.mono,
                    fontSize: 14,
                    fontWeight: 700,
                    color: ACADEMY_THEME.colors.softGold,
                    letterSpacing: "0.08em",
                    marginBottom: 6,
                  }}
                >
                  CURRICULUM ARCHITECTURE · 12 WEEKS ACROSS 3 ACTS
                </div>
                <h2 style={{ margin: 0, fontSize: 42, fontWeight: 800, letterSpacing: "-0.02em" }}>
                  Progressive Scaffolding + Non-Compensable Red Gates
                </h2>
              </div>
              <div
                style={{
                  fontFamily: ACADEMY_THEME.fonts.mono,
                  fontSize: 15,
                  color: ACADEMY_THEME.colors.crimson,
                  backgroundColor: ACADEMY_THEME.colors.crimsonSoft,
                  border: `1px solid ${ACADEMY_THEME.colors.crimsonBorder}`,
                  borderRadius: 10,
                  padding: "8px 16px",
                }}
              >
                INVARIANT: 1 FAILED RED GATE = RELEASE BLOCKED
              </div>
            </div>

            {/* 3-Act Spine Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              {manifest.acts.map((act, idx) => {
                const isGold = idx === 2;
                const borderCol = isGold
                  ? ACADEMY_THEME.colors.softGoldBorder
                  : ACADEMY_THEME.colors.iceBlueBorder;
                const accentCol = isGold
                  ? ACADEMY_THEME.colors.softGold
                  : ACADEMY_THEME.colors.iceBlue;
                return (
                  <div
                    key={act.actCode}
                    style={{
                      backgroundColor: ACADEMY_THEME.colors.smokedGlass,
                      border: `1px solid ${borderCol}`,
                      borderRadius: 16,
                      padding: "20px 24px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontFamily: ACADEMY_THEME.fonts.mono,
                          fontSize: 14,
                          fontWeight: 700,
                          color: accentCol,
                          marginBottom: 8,
                        }}
                      >
                        <span>{act.actCode}</span>
                        <span>{act.weeks}</span>
                      </div>
                      <div style={{ fontSize: 23, fontWeight: 700, marginBottom: 12 }}>
                        {act.title}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {act.modules.map((mod) => (
                          <div
                            key={mod}
                            style={{
                              fontFamily: ACADEMY_THEME.fonts.mono,
                              fontSize: 14,
                              color: ACADEMY_THEME.colors.mutedText,
                            }}
                          >
                            • {mod}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: 14,
                        paddingTop: 10,
                        borderTop: "1px solid rgba(124, 174, 255, 0.14)",
                        fontFamily: ACADEMY_THEME.fonts.mono,
                        fontSize: 13,
                        color: accentCol,
                      }}
                    >
                      Gate: {act.gateSummary}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Non-Compensable Red-Gate Telemetry Matrix */}
            <div
              style={{
                marginTop: 20,
                backgroundColor: "rgba(12, 16, 26, 0.94)",
                border: `1px solid ${ACADEMY_THEME.colors.iceBlueBorder}`,
                borderRadius: 16,
                padding: "20px 26px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    fontFamily: ACADEMY_THEME.fonts.mono,
                    fontSize: 14,
                    fontWeight: 700,
                    color: ACADEMY_THEME.colors.iceBlue,
                    letterSpacing: "0.06em",
                  }}
                >
                  NON-COMPENSABLE ADMISSION GATE MATRIX (EXAMINER KERNEL)
                </span>
                <span
                  style={{
                    fontFamily: ACADEMY_THEME.fonts.mono,
                    fontSize: 13,
                    color: ACADEMY_THEME.colors.mutedText,
                  }}
                >
                  Maker != Checker · Exact SHA-256 Verification
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {manifest.redGates.map((row) => {
                  const blocked = row.gateVerdict === "BLOCKED";
                  return (
                    <div
                      key={row.gateId}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "230px 1fr 180px 150px 240px",
                        alignItems: "center",
                        gap: 16,
                        padding: "11px 16px",
                        borderRadius: 10,
                        backgroundColor: blocked
                          ? "rgba(255, 92, 119, 0.08)"
                          : "rgba(52, 211, 153, 0.06)",
                        border: `1px solid ${
                          blocked
                            ? ACADEMY_THEME.colors.crimsonBorder
                            : "rgba(52, 211, 153, 0.24)"
                        }`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: ACADEMY_THEME.fonts.mono,
                          fontSize: 14,
                          fontWeight: 700,
                          color: blocked
                            ? ACADEMY_THEME.colors.crimson
                            : ACADEMY_THEME.colors.iceBlue,
                        }}
                      >
                        {row.gateId}
                      </span>
                      <span style={{ fontSize: 17, color: ACADEMY_THEME.colors.iceWhite }}>
                        {row.label}
                      </span>
                      <span
                        style={{
                          fontFamily: ACADEMY_THEME.fonts.mono,
                          fontSize: 14,
                          color: ACADEMY_THEME.colors.mutedText,
                        }}
                      >
                        {row.fluencyScore}
                      </span>
                      <span
                        style={{
                          fontFamily: ACADEMY_THEME.fonts.mono,
                          fontSize: 13,
                          fontWeight: 700,
                          textAlign: "center",
                          padding: "4px 10px",
                          borderRadius: 6,
                          color: blocked
                            ? ACADEMY_THEME.colors.crimson
                            : ACADEMY_THEME.colors.emerald,
                          backgroundColor: blocked
                            ? ACADEMY_THEME.colors.crimsonSoft
                            : ACADEMY_THEME.colors.emeraldSoft,
                        }}
                      >
                        {row.gateVerdict}
                      </span>
                      <span
                        style={{
                          fontFamily: ACADEMY_THEME.fonts.mono,
                          fontSize: 13,
                          fontWeight: 700,
                          textAlign: "right",
                          color: blocked
                            ? ACADEMY_THEME.colors.crimson
                            : ACADEMY_THEME.colors.softGold,
                        }}
                      >
                        {row.releaseOutcome}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* SCENE 2: 4-Surface Ecosystem Bridge & Capability Receipt */}
        {sceneIndex === 2 && (
          <>
            <div>
              <div
                style={{
                  fontFamily: ACADEMY_THEME.fonts.mono,
                  fontSize: 14,
                  fontWeight: 700,
                  color: ACADEMY_THEME.colors.softGold,
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                END-TO-END BUILDER JOURNEY · PORTABLE PROOF
              </div>
              <h2 style={{ margin: 0, fontSize: 48, fontWeight: 800, letterSpacing: "-0.02em" }}>
                From Open Guides to Verified Capability Receipts
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 18,
                marginTop: 22,
              }}
            >
              {manifest.surfaceBridge.map((node, idx) => (
                <div
                  key={node.step}
                  style={{
                    backgroundColor: ACADEMY_THEME.colors.smokedGlass,
                    border: `1px solid ${
                      idx === 2
                        ? ACADEMY_THEME.colors.softGoldBorder
                        : ACADEMY_THEME.colors.iceBlueBorder
                    }`,
                    borderRadius: 16,
                    padding: "24px 22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 250,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: ACADEMY_THEME.fonts.mono,
                        fontSize: 15,
                        fontWeight: 700,
                        color:
                          idx === 2
                            ? ACADEMY_THEME.colors.softGold
                            : ACADEMY_THEME.colors.iceBlue,
                        marginBottom: 10,
                      }}
                    >
                      STEP {node.step}
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
                      {node.surface}
                    </div>
                    <div
                      style={{
                        fontFamily: ACADEMY_THEME.fonts.mono,
                        fontSize: 13,
                        color: ACADEMY_THEME.colors.iceBlue,
                        marginBottom: 14,
                      }}
                    >
                      {node.urlLabel}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 17,
                      lineHeight: 1.4,
                      color: ACADEMY_THEME.colors.mutedText,
                      paddingTop: 12,
                      borderTop: "1px solid rgba(124, 174, 255, 0.15)",
                    }}
                  >
                    {node.output}
                  </div>
                </div>
              ))}
            </div>

            {/* Gold Sovereign Receipt Seal */}
            <div
              style={{
                marginTop: 24,
                backgroundColor: "rgba(212, 175, 55, 0.08)",
                border: `1px solid ${ACADEMY_THEME.colors.softGoldBorder}`,
                borderRadius: 18,
                padding: "24px 32px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: ACADEMY_THEME.fonts.mono,
                    fontSize: 14,
                    fontWeight: 700,
                    color: ACADEMY_THEME.colors.softGold,
                    marginBottom: 6,
                  }}
                >
                  PORTABLE VERIFICATION CONTRACT · starlight.capability_receipt.v1
                </div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>
                  Unaided attempt logged · Offline red gates green · 20-min peer critique · Day-7 transfer verified
                </div>
              </div>
              <div
                style={{
                  fontFamily: ACADEMY_THEME.fonts.mono,
                  fontSize: 16,
                  fontWeight: 700,
                  color: ACADEMY_THEME.colors.obsidian,
                  backgroundColor: ACADEMY_THEME.colors.softGold,
                  padding: "12px 22px",
                  borderRadius: 10,
                }}
              >
                START FREE IN GIT & STUDIO
              </div>
            </div>
          </>
        )}
      </div>

      <AcademySubtitleBar cues={manifest.cues} frame={frame} showCaptions={showCaptions} />
      <IllustrativeBadge label="ILLUSTRATIVE DESIGN CONCEPT · NOT MEASURED RESULTS" top={86} right={76} />
    </AbsoluteFill>
  );
};
