import log from "electron-log";
import { ERROR_CODES } from "../../shared/constants/errors";

export interface ApiRequestResult<T> {
  success: boolean;
  data?: T;
  status?: number;
  errorMessage?: string;
  errorDetails?: string;
  setCookie?: string | null;
}

export interface HandlerResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Logs API failure with status and messages
 */
export function logApiFailure(
  context: string,
  result: {
    status?: number;
    errorMessage?: string;
    errorDetails?: string;
  },
): void {
  log.error(
    context,
    "status:",
    result.status ?? "n/a",
    "message:",
    result.errorMessage ?? "n/a",
    "details:",
    result.errorDetails ?? "n/a",
  );
}

/**
 * Safely extracts error details from an unknown result object
 */
export function readErrorDetails(result: unknown): string | undefined {
  if (typeof result !== "object" || result === null) {
    return undefined;
  }
  if (!("errorDetails" in result)) {
    return undefined;
  }
  const value = (result as { errorDetails?: unknown }).errorDetails;
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

/**
 * Maps an API request result to a consistent error response
 */
export function toErrorResponse<T>(
  context: string,
  result: ApiRequestResult<T>,
  fallbackError: string = ERROR_CODES.AUTH_API_REQUEST_FAILED,
): HandlerResult<T> {
  logApiFailure(context, result);
  return {
    success: false,
    error: result.errorMessage ?? fallbackError,
  };
}

/**
 * Maps an API request result to a consistent success response
 */
export function toSuccessResponse<T>(result: ApiRequestResult<T>): HandlerResult<T> {
  return { success: true, data: result.data };
}

/**
 * Maps HTTP status codes to internal error codes for authentication
 */
export function mapAuthFailureCode(status?: number): string {
  if (status === 401 || status === 403) {
    return ERROR_CODES.AUTH_INVALID_CREDENTIALS;
  }
  if (status === 409) {
    return ERROR_CODES.AUTH_ALREADY_EXISTS;
  }
  if (status === 429) {
    return ERROR_CODES.AUTH_RATE_LIMIT;
  }
  if (status === 400) {
    return ERROR_CODES.AUTH_VALIDATION_FAILED;
  }
  return ERROR_CODES.AUTH_API_REQUEST_FAILED;
}
