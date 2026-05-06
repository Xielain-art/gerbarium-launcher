import { apiClient } from "../client";
import { buildApiResult, buildNetworkErrorResult } from "../result";
import type { ApiChangelog, ApiResult } from "../types";

export async function listChangelogRequest(params?: {
  fromDate?: string;
  toDate?: string;
  mandatory?: boolean;
  sortBy?: "releaseDate" | "version" | "createdAt";
  order?: "ASC" | "DESC";
}): Promise<ApiResult<ApiChangelog[]>> {
  try {
    const query: {
      fromDate?: string;
      toDate?: string;
      mandatory?: boolean;
      sortBy?: "releaseDate" | "version" | "createdAt";
      order?: "ASC" | "DESC";
    } = {};
    if (params?.fromDate) query.fromDate = params.fromDate;
    if (params?.toDate) query.toDate = params.toDate;
    if (typeof params?.mandatory === "boolean") query.mandatory = params.mandatory;
    if (params?.sortBy) query.sortBy = params.sortBy;
    if (params?.order) query.order = params.order;

    const { data, error, response } = await apiClient.GET("/api/changelog", {
      params: { query },
    });
    return buildApiResult<ApiChangelog[]>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiChangelog[]>(error);
  }
}
