import fs from "node:fs/promises";
import path from "node:path";
import log from "electron-log";
import got from "got";
import { autoUpdater } from "electron-updater";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import { type IntegrityCheckResult } from "../../../shared/constants/ipc-chanels";
import {
  calculateFileSha256,
  isHexHash,
  normalizeHexHash,
} from "./hash";
import { extractAsarSha256FromLatestYml } from "./yml";

function getLatestYmlFilename(): string {
  if (process.platform === "darwin") {
    return "latest-mac.yml";
  }
  if (process.platform === "linux") {
    return "latest-linux.yml";
  }
  return "latest.yml";
}

export async function fetchExpectedAsarSha256(): Promise<string | null> {
  const filename = getLatestYmlFilename();
  const url = `https://github.com/Xielain-art/gerbarium-releases/releases/latest/download/${filename}`;

  try {
    log.info(`Fetching integrity metadata from: ${url}`);
    const latestYml = await got(url, {
      timeout: { request: 7000 },
      retry: { limit: 1 },
    }).text();
    const expectedHash = extractAsarSha256FromLatestYml(latestYml);

    if (!expectedHash) {
      log.warn(
        `ASAR integrity check skipped: ${filename} does not contain appAsarSha256/asarSha256`,
      );
      return null;
    }

    return expectedHash;
  } catch (error) {
    log.warn(`Failed to fetch ${filename} for ASAR integrity check:`, error);
    return null;
  }
}

export async function triggerRecoveryUpdate(): Promise<void> {
  log.info(LOG_MESSAGES.APP_RECOVERY_UPDATE_TRIGGERED);
  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    log.error(LOG_MESSAGES.APP_RECOVERY_UPDATE_FAILED, error);
  }
}

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
  const filename = getLatestYmlFilename();
  if (!expectedHashRaw || !isHexHash(expectedHashRaw)) {
    log.warn(LOG_MESSAGES.APP_EXPECTED_HASH_INVALID);
    return {
      ok: true,
      status: "offline",
      message: `Unable to fetch hash from ${filename} (offline or missing key).`,
    };
  }

  const asarPath = path.join(resourcesPath, "app.asar");
  try {
    await fs.access(asarPath, fs.constants.F_OK);
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
