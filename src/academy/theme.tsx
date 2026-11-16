import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { AcademyCaptionCue } from "./types";

export const ACADEMY_THEME = {
  colors: {
    obsidian: "#090B10",
    obsidianDeep: "#06080C",
    smokedGlass: "rgba(18, 22, 34, 0.88)",
    smokedGlassSolid: "#121622",
    elevatedPanel: "#171C2B",
    iceWhite: "#F4F7FA",
    mutedText: "#9BA7BC",
    dimText: "#68758D",
    iceBlue: "#7CAEFF",
    iceBlueSoft: "rgba(124, 174, 255, 0.14)",
    iceBlueBorder: "rgba(124, 174, 255, 0.28)",
    softGold: "#D4AF37",
    softGoldSoft: "rgba(212, 175, 55, 0.14)",
    softGoldBorder: "rgba(212, 175, 55, 0.36)",
    crimson: "#FF5C77",
    crimsonSoft: "rgba(255, 92, 119, 0.14)",
    crimsonBorder: "rgba(255, 92, 119, 0.38)",
    emerald: "#34D399",
    emeraldSoft: "rgba(52, 211, 153, 0.14)",
    emeraldBorder: "rgba(52, 211, 153, 0.36)",
    violet: "#A78BFA",
    violetSoft: "rgba(167, 139, 250, 0.14)",
    gridLine: "rgba(124, 174, 255, 0.055)",
  },
  fonts: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
  },
} as const;

export const ObsidianBackdrop: React.FC<{
  frame: number;
  goldGlow?: boolean;
}> = ({ frame, goldGlow = false }) => {
  const driftX = interpolate(frame, [0, 600], [0, 28], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: ACADEMY_THEME.colors.obsidian, overflow: "hidden" }}>
      {/* Precision architectural grid */}
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="academy-grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke={ACADEMY_THEME.colors.gridLine}
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="ice-aura" cx="22%" cy="16%" r="58%">
            <stop offset="0%" stopColor="#7CAEFF" stopOpacity="0.16" />
            <stop offset="65%" stopColor="#7CAEFF" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#090B10" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gold-aura" cx="82%" cy="80%" r="52%">
            <stop offset="0%" stopColor={goldGlow ? "#D4AF37" : "#7CAEFF"} stopOpacity="0.13" />
            <stop offset="70%" stopColor="#090B10" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#academy-grid)" />
        <rect
          width="1920"
          height="1080"
          fill="url(#ice-aura)"
          transform={`translate(${driftX * 0.4}, 0)`}
        />
        <rect width="1920" height="1080" fill="url(#gold-aura)" />
      </svg>

      {/* Top hairline */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background:
            "linear-gradient(90deg, rgba(124,174,255,0.15) 0%, #7CAEFF 35%, #D4AF37 70%, rgba(212,175,55,0.15) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const AcademySubtitleBar: React.FC<{
  cues: AcademyCaptionCue[];
  frame: number;
  showCaptions?: boolean;
}> = ({ cues, frame, showCaptions = true }) => {
  if (!showCaptions || cues.length === 0) {
    return null;
  }

  const activeCue = cues.find((cue) => frame >= cue.startFrame && frame < cue.endFrame);
  if (!activeCue) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 96,
        right: 96,
        bottom: 20,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 1480,
          backgroundColor: "rgba(9, 11, 16, 0.94)",
          border: `1px solid ${ACADEMY_THEME.colors.iceBlueBorder}`,
          borderRadius: 12,
          padding: "9px 22px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.55)",
        }}
      >
        <span
          style={{
            fontFamily: ACADEMY_THEME.fonts.mono,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: ACADEMY_THEME.colors.softGold,
            backgroundColor: ACADEMY_THEME.colors.softGoldSoft,
            border: `1px solid ${ACADEMY_THEME.colors.softGoldBorder}`,
            borderRadius: 6,
            padding: "3px 8px",
            whiteSpace: "nowrap",
          }}
        >
          {activeCue.speaker}
        </span>
        <span
          style={{
            fontFamily: ACADEMY_THEME.fonts.sans,
            fontSize: 20,
            fontWeight: 500,
            lineHeight: 1.32,
            color: ACADEMY_THEME.colors.iceWhite,
          }}
        >
          {activeCue.text}
        </span>
      </div>
    </div>
  );
};

/**
 * Persistent on-screen provenance label. Every number, score, terminal line or
 * result shown in a composition that is NOT copied from a real, cited run must
 * carry this badge (see manifest `provenance`).
 */
export const IllustrativeBadge: React.FC<{ label?: string; top?: number; right?: number }> = ({
  label = "ILLUSTRATIVE EXAMPLE · NOT OUTPUT OF A REAL LAB RUN",
  top = 18,
  right = 28,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      right,
      zIndex: 50,
      padding: "7px 16px",
      borderRadius: 999,
      backgroundColor: "rgba(9, 11, 16, 0.92)",
      border: `1.5px solid ${ACADEMY_THEME.colors.softGoldBorder}`,
      color: ACADEMY_THEME.colors.softGold,
      fontFamily: ACADEMY_THEME.fonts.mono,
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: 1,
      pointerEvents: "none",
    }}
  >
    {label}
  </div>
);
