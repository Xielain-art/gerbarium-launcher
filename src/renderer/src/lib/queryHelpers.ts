import { UI_STRINGS } from "../../../shared/constants/ui-strings";

/**
 * Extracts error message from various error formats including API responses
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  // Handle Error instances
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  // Handle API error objects with nested structure
  if (error && typeof error === "object") {
    const errorObj = error as Record<string, unknown>;

    // Try to extract message from nested error details
    if (
      errorObj.message &&
      typeof errorObj.message === "string" &&
      errorObj.message.trim()
    ) {
      return errorObj.message.trim();
    }

    // Try to extract from error field
    if (
      errorObj.error &&
      typeof errorObj.error === "string" &&
      errorObj.error.trim()
    ) {
      return errorObj.error.trim();
    }
  }

  return fallback;
}

export function ensureSuccess<T extends { success: boolean; error?: string }>(
  result: T,
  fallback: string,
): T {
  if (!result.success) {
    throw new Error(result.error || fallback);
  }

  return result;
}

export function getStoreFallbackError(
  key:
    | "NEWS_LOAD"
    | "AUTH_LOGIN"
    | "AUTH_REGISTER"
    | "SERVER_STATUS"
    | "SETTINGS_SAVE",
): string {
  return UI_STRINGS.STORE_ERRORS[key];
}

