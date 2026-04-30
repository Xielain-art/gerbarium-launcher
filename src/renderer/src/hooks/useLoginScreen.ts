import { useEffect, useMemo, useState, type FormEvent, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useTranslation } from "./useTranslation";
import { ROUTES } from "../../../shared/constants/system";
import {
  emailCodeSchema,
  emailSchema,
  loginIdentifierSchema,
  passwordSchema,
  PASSWORD_MAX_LENGTH,
  usernameSchema,
  EMAIL_MAX_LENGTH,
} from "../lib/validation/authValidation";

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
    ERR_AUTH_EMAIL_CODE_INVALID: t.STORE_ERRORS.AUTH_EMAIL_CODE_INVALID,
    ERR_AUTH_EMAIL_ALREADY_VERIFIED:
      t.STORE_ERRORS.AUTH_EMAIL_ALREADY_VERIFIED,
    ERR_AUTH_VERIFY_EMAIL_FAILED: t.STORE_ERRORS.AUTH_VERIFY_EMAIL,
    ERR_AUTH_RESEND_EMAIL_FAILED: t.STORE_ERRORS.AUTH_RESEND_EMAIL,
    ERR_AUTH_EMAIL_STATUS_FAILED: t.STORE_ERRORS.AUTH_EMAIL_STATUS,
    ERR_AUTH_UNAUTHORIZED: t.STORE_ERRORS.AUTH_UNAUTHORIZED,
  };

  return byCode[error] || error;
}

function clearAuthDrafts(
  setters: Array<(value: string) => void>,
  setOfflineMode: (value: boolean) => void,
): void {
  for (const setter of setters) {
    setter("");
  }
  setOfflineMode(false);
}

export function useLoginScreen() {
  const t = useTranslation();
  const navigate = useNavigate();
  const language = useSettingsStore((state) => state.general.language);
  const updateGeneral = useSettingsStore((state) => state.updateGeneral);
  const {
    isLoading,
    isSessionLoading,
    hasCheckedSession,
    error,
    isAuthenticated,
    user,
    emailVerification,
    login,
    register,
    verifyEmail,
    resendEmailVerification,
    refreshEmailVerificationStatus,
    loginOffline,
    loadToken,
    clearError,
    logout,
  } = useAuthStore();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [localUsername, setLocalUsername] = useState("");
  const [localEmail, setLocalEmail] = useState("");
  const [localPassword, setLocalPassword] = useState("");
  const [localPasswordConfirm, setLocalPasswordConfirm] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [offlineMode, setOfflineMode] = useState(false);
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  const verificationRequired = isAuthenticated && user?.emailVerified === false;

  useEffect(() => {
    if (!hasCheckedSession) {
      void loadToken();
    }
  }, [loadToken, hasCheckedSession]);

  useEffect(() => {
    if (isAuthenticated && user?.emailVerified !== false) {
      navigate({ to: ROUTES.DASHBOARD });
    }
  }, [isAuthenticated, navigate, user?.emailVerified]);

  useEffect(() => {
    if (verificationRequired) {
      void refreshEmailVerificationStatus();
    }
  }, [refreshEmailVerificationStatus, verificationRequired]);

  const onUsernameChange = useCallback((value: string) => {
    setValidationError(null);
    setLocalUsername(value);
  }, []);

  const onEmailChange = useCallback((value: string) => {
    setValidationError(null);
    setLocalEmail(value.slice(0, EMAIL_MAX_LENGTH));
  }, []);

  const onPasswordChange = useCallback((value: string) => {
    setValidationError(null);
    setLocalPassword(value.slice(0, PASSWORD_MAX_LENGTH));
  }, []);

  const onConfirmPasswordChange = useCallback((value: string) => {
    setValidationError(null);
    setLocalPasswordConfirm(value.slice(0, PASSWORD_MAX_LENGTH));
  }, []);

  const onVerificationCodeChange = useCallback((value: string) => {
    setValidationError(null);
    setVerificationCode(value.replace(/\D/g, "").slice(0, 6));
  }, []);

  const onToggleOfflineMode = useCallback((enabled: boolean) => {
    setValidationError(null);
    setMode("login");
    setRegisterStep(1);
    setOfflineMode(enabled);
  }, []);

  const onSwitchMode = useCallback((nextMode: "login" | "register") => {
    setValidationError(null);
    clearError();
    setMode(nextMode);
    setRegisterStep(1);
    setOfflineMode(false);
  }, [clearError]);

  const onUseAnotherAccount = useCallback(async () => {
    setValidationError(null);
    clearError();
    await logout();
    clearAuthDrafts(
      [
        setLocalUsername,
        setLocalEmail,
        setLocalPassword,
        setLocalPasswordConfirm,
        setVerificationCode,
      ],
      setOfflineMode,
    );
    setMode("login");
    setRegisterStep(1);
  }, [clearError, logout]);

  const onResendCode = useCallback(async () => {
    setValidationError(null);
    clearError();

    if (resendCountdown > 0) {
      return;
    }

    await resendEmailVerification();
  }, [clearError, resendCountdown, resendEmailVerification]);

  const onSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (verificationRequired) {
      const code = verificationCode.trim();
      if (!emailCodeSchema.safeParse(code).success) {
        setValidationError(t.STORE_ERRORS.AUTH_EMAIL_CODE_INVALID);
        return;
      }

      await verifyEmail(code);
      return;
    }

    if (mode === "register") {
      const email = localEmail.trim();
      const username = localUsername.trim();
      const password = localPassword.trim();

      if (registerStep === 1) {
        if (!email || !username) {
          setValidationError(t.STORE_ERRORS.AUTH_EMPTY_FIELDS);
          return;
        }
        if (!emailSchema.safeParse(email).success) {
          setValidationError(t.STORE_ERRORS.AUTH_EMAIL_INVALID);
          return;
        }
        if (!usernameSchema.safeParse(username).success) {
          setValidationError(t.STORE_ERRORS.AUTH_USERNAME_INVALID);
          return;
        }

        setRegisterStep(2);
        return;
      }

      if (!password) {
        setValidationError(t.STORE_ERRORS.AUTH_EMPTY_FIELDS);
        return;
      }
      if (!passwordSchema.safeParse(password).success) {
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
      if (!usernameSchema.safeParse(username).success) {
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

    if (!loginIdentifierSchema.safeParse(identifier).success) {
      setValidationError(t.STORE_ERRORS.AUTH_LOGIN_INVALID);
      return;
    }

    if (!passwordSchema.safeParse(password).success) {
      setValidationError(t.STORE_ERRORS.AUTH_PASSWORD_INVALID);
      return;
    }

    await login({ login: identifier, password });
  }, [
    clearError,
    verificationRequired,
    verificationCode,
    t.STORE_ERRORS.AUTH_EMAIL_CODE_INVALID,
    t.STORE_ERRORS.AUTH_EMPTY_FIELDS,
    t.STORE_ERRORS.AUTH_EMAIL_INVALID,
    t.STORE_ERRORS.AUTH_USERNAME_INVALID,
    t.STORE_ERRORS.AUTH_PASSWORD_INVALID,
    t.STORE_ERRORS.AUTH_PASSWORDS_MISMATCH,
    t.STORE_ERRORS.AUTH_LOGIN_INVALID,
    verifyEmail,
    mode,
    localEmail,
    localUsername,
    localPassword,
    registerStep,
    localPasswordConfirm,
    register,
    offlineMode,
    loginOffline,
    login
  ]);

  const [autoSubmitMode, setAutoSubmitMode] = useState<"login" | "register_step1" | "register_step2" | "verify" | null>(null);

  useEffect(() => {
    const smokeTestConfig = window.electronAPI.getSmokeTestConfig();
    if (smokeTestConfig?.isSmokeTest) {
      const email = smokeTestConfig.testEmail || "smoke@gerbarium.ru";
      const username = smokeTestConfig.testUsername || "smoke_user";
      const password = smokeTestConfig.testPassword || "SmokeTestPassword123!";
      
      setLocalEmail(email);
      setLocalUsername(username);
      setLocalPassword(password);
      setLocalPasswordConfirm(password);

      // Trigger auto-login after state has a chance to settle
      const timer = setTimeout(() => {
        setAutoSubmitMode("login");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle auto-switching to registration if login fails in smoke test
  useEffect(() => {
    const smokeTestConfig = window.electronAPI.getSmokeTestConfig();
    if (smokeTestConfig?.isSmokeTest && error && mode === "login") {
      // If we get an error during auto-login, it's likely 401 (user doesn't exist)
      // Switch to registration flow
      setMode("register");
      setRegisterStep(1);
      clearError();
      
      const timer = setTimeout(() => {
        setAutoSubmitMode("register_step1");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [error, mode, clearError]);

  // Handle auto-submitting registration step 2
  useEffect(() => {
    const smokeTestConfig = window.electronAPI.getSmokeTestConfig();
    if (smokeTestConfig?.isSmokeTest && mode === "register" && registerStep === 2 && !isLoading && !error) {
      const timer = setTimeout(() => {
        setAutoSubmitMode("register_step2");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [mode, registerStep, isLoading, error]);

  // Handle auto-submitting verification code
  useEffect(() => {
    const smokeTestConfig = window.electronAPI.getSmokeTestConfig();
    if (
      smokeTestConfig?.isSmokeTest &&
      verificationRequired &&
      emailVerification?.developmentCode &&
      !verificationCode &&
      !isLoading
    ) {
      setVerificationCode(emailVerification.developmentCode);
      const timer = setTimeout(() => {
        setAutoSubmitMode("verify");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [verificationRequired, emailVerification?.developmentCode, verificationCode, isLoading]);

  // Centralized auto-submit executor
  useEffect(() => {
    if (autoSubmitMode && !isLoading) {
      setAutoSubmitMode(null); // Reset
      
      const dummyEvent = { preventDefault: () => {} } as FormEvent;
      void onSubmit(dummyEvent);
    }
  }, [autoSubmitMode, isLoading, onSubmit]);

  const localizedError = useMemo(
    () => validationError ?? localizeAuthError(error, t),
    [validationError, error, t],
  );

  return {
    t,
    language,
    isLoading,
    showSessionSpinner: isSessionLoading || !hasCheckedSession,
    mode,
    registerStep,
    localUsername,
    localEmail,
    localPassword,
    localPasswordConfirm,
    verificationCode,
    offlineMode,
    verificationRequired,
    verificationEmail: user?.email ?? localEmail.trim(),
    resendCountdown,
    developmentCode: emailVerification?.developmentCode,
    emailWasSent: emailVerification?.emailSent ?? false,
    localizedError,
    onLanguageChange: (nextLanguage: string) =>
      updateGeneral({ language: nextLanguage }),
    onRegisterStepBack: () => {
      setValidationError(null);
      setRegisterStep(1);
    },
    onUsernameChange,
    onEmailChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onVerificationCodeChange,
    onToggleOfflineMode,
    onSwitchMode,
    onUseAnotherAccount,
    onResendCode,
    onSubmit,
  };
}
