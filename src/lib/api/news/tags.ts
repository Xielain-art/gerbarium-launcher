import { apiClient } from "../client";
import { buildApiResult, buildNetworkErrorResult } from "../result";
import type { ApiCreateNewsTagDto, ApiNewsTag, ApiResult } from "../types";

export async function listNewsTagsRequest(
  accessToken: string,
): Promise<ApiResult<ApiNewsTag[]>> {
  try {
    const { data, error, response } = await apiClient.GET("/api/news/tags", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return buildApiResult<ApiNewsTag[]>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiNewsTag[]>(error);
  }
}

export async function createNewsTagRequest(
  accessToken: string,
  payload: ApiCreateNewsTagDto,
): Promise<ApiResult<ApiNewsTag>> {
  try {
    const { data, error, response } = await apiClient.POST("/api/news/tags", {
      body: payload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return buildApiResult<ApiNewsTag>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiNewsTag>(error);
  }
}

export async function updateNewsTagRequest(
  accessToken: string,
  tagId: string,
  payload: ApiCreateNewsTagDto,
): Promise<ApiResult<ApiNewsTag>> {
  try {
    const { data, error, response } = await apiClient.PATCH(
      "/api/news/tags/{id}",
      {
        params: { path: { id: tagId } },
        body: payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return buildApiResult<ApiNewsTag>({ response, data, error });
  } catch (error) {
    return buildNetworkErrorResult<ApiNewsTag>(error);
  }
}

export async function deleteNewsTagRequest(
  accessToken: string,
  tagId: string,
): Promise<ApiResult<{ success: true }>> {
  try {
    const { error, response } = await apiClient.DELETE("/api/news/tags/{id}", {
      params: { path: { id: tagId } },
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
