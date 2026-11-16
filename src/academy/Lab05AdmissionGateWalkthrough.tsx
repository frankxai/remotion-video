import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import defaultLab05ManifestJson from "./manifests/lab-05-admission-gate.json";
import { ACADEMY_THEME, AcademySubtitleBar, IllustrativeBadge, ObsidianBackdrop } from "./theme";
import { Lab05AdmissionGateManifest, Lab05PhaseSpec, TerminalLineSpec } from "./types";

export type Lab05AdmissionGateWalkthroughProps = {
  manifest?: Lab05AdmissionGateManifest;
  showCaptions?: boolean;
};

const DEFAULT_LAB05_MANIFEST = defaultLab05ManifestJson as Lab05AdmissionGateManifest;

function diffLinePalette(kind: TerminalLineSpec["kind"]): {
  fg: string;
  bg: string;
  border: string;
} {
  switch (kind) {
    case "prompt":
      return {
        fg: ACADEMY_THEME.colors.iceBlue,
        bg: "rgba(124, 174, 255, 0.09)",
        border: `3px solid ${ACADEMY_THEME.colors.iceBlue}`,
      };
    case "diff_del":
      return {
        fg: "#FF8DA1",
        bg: "rgba(255, 92, 119, 0.14)",
        border: `3px solid ${ACADEMY_THEME.colors.crimson}`,
      };
    case "diff_add":
      return {
        fg: "#6EE7B7",
        bg: "rgba(52, 211, 153, 0.14)",
        border: `3px solid ${ACADEMY_THEME.colors.emerald}`,
      };
    case "meta":
    default:
      return {
        fg: ACADEMY_THEME.colors.softGold,
        bg: "rgba(212, 175, 55, 0.09)",
        border: `3px solid ${ACADEMY_THEME.colors.softGold}`,
      };
  }
}

export const Lab05AdmissionGateWalkthrough: React.FC<Lab05AdmissionGateWalkthroughProps> = ({
  manifest = DEFAULT_LAB05_MANIFEST,
  showCaptions = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activePhaseIndex = Math.max(
    0,
    manifest.phases.findIndex((p) => frame >= p.startFrame && frame < p.endFrame)
  );
  const activePhase: Lab05PhaseSpec =
    manifest.phases[activePhaseIndex] ?? manifest.phases[manifest.phases.length - 1];
  const localFrame = Math.max(0, frame - activePhase.startFrame);

  const cardSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 135, mass: 0.85 },
  });
  const cardShiftY = interpolate(cardSpring, [0, 1], [14, 0]);

  const isStarterMode = activePhase.mode === "faulty_starter";
  const isGoldenOrReceipt =
    activePhase.mode === "golden_admitted" || activePhase.mode === "comparison_receipt";

  const activeTelemetry = isGoldenOrReceipt ? manifest.goldenSummary : manifest.starterSummary;
  const p95Breached = activeTelemetry.p95LatencyMs > manifest.thresholds.maxP95LatencyMs;
  const costBreached = activeTelemetry.maxCostUsd > manifest.thresholds.maxCostUsd;
  const safetyBreached = activeTelemetry.safetyPct !== manifest.thresholds.requiredSafetyPct;

  return (
    <AbsoluteFill style={{ fontFamily: ACADEMY_THEME.fonts.sans, color: ACADEMY_THEME.colors.iceWhite }}>
      <ObsidianBackdrop frame={frame} goldGlow={activePhase.mode === "comparison_receipt"} />

      {/* Top Header */}
      <div
        style={{
          position: "absolute",
          top: 36,
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
              letterSpacing: "0.08em",
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
            color: ACADEMY_THEME.colors.softGold,
            backgroundColor: ACADEMY_THEME.colors.smokedGlass,
            border: `1px solid ${ACADEMY_THEME.colors.softGoldBorder}`,
            padding: "8px 16px",
            borderRadius: 10,
          }}
        >
          {manifest.runtimeLabel}
        </div>
      </div>

      {/* Main Split Stage */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 72,
          right: 72,
          bottom: 112,
          display: "grid",
          gridTemplateColumns: "1140px 1fr",
          gap: 24,
          transform: `translateY(${cardShiftY}px)`,
        }}
      >
        {/* Left Panel: 5-Case Matrix / Surgical Diff / Side-by-Side Comparison */}
        <div
          style={{
            backgroundColor: "#0B0E16",
            border: `1px solid ${
              isStarterMode
                ? ACADEMY_THEME.colors.crimsonBorder
                : isGoldenOrReceipt
                ? ACADEMY_THEME.colors.emeraldBorder
                : ACADEMY_THEME.colors.iceBlueBorder
            }`,
            borderRadius: 18,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 20px 48px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Window Bar */}
          <div
            style={{
              padding: "13px 22px",
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
                  fontSize: 13,
                  color: ACADEMY_THEME.colors.mutedText,
                }}
              >
                {activePhase.command}
              </span>
            </div>

            <span
              style={{
                fontFamily: ACADEMY_THEME.fonts.mono,
                fontSize: 13,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 6,
                color:
                  activePhase.exitCode !== 0
                    ? ACADEMY_THEME.colors.crimson
                    : ACADEMY_THEME.colors.emerald,
                backgroundColor:
                  activePhase.exitCode !== 0
                    ? ACADEMY_THEME.colors.crimsonSoft
                    : ACADEMY_THEME.colors.emeraldSoft,
              }}
            >
              EXIT {activePhase.exitCode}
            </span>
          </div>

          {/* Phase Context Header */}
          <div
            style={{
              padding: "16px 24px 12px 24px",
              borderBottom: "1px solid rgba(124, 174, 255, 0.12)",
            }}
          >
            <div
              style={{
                fontFamily: ACADEMY_THEME.fonts.mono,
                fontSize: 13,
                fontWeight: 700,
                color:
                  activePhase.exitCode !== 0
                    ? ACADEMY_THEME.colors.crimson
                    : ACADEMY_THEME.colors.softGold,
                marginBottom: 4,
              }}
            >
              {activePhase.badge}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
              {activePhase.phaseTitle}
            </div>
            <div style={{ fontSize: 15, color: ACADEMY_THEME.colors.mutedText }}>
              {activePhase.summary}
            </div>
          </div>

          {/* Body Mode A: 5-Case Eval Table (Act 1 Starter REJECTED or Act 3 Golden ADMITTED) */}
          {(activePhase.mode === "faulty_starter" || activePhase.mode === "golden_admitted") && (
            <div
              style={{
                padding: "16px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              {/* Column Headers */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "210px 1fr 125px 115px 125px 115px",
                  gap: 12,
                  padding: "0 14px",
                  fontFamily: ACADEMY_THEME.fonts.mono,
                  fontSize: 12,
                  fontWeight: 700,
                  color: ACADEMY_THEME.colors.dimText,
                }}
              >
                <span>CASE ID</span>
                <span>EVALUATION SCENARIO</span>
                <span>LATENCY</span>
                <span>COST</span>
                <span>SAFETY</span>
                <span style={{ textAlign: "right" }}>VERDICT</span>
              </div>

              {manifest.evalCases.map((item, idx) => {
                const useGolden = activePhase.mode === "golden_admitted";
                const latency = useGolden ? item.goldenLatencyMs : item.starterLatencyMs;
                const cost = useGolden ? item.goldenCostUsd : item.starterCostUsd;
                const safety = useGolden ? item.goldenSafetyPct : item.starterSafetyPct;
                const verdict = useGolden ? item.goldenVerdict : item.starterVerdict;
                const failed = verdict === "FAIL";

                const rowOpacity = interpolate(localFrame, [idx * 5, idx * 5 + 12], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });

                return (
                  <div
                    key={item.caseId}
                    style={{
                      opacity: rowOpacity,
                      display: "grid",
                      gridTemplateColumns: "210px 1fr 125px 115px 125px 115px",
                      gap: 12,
                      alignItems: "center",
                      padding: "12px 14px",
                      borderRadius: 10,
                      backgroundColor: failed
                        ? "rgba(255, 92, 119, 0.10)"
                        : "rgba(52, 211, 153, 0.07)",
                      border: `1px solid ${
                        failed ? ACADEMY_THEME.colors.crimsonBorder : "rgba(52, 211, 153, 0.28)"
                      }`,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: ACADEMY_THEME.fonts.mono,
                          fontSize: 13,
                          fontWeight: 700,
                          color: failed
                            ? ACADEMY_THEME.colors.crimson
                            : ACADEMY_THEME.colors.iceBlue,
                        }}
                      >
                        {item.caseId}
                      </div>
                      <div
                        style={{
                          fontFamily: ACADEMY_THEME.fonts.mono,
                          fontSize: 11,
                          color: ACADEMY_THEME.colors.mutedText,
                        }}
                      >
                        {item.category}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{item.title}</div>
                      {!useGolden && item.starterFailureReason && (
                        <div
                          style={{
                            fontFamily: ACADEMY_THEME.fonts.mono,
                            fontSize: 12,
                            color: ACADEMY_THEME.colors.crimson,
                            marginTop: 2,
                          }}
                        >
                          ↳ {item.starterFailureReason}
                        </div>
                      )}
                    </div>

                    <span
                      style={{
                        fontFamily: ACADEMY_THEME.fonts.mono,
                        fontSize: 14,
                        fontWeight: 600,
                        color:
                          latency > manifest.thresholds.maxP95LatencyMs
                            ? ACADEMY_THEME.colors.crimson
                            : ACADEMY_THEME.colors.iceWhite,
                      }}
                    >
                      {latency}ms
                    </span>

                    <span
                      style={{
                        fontFamily: ACADEMY_THEME.fonts.mono,
                        fontSize: 14,
                        fontWeight: 600,
                        color:
                          cost > manifest.thresholds.maxCostUsd
                            ? ACADEMY_THEME.colors.crimson
                            : ACADEMY_THEME.colors.iceWhite,
                      }}
                    >
                      ${cost.toFixed(3)}
                    </span>

                    <span
                      style={{
                        fontFamily: ACADEMY_THEME.fonts.mono,
                        fontSize: 14,
                        fontWeight: 700,
                        color:
                          safety !== 100
                            ? ACADEMY_THEME.colors.crimson
                            : ACADEMY_THEME.colors.emerald,
                      }}
                    >
                      {safety}%
                    </span>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontFamily: ACADEMY_THEME.fonts.mono,
                          fontSize: 13,
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: 6,
                          color: failed
                            ? ACADEMY_THEME.colors.crimson
                            : ACADEMY_THEME.colors.emerald,
                          backgroundColor: failed
                            ? ACADEMY_THEME.colors.crimsonSoft
                            : ACADEMY_THEME.colors.emeraldSoft,
                        }}
                      >
                        {verdict}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Body Mode B: Surgical Diff (Act 2) */}
          {activePhase.mode === "surgical_fix" && (
            <div
              style={{
                padding: "18px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 9,
                flex: 1,
                justifyContent: "center",
              }}
            >
              {(activePhase.diffLines ?? []).map((line, idx) => {
                const palette = diffLinePalette(line.kind);
                const reveal = interpolate(localFrame, [idx * 4, idx * 4 + 10], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <div
                    key={`diff-${idx}`}
                    style={{
                      opacity: reveal,
                      fontFamily: ACADEMY_THEME.fonts.mono,
                      fontSize: 15,
                      color: palette.fg,
                      backgroundColor: palette.bg,
                      borderLeft: palette.border,
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
          )}

          {/* Body Mode C: Faulty REJECTED vs Golden ADMITTED Side-by-Side Comparison (Act 4) */}
          {activePhase.mode === "comparison_receipt" && (
            <div
              style={{
                padding: "20px 24px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                flex: 1,
              }}
            >
              {/* Faulty Starter Card */}
              <div
                style={{
                  backgroundColor: "rgba(255, 92, 119, 0.08)",
                  border: `1px solid ${ACADEMY_THEME.colors.crimsonBorder}`,
                  borderRadius: 16,
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: ACADEMY_THEME.fonts.mono,
                      fontSize: 13,
                      fontWeight: 700,
                      color: ACADEMY_THEME.colors.crimson,
                      marginBottom: 8,
                    }}
                  >
                    CANDIDATE A · FAULTY STARTER
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>
                    {manifest.starterSummary.candidateLabel}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      fontFamily: ACADEMY_THEME.fonts.mono,
                      fontSize: 15,
                    }}
                  >
                    <div style={{ color: ACADEMY_THEME.colors.crimson }}>
                      ✕ p95 Latency: {manifest.starterSummary.p95LatencyMs}ms (&gt; 4200ms)
                    </div>
                    <div style={{ color: ACADEMY_THEME.colors.crimson }}>
                      ✕ Peak Cost: ${manifest.starterSummary.maxCostUsd.toFixed(3)} (&gt; $0.050)
                    </div>
                    <div style={{ color: ACADEMY_THEME.colors.crimson }}>
                      ✕ Safety Score: {manifest.starterSummary.safetyPct}% (!= 100%)
                    </div>
                    <div style={{ color: ACADEMY_THEME.colors.mutedText }}>
                      Cases Passed: {manifest.starterSummary.passedCases}/
                      {manifest.starterSummary.totalCases}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    backgroundColor: ACADEMY_THEME.colors.crimsonSoft,
                    border: `1px solid ${ACADEMY_THEME.colors.crimsonBorder}`,
                    fontFamily: ACADEMY_THEME.fonts.mono,
                    fontSize: 15,
                    fontWeight: 700,
                    color: ACADEMY_THEME.colors.crimson,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>VERDICT: {manifest.starterSummary.verdict}</span>
                  <span>{manifest.starterSummary.refusalCode}</span>
                </div>
              </div>

              {/* Golden Admitted Card */}
              <div
                style={{
                  backgroundColor: "rgba(52, 211, 153, 0.08)",
                  border: `1px solid ${ACADEMY_THEME.colors.emeraldBorder}`,
                  borderRadius: 16,
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: ACADEMY_THEME.fonts.mono,
                      fontSize: 13,
                      fontWeight: 700,
                      color: ACADEMY_THEME.colors.emerald,
                      marginBottom: 8,
                    }}
                  >
                    CANDIDATE B · GOLDEN VERIFIED
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>
                    {manifest.goldenSummary.candidateLabel}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      fontFamily: ACADEMY_THEME.fonts.mono,
                      fontSize: 15,
                    }}
                  >
                    <div style={{ color: ACADEMY_THEME.colors.emerald }}>
                      ✓ p95 Latency: {manifest.goldenSummary.p95LatencyMs}ms (&lt;= 4200ms)
                    </div>
                    <div style={{ color: ACADEMY_THEME.colors.emerald }}>
                      ✓ Peak Cost: ${manifest.goldenSummary.maxCostUsd.toFixed(3)} (&lt;= $0.050)
                    </div>
                    <div style={{ color: ACADEMY_THEME.colors.emerald }}>
                      ✓ Safety Score: {manifest.goldenSummary.safetyPct}% (== 100%)
                    </div>
                    <div style={{ color: ACADEMY_THEME.colors.softGold }}>
                      Cases Passed: {manifest.goldenSummary.passedCases}/
                      {manifest.goldenSummary.totalCases} · {manifest.goldenSummary.receiptDigest}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    backgroundColor: ACADEMY_THEME.colors.emeraldSoft,
                    border: `1px solid ${ACADEMY_THEME.colors.emeraldBorder}`,
                    fontFamily: ACADEMY_THEME.fonts.mono,
                    fontSize: 15,
                    fontWeight: 700,
                    color: ACADEMY_THEME.colors.emerald,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>VERDICT: {manifest.goldenSummary.verdict}</span>
                  <span>RECEIPT ISSUED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right HUD: Non-Compensable Thresholds + Act Stepper + Verdict Seal */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            justifyContent: "space-between",
          }}
        >
          {/* 4-Act Progress Stepper */}
          <div
            style={{
              backgroundColor: ACADEMY_THEME.colors.smokedGlass,
              border: `1px solid ${ACADEMY_THEME.colors.iceBlueBorder}`,
              borderRadius: 16,
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontFamily: ACADEMY_THEME.fonts.mono,
                fontSize: 12,
                fontWeight: 700,
                color: ACADEMY_THEME.colors.iceBlue,
                marginBottom: 10,
              }}
            >
              30-SECOND WALKTHROUGH PROGRESSION
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {manifest.phases.map((phase, idx) => {
                const selected = idx === activePhaseIndex;
                const completed = idx < activePhaseIndex;
                return (
                  <div
                    key={phase.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      fontFamily: ACADEMY_THEME.fonts.mono,
                      fontSize: 12,
                      fontWeight: selected || completed ? 700 : 500,
                      color: selected
                        ? ACADEMY_THEME.colors.obsidian
                        : completed
                        ? ACADEMY_THEME.colors.emerald
                        : ACADEMY_THEME.colors.mutedText,
                      backgroundColor: selected
                        ? ACADEMY_THEME.colors.iceBlue
                        : completed
                        ? ACADEMY_THEME.colors.emeraldSoft
                        : "rgba(9, 11, 16, 0.65)",
                    }}
                  >
                    0{idx + 1} · {phase.mode.replace("_", " ")}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3 Non-Compensable Admission Threshold Gauges */}
          <div
            style={{
              backgroundColor: ACADEMY_THEME.colors.smokedGlass,
              border: `1px solid ${ACADEMY_THEME.colors.softGoldBorder}`,
              borderRadius: 16,
              padding: "18px 20px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontFamily: ACADEMY_THEME.fonts.mono,
                fontSize: 13,
                fontWeight: 700,
                color: ACADEMY_THEME.colors.softGold,
              }}
            >
              ADMISSION GATE INVARIANTS
            </div>

            {[
              {
                label: "Latency SLO (p95 <= 4200ms)",
                measured: `${activeTelemetry.p95LatencyMs}ms`,
                breached: p95Breached,
              },
              {
                label: "Spend Cap (cost <= $0.05)",
                measured: `$${activeTelemetry.maxCostUsd.toFixed(3)}`,
                breached: costBreached,
              },
              {
                label: "Safety Red Gate (safety == 100%)",
                measured: `${activeTelemetry.safetyPct}%`,
                breached: safetyBreached,
              },
            ].map((gauge) => (
              <div
                key={gauge.label}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  backgroundColor: "rgba(9, 11, 16, 0.78)",
                  border: `1px solid ${
                    gauge.breached
                      ? ACADEMY_THEME.colors.crimsonBorder
                      : ACADEMY_THEME.colors.emeraldBorder
                  }`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{gauge.label}</div>
                  <div
                    style={{
                      fontFamily: ACADEMY_THEME.fonts.mono,
                      fontSize: 12,
                      color: ACADEMY_THEME.colors.mutedText,
                    }}
                  >
                    Non-compensable threshold
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: ACADEMY_THEME.fonts.mono,
                    fontSize: 15,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 6,
                    color: gauge.breached
                      ? ACADEMY_THEME.colors.crimson
                      : ACADEMY_THEME.colors.emerald,
                    backgroundColor: gauge.breached
                      ? ACADEMY_THEME.colors.crimsonSoft
                      : ACADEMY_THEME.colors.emeraldSoft,
                  }}
                >
                  {gauge.measured}
                </span>
              </div>
            ))}
          </div>

          {/* Admission Verdict & Capability Receipt Seal */}
          <div
            style={{
              backgroundColor: isGoldenOrReceipt
                ? "rgba(52, 211, 153, 0.12)"
                : "rgba(255, 92, 119, 0.12)",
              border: `1px solid ${
                isGoldenOrReceipt
                  ? ACADEMY_THEME.colors.emeraldBorder
                  : ACADEMY_THEME.colors.crimsonBorder
              }`,
              borderRadius: 16,
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontFamily: ACADEMY_THEME.fonts.mono,
                fontSize: 12,
                fontWeight: 700,
                color: isGoldenOrReceipt
                  ? ACADEMY_THEME.colors.emerald
                  : ACADEMY_THEME.colors.crimson,
                marginBottom: 6,
              }}
            >
              GATE VERDICT · {activeTelemetry.verdict}
            </div>
            <div
              style={{
                fontFamily: ACADEMY_THEME.fonts.mono,
                fontSize: 13,
                lineHeight: 1.5,
                color: ACADEMY_THEME.colors.iceWhite,
              }}
            >
              {isGoldenOrReceipt ? (
                <>
                  <div>contract: {manifest.goldenSummary.receiptSchema}</div>
                  <div>digest: {manifest.goldenSummary.receiptDigest}</div>
                  <div style={{ color: ACADEMY_THEME.colors.softGold }}>
                    5/5 cases green · Day-7 perturbation queued
                  </div>
                </>
              ) : (
                <>
                  <div>refusal: {manifest.starterSummary.refusalCode}</div>
                  <div>passed: {manifest.starterSummary.passedCases}/5 cases</div>
                  <div style={{ color: ACADEMY_THEME.colors.crimson }}>
                    Promotion blocked fail-closed until all 3 invariants hold
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AcademySubtitleBar cues={manifest.cues} frame={frame} showCaptions={showCaptions} />
      <IllustrativeBadge />
    </AbsoluteFill>
  );
};
