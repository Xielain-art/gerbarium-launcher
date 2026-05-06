import { apiClient } from "../client";
import { buildApiResult, buildNetworkErrorResult } from "../result";
import type { ApiAdminStats, ApiResult } from "../types";

export async function getAdminStatsRequest(
  accessToken: string,
): Promise<ApiResult<ApiAdminStats>> {
  try {
    const { data, error, response } = await apiClient.GET("/api/admin/stats", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return buildApiResult<ApiAdminStats>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiAdminStats>(error);
  }
}
