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
    isAuthenticated,
    login,
    register,
    loginOffline,
    loadToken,
    clearError,
  } = useAuthStore();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [localUsername, setLocalUsername] = useState("");
  const [localEmail, setLocalEmail] = useState("");
  const [localPassword, setLocalPassword] = useState("");
  const [localPasswordConfirm, setLocalPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

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
    setValidationError(null);
    clearError();

    if (mode === "register") {
      if (localPassword !== localPasswordConfirm) {
        setValidationError("Passwords do not match");
        return;
      }

      await register({
        email: localEmail,
        username: localUsername,
        password: localPassword,
      });
      return;
    }

    if (offlineMode) {
      await loginOffline(localUsername);
      return;
    }

    await login({ login: localUsername, password: localPassword });
  };

  return (
    <div className="bg-theme-main-gradient relative flex h-screen w-full items-center justify-center overflow-hidden">
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
          error={validationError ?? error}
          mode={mode}
          username={localUsername}
          email={localEmail}
          password={localPassword}
          confirmPassword={localPasswordConfirm}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          offlineMode={offlineMode}
          onUsernameChange={(value) => {
            setValidationError(null);
            setLocalUsername(value);
          }}
          onEmailChange={(value) => {
            setValidationError(null);
            setLocalEmail(value);
          }}
          onPasswordChange={(value) => {
            setValidationError(null);
            setLocalPassword(value);
          }}
          onConfirmPasswordChange={(value) => {
            setValidationError(null);
            setLocalPasswordConfirm(value);
          }}
          onTogglePassword={() => setShowPassword(!showPassword)}
          onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
          onToggleOfflineMode={(enabled) => {
            setValidationError(null);
            setMode("login");
            setOfflineMode(enabled);
          }}
          onSwitchMode={(nextMode) => {
            setValidationError(null);
            setMode(nextMode);
            setOfflineMode(false);
          }}
          onSubmit={handleLogin}
        />

        <div className="mt-4 text-center font-minecraft text-xs text-theme-muted">
          {t.LOGIN.FOOTER_TEXT}
        </div>
      </div>
    </div>
  );
}
