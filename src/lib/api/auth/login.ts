import { isSmokeTestEnabled } from "../../../shared/env";
import { apiClient } from "../client";
import { buildApiResult, buildNetworkErrorResult } from "../result";
import type {
  ApiAuthResponse,
  ApiLoginDto,
  ApiRegisterDto,
  ApiResult,
} from "../types";

function isSmokeTestRuntime(): boolean {
  return isSmokeTestEnabled({
    SMOKE_TEST:
      typeof process !== "undefined" && process.env
        ? (process.env.SMOKE_TEST as "true" | "false" | undefined)
        : undefined,
  });
}

export async function loginRequest(
  payload: ApiLoginDto,
): Promise<ApiResult<ApiAuthResponse>> {
  try {
    const { data, error, response } = await apiClient.POST("/api/auth/login", {
      body: payload,
    });
    return buildApiResult<ApiAuthResponse>({
      response,
      data,
      error,
      includeSetCookie: true,
    });
  } catch (error) {
    return buildNetworkErrorResult<ApiAuthResponse>(error);
  }
}

export async function registerRequest(
  payload: ApiRegisterDto,
): Promise<ApiResult<ApiAuthResponse>> {
  try {
    const { data, error, response } = await apiClient.POST(
      "/api/auth/register",
      {
        body: payload,
      },
    );

    if (isSmokeTestRuntime()) {
      process.stdout.write(`[DEBUG_API_REGISTER] Data: ${JSON.stringify(data)}\n`);
    }

    return buildApiResult<ApiAuthResponse>({
      response,
      data,
      error,
      includeSetCookie: true,
    });
  } catch (error) {
    return buildNetworkErrorResult<ApiAuthResponse>(error);
  }
}
