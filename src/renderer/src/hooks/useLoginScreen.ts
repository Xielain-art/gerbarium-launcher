import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useTranslation } from "./useTranslation";
import { ROUTES } from "../../../shared/constants/system";

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

function localizeAuthError(
  error: string | null,
  t: ReturnType<typeof useTranslation>,
): string | null {
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

export function useLoginScreen() {
  const t = useTranslation();
  const navigate = useNavigate();
  const {
    isLoading,
    isSessionLoading,
    hasCheckedSession,
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
    if (!hasCheckedSession) {
      void loadToken();
    }
  }, [loadToken, hasCheckedSession]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: ROUTES.DASHBOARD });
    }
  }, [isAuthenticated, navigate]);

  const onUsernameChange = (value: string) => {
    setValidationError(null);
    setLocalUsername(value);
  };

  const onEmailChange = (value: string) => {
    setValidationError(null);
    setLocalEmail(value);
  };

  const onPasswordChange = (value: string) => {
    setValidationError(null);
    setLocalPassword(value);
  };

  const onConfirmPasswordChange = (value: string) => {
    setValidationError(null);
    setLocalPasswordConfirm(value);
  };

  const onToggleOfflineMode = (enabled: boolean) => {
    setValidationError(null);
    setMode("login");
    setOfflineMode(enabled);
  };

  const onSwitchMode = (nextMode: "login" | "register") => {
    setValidationError(null);
    setMode(nextMode);
    setOfflineMode(false);
  };

  const onSubmit = async (e: FormEvent) => {
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

      await register({ email, username, password });
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

  const localizedError = useMemo(
    () => validationError ?? localizeAuthError(error, t),
    [validationError, error, t],
  );

  return {
    t,
    isLoading,
    showSessionSpinner: isSessionLoading || !hasCheckedSession,
    mode,
    localUsername,
    localEmail,
    localPassword,
    localPasswordConfirm,
    showPassword,
    showConfirmPassword,
    offlineMode,
    localizedError,
    onUsernameChange,
    onEmailChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onTogglePassword: () => setShowPassword((prev) => !prev),
    onToggleConfirmPassword: () => setShowConfirmPassword((prev) => !prev),
    onToggleOfflineMode,
    onSwitchMode,
    onSubmit,
  };
}
