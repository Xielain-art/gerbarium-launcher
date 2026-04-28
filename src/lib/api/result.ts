import type { ApiResult, ApiWrappedData } from "./types";

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
  return {
    success: false,
    errorMessage: extractErrorMessage(error) ?? "Network request failed",
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
    return {
      success: false,
      status: response.status,
      errorMessage: extractErrorMessage(error),
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
