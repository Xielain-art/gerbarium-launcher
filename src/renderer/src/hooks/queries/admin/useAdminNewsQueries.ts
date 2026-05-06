import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "../../../lib/queryKeys";
import { ensureSuccess } from "../../../lib/queryHelpers";
import type { AdminNewsFilters } from "./types";
import { ADMIN_NEWS_PAGE_SIZE, normalizeNewsListPayload, getNewsTags } from "./utils";
import type { ApiCreateNewsDto, ApiUpdateNewsDto } from "../../../../../lib/api/news";

const adminNewsTagsQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.adminNewsTags(),
    queryFn: getNewsTags,
  });

const adminNewsInfiniteQueryOptions = (filters: AdminNewsFilters) =>
  infiniteQueryOptions({
    queryKey: queryKeys.adminNews(filters),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const result = await window.electronAPI.admin.getNews(
        filters.search,
        pageParam,
        ADMIN_NEWS_PAGE_SIZE,
        filters.sortBy,
        filters.order,
        filters.tagId,
        filters.fromDate,
        filters.toDate,
      );

      return normalizeNewsListPayload(
        ensureSuccess(result, "Failed to fetch news").data,
        pageParam,
        ADMIN_NEWS_PAGE_SIZE,
      );
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.meta) {
        return undefined;
      }

      return lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined;
    },
    select: (data) => ({
      ...data,
      items: data.pages.flatMap((page) => page?.items ?? []),
    }),
  });

export function useAdminNewsTagsQuery() {
  return useQuery(adminNewsTagsQueryOptions());
}

export function useAdminNewsQuery(filters: AdminNewsFilters) {
  return useInfiniteQuery(adminNewsInfiniteQueryOptions(filters));
}

export function useAdminNewsMutations(_filters: AdminNewsFilters) {
  const queryClient = useQueryClient();
  const invalidateNews = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.adminNews(_filters),
    });
  };

  return {
    createNews: useMutation({
      mutationFn: async (payload: ApiCreateNewsDto) =>
        ensureSuccess(
          await window.electronAPI.admin.createNews(payload),
          "Failed to create news",
        ),
      onSuccess: invalidateNews,
    }),
    updateNews: useMutation({
      mutationFn: async ({
        newsId,
        payload,
      }: {
        newsId: string;
        payload: ApiUpdateNewsDto;
      }) =>
        ensureSuccess(
          await window.electronAPI.admin.updateNews(newsId, payload),
          "Failed to update news",
        ),
      onSuccess: invalidateNews,
    }),
    deleteNews: useMutation({
      mutationFn: async (newsId: string) =>
        ensureSuccess(
          await window.electronAPI.admin.deleteNews(newsId),
          "Failed to delete news",
        ),
      onSuccess: invalidateNews,
    }),
    createNewsTag: useMutation({
      mutationFn: async (payload: { name: string }) =>
        ensureSuccess(
          await window.electronAPI.admin.createNewsTag(payload),
          "Failed to create news tag",
        ),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.adminNewsTags(),
        });
      },
    }),
    updateNewsTag: useMutation({
      mutationFn: async ({
        tagId,
        payload,
      }: {
        tagId: string;
        payload: { name: string };
      }) =>
        ensureSuccess(
          await window.electronAPI.admin.updateNewsTag(tagId, payload),
          "Failed to update news tag",
        ),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.adminNewsTags(),
        });
      },
    }),
    deleteNewsTag: useMutation({
      mutationFn: async (tagId: string) =>
        ensureSuccess(
          await window.electronAPI.admin.deleteNewsTag(tagId),
          "Failed to delete news tag",
        ),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.adminNewsTags(),
        });
      },
    }),
  };
}
