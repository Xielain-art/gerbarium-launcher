import { useState, useCallback } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import {
  getUsersRequest,
  banUserRequest,
  unbanUserRequest,
  updateUserRolesRequest,
  type ApiUser
} from "../../../lib/api/admin";

export function useAdmin() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    const result = await getUsersRequest(token);
    
    if (result.success && result.data) {
      setUsers(result.data);
    } else {
      setError(result.errorMessage || "Failed to fetch users");
    }
    setIsLoading(false);
  }, [token]);

  const banUser = useCallback(async (userId: string, reason: string) => {
    if (!token) return false;
    const result = await banUserRequest(token, userId, reason);
    if (result.success) {
      await fetchUsers();
      return true;
    }
    return false;
  }, [token, fetchUsers]);

  const unbanUser = useCallback(async (userId: string) => {
    if (!token) return false;
    const result = await unbanUserRequest(token, userId);
    if (result.success) {
      await fetchUsers();
      return true;
    }
    return false;
  }, [token, fetchUsers]);

  const updateUserRoles = useCallback(async (userId: string, roles: ("user" | "moderator" | "admin")[]) => {
    if (!token) return false;
    const result = await updateUserRolesRequest(token, userId, roles);
    if (result.success) {
      await fetchUsers();
      return true;
    }
    return false;
  }, [token, fetchUsers]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    banUser,
    unbanUser,
    updateUserRoles,
  };
}
