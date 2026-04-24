import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { WindowControls, Input, Button } from "../components";
import { useTranslation } from "../hooks/useTranslation";
import { ROUTES, STORAGE_KEYS } from "../../../shared/constants/system";
import logoImage from "../assets/photo_2026-04-23_10-34-22.jpg";

export function LoginScreen() {
  const t = useTranslation();
  const navigate = useNavigate();

  // Zustand store
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

  // Local state
  const [localUsername, setLocalUsername] = useState("");
  const [localPassword, setLocalPassword] = useState("");
  const [offlineMode, setOfflineMode] = useState(false);

  // Load token from secure storage on mount
  useEffect(() => {
    loadToken();
    
    // Pre-fill username if available
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user.username) setLocalUsername(user.username);
      } catch (e) {
        // Ignore parse error
      }
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: ROUTES.DASHBOARD });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const result = offlineMode
      ? await loginOffline(localUsername)
      : await login({ login: localUsername, password: localPassword });

    if (result.success) {
      // Redirect via useEffect
    }
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a1c20] via-[#2b2d31] to-[#1a1c20]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern opacity-30" />

      {/* Window Controls */}
      <div className="absolute right-4 top-4 z-50">
        <WindowControls />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center py-4 px-4">
        {/* Logo */}
        <div className="mb-4 text-center">
          <img
            src={logoImage}
            alt={t.LOGIN.LOGO_ALT}
            className="h-32 w-auto object-contain drop-shadow-2xl"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        {/* Login Form */}
        <div className="w-full max-h-[90vh] overflow-y-auto rounded-2xl mc-panel p-6 backdrop-blur-md">
          {/* Error Message */}
          {error && (
            <div className="mc-error mb-6" role="alert">
              <svg
                className="h-5 w-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="square"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            {/* Username Input */}
            <Input
              type="text"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              placeholder={t.LOGIN.USERNAME_PLACEHOLDER}
              disabled={isLoading}
              autoComplete="username"
            />

            {/* Password Input */}
            {!offlineMode && (
              <Input
                type="password"
                value={localPassword}
                onChange={(e) => setLocalPassword(e.target.value)}
                placeholder={t.LOGIN.PASSWORD_PLACEHOLDER}
                disabled={isLoading}
                autoComplete="current-password"
                showPasswordExternal={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
            )}

            {/* Login Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="mt-2 w-full"
              isLoading={isLoading}
            >
              {t.LOGIN.SUBMIT_BUTTON}
            </Button>

            {/* Offline Mode Toggle */}
            <div className="flex items-center justify-center pt-1">
              <label className="mc-checkbox-label">
                <input
                  type="checkbox"
                  checked={offlineMode}
                  onChange={(e) => setOfflineMode(e.target.checked)}
                  className="mc-checkbox"
                  disabled={isLoading}
                />
                <div className="mc-checkbox-box">
                  <svg
                    className="h-4 w-4 text-white opacity-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="square" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-minecraft text-[10px] text-gray-400">
                  {t.LOGIN.OFFLINE_MODE}
                </span>
              </label>
            </div>

            {/* Help Links */}
            <div className="mt-4 flex flex-col items-center gap-1 text-center">
              <a
                href="#"
                className="font-minecraft text-[11px] text-gray-400 transition-colors hover:text-cyan-400 hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                {t.LOGIN.FORGOT_PASSWORD}
              </a>
              <a
                href="#"
                className="font-minecraft text-[11px] text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                {t.LOGIN.CREATE_ACCOUNT}
              </a>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center font-minecraft text-[10px] text-gray-600">
          {t.LOGIN.FOOTER_TEXT}
        </div>
      </div>
    </div>
  );
}
