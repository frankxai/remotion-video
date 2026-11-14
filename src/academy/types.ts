export const ACADEMY_VIDEO_MANIFEST_SCHEMA = "starlight.academy_video_manifest.v1" as const;

export type AcademyVideoKind = "trailer" | "concept_anatomy" | "terminal_lab";

export interface AcademyCaptionCue {
  id: string;
  startFrame: number;
  endFrame: number;
  speaker: string;
  text: string;
}

export interface AcademyBaseManifest {
  schemaVersion: typeof ACADEMY_VIDEO_MANIFEST_SCHEMA;
  manifestId: string;
  compositionId: string;
  kind: AcademyVideoKind;
  fps: number;
  durationInFrames: number;
  width: number;
  height: number;
  cues: AcademyCaptionCue[];
}

export interface TrailerIcpTrack {
  id: "enterprise-architect" | "production-builder" | "technical-creator" | "workflow-operator";
  label: string;
  code: string;
  focus: string;
  artifact: string;
  accent: "ice" | "gold" | "emerald" | "violet";
}

export interface TrailerCurriculumAct {
  actCode: string;
  weeks: string;
  title: string;
  modules: string[];
  gateSummary: string;
}

export interface TrailerRedGateRow {
  gateId: string;
  label: string;
  fluencyScore: string;
  gateVerdict: "PASS" | "BLOCKED";
  releaseOutcome: "RECEIPT_ISSUED" | "REFUSED_FAIL_CLOSED";
}

export interface AcademyTrailerManifest extends AcademyBaseManifest {
  kind: "trailer";
  eyebrow: string;
  headline: string;
  subheadline: string;
  icpTracks: TrailerIcpTrack[];
  acts: TrailerCurriculumAct[];
  redGates: TrailerRedGateRow[];
  surfaceBridge: Array<{
    step: string;
    surface: string;
    urlLabel: string;
    output: string;
  }>;
}

export type ConceptPlateKind = "trust-firewall" | "context-budget" | "eval-gate";

export interface ConceptMetricChip {
  label: string;
  value: string;
  tone: "ice" | "gold" | "crimson" | "emerald";
}

export interface ConceptStageSpec {
  id: string;
  startFrame: number;
  endFrame: number;
  plateKind: ConceptPlateKind;
  calloutBadge: string;
  stageTitle: string;
  thesis: string;
  calloutBullets: string[];
  activeNodeIds: string[];
  metrics: ConceptMetricChip[];
}

export interface ConceptAnatomyManifest extends AcademyBaseManifest {
  kind: "concept_anatomy";
  moduleCode: string;
  title: string;
  subtitle: string;
  stages: ConceptStageSpec[];
}

export type TerminalLineKind =
  | "prompt"
  | "out"
  | "fail"
  | "pass"
  | "diff_del"
  | "diff_add"
  | "meta";

export interface TerminalLineSpec {
  kind: TerminalLineKind;
  text: string;
}

export interface TerminalGateStatus {
  gateId: string;
  label: string;
  status: "PASS" | "FAIL" | "PENDING";
}

export interface TerminalStepSpec {
  id: string;
  startFrame: number;
  endFrame: number;
  phase: "fault_injection" | "diff_patch" | "green_verification" | "capability_receipt";
  badge: string;
  stepTitle: string;
  command: string;
  exitCode: number;
  summaryNote: string;
  terminalLines: TerminalLineSpec[];
  gateStates: TerminalGateStatus[];
  receiptPreview?: {
    schema: string;
    missionId: string;
    artifactDigest: string;
    verdict: "VERIFIED";
    day7Transfer: string;
  };
}

export interface TerminalLabManifest extends AcademyBaseManifest {
  kind: "terminal_lab";
  labPath: string;
  labTitle: string;
  runtimeLabel: string;
  steps: TerminalStepSpec[];
}

export type AnyAcademyManifest =
  | AcademyTrailerManifest
  | ConceptAnatomyManifest
  | TerminalLabManifest;

export function assertValidAcademyManifest(manifest: AnyAcademyManifest): void {
  if (manifest.schemaVersion !== ACADEMY_VIDEO_MANIFEST_SCHEMA) {
    throw new Error(`Invalid manifest schemaVersion in ${manifest.manifestId}`);
  }
  if (manifest.fps <= 0 || manifest.durationInFrames <= 0) {
    throw new Error(`Invalid fps or durationInFrames in ${manifest.manifestId}`);
  }
  let previousEnd = 0;
  for (const cue of manifest.cues) {
    if (cue.startFrame < previousEnd || cue.endFrame <= cue.startFrame || cue.endFrame > manifest.durationInFrames) {
      throw new Error(`Invalid or overlapping cue ${cue.id} in ${manifest.manifestId}`);
    }
    previousEnd = cue.endFrame;
  }
}
