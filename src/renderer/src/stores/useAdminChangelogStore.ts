import { create } from "zustand";
import type {
  ApiChangelog,
  ApiCreateChangelogDto,
  ApiUpdateChangelogDto,
} from "../../../lib/api/changelog";

interface AdminChangelogState {
  changelog: ApiChangelog[];
  isLoading: boolean;
  actionLoadingId: string | "create" | null;
  error: string | null;

  fromDate: string;
  toDate: string;
  mandatory?: boolean;
  sortBy: "releaseDate" | "version" | "createdAt";
  order: "ASC" | "DESC";

  setFilters: (filters: {
    fromDate?: string;
    toDate?: string;
    mandatory?: boolean;
    sortBy?: "releaseDate" | "version" | "createdAt";
    order?: "ASC" | "DESC";
  }) => void;
  fetchChangelog: () => Promise<void>;
  createChangelog: (payload: ApiCreateChangelogDto) => Promise<boolean>;
  updateChangelog: (changelogId: string, payload: ApiUpdateChangelogDto) => Promise<boolean>;
  deleteChangelog: (changelogId: string) => Promise<boolean>;
}

function normalizeChangelogPayload(payload: unknown): ApiChangelog[] {
  if (Array.isArray(payload)) return payload as ApiChangelog[];
  if (payload && typeof payload === "object" && "data" in payload) {
    const nested = (payload as { data?: unknown }).data;
    if (Array.isArray(nested)) return nested as ApiChangelog[];
  }
  return [];
}

export const useAdminChangelogStore = create<AdminChangelogState>()((set, get) => ({
  changelog: [],
  isLoading: false,
  actionLoadingId: null,
  error: null,
  fromDate: "",
  toDate: "",
  sortBy: "releaseDate",
  order: "DESC",

  setFilters: (filters) => {
    set((state) => ({ ...state, ...filters }));
    void get().fetchChangelog();
  },

  fetchChangelog: async () => {
    const { fromDate, toDate, mandatory, sortBy, order } = get();
    set({ isLoading: true, error: null });
    try {
      const result = await window.electronAPI.admin.getChangelog(
        fromDate || undefined,
        toDate || undefined,
        mandatory,
        sortBy,
        order,
      );
      if (!result.success) {
        set({
          isLoading: false,
          error: result.error || "Failed to fetch changelog",
        });
        return;
      }
      set({
        changelog: normalizeChangelogPayload(result.data),
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, error: "Failed to fetch changelog" });
    }
  },

  createChangelog: async (payload) => {
    set({ actionLoadingId: "create", error: null });
    try {
      const result = await window.electronAPI.admin.createChangelog(payload);
      if (!result.success) {
        set({
          actionLoadingId: null,
          error: result.error || "Failed to create changelog",
        });
        return false;
      }
      set({ actionLoadingId: null });
      await get().fetchChangelog();
      return true;
    } catch {
      set({ actionLoadingId: null, error: "Failed to create changelog" });
      return false;
    }
  },

  updateChangelog: async (changelogId, payload) => {
    set({ actionLoadingId: changelogId, error: null });
    try {
      const result = await window.electronAPI.admin.updateChangelog(changelogId, payload);
      if (!result.success) {
        set({
          actionLoadingId: null,
          error: result.error || "Failed to update changelog",
        });
        return false;
      }
      set({ actionLoadingId: null });
      await get().fetchChangelog();
      return true;
    } catch {
      set({ actionLoadingId: null, error: "Failed to update changelog" });
      return false;
    }
  },

  deleteChangelog: async (changelogId) => {
    set({ actionLoadingId: changelogId, error: null });
    try {
      const result = await window.electronAPI.admin.deleteChangelog(changelogId);
      if (!result.success) {
        set({
          actionLoadingId: null,
          error: result.error || "Failed to delete changelog",
        });
        return false;
      }
      set({ actionLoadingId: null });
      await get().fetchChangelog();
      return true;
    } catch {
      set({ actionLoadingId: null, error: "Failed to delete changelog" });
      return false;
    }
  },
}));
