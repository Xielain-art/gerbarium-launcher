import { create } from "zustand";
import { listChangelogRequest, type ApiChangelog } from "../../../lib/api/changelog";
import type { ChangelogItem } from "../types";
import { UI_STRINGS } from "../../../shared/constants/ui-strings";

interface ChangelogState {
  allItems: ChangelogItem[];
  items: ChangelogItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  page: number;
  isInitialLoaded: boolean;
  error: string | null;
  fetchChangelog: () => Promise<void>;
  fetchMoreChangelog: () => Promise<void>;
}

const PAGE_LIMIT = 8;

function normalizeChanges(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) => {
    if (typeof entry === "string") return [entry];
    if (Array.isArray(entry)) {
      return entry.filter((value): value is string => typeof value === "string");
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

export const useChangelogStore = create<ChangelogState>((set, get) => ({
  allItems: [],
  items: [],
  isLoading: false,
  isLoadingMore: false,
  hasMore: false,
  page: 1,
  isInitialLoaded: false,
  error: null,

  fetchChangelog: async () => {
    set({
      allItems: [],
      items: [],
      isLoading: true,
      isLoadingMore: false,
      hasMore: false,
      page: 1,
      isInitialLoaded: false,
      error: null,
    });
    try {
      const result = await listChangelogRequest({
        sortBy: "releaseDate",
        order: "DESC",
      });
      if (!result.success || !result.data) {
        set({
          isLoading: false,
          isInitialLoaded: true,
          error: result.errorMessage ?? UI_STRINGS.STORE_ERRORS.NEWS_LOAD,
        });
        return;
      }
      const allItems = result.data.map(mapApiChangelog);
      set({
        allItems,
        items: allItems.slice(0, PAGE_LIMIT),
        isLoading: false,
        hasMore: allItems.length > PAGE_LIMIT,
        page: 1,
        isInitialLoaded: true,
      });
    } catch (error) {
      set({
        isLoading: false,
        isInitialLoaded: true,
        error: error instanceof Error ? error.message : UI_STRINGS.STORE_ERRORS.NEWS_LOAD,
      });
    } 
  },

  fetchMoreChangelog: async () => {
    const { allItems, page, hasMore, isLoading, isLoadingMore, isInitialLoaded } = get();
    if (!isInitialLoaded || !hasMore || isLoading || isLoadingMore) return;
    set({ isLoadingMore: true });
    const nextPage = page + 1;
    const nextItems = allItems.slice(0, nextPage * PAGE_LIMIT);
    set({
      items: nextItems,
      page: nextPage,
      hasMore: nextItems.length < allItems.length,
      isLoadingMore: false,
    });
  },
}));
