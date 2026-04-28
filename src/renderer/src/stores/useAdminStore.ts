import { create } from "zustand";
import type { ApiRole, ApiUser } from "../../../lib/api/admin";

interface AdminState {
  users: ApiUser[];
  roles: ApiRole[];
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
  fetchRoles: () => Promise<void>;
  fetchMoreUsers: () => Promise<void>;
  banUser: (userId: string, reason: string) => Promise<boolean>;
  unbanUser: (userId: string) => Promise<boolean>;
  updateUserRoles: (userId: string, roleIds: string[]) => Promise<boolean>;
  createRole: (
    payload: { name: string; description?: string },
  ) => Promise<{ success: boolean; error?: string }>;
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
  roles: [],
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

  fetchRoles: async () => {
    try {
      const result = await window.electronAPI.admin.getRoles();
      if (result.success && result.data) {
        set({ roles: result.data });
      }
    } catch {
      // Ignore and keep user-derived roles as fallback in UI.
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
            u.id === userId && result.data ? result.data : u
          ),
          allUsers: state.allUsers.map((u) =>
            u.id === userId && result.data ? result.data : u
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

  createRole: async (payload) => {
    set({ actionLoading: "create-role", error: null });
    try {
      const result = await window.electronAPI.admin.createRole(payload);
      if (result.success && result.data) {
        set((state) => ({
          roles: [...state.roles, result.data!],
          actionLoading: null,
        }));
        return { success: true };
      }
      const message = result.error || "Failed to create role";
      set({
        actionLoading: null,
        error: message,
      });
      return { success: false, error: message };
    } catch {
      const message = "Failed to create role";
      set({
        actionLoading: null,
        error: message,
      });
      return { success: false, error: message };
    }
  },
}));
