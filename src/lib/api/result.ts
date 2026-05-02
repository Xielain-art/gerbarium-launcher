import type { ApiResult, ApiWrappedData } from "./types";

function serializeErrorDetails(error: unknown): string | undefined {
  if (typeof error === "undefined") {
    return undefined;
  }
  if (typeof error === "string") {
    const trimmed = error.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  try {
    const serialized = JSON.stringify(error);
    return serialized && serialized !== "{}" ? serialized : undefined;
  } catch {
    return undefined;
  }
}

function extractErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const maybeRecord = error as Record<string, unknown>;
  const message = maybeRecord.message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }
  if (Array.isArray(message)) {
    const firstString = message.find(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
    if (firstString) {
      return firstString.trim();
    }
  }

  const errorText = maybeRecord.error;
  if (typeof errorText === "string" && errorText.trim()) {
    return errorText.trim();
  }

  const errors = maybeRecord.errors;
  if (Array.isArray(errors)) {
    const firstString = errors.find(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
    if (firstString) {
      return firstString.trim();
    }
  }

  return undefined;
}

function normalizeTransportErrorMessage(message: string | undefined): string | undefined {
  if (!message) return undefined;
  const normalized = message.trim();
  if (!normalized) return undefined;
  const lower = normalized.toLowerCase();
  if (
    lower.includes("unexpected token '<'") ||
    lower.includes("<!doctype") ||
    lower.includes("is not valid json")
  ) {
    return "Server returned non-JSON response. Check API base URL or backend proxy configuration.";
  }
  return normalized;
}

function unwrapData<T>(payload: ApiWrappedData<T> | undefined): T | undefined {
  if (!payload) {
    return undefined;
  }
  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function buildNetworkErrorResult<T>(error: unknown): ApiResult<T> {
  const extracted = extractErrorMessage(error);
  return {
    success: false,
    errorMessage: normalizeTransportErrorMessage(extracted) ?? "Network request failed",
    errorDetails: serializeErrorDetails(error),
  };
}

export function buildApiResult<T>(params: {
  response?: Response;
  data?: ApiWrappedData<T>;
  error?: unknown;
  includeSetCookie?: boolean;
}): ApiResult<T> {
  const { response, data, error, includeSetCookie = false } = params;
  const setCookie = includeSetCookie ? response?.headers.get("set-cookie") : undefined;

  if (!response) {
    return { success: false, setCookie };
  }

  const unwrapped = unwrapData<T>(data);
  if (!response.ok || typeof unwrapped === "undefined") {
    const fallbackStatusText =
      response.statusText && response.statusText.trim().length > 0
        ? response.statusText.trim()
        : undefined;
    const extractedError = extractErrorMessage(error);
    return {
      success: false,
      status: response.status,
      errorMessage: normalizeTransportErrorMessage(extractedError) ?? fallbackStatusText,
      errorDetails: serializeErrorDetails(error),
      setCookie,
    };
  }

  return {
    success: true,
    data: unwrapped,
    status: response.status,
    setCookie,
  };
}
