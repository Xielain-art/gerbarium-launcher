import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { WindowControls } from "../components";
import logoImage from "../assets/photo_2026-04-23_10-34-22.jpg";

export function LoginScreen() {
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
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
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
            alt="Minecraft Gerbarium"
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
            <input
              type="text"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              placeholder="Логин"
              className="mc-input py-2"
              disabled={isLoading}
              autoComplete="username"
            />

            {/* Password Input */}
            {!offlineMode && (
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={localPassword}
                  onChange={(e) => setLocalPassword(e.target.value)}
                  placeholder="Пароль"
                  className="mc-input py-2 pr-12"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                {/* Password Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition-colors hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="square"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.591a9.98 9.98 0 012.053-1.14m3.097-2.187a9.954 9.954 0 013.543 2.187M6.375 6.375C4.5 8.25 3 10.5 3 12c0 1.5 1.5 3.75 3.375 5.625m3.75 3.75a10.05 10.05 0 001.875-.175M18 12a6 6 0 11-12 0 6 6 0 0112 0z"
                      />
                      <path strokeLinecap="square" d="M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="square"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="square"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="mc-btn mc-btn-primary mc-btn-md mt-2 w-full py-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="mc-spinner" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Авторизация...
                </>
              ) : (
                "Вход"
              )}
            </button>

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
                  Оффлайн режим
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
                Забыли пароль?
              </a>
              <a
                href="#"
                className="font-minecraft text-[11px] text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                Создать аккаунт
              </a>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center font-minecraft text-[10px] text-gray-600">
          Gerbarium Launcher v2.0
        </div>
      </div>
    </div>
  );
}
