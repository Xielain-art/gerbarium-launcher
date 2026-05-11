import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import got from "got";
import log from "electron-log";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import { mainEnv } from "../../config/env";

const DEFAULT_TIMEOUT_MS = 120_000;
const DOWNLOAD_RETRIES = 3;
const RETRY_BACKOFF_MS = [2_000, 5_000, 10_000] as const;
const DOWNLOAD_ATTEMPTS = DOWNLOAD_RETRIES + 1;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getPackwizDownloadTimeoutMs(): number {
  const raw = mainEnv.PACKWIZ_DOWNLOAD_TIMEOUT_MS;
  if (!raw) {
    return DEFAULT_TIMEOUT_MS;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }
  return parsed;
}

function isRetryable(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("timeout") ||
    message.includes("econnreset") ||
    message.includes("enotfound") ||
    message.includes("socket")
  );
}

async function retry<T>(
  operationName: string,
  operationTarget: string,
  task: () => Promise<T>,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= DOWNLOAD_ATTEMPTS; attempt += 1) {
    try {
      return await task();
    } catch (error: unknown) {
      lastError = error;
      const message = error instanceof Error ? error.message : "Unknown download error";
      log.warn(LOG_MESSAGES.PACKWIZ_DOWNLOAD_ATTEMPT_FAILED, {
        operation: operationName,
        target: operationTarget,
        attempt,
        maxAttempts: DOWNLOAD_ATTEMPTS,
        error: message,
      });

      if (attempt === DOWNLOAD_ATTEMPTS || !isRetryable(error)) {
        break;
      }

      const backoffMs = RETRY_BACKOFF_MS[attempt - 1] ?? RETRY_BACKOFF_MS[RETRY_BACKOFF_MS.length - 1];
      log.warn(LOG_MESSAGES.PACKWIZ_DOWNLOAD_RETRY, {
        operation: operationName,
        target: operationTarget,
        attempt: attempt + 1,
        maxAttempts: DOWNLOAD_ATTEMPTS,
        backoffMs,
      });
      await sleep(backoffMs);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Unknown download error");
}

export async function fetchText(url: string): Promise<string> {
  const timeoutMs = getPackwizDownloadTimeoutMs();
  return retry("fetchText", url, async () =>
    got(url, { timeout: { request: timeoutMs } }).text(),
  );
}

export async function fetchJson<T>(
  url: string,
  headers?: Record<string, string>,
): Promise<T> {
  const timeoutMs = getPackwizDownloadTimeoutMs();
  return retry("fetchJson", url, async () =>
    got(url, {
      timeout: { request: timeoutMs },
      headers,
      responseType: "json",
    }).json<T>(),
  );
}

export async function downloadToFile(url: string, destination: string): Promise<void> {
  const timeoutMs = getPackwizDownloadTimeoutMs();
  await fs.mkdir(path.dirname(destination), { recursive: true });
  const tempDestination = `${destination}.download`;
  await retry("downloadToFile", destination, async () => {
    await pipeline(
      got.stream(url, { timeout: { request: timeoutMs } }),
      createWriteStream(tempDestination),
    );
  });
  await fs.rename(tempDestination, destination);
}
