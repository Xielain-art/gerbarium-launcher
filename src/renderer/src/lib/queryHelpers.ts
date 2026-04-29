import { UI_STRINGS } from "../../../shared/constants/ui-strings";

export function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
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
