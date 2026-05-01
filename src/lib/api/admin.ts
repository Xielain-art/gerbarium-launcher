import { apiClient } from "./client";
import { buildApiResult, buildNetworkErrorResult } from "./result";
import type {
  ApiAdminStats,
  ApiCreateRoleDto,
  ApiResult,
  ApiRole,
  ApiUser,
} from "./types";
export type {
  ApiAdminStats,
  ApiCreateRoleDto,
  ApiResult,
  ApiRole,
  ApiUser,
} from "./types";

export async function getUsersRequest(
  accessToken: string,
  search?: string,
  role?: string,
  banned?: boolean,
  page?: number,
  limit?: number,
): Promise<ApiResult<ApiUser[]>> {
  try {
    const query: {
      search?: string;
      role?: string;
      banned?: boolean;
      page?: number;
      limit?: number;
    } = {};
    if (search) query.search = search;
    if (role) query.role = role;
    if (typeof banned === "boolean") query.banned = banned;
    if (page) query.page = page;
    if (limit) query.limit = limit;

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
    const { data, error, response } = await apiClient.PUT(
      "/api/admin/users/{id}/roles",
      {
        params: { path: { id: userId } },
        body: { roleIds: roleIds as unknown as unknown[][] },
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

export async function getRolesRequest(
  accessToken: string,
): Promise<ApiResult<ApiRole[]>> {
  try {
    const { data, error, response } = await apiClient.GET("/api/admin/roles", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return buildApiResult<ApiRole[]>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiRole[]>(error);
  }
}

export async function createRoleRequest(
  accessToken: string,
  payload: ApiCreateRoleDto,
): Promise<ApiResult<ApiRole>> {
  try {
    const { data, error, response } = await apiClient.POST("/api/admin/roles", {
      body: payload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return buildApiResult<ApiRole>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiRole>(error);
  }
}

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
