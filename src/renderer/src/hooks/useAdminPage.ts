import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useAdminScreen } from "./useAdminScreen";
import { ROUTES } from "../../../shared/constants/system";

export function useAdminPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const admin = useAdminScreen();

  return {
    currentUser,
    onBack: () => navigate({ to: ROUTES.DASHBOARD }),
    ...admin,
  };
}
