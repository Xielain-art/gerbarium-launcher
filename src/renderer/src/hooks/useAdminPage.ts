import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useAdminScreen } from "./useAdminScreen";
import { ROUTES } from "../../../shared/constants/system";
import type { AuthUser } from "../types";

export interface AdminPageResult extends ReturnType<typeof useAdminScreen> {
  currentUser: AuthUser | null;
  onBack: () => void;
}

export function useAdminPage(): AdminPageResult {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const admin = useAdminScreen();

  return {
    currentUser,
    onBack: () => navigate({ to: ROUTES.DASHBOARD }),
    ...admin,
  };
}

