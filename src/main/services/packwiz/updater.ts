import fs from "node:fs/promises";
import path from "node:path";
import log from "electron-log";
import type { GameUpdateResult } from "../../../shared/distribution/manifest";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import { assertSupportedHashFormat, computeFileHash, normalizeHash } from "./hash";
import { downloadToFile, fetchText } from "./downloader";
import { parseIndexToml, parseModMetafileToml, parsePackToml } from "./parser";
import type { PackwizIndexFile, PackwizResolvedFile } from "./types";

const SAFE_MANAGED_PREFIXES = [
  "mods/",
  "config/gerbarium-managed/",
  "resourcepacks/gerbarium-managed/",
  "shaderpacks/gerbarium-managed/",
];

type UpdateProgressReporter = (progress: { percent: number; status: string }) => void;

export type PackwizUpdateOptions = {
  gameRoot: string;
  packUrl: string;
  verifyOnly?: boolean;
  cleanUnknownMods?: boolean;
  downloadConcurrency?: number;
  reportProgress?: UpdateProgressReporter;
};

function normalizeRelativePath(relativePath: string): string {
  const normalized = relativePath.replaceAll("\\", "/").trim();
  if (!normalized || normalized.startsWith("/") || normalized.includes("\0")) {
    throw new Error(`Invalid path: ${relativePath}`);
  }
  const resolved = path.posix.normalize(normalized);
  if (resolved === "." || resolved === ".." || resolved.startsWith("../")) {
    throw new Error(`Path escapes root: ${relativePath}`);
  }
  return resolved;
}

function canCleanupPath(relativePath: string): boolean {
  const lower = relativePath.toLowerCase();
  return SAFE_MANAGED_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

function resolveUrl(base: string, relativeOrAbsolute: string): string {
  return new URL(relativeOrAbsolute, base).toString();
}

async function resolveExpectedFile(
  indexFile: PackwizIndexFile,
  packBaseUrl: string,
): Promise<PackwizResolvedFile | null> {
  const entryPath = normalizeRelativePath(indexFile.file);
  if (!indexFile.metafile) {
    const hash = indexFile.hash?.trim();
    if (!hash) {
      throw new Error(`index.toml missing hash for ${entryPath}`);
    }
    const hashFormat = assertSupportedHashFormat(indexFile.hashFormat ?? "sha256");
    return {
      localPath: entryPath,
      displayPath: entryPath,
      downloadUrl: resolveUrl(packBaseUrl, entryPath),
      hash: normalizeHash(hash),
      hashFormat,
      source: "index",
    };
  }

  const metaUrl = resolveUrl(packBaseUrl, entryPath);
  const metaToml = await fetchText(metaUrl);
  const meta = parseModMetafileToml(metaToml);
  const side = meta.side ?? "both";
  if (side === "server") {
    return null;
  }

  const filename = meta.filename?.trim();
  if (!filename) {
    throw new Error(`Metafile ${entryPath} missing filename`);
  }
  const downloadUrl = meta.download?.url?.trim();
  const hash = meta.download?.hash?.trim();
  if (!downloadUrl) {
    throw new Error(`Metafile ${entryPath} missing download.url`);
  }
  if (!hash) {
    throw new Error(`Metafile ${entryPath} missing download.hash`);
  }

  const hashFormat = assertSupportedHashFormat(meta.download?.hashFormat ?? "sha256");
  const localPath = normalizeRelativePath(path.posix.join(path.posix.dirname(entryPath), filename));
  return {
    localPath,
    displayPath: filename,
    downloadUrl: resolveUrl(metaUrl, downloadUrl),
    hash: normalizeHash(hash),
    hashFormat,
    source: "metafile",
  };
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  task: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const workers = Array.from({ length: Math.max(1, limit) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await task(items[index] as T, index);
    }
  });
  await Promise.all(workers);
}

async function cleanupUnknownMods(
  gameRoot: string,
  expectedPaths: Set<string>,
): Promise<number> {
  const modsPath = path.join(gameRoot, "mods");
  let entries: string[];
  try {
    entries = await fs.readdir(modsPath);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return 0;
    }
    throw error;
  }

  let removed = 0;
  for (const entry of entries) {
    if (!entry.toLowerCase().endsWith(".jar")) {
      continue;
    }
    const rel = normalizeRelativePath(path.posix.join("mods", entry));
    if (expectedPaths.has(rel)) {
      continue;
    }
    await fs.rm(path.join(gameRoot, rel), { force: true });
    removed += 1;
  }
  return removed;
}

export async function runPackwizUpdate(options: PackwizUpdateOptions): Promise<GameUpdateResult> {
  const packUrl = options.packUrl.trim();
  if (!packUrl) {
    return { success: true, checked: 0, downloaded: 0, skipped: 0, deleted: 0 };
  }

  options.reportProgress?.({ percent: 2, status: "Fetching modpack metadata..." });
  const packToml = await fetchText(packUrl);
  const pack = parsePackToml(packToml);
  const indexUrl = resolveUrl(packUrl, pack.index.file);
  const indexToml = await fetchText(indexUrl);
  const index = parseIndexToml(indexToml);
  if (index.hashFormat) {
    assertSupportedHashFormat(index.hashFormat);
  }

  const packBaseUrl = packUrl.replace(/[^/]+$/, "");
  const expectedFiles: PackwizResolvedFile[] = [];
  for (const fileEntry of index.files) {
    try {
      const resolved = await resolveExpectedFile(fileEntry, packBaseUrl);
      if (resolved) {
        expectedFiles.push(resolved);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown file resolution error";
      log.error("[PACKWIZ] Failed to resolve file entry", { file: fileEntry.file, error: message });
      return {
        success: false,
        checked: 0,
        downloaded: 0,
        skipped: 0,
        deleted: 0,
        error: `Failed to resolve ${fileEntry.file}: ${message}`,
      };
    }
  }

  log.info("[PACKWIZ] Update start", {
    packUrl,
    packName: pack.name ?? "unknown",
    packVersion: pack.version ?? "unknown",
    files: expectedFiles.length,
  });

  let checked = 0;
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  const failures: string[] = [];
  const expectedPaths = new Set(expectedFiles.map((file) => normalizeRelativePath(file.localPath)));

  options.reportProgress?.({ percent: 8, status: "Checking files..." });
  await runWithConcurrency(
    expectedFiles,
    Math.max(1, options.downloadConcurrency ?? 4),
    async (file, indexPosition) => {
      checked += 1;
      const localPath = path.join(options.gameRoot, file.localPath);
      const localHash = await computeFileHash(localPath, file.hashFormat);
      if (localHash === file.hash) {
        skipped += 1;
        return;
      }
      if (options.verifyOnly) {
        failed += 1;
        failures.push(`Mismatch: ${file.localPath}`);
        return;
      }

      const progress = 10 + Math.round(((indexPosition + 1) / Math.max(1, expectedFiles.length)) * 80);
      options.reportProgress?.({ percent: progress, status: `Downloading ${file.displayPath}` });
      try {
        await downloadToFile(file.downloadUrl, localPath);
        options.reportProgress?.({ percent: Math.min(99, progress + 1), status: `Verifying ${file.displayPath}` });
        const downloadedHash = await computeFileHash(localPath, file.hashFormat);
        if (downloadedHash !== file.hash) {
          await fs.rm(localPath, { force: true });
          throw new Error(`Hash mismatch after download: ${file.localPath}`);
        }
        downloaded += 1;
      } catch (error: unknown) {
        failed += 1;
        const message = error instanceof Error ? error.message : "Unknown download error";
        failures.push(`${file.localPath}: ${message}`);
        await fs.rm(`${localPath}.download`, { force: true }).catch(() => undefined);
      }
    },
  );

  if (failed > 0) {
    const error = `Packwiz update failed (${failed} file(s)): ${failures[0]}`;
    log.error(LOG_MESSAGES.GAME_DISTRIBUTION_UPDATE_FAILED, { error, failures });
    return { success: false, checked, downloaded, skipped, deleted: 0, error };
  }

  let deleted = 0;
  if (!options.verifyOnly) {
    options.reportProgress?.({ percent: 95, status: "Cleaning old files..." });
    if (options.cleanUnknownMods) {
      deleted += await cleanupUnknownMods(options.gameRoot, expectedPaths);
    }

    for (const expectedPath of expectedPaths) {
      if (!canCleanupPath(expectedPath)) {
        continue;
      }
      // conservative policy: manage only expected files; no blind recursive deletion
    }
  }

  options.reportProgress?.({ percent: 100, status: "Ready to launch" });
  return {
    success: true,
    manifest: {
      packId: pack.name ?? "packwiz-client",
      version: pack.version ?? "unknown",
      channel: "packwiz",
      minecraftVersion: pack.versions?.minecraft ?? "unknown",
    },
    checked,
    downloaded,
    skipped,
    deleted,
  };
}
