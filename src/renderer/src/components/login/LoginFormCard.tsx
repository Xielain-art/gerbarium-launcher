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

  const modeBadge = props.verificationRequired
    ? t.LOGIN.MODE_VERIFY
    : isRegisterMode
      ? t.LOGIN.MODE_REGISTER
      : t.LOGIN.MODE_LOGIN;

  const description = props.verificationRequired
    ? t.LOGIN.VERIFY_DESCRIPTION(props.verificationEmail)
    : isRegisterMode
      ? t.LOGIN.REGISTER_DESCRIPTION
      : t.LOGIN.LOGIN_DESCRIPTION;

  return (
    <Card className="auth-card w-full overflow-hidden border-white/10 shadow-2xl backdrop-blur-xl">
      <div className="auth-card__glow" />
      <CardHeader className="space-y-2 p-3 pb-2 sm:p-3 sm:pb-2">
        <div className="flex items-center justify-between gap-3">
          <span className="auth-card__eyebrow">{modeBadge}</span>
          <div className="auth-language-shell auth-language-shell--inline self-center">
            <Select
              label={t.LOGIN.LANGUAGE_LABEL}
              value={props.language}
              onChange={(e) => props.onLanguageChange(e.target.value)}
              options={props.languageOptions.map((option) => ({
                value: option.value,
                label: option.value.toUpperCase(),
              }))}
              className="auth-language-select auth-language-select--compact h-8 min-w-[78px] rounded-xl border-white/12 bg-white/6 px-2.5 text-xs text-theme"
            />
          </div>
        </div>

        <div className="space-y-1">
          <CardTitle className="text-[1.45rem] font-semibold tracking-tight text-theme">
            {title}
          </CardTitle>
          <p className="max-w-[24rem] text-sm leading-5 text-theme-muted">
            {description}
          </p>
        </div>

        {!props.verificationRequired && (
          <div className="flex justify-center">
            <div className="auth-switch grid w-full max-w-[286px] grid-cols-2 gap-1 p-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => props.onSwitchMode("login")}
                disabled={props.isLoading}
                className={cn(
                  "auth-switch__button h-8 rounded-xl px-3 font-minecraft text-[10px] uppercase tracking-[0.16em]",
                  !isRegisterMode && "auth-switch__button--active",
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
                  "auth-switch__button h-8 rounded-xl px-3 font-minecraft text-[10px] uppercase tracking-[0.16em]",
                  isRegisterMode && "auth-switch__button--active",
                )}
              >
                {t.LOGIN.CREATE_ACCOUNT}
              </Button>
            </div>
          </div>
        )}

        {isRegisterMode && !props.verificationRequired && (
          <div className="auth-steps">
            <div
              className={cn(
                "auth-step",
                props.registerStep === 1 ? "auth-step--active" : "auth-step--done",
              )}
            >
              <span className="auth-step__dot">1</span>
              <span>{t.LOGIN.REGISTER_STEP_ACCOUNT}</span>
            </div>
            <div
              className={cn(
                "auth-step",
                props.registerStep === 2 && "auth-step--active",
              )}
            >
              <span className="auth-step__dot">2</span>
              <span>{t.LOGIN.REGISTER_STEP_PASSWORD}</span>
            </div>
          </div>
        )}

        {props.verificationRequired && props.emailWasSent && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5 text-xs font-medium tracking-[0.04em] text-emerald-100">
            {t.LOGIN.EMAIL_SENT_NOTICE}
          </div>
        )}
        {props.error && (
          <div
            className="rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm leading-5 text-red-100"
            role="alert"
          >
            {props.error}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-3 pt-0 sm:p-3 sm:pt-0">
        <form
          onSubmit={(event) => void props.onSubmit(event)}
          noValidate
          className="space-y-2.5"
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

