import log from "electron-log";
import type { ApiEmailVerificationStatus } from "../../../lib/api/auth";
import { ERROR_CODES } from "../../../shared/constants/errors";
import type { AuthEmailVerificationStatus, AuthSessionUser } from "../../../shared/constants/ipc-chanels";
import { mainEnv } from "../../config/env";
import { isSmokeTestEnabled } from "../../../shared/env";

export function mapEmailVerification(
  status?: ApiEmailVerificationStatus,
): AuthEmailVerificationStatus | undefined {
  if (!status) {
    return undefined;
  }

  return {
    emailVerified: status.emailVerified,
    resendAvailableInSeconds: status.resendAvailableInSeconds,
    emailSent: status.emailSent,
    developmentCode: status.developmentCode,
  };
}

export function applyEmailVerificationToUser(
  user: AuthSessionUser,
  status: ApiEmailVerificationStatus,
): AuthSessionUser {
  return {
    ...user,
    emailVerified: status.emailVerified,
    emailVerificationResendAvailableInSeconds:
      status.resendAvailableInSeconds,
  };
}

export function mapVerifyEmailFailureCode(status?: number): string {
  if (status === 400) {
    return ERROR_CODES.AUTH_EMAIL_CODE_INVALID;
  }
  if (status === 401 || status === 403) {
    return ERROR_CODES.AUTH_UNAUTHORIZED;
  }
  if (status === 409) {
    return ERROR_CODES.AUTH_EMAIL_ALREADY_VERIFIED;
  }
  if (status === 429) {
    return ERROR_CODES.AUTH_RATE_LIMIT;
  }
  return ERROR_CODES.AUTH_VERIFY_EMAIL_FAILED;
}

export function mapEmailVerificationFailureCode(status?: number): string {
  if (status === 401 || status === 403) {
    return ERROR_CODES.AUTH_UNAUTHORIZED;
  }
  if (status === 409) {
    return ERROR_CODES.AUTH_EMAIL_ALREADY_VERIFIED;
  }
  if (status === 429) {
    return ERROR_CODES.AUTH_RATE_LIMIT;
  }
  return ERROR_CODES.AUTH_EMAIL_STATUS_FAILED;
}

export function interceptSmokeTestCode(status?: ApiEmailVerificationStatus): void {
  if (isSmokeTestEnabled(mainEnv) && status?.developmentCode) {
    const devCode = status.developmentCode;
    (global as Record<string, unknown>).lastDevelopmentCode = devCode;
    process.stdout.write(`[SMOKE_TEST_CODE]:${devCode}\n`);
    log.info(`[SMOKE_TEST] Intercepted dev code: ${devCode}`);
  }
}
