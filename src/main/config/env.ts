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

function buildRuntimeEnv(): Record<string, string | undefined> {
  const fileEnv = readEnvFromFileCandidates();
  return fileEnv;
}

export const mainEnv = parseAppEnv(buildRuntimeEnv());
