import { useAuthStore } from "../stores/useAuthStore";

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    loginOffline,
    logout,
    clearError,
    loadToken,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    loginOffline,
    logout,
    clearError,
    loadToken,
  };
}
