/**
 * Utilities for verifying ASAR integrity and parsing release metadata.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import log from "electron-log";
import got from "got";
import { autoUpdater } from "electron-updater";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";
import { type IntegrityCheckResult } from "../../shared/constants/ipc-chanels";

export function normalizeHexHash(value: string): string {
  return value.trim().toLowerCase();
}

export function isHexHash(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value);
}

export async function calculateFileSha256(filePath: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

export function isSimpleYamlComment(value: string): boolean {
  return value.startsWith("#");
}

export function parseSimpleYamlKeyValue(
  line: string,
): { key: string; value: string } | null {
  const separatorIndex = line.indexOf(":");
  if (separatorIndex <= 0) {
    return null;
  }

  const key = line.slice(0, separatorIndex).trim();
  if (!key) {
    return null;
  }

  let value = line.slice(separatorIndex + 1).trim();
  if (!value || isSimpleYamlComment(value)) {
    return null;
  }

  const hashCommentIndex = value.indexOf(" #");
  if (hashCommentIndex >= 0) {
    value = value.slice(0, hashCommentIndex).trim();
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  return { key, value };
}

export function extractAsarSha256FromLatestYml(content: string): string | null {
  const allowedKeys = new Set(["appAsarSha256", "asarSha256", "asar_sha256"]);

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || isSimpleYamlComment(line)) {
      continue;
    }

    const keyValue = parseSimpleYamlKeyValue(line);
    if (!keyValue || !allowedKeys.has(keyValue.key)) {
      continue;
    }

    if (isHexHash(keyValue.value)) {
      return keyValue.value;
    }
  }

  return null;
}

function getLatestYmlFilename(): string {
  if (process.platform === "darwin") {
    return "latest-mac.yml";
  }
  if (process.platform === "linux") {
    return "latest-linux.yml";
  }
  return "latest.yml";
}

const LATEST_YML_URL = `https://github.com/Xielain-art/gerbarium-releases/releases/latest/download/${getLatestYmlFilename()}`;

/**
 * Fetches the expected ASAR SHA256 hash from the latest release metadata
 */
export async function fetchExpectedAsarSha256(): Promise<string | null> {
  try {
    const latestYml = await got(LATEST_YML_URL, {
      timeout: { request: 7000 },
      retry: { limit: 1 },
    }).text();
    const expectedHash = extractAsarSha256FromLatestYml(latestYml);

    if (!expectedHash) {
      log.warn(LOG_MESSAGES.APP_LATEST_YML_MISSING_HASH);
      return null;
    }

    return expectedHash;
  } catch (error) {
    log.warn(LOG_MESSAGES.APP_LATEST_YML_FETCH_FAILED, error);
    return null;
  }
}

/**
 * Triggers a recovery update via the auto-updater
 */
export async function triggerRecoveryUpdate(): Promise<void> {
  log.info(LOG_MESSAGES.APP_RECOVERY_UPDATE_TRIGGERED);
  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    log.error(LOG_MESSAGES.APP_RECOVERY_UPDATE_FAILED, error);
  }
}

/**
 * Verifies the integrity of the app.asar file
 */
export async function verifyAsarIntegrity(
  isDev: boolean,
  resourcesPath: string,
): Promise<IntegrityCheckResult> {
  if (isDev) {
    return {
      ok: true,
      status: "skipped",
      message: "Integrity check is skipped in development mode.",
    };
  }

  const expectedHashRaw = await fetchExpectedAsarSha256();
  if (!expectedHashRaw || !isHexHash(expectedHashRaw)) {
    log.warn(LOG_MESSAGES.APP_EXPECTED_HASH_INVALID);
    return {
      ok: true,
      status: "offline",
      message: "Unable to fetch hash from latest.yml (offline or missing key).",
    };
  }

  const asarPath = path.join(resourcesPath, "app.asar");
  try {
    await fsPromises.access(asarPath, fs.constants.F_OK);
  } catch {
    log.warn(LOG_MESSAGES.APP_ASAR_NOT_FOUND, asarPath);
    return {
      ok: true,
      status: "skipped",
      message: "app.asar is not present in current runtime.",
    };
  }

  try {
    const expectedHash = normalizeHexHash(expectedHashRaw);
    const actualHash = normalizeHexHash(await calculateFileSha256(asarPath));
    if (actualHash === expectedHash) {
      log.info(LOG_MESSAGES.APP_ASAR_INTEGRITY_OK);
      return {
        ok: true,
        status: "ok",
        message: "ASAR integrity check passed.",
        expectedHash,
        actualHash,
      };
    }

    log.warn(LOG_MESSAGES.APP_ASAR_INTEGRITY_MISMATCH, {
      expectedHash,
      actualHash,
    });
    await triggerRecoveryUpdate();
    return {
      ok: false,
      status: "mismatch",
      message:
        "ASAR integrity mismatch detected. Recovery update was triggered.",
      expectedHash,
      actualHash,
    };
  } catch (error) {
    log.error(LOG_MESSAGES.APP_ASAR_INTEGRITY_FAILED, error);
    return {
      ok: false,
      status: "error",
      message:
        error instanceof Error ? error.message : "Unknown integrity check error",
    };
  }
}
