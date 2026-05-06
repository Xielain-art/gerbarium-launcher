import { apiClient } from "../client";
import { buildApiResult, buildNetworkErrorResult } from "../result";
import type {
  ApiAccountDeletionCodeStatus,
  ApiEmailVerifiedResponse,
  ApiResult,
  ApiVerifyEmailDto,
} from "../types";

export async function deleteAccountCodeRequest(
  accessToken: string,
): Promise<ApiResult<ApiAccountDeletionCodeStatus>> {
  try {
    const { data, error, response } = await apiClient.POST(
      "/api/users/me/delete-code",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return buildApiResult<ApiAccountDeletionCodeStatus>({
      response,
      data,
      error,
    });
  } catch (error) {
    return buildNetworkErrorResult<ApiAccountDeletionCodeStatus>(error);
  }
}

export async function deleteAccountRequest(
  accessToken: string,
  payload: ApiVerifyEmailDto,
): Promise<ApiResult<ApiEmailVerifiedResponse>> {
  try {
    const { data, error, response } = await apiClient.DELETE("/api/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: payload,
    });
    return buildApiResult<ApiEmailVerifiedResponse>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiEmailVerifiedResponse>(error);
  }
}
