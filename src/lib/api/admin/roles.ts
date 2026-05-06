import { apiClient } from "../client";
import { buildApiResult, buildNetworkErrorResult } from "../result";
import type { ApiCreateRoleDto, ApiResult, ApiRole, ApiUpdateRoleDto } from "../types";

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

export async function updateRoleRequest(
  accessToken: string,
  roleId: string,
  payload: ApiUpdateRoleDto,
): Promise<ApiResult<ApiRole>> {
  try {
    const { data, error, response } = await apiClient.PATCH(
      "/api/admin/roles/{id}",
      {
        params: { path: { id: roleId } },
        body: payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return buildApiResult<ApiRole>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiRole>(error);
  }
}
