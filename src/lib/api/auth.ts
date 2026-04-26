import { apiClient } from "./client";
import type { components } from "./v1";

export type ApiUser = components["schemas"]["UserResponseDto"];
export type ApiAuthResponse = components["schemas"]["AuthResponseDto"];
export type ApiLoginDto = components["schemas"]["LoginDto"];
export type ApiRegisterDto = components["schemas"]["RegisterDto"];

export type ApiResult<T> = {
  success: boolean;
  data?: T;
  status?: number;
  errorMessage?: string;
  setCookie?: string | null;
};

function extractErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const maybeRecord = error as Record<string, unknown>;
  const message = maybeRecord.message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }

  const errorText = maybeRecord.error;
  if (typeof errorText === "string" && errorText.trim()) {
    return errorText.trim();
  }

  return undefined;
}

function buildNetworkErrorResult<T>(error: unknown): ApiResult<T> {
  return {
    success: false,
    errorMessage: extractErrorMessage(error) ?? "Network request failed",
  };
}

export async function loginRequest(payload: ApiLoginDto): Promise<ApiResult<ApiAuthResponse>> {
  try {
    const { data, error, response } = await apiClient.POST("/api/auth/login", {
      body: payload,
    });

    if (!response) {
      return { success: false };
    }

    if (!response.ok || !data) {
      return {
        success: false,
        status: response.status,
        errorMessage: extractErrorMessage(error),
      };
    }

    return {
      success: true,
      data,
      status: response.status,
      setCookie: response.headers.get("set-cookie"),
    };
  } catch (error) {
    return buildNetworkErrorResult<ApiAuthResponse>(error);
  }
}

export async function registerRequest(payload: ApiRegisterDto): Promise<ApiResult<ApiAuthResponse>> {
  try {
    const { data, error, response } = await apiClient.POST("/api/auth/register", {
      body: payload,
    });

    if (!response) {
      return { success: false };
    }

    if (!response.ok || !data) {
      return {
        success: false,
        status: response.status,
        errorMessage: extractErrorMessage(error),
      };
    }

    return {
      success: true,
      data,
      status: response.status,
      setCookie: response.headers.get("set-cookie"),
    };
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

    if (!response) {
      return { success: false };
    }

    if (!response.ok || !data) {
      return {
        success: false,
        status: response.status,
        errorMessage: extractErrorMessage(error),
      };
    }

    return {
      success: true,
      data,
      status: response.status,
      setCookie: response.headers.get("set-cookie"),
    };
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

    if (!response) {
      return { success: false };
    }

    if (!response.ok || !data) {
      return {
        success: false,
        status: response.status,
        errorMessage: extractErrorMessage(error),
      };
    }

    return {
      success: true,
      data,
      status: response.status,
    };
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

    if (!response) {
      return { success: false };
    }

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        errorMessage: extractErrorMessage(error),
      };
    }

    return {
      success: true,
      data: { success: data?.success ?? true },
      status: response.status,
    };
  } catch (error) {
    return buildNetworkErrorResult<{ success: boolean }>(error);
  }
}
