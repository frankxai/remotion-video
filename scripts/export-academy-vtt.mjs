#!/usr/bin/env node
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_SCHEMA = "starlight.academy_video_manifest.v1";

function formatVttTimestamp(seconds) {
  const totalMillis = Math.round(seconds * 1000);
  const hours = Math.floor(totalMillis / 3_600_000);
  const minutes = Math.floor((totalMillis % 3_600_000) / 60_000);
  const secs = Math.floor((totalMillis % 60_000) / 1000);
  const millis = totalMillis % 1000;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  const mmm = String(millis).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${mmm}`;
}

function validateManifest(manifest, fileName) {
  if (!manifest || typeof manifest !== "object") {
    throw new Error(`${fileName}: manifest must be a JSON object`);
  }
  if (manifest.schemaVersion !== EXPECTED_SCHEMA) {
    throw new Error(`${fileName}: expected schemaVersion="${EXPECTED_SCHEMA}"`);
  }
  if (typeof manifest.manifestId !== "string" || manifest.manifestId.length < 3) {
    throw new Error(`${fileName}: missing valid manifestId`);
  }
  if (typeof manifest.compositionId !== "string" || manifest.compositionId.length < 3) {
    throw new Error(`${fileName}: missing valid compositionId`);
  }
  if (!Number.isInteger(manifest.fps) || manifest.fps <= 0) {
    throw new Error(`${fileName}: fps must be a positive integer`);
  }
  if (!Number.isInteger(manifest.durationInFrames) || manifest.durationInFrames <= 0) {
    throw new Error(`${fileName}: durationInFrames must be a positive integer`);
  }
  if (!Array.isArray(manifest.cues) || manifest.cues.length === 0) {
    throw new Error(`${fileName}: cues must be a non-empty array`);
  }

  let previousEndFrame = 0;
  for (const cue of manifest.cues) {
    if (typeof cue.id !== "string" || cue.id.trim().length === 0) {
      throw new Error(`${fileName}: cue missing id`);
    }
    if (!Number.isInteger(cue.startFrame) || !Number.isInteger(cue.endFrame)) {
      throw new Error(`${fileName} (${cue.id}): startFrame and endFrame must be integers`);
    }
    if (cue.startFrame < previousEndFrame) {
      throw new Error(
        `${fileName} (${cue.id}): startFrame ${cue.startFrame} overlaps previous endFrame ${previousEndFrame}`
      );
    }
    if (cue.endFrame <= cue.startFrame || cue.endFrame > manifest.durationInFrames) {
      throw new Error(
        `${fileName} (${cue.id}): cue range [${cue.startFrame}, ${cue.endFrame}] exceeds [0, ${manifest.durationInFrames}]`
      );
    }
    if (typeof cue.speaker !== "string" || cue.speaker.trim().length === 0) {
      throw new Error(`${fileName} (${cue.id}): speaker must be non-empty`);
    }
    if (typeof cue.text !== "string" || cue.text.trim().length === 0) {
      throw new Error(`${fileName} (${cue.id}): text must be non-empty`);
    }
    previousEndFrame = cue.endFrame;
  }
}

function renderWebVtt(manifest) {
  const lines = [
    "WEBVTT",
    "",
    `NOTE`,
    `schema=${manifest.schemaVersion}`,
    `manifestId=${manifest.manifestId}`,
    `compositionId=${manifest.compositionId}`,
    `fps=${manifest.fps}`,
    `durationInFrames=${manifest.durationInFrames}`,
    ""
  ];

  for (const cue of manifest.cues) {
    const startTs = formatVttTimestamp(cue.startFrame / manifest.fps);
    const endTs = formatVttTimestamp(cue.endFrame / manifest.fps);
    const cleanText = cue.text.replace(/\r?\n/g, " ").trim();
    lines.push(cue.id);
    lines.push(`${startTs} --> ${endTs}`);
    lines.push(`<v ${cue.speaker.trim()}>${cleanText}`);
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

async function main() {
  const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
  const manifestsDir = join(rootDir, "src", "academy", "manifests");
  const outputDir = join(rootDir, "out", "captions");

  await mkdir(outputDir, { recursive: true });

  const entries = (await readdir(manifestsDir))
    .filter((file) => file.endsWith(".manifest.json"))
    .sort();

  if (entries.length < 3) {
    throw new Error(`Expected at least 3 academy manifests in ${manifestsDir}, found ${entries.length}`);
  }

  const exported = [];
  for (const entry of entries) {
    const raw = await readFile(join(manifestsDir, entry), "utf8");
    const manifest = JSON.parse(raw);
    validateManifest(manifest, entry);

    const vttContent = renderWebVtt(manifest);
    const vttFileName = `${manifest.manifestId}.vtt`;
    const vttPath = join(outputDir, vttFileName);
    await writeFile(vttPath, vttContent, "utf8");

    exported.push({
      manifestFile: `src/academy/manifests/${entry}`,
      manifestId: manifest.manifestId,
      compositionId: manifest.compositionId,
      fps: manifest.fps,
      durationInFrames: manifest.durationInFrames,
      durationSeconds: Number((manifest.durationInFrames / manifest.fps).toFixed(3)),
      cueCount: manifest.cues.length,
      vttOutput: `out/captions/${vttFileName}`
    });
  }

  const indexPayload = {
    schema: "starlight.academy_vtt_export_index.v1",
    count: exported.length,
    captions: exported
  };
  await writeFile(join(outputDir, "index.json"), `${JSON.stringify(indexPayload, null, 2)}\n`, "utf8");

  for (const item of exported) {
    console.log(
      `[vtt] ${item.compositionId} (${item.manifestId}) -> ${item.vttOutput} (${item.cueCount} cues, ${item.durationSeconds}s @ ${item.fps}fps)`
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
