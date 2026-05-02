import { apiClient } from "./client";
import { buildApiResult, buildNetworkErrorResult } from "./result";
import type {
  ApiChangelog,
  ApiCreateChangelogDto,
  ApiResult,
  ApiUpdateChangelogDto,
} from "./types";

export type {
  ApiChangelog,
  ApiCreateChangelogDto,
  ApiUpdateChangelogDto,
  ApiResult,
} from "./types";

function normalizeChangesForApi(changes: unknown): string[] | undefined {
  if (!Array.isArray(changes)) return undefined;
  const normalized = changes.flatMap((entry) => {
    if (typeof entry === "string") return [entry];
    if (Array.isArray(entry)) {
      return entry.filter((value): value is string => typeof value === "string");
    }
    return [];
  });
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeChangelogPayloadForApi<T extends { changes?: unknown }>(
  payload: T,
): T {
  const changes = normalizeChangesForApi(payload.changes);
  return {
    ...payload,
    changes,
  };
}

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

export async function createChangelogRequest(
  accessToken: string,
  payload: ApiCreateChangelogDto,
): Promise<ApiResult<ApiChangelog>> {
  try {
    const normalizedPayload = normalizeChangelogPayloadForApi(payload);
    const { data, error, response } = await apiClient.POST("/api/changelog", {
      body: normalizedPayload as unknown as ApiCreateChangelogDto,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return buildApiResult<ApiChangelog>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiChangelog>(error);
  }
}

export async function updateChangelogRequest(
  accessToken: string,
  changelogId: string,
  payload: ApiUpdateChangelogDto,
): Promise<ApiResult<ApiChangelog>> {
  try {
    const normalizedPayload = normalizeChangelogPayloadForApi(payload);
    const { data, error, response } = await apiClient.PATCH("/api/changelog/{id}", {
      params: { path: { id: changelogId } },
      body: normalizedPayload as unknown as ApiUpdateChangelogDto,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return buildApiResult<ApiChangelog>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiChangelog>(error);
  }
}

export async function deleteChangelogRequest(
  accessToken: string,
  changelogId: string,
): Promise<ApiResult<{ success: true }>> {
  try {
    const { error, response } = await apiClient.DELETE("/api/changelog/{id}", {
      params: { path: { id: changelogId } },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response) {
      return { success: false, errorMessage: "Network request failed" };
    }
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        errorMessage:
          typeof error === "object" && error !== null && "message" in error
            ? String((error as { message?: string }).message)
            : undefined,
      };
    }
    return { success: true, data: { success: true }, status: response.status };
  } catch (error) {
    return buildNetworkErrorResult<{ success: true }>(error);
  }
}
