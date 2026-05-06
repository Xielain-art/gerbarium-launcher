import type { FormEvent } from "react";
import type { TranslationType } from "../../../../shared/constants/translations";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
} from "../shadcn/ui";
import { LoginVerificationSection } from "./LoginVerificationSection";
import { LoginCredentialsSection } from "./LoginCredentialsSection";
import { cn } from "@/lib/utils";

interface FieldValidation {
  isValid: boolean;
  error: string | null;
  touched: boolean;
}

interface LoginFormCardProps {
  t: TranslationType;
  language: string;
  isLoading: boolean;
  error: string | null;
  mode: "login" | "register";
  registerStep: 1 | 2;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  verificationCode: string;
  verificationRequired: boolean;
  verificationEmail: string;
  resendCountdown: number;
  developmentCode?: string;
  emailWasSent: boolean;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onVerificationCodeChange: (value: string) => void;
  onSwitchMode: (mode: "login" | "register") => void;
  languageOptions: Array<{ value: string; label: string }>;
  onLanguageChange: (value: string) => void;
  onUseAnotherAccount: () => Promise<void>;
  onResendCode: () => Promise<void>;
  onRegisterStepBack: () => void;
  onSubmit: (e: FormEvent) => Promise<void>;
  onBlur: (
    field:
      | "username"
      | "email"
      | "password"
      | "passwordConfirm"
      | "verificationCode",
  ) => void;
  validations: {
    username: FieldValidation;
    email: FieldValidation;
    password: FieldValidation;
    passwordConfirm: FieldValidation;
    verificationCode: FieldValidation;
  };
}



export function LoginFormCard(props: LoginFormCardProps): React.JSX.Element {
  const { t } = props;
  const isRegisterMode = props.mode === "register";
  const isRegisterAccountStep = isRegisterMode && props.registerStep === 1;
  const isRegisterPasswordStep = isRegisterMode && props.registerStep === 2;

  const title = props.verificationRequired
    ? t.LOGIN.VERIFY_TITLE
    : isRegisterMode
      ? t.LOGIN.CREATE_ACCOUNT
      : t.LOGIN.SUBMIT_BUTTON;

  const description = props.verificationRequired
    ? t.LOGIN.VERIFY_DESCRIPTION(props.verificationEmail)
    : isRegisterMode
      ? t.LOGIN.REGISTER_DESCRIPTION
      : t.LOGIN.LOGIN_DESCRIPTION;

  return (
    <Card className="relative z-10 w-full max-w-[420px] rounded-2xl border-theme bg-[var(--theme-surface)]/95 text-theme shadow-none backdrop-blur-sm">
      <div className="absolute top-4 right-4">
        <Select
          label={t.LOGIN.LANGUAGE_LABEL}
          value={props.language}
          onChange={(e) => props.onLanguageChange(e.target.value)}
          options={props.languageOptions.map((option) => ({
            value: option.value,
            label: option.value.toUpperCase(),
          }))}
          className="auth-language-select auth-language-select--compact h-7 min-w-[64px] rounded-lg border-[var(--theme-border-hi)] bg-white/5 px-2 text-[10px] text-theme focus:border-[var(--mc-accent)]"
        />
      </div>
      <CardHeader className="space-y-2 pb-5 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--mc-accent)]">
          Authentication
        </div>
        <CardTitle className="text-[24px] font-normal leading-[1.2] tracking-[-0.16px] text-theme">
          {title}
        </CardTitle>
        <p className="text-sm leading-relaxed text-theme-muted">{description}</p>
      </CardHeader>
      <div className="mx-6 h-px bg-[var(--theme-border)]" />
      <CardContent className="space-y-5 pt-5">
        {!props.verificationRequired && (
          <div className="flex justify-center">
            <div className="auth-switch grid w-full grid-cols-2 gap-1 p-1 bg-[var(--theme-surface)] border border-theme rounded-full">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => props.onSwitchMode("login")}
                disabled={props.isLoading}
                className={cn(
                  "h-7 rounded-full px-3 font-mono text-[10px] uppercase tracking-wider transition-all",
                  !isRegisterMode 
                    ? "bg-[var(--mc-accent)] text-[var(--theme-bg)] hover:bg-[var(--mc-accent)]/90" 
                    : "text-theme-muted hover:text-theme hover:bg-white/5",
                )}
              >
                {t.LOGIN.SWITCH_TO_LOGIN}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => props.onSwitchMode("register")}
                disabled={props.isLoading}
                className={cn(
                  "h-7 rounded-full px-3 font-mono text-[10px] uppercase tracking-wider transition-all",
                  isRegisterMode 
                    ? "bg-[var(--mc-accent)] text-[var(--theme-bg)] hover:bg-[var(--mc-accent)]/90" 
                    : "text-theme-muted hover:text-theme hover:bg-white/5",
                )}
              >
                {t.LOGIN.CREATE_ACCOUNT}
              </Button>
            </div>
          </div>
        )}

        {isRegisterMode && !props.verificationRequired && (
          <div className="auth-steps grid grid-cols-2 gap-2">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] transition-all",
                props.registerStep === 1 
                  ? "border-[var(--mc-accent)]/40 bg-[var(--mc-accent)]/10 text-theme"
                  : "border-theme bg-[var(--theme-surface)] text-theme-muted",
              )}
            >
              <span className={cn(
                "flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold",
                props.registerStep === 1 ? "bg-[var(--mc-accent)] text-[var(--theme-bg)]" : "bg-[var(--theme-border)] text-theme-muted"
              )}>1</span>
              <span>{t.LOGIN.REGISTER_STEP_ACCOUNT}</span>
            </div>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] transition-all",
                props.registerStep === 2 
                  ? "border-[var(--mc-accent)]/40 bg-[var(--mc-accent)]/10 text-theme"
                  : "border-theme bg-[var(--theme-surface)] text-theme-muted",
              )}
            >
              <span className={cn(
                "flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold",
                props.registerStep === 2 ? "bg-[var(--mc-accent)] text-[var(--theme-bg)]" : "bg-[var(--theme-border)] text-theme-muted"
              )}>2</span>
              <span>{t.LOGIN.REGISTER_STEP_PASSWORD}</span>
            </div>
          </div>
        )}

        {props.verificationRequired && props.emailWasSent && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-400 text-center">
            {t.LOGIN.EMAIL_SENT_NOTICE}
          </div>
        )}
        {props.error && (
          <div
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] leading-snug text-red-400 text-center"
            role="alert"
          >
            {props.error}
          </div>
        )}

        <form
          onSubmit={(event) => void props.onSubmit(event)}
          noValidate
          className="space-y-4"
        >
          {props.verificationRequired ? (
            <LoginVerificationSection
              t={t}
              isLoading={props.isLoading}
              verificationCode={props.verificationCode}
              verificationEmail={props.verificationEmail}
              resendCountdown={props.resendCountdown}
              developmentCode={props.developmentCode}
              onVerificationCodeChange={props.onVerificationCodeChange}
              onResendCode={props.onResendCode}
              onUseAnotherAccount={props.onUseAnotherAccount}
              onBlur={props.onBlur}
              validation={props.validations.verificationCode}
            />
          ) : (
            <LoginCredentialsSection
              t={t}
              isLoading={props.isLoading}
              isRegisterMode={isRegisterMode}
              isRegisterAccountStep={isRegisterAccountStep}
              isRegisterPasswordStep={isRegisterPasswordStep}
              email={props.email}
              username={props.username}
              password={props.password}
              confirmPassword={props.confirmPassword}
              onEmailChange={props.onEmailChange}
              onUsernameChange={props.onUsernameChange}
              onPasswordChange={props.onPasswordChange}
              onConfirmPasswordChange={props.onConfirmPasswordChange}
              onRegisterStepBack={props.onRegisterStepBack}
              onBlur={props.onBlur}
              validations={props.validations}
            />
          )}
        </form>
      </CardContent>
    </Card>
  );
}

