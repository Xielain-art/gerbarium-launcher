import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import got from "got";
import type {
  DistributionFile,
  DistributionManifest,
  GameUpdateResult,
} from "../../shared/distribution/manifest";

export type DistributionProgress = {
  percent: number;
  status: string;
};

export type DistributionProgressReporter = (
  progress: DistributionProgress,
) => void;

const NEVER_MANAGED_PREFIXES = [
  "saves/",
  "screenshots/",
  "logs/",
  "crash-reports/",
];

export function getDistributionManifestUrl(input?: string): string | null {
  return input?.trim() || process.env.GERBARIUM_DISTRIBUTION_URL?.trim() || null;
}

export function normalizeDistributionPath(relativePath: string): string {
  const normalized = relativePath.replaceAll("\\", "/").trim();
  if (!normalized || normalized.startsWith("/") || normalized.includes("\0")) {
    throw new Error("Invalid distribution file path");
  }
  const resolved = path.posix.normalize(normalized);
  if (resolved === "." || resolved.startsWith("../") || resolved === "..") {
    throw new Error("Distribution file path escapes game root");
  }
  return resolved;
}

export function isNeverManagedPath(relativePath: string): boolean {
  const normalized = normalizeDistributionPath(relativePath).toLowerCase();
  return NEVER_MANAGED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export async function hashFile(filePath: string): Promise<string | null> {
  try {
    const file = await fs.readFile(filePath);
    return crypto.createHash("sha256").update(file).digest("hex");
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }
    throw error;
  }
}

async function fetchManifest(manifestUrl: string): Promise<DistributionManifest> {
  const manifest = await got(manifestUrl, { timeout: { request: 30000 } }).json<
    DistributionManifest
  >();
  validateManifest(manifest);
  return manifest;
}

function validateManifest(manifest: DistributionManifest): void {
  if (manifest.schemaVersion !== 1) {
    throw new Error("Unsupported distribution manifest schema");
  }
  if (!manifest.packId.trim() || !manifest.version.trim()) {
    throw new Error("Distribution manifest metadata is invalid");
  }
  if (!Array.isArray(manifest.files)) {
    throw new Error("Distribution manifest files must be an array");
  }
}

async function downloadFile(
  file: DistributionFile,
  targetPath: string,
): Promise<void> {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  const tempPath = `${targetPath}.download`;
  await pipeline(got.stream(file.url), createWriteStream(tempPath));
  const actualHash = await hashFile(tempPath);
  if (actualHash !== file.sha256.toLowerCase()) {
    await fs.rm(tempPath, { force: true });
    throw new Error(`Hash mismatch for ${file.path}`);
  }
  await fs.rename(tempPath, targetPath);
}

async function removeObsoleteFiles(
  gameRoot: string,
  manifest: DistributionManifest,
): Promise<number> {
  let deleted = 0;
  for (const rawPath of manifest.delete ?? []) {
    const relativePath = normalizeDistributionPath(rawPath);
    if (isNeverManagedPath(relativePath)) {
      continue;
    }
    await fs.rm(path.join(gameRoot, relativePath), { force: true });
    deleted += 1;
  }
  return deleted;
}

export async function runDistributionUpdate(options: {
  gameRoot: string;
  manifestUrl?: string;
  verifyOnly?: boolean;
  reportProgress?: DistributionProgressReporter;
}): Promise<GameUpdateResult> {
  const manifestUrl = getDistributionManifestUrl(options.manifestUrl);
  if (!manifestUrl) {
    return {
      success: true,
      checked: 0,
      downloaded: 0,
      skipped: 0,
      deleted: 0,
    };
  }

  options.reportProgress?.({ percent: 1, status: "Fetching distribution..." });
  const manifest = await fetchManifest(manifestUrl);

  let checked = 0;
  let downloaded = 0;
  let skipped = 0;
  let mismatched = 0;
  const managedFiles = manifest.files.filter((file) => file.action !== "ignore");

  for (const file of managedFiles) {
    const relativePath = normalizeDistributionPath(file.path);
    if (isNeverManagedPath(relativePath)) {
      skipped += 1;
      continue;
    }

    checked += 1;
    const targetPath = path.join(options.gameRoot, relativePath);
    const localHash = await hashFile(targetPath);
    const expectedHash = file.sha256.toLowerCase();
    const isCurrent = localHash === expectedHash;
    const percent = Math.round((checked / Math.max(1, managedFiles.length)) * 90);

    if (isCurrent || (file.action === "seed" && localHash !== null)) {
      skipped += 1;
      options.reportProgress?.({
        percent,
        status: `Checked ${relativePath}`,
      });
      continue;
    }

    if (options.verifyOnly) {
      mismatched += 1;
      continue;
    }

    options.reportProgress?.({
      percent,
      status: `Downloading ${relativePath}`,
    });
    await downloadFile(file, targetPath);
    downloaded += 1;
  }

  if (options.verifyOnly && mismatched > 0) {
    return {
      success: false,
      checked,
      downloaded,
      skipped,
      deleted: 0,
      error: `Distribution verification failed: ${mismatched} file(s) missing or changed`,
    };
  }

  const deleted = options.verifyOnly
    ? 0
    : await removeObsoleteFiles(options.gameRoot, manifest);

  options.reportProgress?.({ percent: 100, status: "Distribution ready" });

  return {
    success: true,
    manifest: {
      packId: manifest.packId,
      version: manifest.version,
      channel: manifest.channel,
      minecraftVersion: manifest.minecraft.version,
    },
    checked,
    downloaded,
    skipped,
    deleted,
  };
}
