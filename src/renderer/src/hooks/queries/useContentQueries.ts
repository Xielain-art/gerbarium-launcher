import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  listNewsRequest,
  type ApiNews,
  type ApiNewsListPayload,
} from "../../../../lib/api/news";
import {
  listChangelogRequest,
  type ApiChangelog,
} from "../../../../lib/api/changelog";
import { UI_STRINGS } from "../../../../shared/constants/ui-strings";
import type { ChangelogItem, NewsItem, ServerStatusData } from "../../types";
import { getErrorMessage } from "../../lib/queryHelpers";
import { queryKeys } from "../../lib/queryKeys";

type PublicNewsFilters = {
  searchQuery?: string;
  tagId?: string;
  sortBy?: "createdAt" | "updatedAt" | "title";
  order?: "ASC" | "DESC";
};

const FALLBACK_CATEGORY: NewsItem["category"] = "announcement";
const VALID_CATEGORIES: NewsItem["category"][] = [
  "update",
  "event",
  "community",
  "announcement",
];
const PUBLIC_NEWS_PAGE_LIMIT = 2;
const CHANGELOG_PAGE_LIMIT = 8;

type NormalizedNewsTag = { id: string; name: string };

function normalizeNewsTags(raw: unknown): NormalizedNewsTag[] {
  if (!Array.isArray(raw)) return [];

  const tags = raw
    .map((tag): NormalizedNewsTag | null => {
      if (typeof tag === "object" && tag !== null) {
        const maybeId = "id" in tag ? (tag as { id?: unknown }).id : undefined;
        const maybeName =
          "name" in tag ? (tag as { name?: unknown }).name : undefined;
        if (typeof maybeId === "string" && typeof maybeName === "string") {
          const id = maybeId.trim();
          const name = maybeName.trim();
          if (id && name) return { id, name };
        }
      }
      return null;
    })
    .filter((tag): tag is NormalizedNewsTag => tag !== null);

  const byId = new Map<string, NormalizedNewsTag>();
  for (const tag of tags) {
    byId.set(tag.id, tag);
  }
  return Array.from(byId.values());
}

function stripHtml(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, " ");
  }

  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

function resolveCategoryFromTags(tags: string[]): NewsItem["category"] {
  const lowerTags = tags.map((tag) => tag.toLowerCase());
  const category = VALID_CATEGORIES.find((candidate) =>
    lowerTags.includes(candidate),
  );

  return category ?? FALLBACK_CATEGORY;
}

function mapApiNews(item: ApiNews): NewsItem {
  const tags = normalizeNewsTags(item.tags);
  const plain = stripHtml(item.content).trim();

  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    content: plain || item.content,
    htmlContent: item.content,
    date: item.createdAt,
    imageUrl: item.image,
    category: resolveCategoryFromTags(tags.map((tag) => tag.name)),
    author: item.authorUsername,
    tags: tags.map((tag) => tag.name),
    tagIds: tags.map((tag) => tag.id),
  };
}

function normalizeChanges(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((entry) => {
    if (typeof entry === "string") return [entry];
    if (Array.isArray(entry)) {
      return entry.filter(
        (value): value is string => typeof value === "string",
      );
    }

    return [];
  });
}

function mapApiChangelog(item: ApiChangelog): ChangelogItem {
  return {
    id: item.id,
    version: item.version,
    releaseDate: item.releaseDate,
    changes: normalizeChanges(item.changes),
    downloadUrl: item.downloadUrl,
    mandatory: item.mandatory,
    createdAt: item.createdAt,
  };
}

const mockServerStatus: ServerStatusData = {
  online: true,
  players: {
    online: 142,
    max: 500,
  },
  version: "1.20.1",
  motd: UI_STRINGS.DASHBOARD.SERVER_MOTD,
  latency: 45,
};

export function usePublicNewsQuery(filters: PublicNewsFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.publicNews(filters),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const result = await listNewsRequest({
        search: filters.searchQuery || undefined,
        tagId: filters.tagId,
        sortBy: filters.sortBy ?? "createdAt",
        order: filters.order ?? "DESC",
        page: pageParam,
        limit: PUBLIC_NEWS_PAGE_LIMIT,
      });

      if (!result.success || !result.data) {
        throw new Error(
          result.errorMessage ?? UI_STRINGS.STORE_ERRORS.NEWS_LOAD,
        );
      }

      return result.data;
    },
    getNextPageParam: (lastPage: ApiNewsListPayload) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    select: (data) => {
      const pages = data.pages;
      const items = pages.flatMap((page) => page.items.map(mapApiNews));

      return {
        ...data,
        items,
      };
    },
  });
}

export function usePublicChangelogQuery() {
  return useQuery({
    queryKey: queryKeys.publicChangelog(),
    queryFn: async () => {
      const result = await listChangelogRequest({
        sortBy: "releaseDate",
        order: "DESC",
      });

      if (!result.success || !result.data) {
        throw new Error(
          result.errorMessage ?? UI_STRINGS.STORE_ERRORS.NEWS_LOAD,
        );
      }

      return result.data.map(mapApiChangelog);
    },
  });
}

export function usePaginatedChangelog(changelog: ChangelogItem[]) {
  const visibleItems = changelog.slice(0, CHANGELOG_PAGE_LIMIT);
  const hasMore = changelog.length > CHANGELOG_PAGE_LIMIT;

  return {
    initialItems: visibleItems,
    hasInitialMore: hasMore,
    pageSize: CHANGELOG_PAGE_LIMIT,
  };
}

export function useServerStatusQuery() {
  return useQuery({
    queryKey: queryKeys.serverStatus(),
    queryFn: async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 300));
      return mockServerStatus;
    },
    refetchInterval: 30_000,
  });
}

export function toQueryErrorMessage(error: unknown, fallback: string): string {
  return getErrorMessage(error, fallback);
}
