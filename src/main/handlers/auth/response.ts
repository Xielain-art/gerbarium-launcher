import type { ApiEmailVerificationStatus } from "../../../lib/api/auth";

export function mapEmailVerificationPayload(
  status?: ApiEmailVerificationStatus,
):
  | {
      emailVerified: boolean;
      resendAvailableInSeconds: number;
      emailSent: boolean;
      developmentCode?: string;
    }
  | undefined {
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
