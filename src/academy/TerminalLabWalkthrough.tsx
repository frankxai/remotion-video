import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import defaultLabManifestJson from "./manifests/terminal-lab-walkthrough.manifest.json";
import { ACADEMY_THEME, AcademySubtitleBar, ObsidianBackdrop } from "./theme";
import { TerminalLabManifest, TerminalLineSpec, TerminalStepSpec } from "./types";

export type TerminalLabWalkthroughProps = {
  manifest?: TerminalLabManifest;
  showCaptions?: boolean;
};

const DEFAULT_LAB_MANIFEST = defaultLabManifestJson as TerminalLabManifest;

function lineStyle(kind: TerminalLineSpec["kind"]): {
  color: string;
  bg: string;
  borderLeft: string;
} {
  switch (kind) {
    case "prompt":
      return {
        color: ACADEMY_THEME.colors.iceBlue,
        bg: "rgba(124, 174, 255, 0.08)",
        borderLeft: `3px solid ${ACADEMY_THEME.colors.iceBlue}`,
      };
    case "fail":
      return {
        color: ACADEMY_THEME.colors.crimson,
        bg: "rgba(255, 92, 119, 0.10)",
        borderLeft: `3px solid ${ACADEMY_THEME.colors.crimson}`,
      };
    case "pass":
      return {
        color: ACADEMY_THEME.colors.emerald,
        bg: "rgba(52, 211, 153, 0.09)",
        borderLeft: `3px solid ${ACADEMY_THEME.colors.emerald}`,
      };
    case "diff_del":
      return {
        color: "#FF8DA1",
        bg: "rgba(255, 92, 119, 0.14)",
        borderLeft: `3px solid ${ACADEMY_THEME.colors.crimson}`,
      };
    case "diff_add":
      return {
        color: "#6EE7B7",
        bg: "rgba(52, 211, 153, 0.14)",
        borderLeft: `3px solid ${ACADEMY_THEME.colors.emerald}`,
      };
    case "meta":
      return {
        color: ACADEMY_THEME.colors.softGold,
        bg: "rgba(212, 175, 55, 0.08)",
        borderLeft: `3px solid ${ACADEMY_THEME.colors.softGold}`,
      };
    case "out":
    default:
      return {
        color: ACADEMY_THEME.colors.iceWhite,
        bg: "transparent",
        borderLeft: "3px solid transparent",
      };
  }
}

export const TerminalLabWalkthrough: React.FC<TerminalLabWalkthroughProps> = ({
  manifest = DEFAULT_LAB_MANIFEST,
  showCaptions = true,
}) => {
  const frame = useCurrentFrame();

  const activeStepIndex = Math.max(
    0,
    manifest.steps.findIndex((step) => frame >= step.startFrame && frame < step.endFrame)
  );
  const activeStep: TerminalStepSpec =
    manifest.steps[activeStepIndex] ?? manifest.steps[manifest.steps.length - 1];
  const localFrame = Math.max(0, frame - activeStep.startFrame);

  const isFailedExit = activeStep.exitCode !== 0;

  return (
    <AbsoluteFill style={{ fontFamily: ACADEMY_THEME.fonts.sans, color: ACADEMY_THEME.colors.iceWhite }}>
      <ObsidianBackdrop frame={frame} goldGlow={activeStep.phase === "capability_receipt"} />

      {/* Top Lab Header */}
      <div
        style={{
          position: "absolute",
          top: 38,
          left: 72,
          right: 72,
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
              color: ACADEMY_THEME.colors.iceBlue,
              marginBottom: 4,
            }}
          >
            AI ARCHITECT ACADEMY · {manifest.labPath}
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>
            {manifest.labTitle}
          </div>
        </div>

        <div
          style={{
            fontFamily: ACADEMY_THEME.fonts.mono,
            fontSize: 13,
            color: ACADEMY_THEME.colors.mutedText,
            backgroundColor: ACADEMY_THEME.colors.smokedGlass,
            border: `1px solid ${ACADEMY_THEME.colors.iceBlueBorder}`,
            padding: "8px 16px",
            borderRadius: 10,
          }}
        >
          {manifest.runtimeLabel}
        </div>
      </div>

      {/* Main Split Workbench */}
      <div
        style={{
          position: "absolute",
          top: 124,
          left: 72,
          right: 72,
          bottom: 116,
          display: "grid",
          gridTemplateColumns: "1120px 1fr",
          gap: 24,
        }}
      >
        {/* Left: Deterministic PTY Terminal Window */}
        <div
          style={{
            backgroundColor: "#0B0E16",
            border: `1px solid ${
              isFailedExit ? ACADEMY_THEME.colors.crimsonBorder : ACADEMY_THEME.colors.iceBlueBorder
            }`,
            borderRadius: 18,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Terminal Window Chrome */}
          <div
            style={{
              padding: "14px 22px",
              backgroundColor: "#121725",
              borderBottom: "1px solid rgba(124, 174, 255, 0.16)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 11, height: 11, borderRadius: 99, backgroundColor: "#FF5C77" }} />
              <span style={{ width: 11, height: 11, borderRadius: 99, backgroundColor: "#D4AF37" }} />
              <span style={{ width: 11, height: 11, borderRadius: 99, backgroundColor: "#34D399" }} />
              <span
                style={{
                  marginLeft: 10,
                  fontFamily: ACADEMY_THEME.fonts.mono,
                  fontSize: 14,
                  color: ACADEMY_THEME.colors.mutedText,
                }}
              >
                {activeStep.command}
              </span>
            </div>

            <span
              style={{
                fontFamily: ACADEMY_THEME.fonts.mono,
                fontSize: 13,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 6,
                color: isFailedExit ? ACADEMY_THEME.colors.crimson : ACADEMY_THEME.colors.emerald,
                backgroundColor: isFailedExit
                  ? ACADEMY_THEME.colors.crimsonSoft
                  : ACADEMY_THEME.colors.emeraldSoft,
              }}
            >
              EXIT {activeStep.exitCode}
            </span>
          </div>

          {/* Step Context Banner */}
          <div
            style={{
              padding: "18px 24px 12px 24px",
              borderBottom: "1px solid rgba(124, 174, 255, 0.10)",
            }}
          >
            <div
              style={{
                fontFamily: ACADEMY_THEME.fonts.mono,
                fontSize: 13,
                fontWeight: 700,
                color: isFailedExit ? ACADEMY_THEME.colors.crimson : ACADEMY_THEME.colors.softGold,
                marginBottom: 4,
              }}
            >
              {activeStep.badge}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
              {activeStep.stepTitle}
            </div>
            <div style={{ fontSize: 16, color: ACADEMY_THEME.colors.mutedText }}>
              {activeStep.summaryNote}
            </div>
          </div>

          {/* Deterministic Terminal Output Lines */}
          <div
            style={{
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              flex: 1,
            }}
          >
            {activeStep.terminalLines.map((line, idx) => {
              const reveal = interpolate(localFrame, [idx * 4, idx * 4 + 10], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const palette = lineStyle(line.kind);
              return (
                <div
                  key={`${activeStep.id}-line-${idx}`}
                  style={{
                    opacity: reveal,
                    fontFamily: ACADEMY_THEME.fonts.mono,
                    fontSize: 16,
                    lineHeight: 1.45,
                    color: palette.color,
                    backgroundColor: palette.bg,
                    borderLeft: palette.borderLeft,
                    padding: "8px 14px",
                    borderRadius: "0 8px 8px 0",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {line.text}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Red-Gate HUD + Capability Receipt Inspector */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            justifyContent: "space-between",
          }}
        >
          {/* Step Progress Rail */}
          <div
            style={{
              backgroundColor: ACADEMY_THEME.colors.smokedGlass,
              border: `1px solid ${ACADEMY_THEME.colors.iceBlueBorder}`,
              borderRadius: 16,
              padding: "18px 22px",
            }}
          >
            <div
              style={{
                fontFamily: ACADEMY_THEME.fonts.mono,
                fontSize: 13,
                fontWeight: 700,
                color: ACADEMY_THEME.colors.iceBlue,
                marginBottom: 12,
              }}
            >
              WORKBOOK PROGRESSION
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {manifest.steps.map((step, idx) => {
                const current = idx === activeStepIndex;
                const done = idx < activeStepIndex;
                return (
                  <div
                    key={step.id}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontFamily: ACADEMY_THEME.fonts.mono,
                      fontSize: 13,
                      color: current
                        ? ACADEMY_THEME.colors.obsidian
                        : done
                        ? ACADEMY_THEME.colors.emerald
                        : ACADEMY_THEME.colors.mutedText,
                      backgroundColor: current
                        ? ACADEMY_THEME.colors.iceBlue
                        : done
                        ? ACADEMY_THEME.colors.emeraldSoft
                        : "rgba(9, 11, 16, 0.6)",
                      fontWeight: current || done ? 700 : 500,
                    }}
                  >
                    0{idx + 1} · {step.phase.replace("_", " ")}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Non-Compensable Red-Gate Status Panel */}
          <div
            style={{
              backgroundColor: ACADEMY_THEME.colors.smokedGlass,
              border: `1px solid ${ACADEMY_THEME.colors.iceBlueBorder}`,
              borderRadius: 16,
              padding: "20px 22px",
              flex: 1,
            }}
          >
            <div
              style={{
                fontFamily: ACADEMY_THEME.fonts.mono,
                fontSize: 13,
                fontWeight: 700,
                color: ACADEMY_THEME.colors.softGold,
                marginBottom: 14,
              }}
            >
              NON-COMPENSABLE RED-GATE HUD
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activeStep.gateStates.map((gate) => {
                const isPass = gate.status === "PASS";
                const isFail = gate.status === "FAIL";
                return (
                  <div
                    key={gate.gateId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      borderRadius: 10,
                      backgroundColor: "rgba(9, 11, 16, 0.72)",
                      border: `1px solid ${
                        isPass
                          ? ACADEMY_THEME.colors.emeraldBorder
                          : isFail
                          ? ACADEMY_THEME.colors.crimsonBorder
                          : ACADEMY_THEME.colors.softGoldBorder
                      }`,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{gate.label}</div>
                      <div
                        style={{
                          fontFamily: ACADEMY_THEME.fonts.mono,
                          fontSize: 12,
                          color: ACADEMY_THEME.colors.mutedText,
                        }}
                      >
                        {gate.gateId}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: ACADEMY_THEME.fonts.mono,
                        fontSize: 13,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 6,
                        color: isPass
                          ? ACADEMY_THEME.colors.emerald
                          : isFail
                          ? ACADEMY_THEME.colors.crimson
                          : ACADEMY_THEME.colors.softGold,
                        backgroundColor: isPass
                          ? ACADEMY_THEME.colors.emeraldSoft
                          : isFail
                          ? ACADEMY_THEME.colors.crimsonSoft
                          : ACADEMY_THEME.colors.softGoldSoft,
                      }}
                    >
                      {gate.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Capability Receipt Card */}
          <div
            style={{
              backgroundColor: activeStep.receiptPreview
                ? "rgba(212, 175, 55, 0.12)"
                : "rgba(18, 22, 34, 0.85)",
              border: `1px solid ${
                activeStep.receiptPreview
                  ? ACADEMY_THEME.colors.softGold
                  : ACADEMY_THEME.colors.iceBlueBorder
              }`,
              borderRadius: 16,
              padding: "18px 22px",
            }}
          >
            <div
              style={{
                fontFamily: ACADEMY_THEME.fonts.mono,
                fontSize: 13,
                fontWeight: 700,
                color: activeStep.receiptPreview
                  ? ACADEMY_THEME.colors.softGold
                  : ACADEMY_THEME.colors.mutedText,
                marginBottom: 8,
              }}
            >
              CAPABILITY RECEIPT STATUS
            </div>
            {activeStep.receiptPreview ? (
              <div
                style={{
                  fontFamily: ACADEMY_THEME.fonts.mono,
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: ACADEMY_THEME.colors.iceWhite,
                }}
              >
                <div>schema: {activeStep.receiptPreview.schema}</div>
                <div>mission: {activeStep.receiptPreview.missionId}</div>
                <div style={{ color: ACADEMY_THEME.colors.emerald }}>
                  verdict: {activeStep.receiptPreview.verdict} ({activeStep.receiptPreview.artifactDigest})
                </div>
                <div style={{ color: ACADEMY_THEME.colors.softGold }}>
                  next: {activeStep.receiptPreview.day7Transfer}
                </div>
              </div>
            ) : (
              <div
                style={{
                  fontFamily: ACADEMY_THEME.fonts.mono,
                  fontSize: 13,
                  color: ACADEMY_THEME.colors.mutedText,
                }}
              >
                Awaiting 100% green offline suite before issuing starlight.capability_receipt.v1...
              </div>
            )}
          </div>
        </div>
      </div>

      <AcademySubtitleBar cues={manifest.cues} frame={frame} showCaptions={showCaptions} />
    </AbsoluteFill>
  );
};
