import { apiClient } from "../client";
import { buildNetworkErrorResult } from "../result";
import type {
  ApiNews,
  ApiNewsTag,
  ApiResult,
  ApiCreateNewsDto,
  ApiCreateNewsTagDto,
  ApiUpdateNewsDto,
} from "../types";

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

export async function listNewsRequest(params?: {
  search?: string;
  tagId?: string;
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
      tagId?: string;
      fromDate?: string;
      toDate?: string;
      sortBy?: "createdAt" | "updatedAt" | "title";
      order?: "ASC" | "DESC";
      page?: number;
      limit?: number;
    } = {};
    if (params?.search) query.search = params.search;
    if (params?.tagId) query.tagId = params.tagId;
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
          totalPages:
            typeof meta.totalPages === "number"
              ? meta.totalPages
              : Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    return buildNetworkErrorResult<ApiNewsListPayload>(error);
  }
}
