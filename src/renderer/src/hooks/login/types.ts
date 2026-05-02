import type { FormEvent } from "react";
import type { TranslationType } from "../../../../shared/constants/translations";

export interface FieldValidation {
  isValid: boolean;
  error: string | null;
  touched: boolean;
}

export type TouchedFields = {
  email: boolean;
  username: boolean;
  password: boolean;
  verificationCode: boolean;
  passwordConfirm: boolean;
};

export interface LoginScreenResult {
  t: TranslationType;
  language: string;
  isLoading: boolean;
  showSessionSpinner: boolean;
  mode: "login" | "register";
  registerStep: 1 | 2;
  localUsername: string;
  localEmail: string;
  localPassword: string;
  localPasswordConfirm: string;
  verificationCode: string;
  offlineMode: boolean;
  verificationRequired: boolean;
  verificationEmail: string;
  resendCountdown: number;
  developmentCode: string | undefined;
  emailWasSent: boolean;
  localizedError: string | null;
  onLanguageChange: (nextLanguage: string) => void;
  onRegisterStepBack: () => void;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onVerificationCodeChange: (value: string) => void;
  onToggleOfflineMode: (enabled: boolean) => void;
  onSwitchMode: (nextMode: "login" | "register") => void;
  onUseAnotherAccount: () => Promise<void>;
  onResendCode: () => Promise<void>;
  onSubmit: (e: FormEvent) => Promise<void>;
  onBlur: (field: keyof TouchedFields) => void;
  validations: {
    username: FieldValidation;
    email: FieldValidation;
    password: FieldValidation;
    passwordConfirm: FieldValidation;
    verificationCode: FieldValidation;
  };
}
