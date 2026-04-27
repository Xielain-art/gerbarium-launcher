import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "./useTranslation";
import { useAuthStore } from "../stores/useAuthStore";
import { useAdminScreen } from "./useAdminScreen";
import { ROUTES } from "../../../shared/constants/system";

export function useAdminPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const admin = useAdminScreen();

  return {
    t,
    currentUser,
    onBack: () => navigate({ to: ROUTES.DASHBOARD }),
    ...admin,
  };
}
