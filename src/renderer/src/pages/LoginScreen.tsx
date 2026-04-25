import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { WindowControls } from "../components";
import { useTranslation } from "../hooks/useTranslation";
import { ROUTES } from "../../../shared/constants/system";
import logoImage from "../assets/photo_2026-04-23_10-34-22.jpg";
import { LoginFormCard } from "../components/login";

export function LoginScreen() {
  const t = useTranslation();
  const navigate = useNavigate();

  const {
    isLoading,
    error,
    showPassword,
    isAuthenticated,
    login,
    loginOffline,
    loadToken,
    clearError,
    setShowPassword,
  } = useAuthStore();

  const [localUsername, setLocalUsername] = useState("");
  const [localPassword, setLocalPassword] = useState("");
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    void loadToken();
  }, [loadToken]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: ROUTES.DASHBOARD });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (offlineMode) {
      await loginOffline(localUsername);
      return;
    }

    await login({ login: localUsername, password: localPassword });
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a1c20] via-[#2b2d31] to-[#1a1c20]">
      <div className="absolute inset-0 bg-pattern opacity-30" />

      <div className="absolute right-4 top-4 z-50">
        <WindowControls />
      </div>

      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center py-4 px-4">
        <div className="mb-4 text-center">
          <img
            src={logoImage}
            alt={t.LOGIN.LOGO_ALT}
            className="h-32 w-auto object-contain drop-shadow-2xl"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        <LoginFormCard
          t={t}
          isLoading={isLoading}
          error={error}
          username={localUsername}
          password={localPassword}
          showPassword={showPassword}
          offlineMode={offlineMode}
          onUsernameChange={setLocalUsername}
          onPasswordChange={setLocalPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          onToggleOfflineMode={setOfflineMode}
          onSubmit={handleLogin}
        />

        <div className="mt-4 text-center font-minecraft text-xs text-gray-600">
          {t.LOGIN.FOOTER_TEXT}
        </div>
      </div>
    </div>
  );
}
