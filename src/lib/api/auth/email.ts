import { apiClient } from "../client";
import { buildApiResult, buildNetworkErrorResult } from "../result";
import type {
  ApiEmailVerificationStatus,
  ApiEmailVerifiedResponse,
  ApiResult,
  ApiVerifyEmailDto,
} from "../types";

export async function verifyEmailRequest(
  accessToken: string,
  payload: ApiVerifyEmailDto,
): Promise<ApiResult<ApiEmailVerifiedResponse>> {
  try {
    const { data, error, response } = await apiClient.POST(
      "/api/auth/email/verify",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: payload,
      },
    );
    return buildApiResult<ApiEmailVerifiedResponse>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiEmailVerifiedResponse>(error);
  }
}

export async function getEmailVerificationStatusRequest(
  accessToken: string,
): Promise<ApiResult<ApiEmailVerificationStatus>> {
  try {
    const { data, error, response } = await apiClient.GET(
      "/api/auth/email/verification-status",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return buildApiResult<ApiEmailVerificationStatus>({
      response,
      data,
      error,
    });
  } catch (error) {
    return buildNetworkErrorResult<ApiEmailVerificationStatus>(error);
  }
}

export async function resendEmailVerificationRequest(
  accessToken: string,
): Promise<ApiResult<ApiEmailVerificationStatus>> {
  try {
    const { data, error, response } = await apiClient.POST(
      "/api/auth/email/resend",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return buildApiResult<ApiEmailVerificationStatus>({
      response,
      data,
      error,
    });
  } catch (error) {
    return buildNetworkErrorResult<ApiEmailVerificationStatus>(error);
  }
}
