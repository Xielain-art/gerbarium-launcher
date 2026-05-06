import { apiClient } from "../client";
import { buildApiResult, buildNetworkErrorResult } from "../result";
import type { ApiRegisterDto, ApiResult, ApiTestRegisterResponse } from "../types";

export async function testRegisterRequest(
  payload: ApiRegisterDto,
): Promise<ApiResult<ApiTestRegisterResponse>> {
  try {
    const { data, error, response } = await apiClient.POST(
      "/api/test/auth/register",
      {
        body: payload,
      },
    );
    return buildApiResult<ApiTestRegisterResponse>({
      response,
      data,
      error,
      includeSetCookie: true,
    });
  } catch (error) {
    return buildNetworkErrorResult<ApiTestRegisterResponse>(error);
  }
}

