import { apiClient } from "./client";
import type { components } from "./v1";

export type ApiUser = components["schemas"]["UserResponseDto"];
export type ApiUserMeta = {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

export type ApiResult<T> = {
  success: boolean;
  data?: T;
  status?: number;
  errorMessage?: string;
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

export async function getUsersRequest(
  accessToken: string,
  search?: string,
): Promise<ApiResult<ApiUser[]>> {
  try {
    const { data, error, response } = await apiClient.GET("/api/admin/users", {
      params: search ? { query: { search } } : undefined,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response) return { success: false };

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
    return buildNetworkErrorResult<ApiUser[]>(error);
  }
}

export async function banUserRequest(
  accessToken: string,
  userId: string,
  reason: string,
): Promise<ApiResult<ApiUser>> {
  try {
    const { data, error, response } = await apiClient.POST(
      "/api/admin/users/{id}/ban",
      {
        params: { path: { id: userId } },
        body: { reason },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response) return { success: false };

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

export async function unbanUserRequest(
  accessToken: string,
  userId: string,
): Promise<ApiResult<ApiUser>> {
  try {
    const { data, error, response } = await apiClient.POST(
      "/api/admin/users/{id}/unban",
      {
        params: { path: { id: userId } },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response) return { success: false };

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

export async function updateUserRolesRequest(
  accessToken: string,
  userId: string,
  roles: ("user" | "moderator" | "admin")[],
): Promise<ApiResult<ApiUser>> {
  try {
    const { data, error, response } = await apiClient.PUT(
      "/api/admin/users/{id}/roles",
      {
        params: { path: { id: userId } },
        body: { roles },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response) return { success: false };

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
