import React from 'react';
import {
  Composition,
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { Captions, Word } from './Captions';
import {
  AcademyTrailer,
  AcademyVerticalReel,
  ConceptAnatomyExplainer,
  Lab05AdmissionGateWalkthrough,
  TerminalLabWalkthrough,
  AcademyTrailerManifest,
  AcademyVerticalReelManifest,
  ConceptAnatomyManifest,
  Lab05AdmissionGateManifest,
  TerminalLabManifest,
  assertValidAcademyManifest,
} from './academy';
import academyTrailerManifestJson from './academy/manifests/academy-trailer.manifest.json';
import academyVerticalReelManifestJson from './academy/manifests/academy-vertical-reel.json';
import conceptFirewallManifestJson from './academy/manifests/concept-trust-firewall.manifest.json';
import conceptEvalGateManifestJson from './academy/manifests/concept-eval-admission-gate.manifest.json';
import lab05AdmissionGateManifestJson from './academy/manifests/lab-05-admission-gate.json';
import terminalLabManifestJson from './academy/manifests/terminal-lab-walkthrough.manifest.json';

// Enhanced Vertical Reel with REAL word-level captions
// Inspired by Altari guide + upgraded for Hermes
// - Accepts optional `captions` (word-level from Whisper/faster-whisper)
// - Placeholder zone for motion graphics (black square concept)
// - Clean, brandable styling

export type VerticalReelProps = {
  title?: string;
  subtitle?: string;
  bgColor?: string;
  accentColor?: string;
  durationInSeconds?: number;
  captions?: Word[];           // Real timed captions from transcription
  captionBottom?: number;      // Padding from bottom for captions
};

export const VerticalReel: React.FC<VerticalReelProps> = ({
  title = "Hook: The problem with video editing",
  subtitle = "It doesn't scale. Let Claude + Remotion do the work.",
  bgColor = "#0a0a0a",
  accentColor = "#6366f1",
  durationInSeconds = 15,
  captions = [],
  captionBottom = 120,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps; // seconds for caption sync

  // Title animation (kept for visual interest)
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 30], [50, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      {/* Main content area (talking head / primary visuals) */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            marginBottom: 20,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: 36,
            color: "#aaa",
            textAlign: "center",
            maxWidth: "80%",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          {subtitle}
        </p>

        {/* Black square / motion graphics placeholder zone */}
        <div
          style={{
            marginTop: 80,
            width: 420,
            height: 320,
            border: `4px dashed ${accentColor}`,
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accentColor,
            fontSize: 22,
            fontWeight: 600,
            textAlign: "center",
            backgroundColor: "rgba(99, 102, 241, 0.05)",
          }}
        >
          MOTION GRAPHICS ZONE<br />
          (Claude / manim / Lottie fills this)
        </div>
      </AbsoluteFill>

      {/* Real word-level captions (bottom safe area) */}
      {captions.length > 0 && (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            paddingBottom: captionBottom,
            paddingLeft: 60,
            paddingRight: 60,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.75)",
              padding: "18px 32px",
              borderRadius: 16,
              textAlign: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            <Captions
              words={captions}
              currentTime={currentTime}
            />
          </div>
        </AbsoluteFill>
      )}

      {/* Fallback static caption when no real data */}
      {captions.length === 0 && (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            paddingBottom: captionBottom,
            paddingLeft: 60,
            paddingRight: 60,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              padding: "12px 24px",
              borderRadius: 12,
              textAlign: "center",
            }}
          >
            <span style={{ color: "white", fontSize: 28, fontWeight: 600 }}>
              Sample word-by-word caption will go here
            </span>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => {
  // Example captions loaded from transcript (in real use, pass from props or import JSON)
  const exampleCaptions: Word[] = [
    { word: "The", start: 0.0, end: 0.4 },
    { word: "problem", start: 0.4, end: 0.9 },
    { word: "with", start: 0.9, end: 1.2 },
    { word: "manual", start: 1.2, end: 1.7 },
    { word: "video", start: 1.7, end: 2.1 },
    { word: "editing", start: 2.1, end: 2.6 },
    { word: "is", start: 2.8, end: 3.0 },
    { word: "it", start: 3.0, end: 3.2 },
    { word: "doesn't", start: 3.2, end: 3.7 },
    { word: "scale", start: 3.7, end: 4.3 },
    { word: "Claude", start: 5.0, end: 5.5 },
    { word: "plus", start: 5.5, end: 5.9 },
    { word: "Remotion", start: 5.9, end: 6.6 },
    { word: "changes", start: 6.8, end: 7.3 },
    { word: "everything", start: 7.3, end: 8.0 },
  ];

  return (
    <>
      <Composition
        id="VerticalReel"
        component={VerticalReel}
        durationInFrames={30 * 15} // 15 seconds @ 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: "Hook: The problem with video editing",
          subtitle: "It doesn't scale. Let Claude + Remotion do the work.",
          bgColor: "#0a0a0a",
          accentColor: "#6366f1",
          captions: exampleCaptions,
        }}
      />

      {/* Hook A example (different title, same body) */}
      <Composition
        id="VerticalReel-HookA"
        component={VerticalReel}
        durationInFrames={30 * 15}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: "Stop wasting hours editing",
          subtitle: "AI + code = unlimited short-form at scale",
          bgColor: "#0a0a0a",
          accentColor: "#22c55e",
          captions: exampleCaptions,
        }}
      />

      {/* Starlight Intelligence Academy × AI Architect Academy Pack */}
      {(() => {
        const trailerManifest = academyTrailerManifestJson as AcademyTrailerManifest;
        const verticalReelManifest = academyVerticalReelManifestJson as AcademyVerticalReelManifest;
        const firewallManifest = conceptFirewallManifestJson as ConceptAnatomyManifest;
        const evalGateManifest = conceptEvalGateManifestJson as ConceptAnatomyManifest;
        const lab05Manifest = lab05AdmissionGateManifestJson as Lab05AdmissionGateManifest;
        const labManifest = terminalLabManifestJson as TerminalLabManifest;

        assertValidAcademyManifest(trailerManifest);
        assertValidAcademyManifest(verticalReelManifest);
        assertValidAcademyManifest(firewallManifest);
        assertValidAcademyManifest(evalGateManifest);
        assertValidAcademyManifest(lab05Manifest);
        assertValidAcademyManifest(labManifest);

        return (
          <>
            <Composition
              id="AcademyTrailer"
              component={AcademyTrailer}
              durationInFrames={trailerManifest.durationInFrames}
              fps={trailerManifest.fps}
              width={trailerManifest.width}
              height={trailerManifest.height}
              defaultProps={{
                manifest: trailerManifest,
                showCaptions: true,
              }}
            />

            <Composition
              id="AcademyVerticalReel"
              component={AcademyVerticalReel}
              durationInFrames={verticalReelManifest.durationInFrames}
              fps={verticalReelManifest.fps}
              width={verticalReelManifest.width}
              height={verticalReelManifest.height}
              defaultProps={{
                manifest: verticalReelManifest,
                showCaptions: true,
              }}
            />

            <Composition
              id="ConceptAnatomyExplainer"
              component={ConceptAnatomyExplainer}
              durationInFrames={firewallManifest.durationInFrames}
              fps={firewallManifest.fps}
              width={firewallManifest.width}
              height={firewallManifest.height}
              defaultProps={{
                manifest: firewallManifest,
                showCaptions: true,
              }}
            />

            <Composition
              id="ConceptAnatomyExplainer-EvalGate"
              component={ConceptAnatomyExplainer}
              durationInFrames={evalGateManifest.durationInFrames}
              fps={evalGateManifest.fps}
              width={evalGateManifest.width}
              height={evalGateManifest.height}
              defaultProps={{
                manifest: evalGateManifest,
                showCaptions: true,
              }}
            />

            <Composition
              id="TerminalLabWalkthrough"
              component={TerminalLabWalkthrough}
              durationInFrames={labManifest.durationInFrames}
              fps={labManifest.fps}
              width={labManifest.width}
              height={labManifest.height}
              defaultProps={{
                manifest: labManifest,
                showCaptions: true,
              }}
            />

            <Composition
              id="Lab05AdmissionGateWalkthrough"
              component={Lab05AdmissionGateWalkthrough}
              durationInFrames={lab05Manifest.durationInFrames}
              fps={lab05Manifest.fps}
              width={lab05Manifest.width}
              height={lab05Manifest.height}
              defaultProps={{
                manifest: lab05Manifest,
                showCaptions: true,
              }}
            />
          </>
        );
      })()}
    </>
  );
};
