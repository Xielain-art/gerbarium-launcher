import type { ApiResult, ApiWrappedData } from "../types";
import { extractErrorMessage, normalizeTransportErrorMessage, serializeErrorDetails } from "./helpers";

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

