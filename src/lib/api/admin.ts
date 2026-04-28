import { apiClient } from "./client";
import { buildApiResult, buildNetworkErrorResult } from "./result";
import type { ApiResult, ApiUser } from "./types";
export type { ApiResult, ApiUser } from "./types";

export async function getUsersRequest(
  accessToken: string,
  search?: string,
  role?: string,
  banned?: boolean,
): Promise<ApiResult<ApiUser[]>> {
  try {
    const query: {
      search?: string;
      role?: string;
      banned?: boolean;
    } = {};
    if (search) query.search = search;
    if (role) query.role = role;
    if (typeof banned === "boolean") query.banned = banned;

    const { data, error, response } = await apiClient.GET("/api/admin/users", {
      params: { query },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return buildApiResult<ApiUser[]>({ response, data, error });
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

    return buildApiResult<ApiUser>({ response, data, error });
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

    return buildApiResult<ApiUser>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiUser>(error);
  }
}

export async function updateUserRolesRequest(
  accessToken: string,
  userId: string,
  roleIds: string[],
): Promise<ApiResult<ApiUser>> {
  try {
    const normalizedRoleIds = roleIds.map((roleId) => [roleId]);
    const { data, error, response } = await apiClient.PUT(
      "/api/admin/users/{id}/roles",
      {
        params: { path: { id: userId } },
        body: { roleIds: normalizedRoleIds },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return buildApiResult<ApiUser>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiUser>(error);
  }
}
