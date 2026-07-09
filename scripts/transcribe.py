#!/usr/bin/env python3
"""
Local transcription script using faster-whisper for Remotion pipeline.
Outputs word-level timestamps JSON suitable for Remotion captions.

Usage:
  python scripts/transcribe.py input_video.mp4 output_transcript.json

Requires: faster-whisper installed in the Python env.
"""

import sys
import json
from pathlib import Path

try:
    from faster_whisper import WhisperModel
except ImportError:
    print("Install faster-whisper: pip install faster-whisper")
    sys.exit(1)

def transcribe(video_path: str, output_path: str = None, model_size: str = "medium"):
    video_path = Path(video_path)
    if not video_path.exists():
        print(f"Video not found: {video_path}")
        sys.exit(1)

    print(f"Loading Whisper model: {model_size} (local, CTranslate2)")
    model = WhisperModel(model_size, device="cpu", compute_type="int8")  # or "cuda" if available

    print(f"Transcribing: {video_path}")
    segments, info = model.transcribe(
        str(video_path),
        word_timestamps=True,
        beam_size=5,
    )

    words = []
    full_text = []
    for segment in segments:
        full_text.append(segment.text)
        if segment.words:
            for word in segment.words:
                words.append({
                    "word": word.word.strip(),
                    "start": word.start,
                    "end": word.end,
                    "probability": getattr(word, "probability", None),
                })

    result = {
        "video": str(video_path),
        "language": info.language,
        "duration": info.duration,
        "full_text": " ".join(full_text).strip(),
        "words": words,
        "segments": [
            {
                "start": s.start,
                "end": s.end,
                "text": s.text.strip(),
            }
            for s in segments
        ],
    }

    if output_path:
        out = Path(output_path)
    else:
        out = video_path.with_suffix(".transcript.json")

    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Transcript saved to {out}")
    print(f"Words: {len(words)} | Duration: {info.duration:.1f}s | Lang: {info.language}")
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <video.mp4> [output.json]")
        sys.exit(1)

    video = sys.argv[1]
    output = sys.argv[2] if len(sys.argv) > 2 else None
    transcribe(video, output)
