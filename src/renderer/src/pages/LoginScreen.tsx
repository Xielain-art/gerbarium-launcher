import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { WindowControls } from "../components";
import { useTranslation } from "../hooks/useTranslation";
import { ROUTES } from "../../../shared/constants/system";
import logoImage from "../assets/photo_2026-04-23_10-34-22.jpg";
import { LoginFormCard } from "../components/login";

const USERNAME_REGEX = /^[A-Za-z0-9_]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidUsername(value: string): boolean {
  return value.length >= 3 && value.length <= 32 && USERNAME_REGEX.test(value);
}

function isValidPassword(value: string): boolean {
  return value.length >= 10 && value.length <= 128;
}

function isValidEmail(value: string): boolean {
  return value.length <= 320 && EMAIL_REGEX.test(value);
}

function localizeAuthError(error: string | null, t: ReturnType<typeof useTranslation>): string | null {
  if (!error) {
    return null;
  }

  const byCode: Record<string, string> = {
    ERR_AUTH_INVALID_CREDENTIALS: t.STORE_ERRORS.AUTH_INVALID_CREDENTIALS,
    ERR_AUTH_ALREADY_EXISTS: t.STORE_ERRORS.AUTH_ALREADY_EXISTS,
    ERR_AUTH_RATE_LIMIT: t.STORE_ERRORS.AUTH_RATE_LIMIT,
    ERR_AUTH_VALIDATION_FAILED: t.STORE_ERRORS.AUTH_VALIDATION_FAILED,
    ERR_AUTH_API_REQUEST_FAILED: t.STORE_ERRORS.AUTH_SERVICE_UNAVAILABLE,
    ERR_AUTH_LOGIN_FAILED: t.STORE_ERRORS.AUTH_LOGIN,
    ERR_AUTH_REGISTER_FAILED: t.STORE_ERRORS.AUTH_REGISTER,
  };

  return byCode[error] || error;
}

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
      const email = localEmail.trim();
      const username = localUsername.trim();
      const password = localPassword.trim();

      if (!email || !username || !password) {
        setValidationError(t.STORE_ERRORS.AUTH_EMPTY_FIELDS);
        return;
      }
      if (!isValidEmail(email)) {
        setValidationError(t.STORE_ERRORS.AUTH_EMAIL_INVALID);
        return;
      }
      if (!isValidUsername(username)) {
        setValidationError(t.STORE_ERRORS.AUTH_USERNAME_INVALID);
        return;
      }
      if (!isValidPassword(password)) {
        setValidationError(t.STORE_ERRORS.AUTH_PASSWORD_INVALID);
        return;
      }
      if (localPassword !== localPasswordConfirm) {
        setValidationError(t.STORE_ERRORS.AUTH_PASSWORDS_MISMATCH);
        return;
      }

      await register({
        email,
        username,
        password,
      });
      return;
    }

    if (offlineMode) {
      const username = localUsername.trim();
      if (!isValidUsername(username)) {
        setValidationError(t.STORE_ERRORS.AUTH_USERNAME_INVALID);
        return;
      }
      await loginOffline(username);
      return;
    }

    const identifier = localUsername.trim();
    const password = localPassword.trim();
    if (!identifier || !password) {
      setValidationError(t.STORE_ERRORS.AUTH_EMPTY_FIELDS);
      return;
    }

    if (identifier.includes("@")) {
      if (!isValidEmail(identifier)) {
        setValidationError(t.STORE_ERRORS.AUTH_LOGIN_INVALID);
        return;
      }
    } else if (!isValidUsername(identifier)) {
      setValidationError(t.STORE_ERRORS.AUTH_LOGIN_INVALID);
      return;
    }

    if (!isValidPassword(password)) {
      setValidationError(t.STORE_ERRORS.AUTH_PASSWORD_INVALID);
      return;
    }

    await login({ login: identifier, password });
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
          error={validationError ?? localizeAuthError(error, t)}
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
