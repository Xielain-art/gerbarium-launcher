import { create } from "zustand";
import type {
  ApiCreateNewsDto,
  ApiNews,
  ApiNewsTag,
  ApiNewsListPayload,
  ApiUpdateNewsDto,
} from "../../../lib/api/news";

interface AdminNewsState {
  news: ApiNews[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  page: number;
  actionLoadingId: string | "create" | null;
  error: string | null;
  newsTags: ApiNewsTag[];
  isLoadingTags: boolean;

  // Filters
  search: string;
  tagId: string;
  fromDate: string;
  toDate: string;
  sortBy: "createdAt" | "updatedAt" | "title";
  order: "ASC" | "DESC";

  setFilters: (filters: { 
    search?: string; 
    tagId?: string; 
    fromDate?: string; 
    toDate?: string; 
    sortBy?: "createdAt" | "updatedAt" | "title"; 
    order?: "ASC" | "DESC" 
  }) => void;
  fetchNews: () => Promise<void>;
  fetchMoreNews: () => Promise<void>;
  createNews: (payload: ApiCreateNewsDto) => Promise<boolean>;
  updateNews: (newsId: string, payload: ApiUpdateNewsDto) => Promise<boolean>;
  deleteNews: (newsId: string) => Promise<boolean>;
  fetchNewsTags: () => Promise<void>;
  createNewsTag: (name: string) => Promise<{ success: boolean; tag?: ApiNewsTag; error?: string }>;
  updateNewsTag: (tagId: string, name: string) => Promise<{ success: boolean; tag?: ApiNewsTag; error?: string }>;
  deleteNewsTag: (tagId: string) => Promise<{ success: boolean; error?: string }>;
}

const PAGE_LIMIT = 10;

function normalizeNewsPayload(payload: unknown): ApiNewsListPayload {
  const empty: ApiNewsListPayload = {
    items: [],
    meta: { page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 1 },
  };
  if (!payload) return empty;

  if (
    typeof payload === "object" &&
    payload !== null &&
    "items" in payload &&
    Array.isArray((payload as { items?: unknown }).items)
  ) {
    const typed = payload as ApiNewsListPayload;
    return {
      items: typed.items,
      meta: {
        page: typed.meta?.page ?? 1,
        limit: typed.meta?.limit ?? PAGE_LIMIT,
        total: typed.meta?.total ?? typed.items.length,
        totalPages: typed.meta?.totalPages ?? 1,
      },
    };
  }

  if (Array.isArray(payload)) {
    return {
      items: payload as ApiNews[],
      meta: { page: 1, limit: PAGE_LIMIT, total: payload.length, totalPages: 1 },
    };
  }

  if (typeof payload === "object" && payload !== null && "data" in payload) {
    const nested = (payload as { data?: unknown }).data;
    if (Array.isArray(nested)) {
      return {
        items: nested as ApiNews[],
        meta: { page: 1, limit: PAGE_LIMIT, total: nested.length, totalPages: 1 },
      };
    }
  }

  return empty;
}

function mergeNewsById(current: ApiNews[], incoming: ApiNews[]): ApiNews[] {
  if (incoming.length === 0) return current;
  const seen = new Set(current.map((item) => item.id));
  const uniqueIncoming = incoming.filter((item) => !seen.has(item.id));
  return uniqueIncoming.length > 0 ? [...current, ...uniqueIncoming] : current;
}

export const useAdminNewsStore = create<AdminNewsState>()((set, get) => ({
  news: [],
  isLoading: false,
  isLoadingMore: false,
  hasMore: false,
  page: 1,
  actionLoadingId: null,
  error: null,
  newsTags: [],
  isLoadingTags: false,
  search: "",
  tagId: "",
  fromDate: "",
  toDate: "",
  sortBy: "createdAt",
  order: "DESC",

  setFilters: (filters) => {
    set((state) => ({ ...state, ...filters, page: 1, hasMore: false }));
    void get().fetchNews();
  },

  fetchNews: async () => {
    const { search, tagId, fromDate, toDate, sortBy, order } = get();
    set({ isLoading: true, error: null, page: 1, hasMore: false });
    try {
      const result = await window.electronAPI.admin.getNews(
        search, 1, PAGE_LIMIT, sortBy, order, 
        tagId || undefined, 
        fromDate || undefined, 
        toDate || undefined
      );
      if (!result.success) {
        set({
          isLoading: false,
          error: result.error || "Failed to fetch news",
        });
        return;
      }
      const payload = normalizeNewsPayload(result.data);
      set({
        news: payload.items,
        isLoading: false,
        hasMore: payload.meta.page < payload.meta.totalPages,
        page: payload.meta.page,
      });
    } catch {
      set({ isLoading: false, error: "Failed to fetch news" });
    }
  },

  fetchMoreNews: async () => {
    const { page, hasMore, isLoading, isLoadingMore, news, search, tagId, fromDate, toDate, sortBy, order } = get();
    if (!hasMore || isLoading || isLoadingMore) return;

    set({ isLoadingMore: true });
    try {
      const nextPage = page + 1;
      const result = await window.electronAPI.admin.getNews(
        search, nextPage, PAGE_LIMIT, sortBy, order,
        tagId || undefined,
        fromDate || undefined,
        toDate || undefined
      );
      
      if (result.success && result.data) {
        const payload = normalizeNewsPayload(result.data);
        const merged = mergeNewsById(news, payload.items);
        const gotNewItems = merged.length > news.length;
        set({
          news: merged,
          isLoadingMore: false,
          page: payload.meta.page,
          // Stop requesting when server says no more pages or we only got duplicates.
          hasMore: payload.meta.page < payload.meta.totalPages && gotNewItems,
        });
      } else {
        set({ isLoadingMore: false });
      }
    } catch {
      set({ isLoadingMore: false });
    }
  },

  createNews: async (payload) => {
    set({ actionLoadingId: "create", error: null });
    try {
      const result = await window.electronAPI.admin.createNews(payload);
      if (!result.success || !result.data) {
        set({
          actionLoadingId: null,
          error: result.error || "Failed to create news",
        });
        return false;
      }
      set({ actionLoadingId: null });
      await get().fetchNews();
      return true;
    } catch {
      set({ actionLoadingId: null, error: "Failed to create news" });
      return false;
    }
  },

  updateNews: async (newsId, payload) => {
    set({ actionLoadingId: newsId, error: null });
    try {
      const result = await window.electronAPI.admin.updateNews(newsId, payload);
      if (!result.success || !result.data) {
        set({
          actionLoadingId: null,
          error: result.error || "Failed to update news",
        });
        return false;
      }
      set({ actionLoadingId: null });
      await get().fetchNews();
      return true;
    } catch {
      set({ actionLoadingId: null, error: "Failed to update news" });
      return false;
    }
  },

  deleteNews: async (newsId) => {
    set({ actionLoadingId: newsId, error: null });
    try {
      const result = await window.electronAPI.admin.deleteNews(newsId);
      if (!result.success) {
        set({
          actionLoadingId: null,
          error: result.error || "Failed to delete news",
        });
        return false;
      }
      set({ actionLoadingId: null });
      await get().fetchNews();
      return true;
    } catch {
      set({ actionLoadingId: null, error: "Failed to delete news" });
      return false;
    }
  },

  fetchNewsTags: async () => {
    set({ isLoadingTags: true });
    try {
      const result = await window.electronAPI.admin.getNewsTags();
      if (!result.success || !result.data) {
        set({ isLoadingTags: false, error: result.error || "Failed to fetch news tags" });
        return;
      }
      set({ newsTags: result.data, isLoadingTags: false });
    } catch {
      set({ isLoadingTags: false, error: "Failed to fetch news tags" });
    }
  },

  createNewsTag: async (name) => {
    try {
      const result = await window.electronAPI.admin.createNewsTag({ name });
      if (!result.success || !result.data) {
        return { success: false, error: result.error || "Failed to create tag" };
      }
      const created = result.data;
      set((state) => ({
        newsTags: state.newsTags.some((tag) => tag.id === created.id)
          ? state.newsTags
          : [...state.newsTags, created],
      }));
      return { success: true, tag: created };
    } catch {
      return { success: false, error: "Failed to create tag" };
    }
  },
  updateNewsTag: async (tagId, name) => {
    try {
      const result = await window.electronAPI.admin.updateNewsTag(tagId, { name });
      if (!result.success || !result.data) {
        return { success: false, error: result.error || "Failed to update tag" };
      }
      const updated = result.data;
      set((state) => ({
        newsTags: state.newsTags.map((tag) => (tag.id === tagId ? updated : tag)),
      }));
      return { success: true, tag: updated };
    } catch {
      return { success: false, error: "Failed to update tag" };
    }
  },
  deleteNewsTag: async (tagId) => {
    try {
      const result = await window.electronAPI.admin.deleteNewsTag(tagId);
      if (!result.success) {
        return { success: false, error: result.error || "Failed to delete tag" };
      }
      set((state) => ({
        newsTags: state.newsTags.filter((tag) => tag.id !== tagId),
      }));
      return { success: true };
    } catch {
      return { success: false, error: "Failed to delete tag" };
    }
  },
}));
