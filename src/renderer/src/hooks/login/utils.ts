import type { TranslationType } from "../../../../shared/constants/translations";

export function localizeAuthError(
  error: string | null,
  t: TranslationType,
): string | null {
  if (!error) {
    return null;
  }

  const byCode: Record<string, string> = {
    ERR_AUTH_INVALID_CREDENTIALS: t.STORE_ERRORS.AUTH_INVALID_CREDENTIALS,
    ERR_AUTH_ALREADY_EXISTS: t.STORE_ERRORS.AUTH_ALREADY_EXISTS,
    ERR_AUTH_RATE_LIMIT: t.STORE_ERRORS.AUTH_RATE_LIMIT,
    ERR_AUTH_VALIDATION_FAILED: t.STORE_ERRORS.AUTH_VALIDATION_FAILED,
    ERR_AUTH_API_REQUEST_FAILED: t.STORE_ERRORS.AUTH_SERVICE_UNAVAILABLE,
    ERR_AUTH_LOGIN_FAILED: t.STORE_ERRORS.AUTH_LOGIN,
    ERR_AUTH_REGISTER_FAILED: t.STORE_ERRORS.AUTH_REGISTER,
    ERR_AUTH_EMAIL_CODE_INVALID: t.STORE_ERRORS.AUTH_EMAIL_CODE_INVALID,
    ERR_AUTH_EMAIL_ALREADY_VERIFIED: t.STORE_ERRORS.AUTH_EMAIL_ALREADY_VERIFIED,
    ERR_AUTH_VERIFY_EMAIL_FAILED: t.STORE_ERRORS.AUTH_VERIFY_EMAIL,
    ERR_AUTH_RESEND_EMAIL_FAILED: t.STORE_ERRORS.AUTH_RESEND_EMAIL,
    ERR_AUTH_EMAIL_STATUS_FAILED: t.STORE_ERRORS.AUTH_EMAIL_STATUS,
    ERR_AUTH_UNAUTHORIZED: t.STORE_ERRORS.AUTH_UNAUTHORIZED,
  };

  return byCode[error] || error;
}

export function clearAuthDrafts(
  setters: Array<(value: string) => void>,
  setOfflineMode: (value: boolean) => void,
): void {
  for (const setter of setters) {
    setter("");
  }
  setOfflineMode(false);
}
