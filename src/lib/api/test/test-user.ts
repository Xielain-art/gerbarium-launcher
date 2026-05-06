import { apiClient } from "../client";
import { buildApiResult, buildNetworkErrorResult } from "../result";
import type { ApiResult } from "../types";

export async function deleteTestUserRequest(
  accessToken: string,
  userId: string,
): Promise<ApiResult<{ success: boolean }>> {
  try {
    const { data, error, response } = await apiClient.DELETE(
      "/api/test/test-user-delete",
      {
        body: { userId },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const result = buildApiResult<{ success: boolean }>({
      response,
      data,
      error,
    });
    if (!result.success) {
      return result;
    }
    return { ...result, data: { success: true } };
  } catch (error) {
    return buildNetworkErrorResult<{ success: boolean }>(error);
  }
}
