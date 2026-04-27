import { apiClient } from "./client";
import { buildApiResult, buildNetworkErrorResult } from "./result";
import type {
  ApiAuthResponse,
  ApiLoginDto,
  ApiRegisterDto,
  ApiResult,
  ApiUser,
} from "./types";
export type { ApiAuthResponse, ApiLoginDto, ApiRegisterDto, ApiResult, ApiUser } from "./types";

export async function loginRequest(payload: ApiLoginDto): Promise<ApiResult<ApiAuthResponse>> {
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

export async function registerRequest(payload: ApiRegisterDto): Promise<ApiResult<ApiAuthResponse>> {
  try {
    const { data, error, response } = await apiClient.POST("/api/auth/register", {
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

export async function refreshTokenRequest(cookie: string): Promise<ApiResult<ApiAuthResponse>> {
  try {
    const { data, error, response } = await apiClient.POST("/api/auth/refresh-token", {
      headers: {
        Cookie: cookie,
      },
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

export async function profileRequest(accessToken: string): Promise<ApiResult<ApiUser>> {
  try {
    const { data, error, response } = await apiClient.GET("/api/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return buildApiResult<ApiUser>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiUser>(error);
  }
}

export async function logoutRequest(accessToken: string, cookie?: string): Promise<ApiResult<{ success: boolean }>> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  if (cookie?.trim()) {
    headers.Cookie = cookie;
  }

  try {
    const { data, error, response } = await apiClient.POST("/api/auth/logout", {
      headers,
    });
    const result = buildApiResult<{ success: boolean }>({
      response,
      data,
      error,
    });
    if (!result.success) {
      return result;
    }
    return {
      ...result,
      data: { success: result.data.success ?? true },
    };
  } catch (error) {
    return buildNetworkErrorResult<{ success: boolean }>(error);
  }
}
