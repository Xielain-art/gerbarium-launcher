import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import got from "got";

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_RETRIES = 3;

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
  task: () => Promise<T>,
  retries = DEFAULT_RETRIES,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await task();
    } catch (error: unknown) {
      lastError = error;
      if (attempt === retries || !isRetryable(error)) {
        break;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Unknown download error");
}

export async function fetchText(url: string): Promise<string> {
  return retry(async () =>
    got(url, { timeout: { request: DEFAULT_TIMEOUT_MS } }).text(),
  );
}

export async function downloadToFile(url: string, destination: string): Promise<void> {
  await fs.mkdir(path.dirname(destination), { recursive: true });
  const tempDestination = `${destination}.download`;
  await retry(async () => {
    await pipeline(
      got.stream(url, { timeout: { request: DEFAULT_TIMEOUT_MS } }),
      createWriteStream(tempDestination),
    );
  });
  await fs.rename(tempDestination, destination);
}
