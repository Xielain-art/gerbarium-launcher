import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseAppEnv } from "../../shared/env";

function parseEnvFile(envPath: string): Record<string, string> {
  const raw = readFileSync(envPath, "utf8");
  const lines = raw.split(/\r?\n/);
  const parsed: Record<string, string> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    if (!key) {
      continue;
    }

    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

function readEnvFromFileCandidates(): Record<string, string> {
  const candidates = [
    path.join(process.cwd(), ".env"),
    path.resolve(__dirname, "..", "..", "..", ".env"),
    path.resolve(__dirname, "..", "..", "..", "..", ".env"),
  ];

  for (const envPath of candidates) {
    if (!existsSync(envPath)) {
      continue;
    }
    try {
      return parseEnvFile(envPath);
    } catch {
      // best effort
    }
  }

  return {};
}

const bundledMainEnv = {
  API_BASE_URL: process.env.API_BASE_URL,
  DISCORD_RPC_CLIENT_ID: process.env.DISCORD_RPC_CLIENT_ID,
  PACKWIZ_PACK_URL: process.env.PACKWIZ_PACK_URL,
} as const;

/**
 * Builds the runtime env by merging `.env` file values with `process.env`.
 * `process.env` takes precedence so that env vars injected by CI runners
 * or by Playwright's `electron.launch({ env })` are respected.
 */
function buildRuntimeEnv(): Record<string, string | undefined> {
  const fileEnv = readEnvFromFileCandidates();
  const merged: Record<string, string | undefined> = { ...fileEnv };

  for (const key of Object.keys(fileEnv)) {
    if (process.env[key] !== undefined) {
      merged[key] = process.env[key];
    }
  }

  // Also pick up keys that exist only in process.env (not in .env file)
  // but are part of the known env schema.
  const knownKeys = [
    "API_BASE_URL",
    "VITE_API_BASE_URL",
    "PACKWIZ_PACK_URL",
    "DISCORD_RPC_CLIENT_ID",
    "CURSEFORGE_API_KEY",
    "JAVA_HOME",
    "NODE_ENV",
    "SMOKE_TEST",
    "TEST_USERNAME",
    "TEST_EMAIL",
    "TEST_PASSWORD",
    "PACKWIZ_DOWNLOAD_TIMEOUT_MS",
    "PACKWIZ_ALLOWED_HOSTS",
  ];

  for (const key of knownKeys) {
    if (merged[key] === undefined && process.env[key] !== undefined) {
      merged[key] = process.env[key];
    }
  }

  for (const [key, value] of Object.entries(bundledMainEnv)) {
    if (merged[key] === undefined && value !== undefined) {
      merged[key] = value;
    }
  }

  return merged;
}

export const mainEnv = parseAppEnv(buildRuntimeEnv());
