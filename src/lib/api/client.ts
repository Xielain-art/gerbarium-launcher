import createClient from "openapi-fetch";
import { paths } from "./v1";

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function isSafeBaseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function getProcessEnvBaseUrl(): string | undefined {
  if (typeof process === "undefined" || !process.env) {
    return undefined;
  }
  return process.env.API_BASE_URL;
}

function getViteEnvBaseUrl(): string | undefined {
  try {
    const env =
      (import.meta as ImportMeta & { env?: Record<string, string | undefined> })
        .env ?? {};
    return env.VITE_API_BASE_URL ?? env.API_BASE_URL;
  } catch {
    return undefined;
  }
}

function resolveApiBaseUrl(): string {
  const fromProcess = getProcessEnvBaseUrl();
  if (fromProcess && fromProcess.trim()) {
    const normalized = normalizeBaseUrl(fromProcess);
    if (isSafeBaseUrl(normalized)) {
      return normalized;
    }
    throw new Error("Invalid API_BASE_URL in .env");
  }

  const fromVite = getViteEnvBaseUrl();
  if (fromVite && fromVite.trim()) {
    const normalized = normalizeBaseUrl(fromVite);
    if (isSafeBaseUrl(normalized)) {
      return normalized;
    }
    throw new Error("Invalid VITE_API_BASE_URL in .env");
  }

  throw new Error("API base URL is missing. Set API_BASE_URL/VITE_API_BASE_URL in .env");
}

export const API_BASE_URL = resolveApiBaseUrl();

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
});
