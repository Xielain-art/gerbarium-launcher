import { create } from "zustand";
import { listNewsRequest, type ApiNews } from "../../../lib/api/news";
import type { NewsItem } from "../types";
import { UI_STRINGS } from "../../../shared/constants/ui-strings";

interface NewsState {
  items: NewsItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isInitialLoaded: boolean;
  page: number;
  error: string | null;

  // Filters
  searchQuery: string;
  tag?: string;
  sortBy: "createdAt" | "updatedAt" | "title";
  order: "ASC" | "DESC";
  
  setFilters: (filters: { searchQuery?: string; tag?: string; sortBy?: "createdAt" | "updatedAt" | "title"; order?: "ASC" | "DESC" }) => void;
  fetchNews: () => Promise<void>;
  fetchMoreNews: () => Promise<void>;
  clearError: () => void;
}

const FALLBACK_CATEGORY: NewsItem["category"] = "announcement";
const VALID_CATEGORIES: NewsItem["category"][] = [
  "update",
  "event",
  "community",
  "announcement",
];

function normalizeTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const tags = raw
    .map((tag) => (typeof tag === "string" ? tag : Array.isArray(tag) ? tag[0] : ""))
    .filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
    .map((tag) => tag.trim());
  return [...new Set(tags)];
}

function resolveCategoryFromTags(tags: string[]): NewsItem["category"] {
  const lower = tags.map((tag) => tag.toLowerCase());
  const match = VALID_CATEGORIES.find((cat) => lower.includes(cat));
  return match ?? FALLBACK_CATEGORY;
}

function stripHtml(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, " ");
  }
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

function mapApiNews(item: ApiNews): NewsItem {
  const tags = normalizeTags(item.tags);
  const plain = stripHtml(item.content).trim();
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    content: plain || item.content,
    htmlContent: item.content,
    date: item.createdAt,
    imageUrl: item.image,
    category: resolveCategoryFromTags(tags),
    author: item.authorUsername,
    tags,
  };
}

export const useNewsStore = create<NewsState>((set, get) => ({
  items: [],
  isLoading: false,
  isLoadingMore: false,
  hasMore: false,
  isInitialLoaded: false,
  page: 1,
  error: null,
  
  searchQuery: "",
  sortBy: "createdAt",
  order: "DESC",

  setFilters: (filters) => {
    set((state) => ({ ...state, ...filters, page: 1, hasMore: false }));
    void get().fetchNews();
  },

  fetchNews: async () => {
    const { searchQuery, tag, sortBy, order } = get();
    set({ isLoading: true, error: null, page: 1, hasMore: false });
    try {
      const result = await listNewsRequest({
        search: searchQuery || undefined,
        tag,
        sortBy,
        order,
        page: 1,
        limit: 10,
      });
      if (!result.success || !result.data) {
        set({
          error: result.errorMessage ?? UI_STRINGS.STORE_ERRORS.NEWS_LOAD,
          isLoading: false,
          isInitialLoaded: true,
        });
        return;
      }
      set({
        items: result.data.items.map(mapApiNews),
        hasMore: result.data.meta.page < result.data.meta.totalPages,
        page: result.data.meta.page,
        isLoading: false,
        isInitialLoaded: true,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : UI_STRINGS.STORE_ERRORS.NEWS_LOAD;
      set({
        error: errorMessage,
        isLoading: false,
        isInitialLoaded: true,
      });
    }
  },

  fetchMoreNews: async () => {
    const { page, hasMore, isLoading, isLoadingMore, isInitialLoaded, searchQuery, tag, sortBy, order } = get();
    if (!isInitialLoaded || !hasMore || isLoading || isLoadingMore) {
      return;
    }
    set({ isLoadingMore: true, error: null });

    try {
      const nextPage = page + 1;
      const result = await listNewsRequest({
        search: searchQuery || undefined,
        tag,
        sortBy,
        order,
        page: nextPage,
        limit: 10,
      });

      if (!result.success || !result.data) {
        set({
          isLoadingMore: false,
          error: result.errorMessage ?? UI_STRINGS.STORE_ERRORS.NEWS_LOAD,
        });
        return;
      }

      const mapped = result.data.items.map(mapApiNews);
      set((state) => ({
        items: [...state.items, ...mapped],
        hasMore: result.data.meta.page < result.data.meta.totalPages,
        page: result.data.meta.page,
        isLoadingMore: false,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : UI_STRINGS.STORE_ERRORS.NEWS_LOAD;
      set({ error: errorMessage, isLoadingMore: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Auto-fetch on store creation
useNewsStore.getState().fetchNews();
