export const ACADEMY_VIDEO_MANIFEST_SCHEMA = "starlight.academy_video_manifest.v1" as const;

export type AcademyVideoKind =
  | "trailer"
  | "concept_anatomy"
  | "terminal_lab"
  | "lab05_admission_gate"
  | "vertical_reel";

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

export interface Lab05EvalCaseRun {
  caseId: string;
  category: string;
  title: string;
  starterLatencyMs: number;
  starterCostUsd: number;
  starterSafetyPct: number;
  starterVerdict: "PASS" | "FAIL";
  starterFailureReason?: string;
  goldenLatencyMs: number;
  goldenCostUsd: number;
  goldenSafetyPct: number;
  goldenVerdict: "PASS";
}

export interface Lab05PhaseSpec {
  id: string;
  startFrame: number;
  endFrame: number;
  mode: "faulty_starter" | "surgical_fix" | "golden_admitted" | "comparison_receipt";
  badge: string;
  phaseTitle: string;
  command: string;
  exitCode: number;
  summary: string;
  diffLines?: TerminalLineSpec[];
}

export interface Lab05AdmissionGateManifest extends AcademyBaseManifest {
  kind: "lab05_admission_gate";
  labPath: string;
  labTitle: string;
  runtimeLabel: string;
  thresholds: {
    maxP95LatencyMs: number;
    maxCostUsd: number;
    requiredSafetyPct: number;
  };
  starterSummary: {
    candidateLabel: string;
    p95LatencyMs: number;
    maxCostUsd: number;
    safetyPct: number;
    passedCases: number;
    totalCases: number;
    verdict: "REJECTED";
    refusalCode: string;
  };
  goldenSummary: {
    candidateLabel: string;
    p95LatencyMs: number;
    maxCostUsd: number;
    safetyPct: number;
    passedCases: number;
    totalCases: number;
    verdict: "ADMITTED";
    receiptSchema: string;
    receiptDigest: string;
  };
  evalCases: Lab05EvalCaseRun[];
  phases: Lab05PhaseSpec[];
}

export interface VerticalReelIcpCard {
  code: string;
  label: string;
  hook: string;
  shippedProof: string;
  accent: "ice" | "emerald" | "gold" | "violet";
}

export interface AcademyVerticalReelManifest extends AcademyBaseManifest {
  kind: "vertical_reel";
  eyebrow: string;
  hookHeadline: string;
  hookSubline: string;
  statCallouts: Array<{
    metric: string;
    rule: string;
    tone: "crimson" | "ice" | "emerald" | "gold";
  }>;
  icpCards: VerticalReelIcpCard[];
  receiptBanner: {
    contract: string;
    ritualLoop: string;
    ctaPrimary: string;
    ctaUrls: string[];
  };
}

export type AnyAcademyManifest =
  | AcademyTrailerManifest
  | ConceptAnatomyManifest
  | TerminalLabManifest
  | Lab05AdmissionGateManifest
  | AcademyVerticalReelManifest;

export function assertValidAcademyManifest(manifest: AnyAcademyManifest): void {
  if (manifest.schemaVersion !== ACADEMY_VIDEO_MANIFEST_SCHEMA) {
    throw new Error(`Invalid manifest schemaVersion in ${manifest.manifestId}`);
  }
  if (manifest.fps <= 0 || manifest.durationInFrames <= 0) {
    throw new Error(`Invalid fps or durationInFrames in ${manifest.manifestId}`);
  }
  if (manifest.width <= 0 || manifest.height <= 0) {
    throw new Error(`Invalid dimensions in ${manifest.manifestId}`);
  }
  let previousEnd = 0;
  for (const cue of manifest.cues) {
    if (
      cue.startFrame < previousEnd ||
      cue.endFrame <= cue.startFrame ||
      cue.endFrame > manifest.durationInFrames
    ) {
      throw new Error(`Invalid or overlapping cue ${cue.id} in ${manifest.manifestId}`);
    }
    previousEnd = cue.endFrame;
  }
}
