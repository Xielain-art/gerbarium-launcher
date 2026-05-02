import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  useCallback,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useTranslation } from "./useTranslation";
import { ROUTES } from "../../../shared/constants/system";
import type { LoginScreenResult } from "./login/types";
import { localizeAuthError, clearAuthDrafts } from "./login/utils";
import {
  loginIdentifierSchema,
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
} from "../lib/validation/authValidation";
import { useLoginValidation } from "./login/useLoginValidation";

// --- Main Hook ---

export function useLoginScreen(): LoginScreenResult {
  const t = useTranslation();
  const navigate = useNavigate();

  // Stores
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

  // Local State
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

  // Field touch state for real-time feedback
  const [touchedFields, setTouchedFields] = useState({
    username: false,
    email: false,
    password: false,
    passwordConfirm: false,
    verificationCode: false,
  });

  // Derived Data
  const verificationRequired = isAuthenticated && user?.emailVerified === false;

  // --- Real-time Validation ---

  const validations = useLoginValidation(t, mode, offlineMode, localUsername, localEmail, localPassword, localPasswordConfirm, verificationCode, touchedFields);

  // --- Effects ---

  // Handle resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Load session on mount
  useEffect(() => {
    if (!hasCheckedSession) {
      void loadToken();
    }
  }, [loadToken, hasCheckedSession]);

  // Navigate to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && user?.emailVerified !== false) {
      navigate({ to: ROUTES.DASHBOARD });
    }
  }, [isAuthenticated, navigate, user?.emailVerified]);

  // Refresh verification status if needed
  useEffect(() => {
    if (isAuthenticated && user?.emailVerified === false) {
      void refreshEmailVerificationStatus();
    }
  }, [refreshEmailVerificationStatus, isAuthenticated, user?.emailVerified]);

  // --- Callbacks ---

  const onUsernameChange = useCallback((value: string) => {
    setLocalUsername(value);
  }, []);

  const onEmailChange = useCallback((value: string) => {
    setLocalEmail(value.slice(0, EMAIL_MAX_LENGTH));
  }, []);

  const onPasswordChange = useCallback((value: string) => {
    setLocalPassword(value.slice(0, PASSWORD_MAX_LENGTH));
  }, []);

  const onConfirmPasswordChange = useCallback((value: string) => {
    setLocalPasswordConfirm(value.slice(0, PASSWORD_MAX_LENGTH));
  }, []);

  const onVerificationCodeChange = useCallback((value: string) => {
    setVerificationCode(value.replace(/\D/g, "").slice(0, 6));
  }, []);

  const onToggleOfflineMode = useCallback((enabled: boolean) => {
    setValidationError(null);
    setMode("login");
    setRegisterStep(1);
    setOfflineMode(enabled);
    setTouchedFields({
      username: false,
      email: false,
      password: false,
      passwordConfirm: false,
      verificationCode: false,
    });
  }, []);

  const onSwitchMode = useCallback(
    (nextMode: "login" | "register") => {
      setValidationError(null);
      clearError();
      setMode(nextMode);
      setRegisterStep(1);
      setOfflineMode(false);
      setTouchedFields({
        username: false,
        email: false,
        password: false,
        passwordConfirm: false,
        verificationCode: false,
      });
    },
    [clearError],
  );

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
    setTouchedFields({
      username: false,
      email: false,
      password: false,
      passwordConfirm: false,
      verificationCode: false,
    });
  }, [clearError, logout]);

  const onResendCode = useCallback(async () => {
    setValidationError(null);
    clearError();

    if (resendCountdown > 0) {
      return;
    }

    await resendEmailVerification();
  }, [clearError, resendCountdown, resendEmailVerification]);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setValidationError(null);
      clearError();

      // Mark all visible fields as touched to show errors
      setTouchedFields((prev) => ({
        ...prev,
        username: true,
        email: mode === "register",
        password: true,
        passwordConfirm: mode === "register" && registerStep === 2,
        verificationCode: verificationRequired,
      }));

      // Email Verification Flow
      if (isAuthenticated && user?.emailVerified === false) {
        const code = verificationCode.trim();
        if (!emailCodeSchema.safeParse(code).success) {
          setValidationError(t.STORE_ERRORS.AUTH_EMAIL_CODE_INVALID);
          return;
        }

        await verifyEmail(code);
        return;
      }

      // Registration Flow
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

      // Offline Login Flow
      if (offlineMode) {
        const username = localUsername.trim();
        if (!usernameSchema.safeParse(username).success) {
          setValidationError(t.STORE_ERRORS.AUTH_USERNAME_INVALID);
          return;
        }
        await loginOffline(username);
        return;
      }

      // Regular Login Flow
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
    },
    [
      clearError,
      isAuthenticated,
      user?.emailVerified,
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
      login,
      verificationRequired
    ],
  );

  const onBlur = useCallback((field: keyof typeof touchedFields) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  }, []);

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
    onBlur,
    validations,
  };
}



