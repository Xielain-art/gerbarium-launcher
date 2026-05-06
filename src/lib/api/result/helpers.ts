export function serializeErrorDetails(error: unknown): string | undefined {
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

export function extractErrorMessage(error: unknown): string | undefined {
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

export function normalizeTransportErrorMessage(
  message: string | undefined,
): string | undefined {
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

