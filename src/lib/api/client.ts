import createClient from "openapi-fetch";
import { paths } from "./v1";

const DEFAULT_API_BASE_URL = "";

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function getProcessEnvBaseUrl(): string | undefined {
  if (typeof process === "undefined" || !process.env) {
    return undefined;
  }
  return process.env.API_BASE_URL;
}

function getViteEnvBaseUrl(): string | undefined {
  type ImportMetaWithEnv = ImportMeta & {
    env?: Record<string, string | undefined>;
  };

  try {
    const env = (import.meta as ImportMetaWithEnv).env;
    return env?.VITE_API_BASE_URL ?? env?.API_BASE_URL;
  } catch {
    return undefined;
  }
}

function resolveApiBaseUrl(): string {
  const fromProcess = getProcessEnvBaseUrl();
  if (fromProcess && fromProcess.trim()) {
    return normalizeBaseUrl(fromProcess);
  }

  const fromVite = getViteEnvBaseUrl();
  if (fromVite && fromVite.trim()) {
    return normalizeBaseUrl(fromVite);
  }

  return DEFAULT_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
});
