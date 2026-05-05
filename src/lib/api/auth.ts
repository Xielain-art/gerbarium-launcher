import { apiClient } from "./client";
import { buildApiResult, buildNetworkErrorResult } from "./result";
import type {
  ApiAuthResponse,
  ApiEmailVerificationStatus,
  ApiEmailVerifiedResponse,
  ApiLoginDto,
  ApiRegisterDto,
  ApiResult,
  ApiUser,
  ApiVerifyEmailDto,
  ApiAccountDeletionCodeStatus,
  ApiTestRegisterResponse,
} from "./types";
export type {
  ApiAuthResponse,
  ApiEmailVerificationStatus,
  ApiEmailVerifiedResponse,
  ApiLoginDto,
  ApiRegisterDto,
  ApiVerifyEmailDto,
  ApiAccountDeletionCodeStatus,
  ApiTestRegisterResponse,
} from "./types";

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
    
    // DEBUG LOG FOR SMOKE TESTS
    if (process.env.SMOKE_TEST === "true") {
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

export async function verifyEmailRequest(
  accessToken: string,
  payload: ApiVerifyEmailDto,
): Promise<ApiResult<ApiEmailVerifiedResponse>> {
  try {
    const { data, error, response } = await apiClient.POST("/api/auth/email/verify", {
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

    // DEBUG LOG FOR SMOKE TESTS
    if (process.env.SMOKE_TEST === "true") {
      process.stdout.write(
        `[DEBUG_API_STATUS] Data: ${JSON.stringify(data)}\n`,
      );
    }

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

    // DEBUG LOG FOR SMOKE TESTS
    if (process.env.SMOKE_TEST === "true") {
      process.stdout.write(
        `[DEBUG_API_RESEND] Data: ${JSON.stringify(data)}\n`,
      );
    }

    return buildApiResult<ApiEmailVerificationStatus>({
      response,
      data,
      error,
    });
  } catch (error) {
    return buildNetworkErrorResult<ApiEmailVerificationStatus>(error);
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
