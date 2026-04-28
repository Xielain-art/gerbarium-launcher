import { create } from "zustand";
import type { ApiUser } from "../../../lib/api/admin";

interface AdminState {
  users: ApiUser[];
  allUsers: ApiUser[];
  isLoading: boolean;
  isLoadingMore: boolean;
  actionLoading: string | null;
  error: string | null;
  hasMore: boolean;
  page: number;
  
  // Filters
  search: string;
  role?: string;
  banned?: boolean;
  
  setFilters: (filters: { search?: string; role?: string; banned?: boolean }) => void;
  fetchUsers: () => Promise<void>;
  fetchMoreUsers: () => Promise<void>;
  banUser: (userId: string, reason: string) => Promise<boolean>;
  unbanUser: (userId: string) => Promise<boolean>;
  updateUserRoles: (userId: string, roleIds: string[]) => Promise<boolean>;
}

const PAGE_LIMIT = 20;

function normalizeApiUserPayload(payload: unknown): ApiUser[] {
  if (Array.isArray(payload)) return payload as ApiUser[];
  if (payload && typeof payload === "object" && "data" in payload) {
    const nested = (payload as { data?: unknown }).data;
    if (Array.isArray(nested)) return nested as ApiUser[];
  }
  return [];
}

export const useAdminStore = create<AdminState>()((set, get) => ({
  users: [],
  allUsers: [],
  isLoading: false,
  isLoadingMore: false,
  actionLoading: null,
  error: null,
  hasMore: false,
  page: 1,
  search: "",

  setFilters: (filters) => {
    set((state) => ({ ...state, ...filters, page: 1, hasMore: false }));
    void get().fetchUsers();
  },

  fetchUsers: async () => {
    const { search, role, banned } = get();
    set({ isLoading: true, error: null, page: 1, hasMore: false, allUsers: [], users: [] });
    try {
      const result = await window.electronAPI.admin.getUsers(
        search,
        undefined,
        undefined,
        role,
        banned,
      );
      if (result.success && result.data) {
        const allUsers = normalizeApiUserPayload(result.data);
        const users = allUsers.slice(0, PAGE_LIMIT);
        set({ 
          allUsers,
          users, 
          isLoading: false,
          hasMore: allUsers.length > PAGE_LIMIT,
          page: 1
        });
      } else {
        set({ error: result.error || "Failed to fetch users", isLoading: false });
      }
    } catch (err) {
      set({ error: "Failed to fetch users", isLoading: false });
    }
  },

  fetchMoreUsers: async () => {
    const { page, hasMore, isLoading, isLoadingMore, allUsers } = get();
    if (!hasMore || isLoading || isLoadingMore) return;

    set({ isLoadingMore: true });
    try {
      const nextPage = page + 1;
      const nextUsers = allUsers.slice(0, nextPage * PAGE_LIMIT);
      set({
        users: nextUsers,
        isLoadingMore: false,
        page: nextPage,
        hasMore: nextUsers.length < allUsers.length,
      });
    } catch {
      set({ isLoadingMore: false });
    }
  },

  banUser: async (userId, reason) => {
    set({ actionLoading: userId });
    try {
      const result = await window.electronAPI.admin.banUser(userId, reason);
      if (result.success) {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, isBanned: true, banReason: reason } : u
          ),
          allUsers: state.allUsers.map((u) =>
            u.id === userId ? { ...u, isBanned: true, banReason: reason } : u
          ),
          actionLoading: null,
        }));
        return true;
      }
      set({ actionLoading: null });
      return false;
    } catch (err) {
      set({ actionLoading: null });
      return false;
    }
  },

  unbanUser: async (userId) => {
    set({ actionLoading: userId });
    try {
      const result = await window.electronAPI.admin.unbanUser(userId);
      if (result.success) {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, isBanned: false, banReason: undefined } : u
          ),
          allUsers: state.allUsers.map((u) =>
            u.id === userId ? { ...u, isBanned: false, banReason: undefined } : u
          ),
          actionLoading: null,
        }));
        return true;
      }
      set({ actionLoading: null });
      return false;
    } catch (err) {
      set({ actionLoading: null });
      return false;
    }
  },

  updateUserRoles: async (userId, roleIds) => {
    set({ actionLoading: userId });
    try {
      const result = await window.electronAPI.admin.updateRoles(userId, roleIds);
      if (result.success) {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  roles: (u.roles ?? []).filter((role) => roleIds.includes(role.id)),
                }
              : u
          ),
          allUsers: state.allUsers.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  roles: (u.roles ?? []).filter((role) => roleIds.includes(role.id)),
                }
              : u
          ),
          actionLoading: null,
        }));
        return true;
      }
      set({ actionLoading: null });
      return false;
    } catch (err) {
      set({ actionLoading: null });
      return false;
    }
  },
}));
