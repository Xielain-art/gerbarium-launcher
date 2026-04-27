import { create } from "zustand";
import type { ApiCreateNewsDto, ApiNews, ApiUpdateNewsDto } from "../../../lib/api/news";

interface AdminNewsState {
  news: ApiNews[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  page: number;
  actionLoadingId: string | "create" | null;
  error: string | null;

  // Filters
  search: string;
  tag: string;
  fromDate: string;
  toDate: string;
  sortBy: "createdAt" | "updatedAt" | "title";
  order: "ASC" | "DESC";

  setFilters: (filters: { 
    search?: string; 
    tag?: string; 
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
}

const PAGE_LIMIT = 10;

function normalizeNewsPayload(payload: unknown): ApiNews[] {
  if (Array.isArray(payload)) return payload as ApiNews[];
  if (payload && typeof payload === "object" && "data" in payload) {
    const nested = (payload as { data?: unknown }).data;
    if (Array.isArray(nested)) return nested as ApiNews[];
  }
  return [];
}

export const useAdminNewsStore = create<AdminNewsState>()((set, get) => ({
  news: [],
  isLoading: false,
  isLoadingMore: false,
  hasMore: false,
  page: 1,
  actionLoadingId: null,
  error: null,
  search: "",
  tag: "",
  fromDate: "",
  toDate: "",
  sortBy: "createdAt",
  order: "DESC",

  setFilters: (filters) => {
    set((state) => ({ ...state, ...filters, page: 1, hasMore: false }));
    void get().fetchNews();
  },

  fetchNews: async () => {
    const { search, tag, fromDate, toDate, sortBy, order } = get();
    set({ isLoading: true, error: null, page: 1, hasMore: false });
    try {
      const result = await window.electronAPI.admin.getNews(
        search, 1, PAGE_LIMIT, sortBy, order, 
        tag || undefined, 
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
      const data = normalizeNewsPayload(result.data);
      set({
        news: data,
        isLoading: false,
        hasMore: data.length >= PAGE_LIMIT,
        page: 1
      });
    } catch {
      set({ isLoading: false, error: "Failed to fetch news" });
    }
  },

  fetchMoreNews: async () => {
    const { page, hasMore, isLoading, isLoadingMore, news, search, tag, fromDate, toDate, sortBy, order } = get();
    if (!hasMore || isLoading || isLoadingMore) return;

    set({ isLoadingMore: true });
    try {
      const nextPage = page + 1;
      const result = await window.electronAPI.admin.getNews(
        search, nextPage, PAGE_LIMIT, sortBy, order,
        tag || undefined,
        fromDate || undefined,
        toDate || undefined
      );
      
      if (result.success && result.data) {
        const newItems = normalizeNewsPayload(result.data);
        set({
          news: [...news, ...newItems],
          isLoadingMore: false,
          page: nextPage,
          hasMore: newItems.length >= PAGE_LIMIT
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
      set((state) => ({
        news: [result.data!, ...state.news],
        actionLoadingId: null,
      }));
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
      set((state) => ({
        news: state.news.map((item) => (item.id === newsId ? result.data! : item)),
        actionLoadingId: null,
      }));
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
      set((state) => ({
        news: state.news.filter((item) => item.id !== newsId),
        actionLoadingId: null,
      }));
      return true;
    } catch {
      set({ actionLoadingId: null, error: "Failed to delete news" });
      return false;
    }
  },
}));
