import { apiClient } from "./client";
import { buildApiResult, buildNetworkErrorResult } from "./result";
import type { ApiCreateNewsDto, ApiNews, ApiResult, ApiUpdateNewsDto } from "./types";

export type { ApiNews, ApiCreateNewsDto, ApiUpdateNewsDto, ApiResult } from "./types";

export interface ApiPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiNewsListPayload {
  items: ApiNews[];
  meta: ApiPaginationMeta;
}

function normalizeTagsForApi(tags: unknown): string[] | undefined {
  if (!Array.isArray(tags)) return undefined;
  const normalized = tags.flatMap((tag) => {
    if (typeof tag === "string") return [tag];
    if (Array.isArray(tag)) {
      return tag.filter((value): value is string => typeof value === "string");
    }
    return [];
  });
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeNewsPayloadForApi<T extends { tags?: unknown }>(payload: T): T {
  const tags = normalizeTagsForApi(payload.tags);
  return {
    ...payload,
    tags,
  };
}

export async function listNewsRequest(params?: {
  search?: string;
  tag?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: "createdAt" | "updatedAt" | "title";
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}): Promise<ApiResult<ApiNewsListPayload>> {
  try {
    const query: {
      search?: string;
      tag?: string;
      fromDate?: string;
      toDate?: string;
      sortBy?: "createdAt" | "updatedAt" | "title";
      order?: "ASC" | "DESC";
      page?: number;
      limit?: number;
    } = {};
    if (params?.search) query.search = params.search;
    if (params?.tag) query.tag = params.tag;
    if (params?.fromDate) query.fromDate = params.fromDate;
    if (params?.toDate) query.toDate = params.toDate;
    if (params?.sortBy) query.sortBy = params.sortBy;
    if (params?.order) query.order = params.order;
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;

    const { data, error, response } = await apiClient.GET("/api/news", {
      params: { query },
    });

    const payload = data as
      | ApiNews[]
      | { data?: ApiNews[]; meta?: Partial<ApiPaginationMeta> }
      | undefined;

    if (!response || !response.ok || !payload) {
      return {
        success: false,
        status: response?.status,
        errorMessage:
          typeof error === "object" && error !== null && "message" in error
            ? String((error as { message?: string }).message)
            : undefined,
      };
    }

    if (Array.isArray(payload)) {
      return {
        success: true,
        status: response.status,
        data: {
          items: payload,
          meta: {
            page: params?.page ?? 1,
            limit: params?.limit ?? payload.length,
            total: payload.length,
            totalPages: 1,
          },
        },
      };
    }

    const items = Array.isArray(payload.data) ? payload.data : [];
    const meta = payload.meta ?? {};
    const limit = typeof meta.limit === "number" ? meta.limit : params?.limit ?? 20;
    const total = typeof meta.total === "number" ? meta.total : items.length;
    
    return {
      success: true,
      status: response.status,
      data: {
        items,
        meta: {
          page: typeof meta.page === "number" ? meta.page : params?.page ?? 1,
          limit,
          total,
          totalPages: typeof meta.totalPages === "number" ? meta.totalPages : Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    return buildNetworkErrorResult<ApiNewsListPayload>(error);
  }
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
        errorMessage: typeof error === "object" && error !== null && "message" in error
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
