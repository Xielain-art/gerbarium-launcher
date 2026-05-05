import type { FormEvent } from "react";
import type { TranslationType } from "../../../../shared/constants/translations";
import {
  Button,
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
    <div className="relative z-10 w-full max-w-[420px] p-8 border border-[#2e2e2e] bg-[#0f0f0f] rounded-xl shadow-2xl">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#3ecf8e] mb-1.5">
          Authentication
        </div>
        <h1 className="text-2xl font-sans font-medium text-[#fafafa] tracking-tight leading-tight">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#898989]">
          {description}
        </p>
      </div>

      <div className="absolute top-4 right-4">
        <Select
          label={t.LOGIN.LANGUAGE_LABEL}
          value={props.language}
          onChange={(e) => props.onLanguageChange(e.target.value)}
          options={props.languageOptions.map((option) => ({
            value: option.value,
            label: option.value.toUpperCase(),
          }))}
          className="auth-language-select auth-language-select--compact h-7 min-w-[64px] rounded-lg border-[#363636] bg-white/5 px-2 text-[10px] text-[#fafafa] focus:border-[#3ecf8e]"
        />
      </div>

      <div className="space-y-5">
        {!props.verificationRequired && (
          <div className="flex justify-center">
            <div className="auth-switch grid w-full grid-cols-2 gap-1 p-1 bg-[#171717] border border-[#2e2e2e] rounded-full">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => props.onSwitchMode("login")}
                disabled={props.isLoading}
                className={cn(
                  "h-7 rounded-full px-3 font-mono text-[10px] uppercase tracking-wider transition-all",
                  !isRegisterMode 
                    ? "bg-[#3ecf8e] text-[#0f0f0f] shadow-sm hover:bg-[#3ecf8e]/90" 
                    : "text-[#898989] hover:text-[#fafafa] hover:bg-white/5",
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
                    ? "bg-[#3ecf8e] text-[#0f0f0f] shadow-sm hover:bg-[#3ecf8e]/90" 
                    : "text-[#898989] hover:text-[#fafafa] hover:bg-white/5",
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
                  ? "border-[#3ecf8e]/40 bg-[#3ecf8e]/10 text-[#fafafa]" 
                  : "border-[#2e2e2e] bg-[#171717] text-[#898989]",
              )}
            >
              <span className={cn(
                "flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold",
                props.registerStep === 1 ? "bg-[#3ecf8e] text-[#0f0f0f]" : "bg-[#2e2e2e] text-[#898989]"
              )}>1</span>
              <span>{t.LOGIN.REGISTER_STEP_ACCOUNT}</span>
            </div>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] transition-all",
                props.registerStep === 2 
                  ? "border-[#3ecf8e]/40 bg-[#3ecf8e]/10 text-[#fafafa]" 
                  : "border-[#2e2e2e] bg-[#171717] text-[#898989]",
              )}
            >
              <span className={cn(
                "flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold",
                props.registerStep === 2 ? "bg-[#3ecf8e] text-[#0f0f0f]" : "bg-[#2e2e2e] text-[#898989]"
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
      </div>
    </div>
  );
}

