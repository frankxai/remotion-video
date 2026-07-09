# Remotion Agent Skill (Knowledge File for Claude / Hermes Agents)

This is an upgraded, Hermes-aware version of the "Remotion skill" referenced in Altari and community guides.

Use this as system knowledge / .md memory when generating Remotion code.

## Core Principles
- Remotion = React for video. Time is a first-class variable. Everything is code (versionable, generative, templateable).
- Compositions are React components registered with <Composition id=... component=... durationInFrames=... fps=... width=1080 height=1920 /> for vertical reels.
- Use AbsoluteFill for layers.
- Timing: useCurrentFrame() + useVideoConfig() (fps, durationInFrames).
- Animations: interpolate(frame, [from, to], [valFrom, valTo]), spring(), delayRender if async assets.
- Sequences for timed sections: <Sequence from={startFrame} durationInFrames={len}>...</Sequence>
- For captions: prefer word-level timestamps from Whisper. Map word.start * fps to frames. Highlight active word.
- @remotion/captions package available for helpers (import and use).
- Performance: Keep components lightweight. Avoid heavy work in render.
- Vertical 1080x1920 standard for shorts/reels. Safe margins: keep important content away from edges.
- Brand & taste: Reference Linear/Vercel/Stripe/Apple/Notion precision + the specific brand pack (colors, typography, motion feel). No slop.

## Common Patterns
- Title hook: Fade/scale in early frames.
- Body: Talking head or b-roll background (use video src if overlaid, or separate comp).
- Captions: Bottom or dynamic position. Bold white with shadow or accent highlight on current word. Reposition if needed based on content (describe in storyboard).
- Motion graphics: Dedicated zones. Animate shapes, text, icons with interpolate/spring. For complex, reference Lottie or pre-rendered manim video.
- Black square fills: Treat designated areas as slots for animated overlays synced to speech gaps.
- Hooks/A/B: Multiple compositions or prop-driven (different title + first Sequence).

## Prompting Rules for Best Results
- Be extremely specific: exact timings in seconds/frames, fonts (Inter, system), sizes, colors (use hex or brand vars), positions (px or %), easing.
- Provide word-level transcript with start/end.
- Link visuals to audio content (e.g., "on the word 'scale', scale up the graphic").
- For variants: generate separate compositions or clear prop sets.
- Always output complete, runnable TSX that registers in Root.

## Example Structure (adapt)
```tsx
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const MyReel: React.FC<{title: string; words: Array<{word:string; start:number; end:number}>}> = ({title, words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Example active word logic
  const currentTime = frame / fps;
  const activeWord = words.find(w => currentTime >= w.start && currentTime <= w.end);

  return (
    <AbsoluteFill style={{backgroundColor: '#0a0a0a'}}>
      {/* layers */}
      <Sequence from={0} durationInFrames={90}>
        <h1>{title}</h1>
      </Sequence>

      {/* captions */}
      <div style={{position:'absolute', bottom: 120}}>
        {words.map((w, i) => (
          <span key={i} style={{color: currentTime >= w.start ? '#fff' : '#888'}}>
            {w.word}{' '}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
```

## Integration Notes for Hermes
- Generate code via frontend-ultimate + coding-agents or claude-code delegation.
- Feed exact transcript JSON from local faster-whisper.
- Use brand-image-system runtime contracts for colors/motion.
- Log storyboard + code + render command in MD.
- Extend with manim-video exports or comfyui assets.

This skill makes Claude (or Hermes sub-agents) a reliable Remotion expert. Combine with our superior prompts in the remotion-video skill.
