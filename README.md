# video-remotion — Hermes-Powered Claude + Remotion Video Factory

Sovereign, local-first short-form video production system. Absorbs the Altari "Claude + Remotion Skill" and makes it dramatically better using the full GenCreator/Hermes/Arcanea/Starlight ecosystem.

## GitHub Repository

**Primary / canonical source**: https://github.com/frankxai/remotion-video

This is the home for the complete upgraded guide (REMOTION_AGENT_SKILL.md + all prompts/workflows), starter project, compositions, scripts, and documentation. The Hermes skill links here.

## What It Does
- Drop raw recording (ideally with deliberate black squares for motion graphics placeholders).
- Local faster-whisper transcription (word-level timestamps).
- Hermes + Claude agents generate storyboards, motion graphics specs, hook variants.
- High-quality Remotion (React) compositions render to perfect 1080x1920 vertical MP4s.
- A/B test hooks as separate renders.
- Full brand consistency and creative tool integration.
- Everything logged in MD, versionable, agent-orchestratable.

## Quick Start (Setup Already Performed)
```bash
cd ~/video-remotion

# Preview
npm run dev

# List compositions
npx remotion compositions src/index.ts

# Render example
npm run render:props

# A/B hooks example
npm run render:hook

# Transcribe a video (requires faster-whisper in your Python env)
python scripts/transcribe.py /path/to/raw/reel.mp4
```

See `src/Root.tsx` for the starter VerticalReel composition (customize/extend).

See `REMOTION_AGENT_SKILL.md` for the knowledge file to feed Claude / our coding agents.

## Project Structure
- `src/` — Remotion compositions (Root.tsx + index.ts)
- `scripts/transcribe.py` — Local word-level transcription
- `out/` — Renders
- `REMOTION_AGENT_SKILL.md` — Prompt/knowledge base for agents
- (Add your raw/, transcripts/, compositions/, renders/, assets/ as needed)

## Integration with Hermes Skills
Load `remotion-video` (now in Hermes creative skills) + `frontend-ultimate`, `coding-agents`, `claude-code`, `brand-image-system`, `manim-video`, `comfyui`, `suno-e2e-workflow`, etc.

Full details and superior prompts in the Hermes skill:
`hermes skills` or directly at `~/.hermes/skills/creative/remotion-video/SKILL.md` (or equivalent in your profile).

## Why Superior to Original
- Local & free (your FFmpeg + faster-whisper + Remotion).
- Deep ecosystem integration (brands, multi-agent, creative tools, cron/kanban/MD logging).
- Self-improving via our skills and swarm.
- Production taste from frontend-ultimate + design systems.
- Ready for full pipelines (assets, music, distribution).

## Next Steps / Evolution
- Add real caption component using @remotion/captions + transcript data.
- Wire black-square detection or vision analysis.
- Cron watcher for raw/ folder.
- Brand-specific composition library.
- Integrate with GenCreator kanban or 6-pillar workflows.
- Extend hyperframes experiments for hybrid approaches.

Built by Hermes Agent for Frank Riemer / GenCreator.ai — July 2026.
