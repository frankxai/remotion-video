#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_SCHEMA = "starlight.academy_video_manifest.v1";

const EXPECTED_COMPOSITIONS = new Map([
  ["AcademyTrailer", { width: 1920, height: 1080, fps: 30, durationInFrames: 540 }],
  ["AcademyVerticalReel", { width: 1080, height: 1920, fps: 30, durationInFrames: 450 }],
  ["ConceptAnatomyExplainer", { width: 1920, height: 1080, fps: 30, durationInFrames: 600 }],
  ["ConceptAnatomyExplainer-EvalGate", { width: 1920, height: 1080, fps: 30, durationInFrames: 540 }],
  ["Lab05AdmissionGateWalkthrough", { width: 1920, height: 1080, fps: 30, durationInFrames: 900 }],
  ["TerminalLabWalkthrough", { width: 1920, height: 1080, fps: 30, durationInFrames: 540 }]
]);

const FORBIDDEN_PRIVATE_TOKENS = [
  ["starlight", "intelligence", "academy"].join("-"),
  ["agentic", "ops", "hub"].join("-"),
  ["starlight", "command"].join("-"),
  ["starlight", "private", "memory"].join("-"),
  ["starlight", "agent", "config"].join("-"),
  ["affiliate", "agent", "skills"].join("-"),
  ["claude", "code", "config"].join("-"),
  ["starlightintelligence", "ai"].join(".")
];

const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".md", ".vtt"]);

function parseVttTimestampToMs(rawTs) {
  const match = /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/.exec(rawTs.trim());
  if (!match) {
    throw new Error(`Malformed WebVTT timestamp "${rawTs}"`);
  }
  const [, hh, mm, ss, mmm] = match;
  return (
    Number(hh) * 3_600_000 +
    Number(mm) * 60_000 +
    Number(ss) * 1_000 +
    Number(mmm)
  );
}

async function collectScannableFiles(dirPath, results = []) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === "build") {
      continue;
    }
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await collectScannableFiles(fullPath, results);
    } else if (entry.isFile() && TEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

async function verifyZeroPrivateSlugs(rootDir) {
  const files = await collectScannableFiles(rootDir);
  for (const filePath of files) {
    const content = await readFile(filePath, "utf8");
    const lower = content.toLowerCase();
    for (const token of FORBIDDEN_PRIVATE_TOKENS) {
      if (lower.includes(token.toLowerCase())) {
        const rel = relative(rootDir, filePath).replace(/\\/g, "/");
        throw new Error(`Forbidden private slug/domain "${token}" detected in ${rel}`);
      }
    }
  }
  return files.length;
}

async function verifyManifestsAndWebVtt(rootDir) {
  const manifestsDir = join(rootDir, "src", "academy", "manifests");
  const captionsDir = join(rootDir, "out", "captions");
  const manifestFiles = (await readdir(manifestsDir))
    .filter((name) => name.endsWith(".json") && !name.endsWith(".schema.json"))
    .sort();

  if (manifestFiles.length !== EXPECTED_COMPOSITIONS.size) {
    throw new Error(
      `Expected ${EXPECTED_COMPOSITIONS.size} manifest JSON files in src/academy/manifests, found ${manifestFiles.length}`
    );
  }

  const seenCompositions = new Set();
  let totalCueCount = 0;

  for (const fileName of manifestFiles) {
    const manifest = JSON.parse(await readFile(join(manifestsDir, fileName), "utf8"));
    if (manifest.schemaVersion !== EXPECTED_SCHEMA) {
      throw new Error(`${fileName}: unexpected schemaVersion "${manifest.schemaVersion}"`);
    }

    const expectedSpec = EXPECTED_COMPOSITIONS.get(manifest.compositionId);
    if (!expectedSpec) {
      throw new Error(`${fileName}: unexpected compositionId "${manifest.compositionId}"`);
    }
    if (
      manifest.width !== expectedSpec.width ||
      manifest.height !== expectedSpec.height ||
      manifest.fps !== expectedSpec.fps ||
      manifest.durationInFrames !== expectedSpec.durationInFrames
    ) {
      throw new Error(
        `${fileName}: geometry mismatch (${manifest.width}x${manifest.height} @ ${manifest.fps}fps, ${manifest.durationInFrames}f)`
      );
    }

    seenCompositions.add(manifest.compositionId);

    // Cue monotonicity at frame level
    let prevEndFrame = 0;
    for (const cue of manifest.cues) {
      if (!Number.isInteger(cue.startFrame) || !Number.isInteger(cue.endFrame)) {
        throw new Error(`${fileName} (${cue.id}): non-integer frame bounds`);
      }
      if (cue.startFrame < prevEndFrame || cue.endFrame <= cue.startFrame || cue.endFrame > manifest.durationInFrames) {
        throw new Error(
          `${fileName} (${cue.id}): non-monotonic or out-of-range cue [${cue.startFrame}, ${cue.endFrame}]`
        );
      }
      prevEndFrame = cue.endFrame;
    }

    // Verify exported WebVTT file exists and has strictly monotonic timestamps
    const vttPath = join(captionsDir, `${manifest.manifestId}.vtt`);
    const vttStat = await stat(vttPath).catch(() => null);
    if (!vttStat || vttStat.size === 0) {
      throw new Error(`Missing or empty WebVTT file out/captions/${manifest.manifestId}.vtt (run export-academy-vtt.mjs first)`);
    }

    const vttRaw = await readFile(vttPath, "utf8");
    if (!vttRaw.startsWith("WEBVTT\n")) {
      throw new Error(`${manifest.manifestId}.vtt: missing WEBVTT header`);
    }

    const timingLines = vttRaw
      .split(/\r?\n/)
      .filter((line) => line.includes("-->"));

    if (timingLines.length !== manifest.cues.length) {
      throw new Error(
        `${manifest.manifestId}.vtt: expected ${manifest.cues.length} timing cues, found ${timingLines.length}`
      );
    }

    const maxDurationMs = Math.round((manifest.durationInFrames / manifest.fps) * 1000);
    let prevEndMs = 0;
    for (const timingLine of timingLines) {
      const [startRaw, endRaw] = timingLine.split("-->");
      const startMs = parseVttTimestampToMs(startRaw);
      const endMs = parseVttTimestampToMs(endRaw);
      if (startMs < prevEndMs || endMs <= startMs || endMs > maxDurationMs) {
        throw new Error(
          `${manifest.manifestId}.vtt: non-monotonic WebVTT cue "${timingLine}" (prevEndMs=${prevEndMs}, maxMs=${maxDurationMs})`
        );
      }
      prevEndMs = endMs;
    }

    totalCueCount += timingLines.length;
  }

  for (const expectedId of EXPECTED_COMPOSITIONS.keys()) {
    if (!seenCompositions.has(expectedId)) {
      throw new Error(`Missing manifest for expected Academy composition "${expectedId}"`);
    }
  }

  const indexJson = JSON.parse(await readFile(join(captionsDir, "index.json"), "utf8"));
  if (indexJson.count !== EXPECTED_COMPOSITIONS.size) {
    throw new Error(`out/captions/index.json expected count=${EXPECTED_COMPOSITIONS.size}, got ${indexJson.count}`);
  }

  return { compositionCount: seenCompositions.size, totalCueCount };
}

function verifyRemotionCompositionsCli(rootDir) {
  const isWin = process.platform === "win32";
  const result = isWin
    ? spawnSync("cmd.exe", ["/d", "/s", "/c", "npx remotion compositions src/index.ts"], {
        cwd: rootDir,
        encoding: "utf8"
      })
    : spawnSync("npx", ["remotion", "compositions", "src/index.ts"], {
        cwd: rootDir,
        encoding: "utf8"
      });

  if (result.status !== 0) {
    throw new Error(
      `npx remotion compositions src/index.ts failed with code ${result.status}:\n${result.stderr || result.stdout}`
    );
  }

  const combinedOutput = `${result.stdout}\n${result.stderr}`;
  for (const expectedId of EXPECTED_COMPOSITIONS.keys()) {
    if (!combinedOutput.includes(expectedId)) {
      throw new Error(
        `Remotion compositions output did not include expected Academy composition "${expectedId}":\n${combinedOutput}`
      );
    }
  }

  return combinedOutput;
}

async function main() {
  const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));

  const { compositionCount, totalCueCount } = await verifyManifestsAndWebVtt(rootDir);
  console.log(
    `[verify] Manifests & WebVTT OK: ${compositionCount} Academy compositions, ${totalCueCount} monotonic cues`
  );

  const scannedFiles = await verifyZeroPrivateSlugs(rootDir);
  console.log(`[verify] Public-repo safety OK: 0 private slugs/domains across ${scannedFiles} text files`);

  verifyRemotionCompositionsCli(rootDir);
  console.log("[verify] Remotion compositions CLI OK: all 6 Academy compositions registered and inspectable");
}

main().catch((error) => {
  console.error(`[verify] FAILED: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
