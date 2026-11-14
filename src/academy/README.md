# Academy Educational Video Pack (`src/academy/`)

Deterministic, manifest-parameterized `1920x1080` (`16:9`) Remotion compositions for **Starlight Intelligence Academy (SIA)** and **AI Architect Academy (AAA)**.

## Registered Compositions (`src/Root.tsx`)

| Composition ID | Component | Default Manifest | Spec |
|---|---|---|---|
| `AcademyTrailer` | `AcademyTrailer.tsx` | `manifests/academy-trailer.manifest.json` | `1920x1080` · `30fps` · `540f` (`18s`) — 4-ICP matrix, 12-week 3-act spine, non-compensable red-gates, capability receipt seal |
| `ConceptAnatomyExplainer` | `ConceptAnatomyExplainer.tsx` | `manifests/concept-trust-firewall.manifest.json` | `1920x1080` · `30fps` · `600f` (`20s`) — Signaled SVG plates for `T0/T3` Trust Firewall, Context Budget, and Eval Admission |
| `ConceptAnatomyExplainer-EvalGate` | `ConceptAnatomyExplainer.tsx` | `manifests/concept-eval-admission-gate.manifest.json` | `1920x1080` · `30fps` · `540f` (`18s`) — Deep dive on non-compensable golden eval admission & digest-bound receipts |
| `TerminalLabWalkthrough` | `TerminalLabWalkthrough.tsx` | `manifests/terminal-lab-walkthrough.manifest.json` | `1920x1080` · `30fps` · `540f` (`18s`) — Offline CLI fault-injection failure, surgical diff patch, green `unittest` run, and receipt verification |

## Design & Accessibility Invariants

- **Palette:** Obsidian `#090B10`, smoked glass `#121622`, ice white `#F4F7FA`, ice blue `#7CAEFF`, soft gold `#D4AF37`, crimson red-gate `#FF5C77`, emerald verified `#34D399`.
- **Mayer Signaling:** Inactive SVG architecture nodes dim cleanly (`opacity: 0.34–0.35`) while active stage nodes illuminate with code-rendered metrics and zero decorative clutter.
- **Synchronized WebVTT Subtitles:** Every manifest defines integer frame boundaries (`startFrame` / `endFrame`) exported deterministically to `out/captions/*.vtt`.

## Commands

```bash
# Typecheck
npx tsc --noEmit

# List all registered compositions
npx remotion compositions src/index.ts

# Export synchronized WebVTT files into out/captions/
node scripts/export-academy-vtt.mjs

# Render mid-frame proof stills
npx remotion still src/index.ts AcademyTrailer out/academy-trailer-frame.png --frame=270
npx remotion still src/index.ts ConceptAnatomyExplainer out/concept-explainer-frame.png --frame=300
npx remotion still src/index.ts TerminalLabWalkthrough out/terminal-lab-frame.png --frame=320
```
