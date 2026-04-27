import { create } from "zustand";
import type { ApiUser } from "../../../lib/api/admin";

interface AdminState {
  users: ApiUser[];
  isLoading: boolean;
  actionLoading: string | null; // ID of the user being processed
  error: string | null;
  fetchUsers: (search?: string) => Promise<void>;
  banUser: (userId: string, reason: string) => Promise<boolean>;
  unbanUser: (userId: string) => Promise<boolean>;
  updateUserRoles: (userId: string, roles: ("user" | "moderator" | "admin")[]) => Promise<boolean>;
}

export const useAdminStore = create<AdminState>()((set, get) => ({
  users: [],
  isLoading: false,
  actionLoading: null,
  error: null,

  fetchUsers: async (search?: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await window.electronAPI.admin.getUsers(search);
      if (result.success && result.data) {
        set({ users: result.data as ApiUser[], isLoading: false });
      } else {
        set({ error: result.error || "Failed to fetch users", isLoading: false });
      }
    } catch (err) {
      set({ error: "Failed to fetch users", isLoading: false });
    }
  },

  banUser: async (userId, reason) => {
    set({ actionLoading: userId });
    try {
      const result = await window.electronAPI.admin.banUser(userId, reason);
      if (result.success) {
        // Optimistic update
        set((state) => ({
          users: state.users.map((u) =>
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
        // Optimistic update
        set((state) => ({
          users: state.users.map((u) =>
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

  updateUserRoles: async (userId, roles) => {
    set({ actionLoading: userId });
    try {
      const result = await window.electronAPI.admin.updateRoles(userId, roles);
      if (result.success) {
        // Optimistic update
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, roles: roles } : u
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
