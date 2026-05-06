import { apiClient } from "../client";
import { buildApiResult, buildNetworkErrorResult } from "../result";
import type { ApiCreateNewsDto, ApiNews, ApiResult, ApiUpdateNewsDto } from "../types";

function normalizeTagIdsForApi(tags: unknown): string[] | undefined {
  if (!Array.isArray(tags)) return undefined;
  const normalized = tags.filter((tag): tag is string => typeof tag === "string");
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeNewsPayloadForApi<T extends { tags?: unknown; tagIds?: unknown }>(
  payload: T,
): T {
  const tagIds = normalizeTagIdsForApi(payload.tags ?? payload.tagIds);
  return {
    ...payload,
    tagIds,
  };
}

export async function createNewsRequest(
  accessToken: string,
  payload: ApiCreateNewsDto,
): Promise<ApiResult<ApiNews>> {
  try {
    const normalizedPayload = normalizeNewsPayloadForApi(payload);
    const { data, error, response } = await apiClient.POST("/api/news", {
      body: normalizedPayload as unknown as ApiCreateNewsDto,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return buildApiResult<ApiNews>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiNews>(error);
  }
}

export async function updateNewsRequest(
  accessToken: string,
  newsId: string,
  payload: ApiUpdateNewsDto,
): Promise<ApiResult<ApiNews>> {
  try {
    const normalizedPayload = normalizeNewsPayloadForApi(payload);
    const { data, error, response } = await apiClient.PATCH("/api/news/{id}", {
      params: { path: { id: newsId } },
      body: normalizedPayload as unknown as ApiUpdateNewsDto,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return buildApiResult<ApiNews>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiNews>(error);
  }
}

export async function deleteNewsRequest(
  accessToken: string,
  newsId: string,
): Promise<ApiResult<{ success: true }>> {
  try {
    const { error, response } = await apiClient.DELETE("/api/news/{id}", {
      params: { path: { id: newsId } },
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

    return {
      success: true,
      data: { success: true },
      status: response.status,
    };
  } catch (error) {
    return buildNetworkErrorResult<{ success: true }>(error);
  }
}
