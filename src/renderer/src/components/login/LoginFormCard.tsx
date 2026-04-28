import type { FormEvent } from "react";
import type { TranslationType } from "../../../../shared/constants/translations";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
} from "../shadcn/ui";

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
}

export function LoginFormCard({
  t,
  language,
  isLoading,
  error,
  mode,
  registerStep,
  username,
  email,
  password,
  confirmPassword,
  verificationCode,
  verificationRequired,
  verificationEmail,
  resendCountdown,
  developmentCode,
  emailWasSent,
  onUsernameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onVerificationCodeChange,
  onSwitchMode,
  languageOptions,
  onLanguageChange,
  onUseAnotherAccount,
  onResendCode,
  onRegisterStepBack,
  onSubmit,
}: LoginFormCardProps) {
  const isRegisterMode = mode === "register";
  const isRegisterAccountStep = isRegisterMode && registerStep === 1;
  const isRegisterPasswordStep = isRegisterMode && registerStep === 2;
  const title = verificationRequired
    ? t.LOGIN.VERIFY_TITLE
    : isRegisterMode
      ? t.LOGIN.CREATE_ACCOUNT
      : t.LOGIN.SUBMIT_BUTTON;
  const modeBadge = verificationRequired
    ? t.LOGIN.MODE_VERIFY
    : isRegisterMode
      ? t.LOGIN.MODE_REGISTER
      : t.LOGIN.MODE_LOGIN;
  const description = verificationRequired
    ? t.LOGIN.VERIFY_DESCRIPTION(verificationEmail)
    : isRegisterMode
      ? t.LOGIN.REGISTER_DESCRIPTION
      : t.LOGIN.LOGIN_DESCRIPTION;
  const compactLanguageOptions = languageOptions.map((option) => ({
    value: option.value,
    label: option.value.toUpperCase(),
  }));

  return (
    <Card className="auth-card w-full overflow-hidden border-white/10 shadow-2xl backdrop-blur-xl">
      <div className="auth-card__glow" />
      <CardHeader className="space-y-2 p-3 pb-2 sm:p-3 sm:pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-h-8 items-center gap-2">
            <span className="auth-card__eyebrow">{modeBadge}</span>
          </div>
          <div className="auth-language-shell auth-language-shell--inline self-center">
            <Select
              label={t.LOGIN.LANGUAGE_LABEL}
              value={language}
              onChange={(event) => onLanguageChange(event.target.value)}
              options={compactLanguageOptions}
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

        {!verificationRequired && (
          <div className="flex justify-center">
            <div className="auth-switch grid w-full max-w-[286px] grid-cols-2 gap-1 p-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onSwitchMode("login")}
                disabled={isLoading}
                className={
                  isRegisterMode
                    ? "auth-switch__button h-8 rounded-xl px-3 font-minecraft text-[10px] uppercase tracking-[0.16em]"
                    : "auth-switch__button auth-switch__button--active h-8 rounded-xl px-3 font-minecraft text-[10px] uppercase tracking-[0.16em]"
                }
              >
                {t.LOGIN.SWITCH_TO_LOGIN}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onSwitchMode("register")}
                disabled={isLoading}
                className={
                  isRegisterMode
                    ? "auth-switch__button auth-switch__button--active h-8 rounded-xl px-3 font-minecraft text-[10px] uppercase tracking-[0.16em]"
                    : "auth-switch__button h-8 rounded-xl px-3 font-minecraft text-[10px] uppercase tracking-[0.16em]"
                }
              >
                {t.LOGIN.CREATE_ACCOUNT}
              </Button>
            </div>
          </div>
        )}

        {isRegisterMode && !verificationRequired && (
          <div className="auth-steps">
            <div
              className={
                registerStep === 1
                  ? "auth-step auth-step--active"
                  : "auth-step auth-step--done"
              }
            >
              <span className="auth-step__dot">1</span>
              <span>{t.LOGIN.REGISTER_STEP_ACCOUNT}</span>
            </div>
            <div
              className={
                registerStep === 2
                  ? "auth-step auth-step--active"
                  : "auth-step"
              }
            >
              <span className="auth-step__dot">2</span>
              <span>{t.LOGIN.REGISTER_STEP_PASSWORD}</span>
            </div>
          </div>
        )}

        {verificationRequired && emailWasSent && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5 text-xs font-medium tracking-[0.04em] text-emerald-100">
            {t.LOGIN.EMAIL_SENT_NOTICE}
          </div>
        )}

        {error && (
          <div
            className="rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm leading-5 text-red-100"
            role="alert"
          >
            {error}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-3 pt-0 sm:p-3 sm:pt-0">
        <form onSubmit={(event) => void onSubmit(event)} className="space-y-2.5">
          {verificationRequired ? (
            <>
              <div className="auth-section space-y-2">
                <Label
                  htmlFor="email-code"
                  className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-muted"
                >
                  {t.LOGIN.CODE_LABEL}
                </Label>
                <Input
                  id="email-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder={t.LOGIN.CODE_PLACEHOLDER}
                  value={verificationCode}
                  onChange={(event) => onVerificationCodeChange(event.target.value)}
                  disabled={isLoading}
                  className="auth-input h-10 rounded-2xl border-white/12 bg-white/6 text-center font-minecraft text-base tracking-[0.42em]"
                />
                <p className="text-xs leading-5 text-theme-muted">
                  {verificationEmail}
                </p>
              </div>

              <div className="auth-section flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm leading-5 text-theme-muted">
                    {t.LOGIN.RESEND_HINT}
                  </span>
                  {developmentCode ? (
                    <Badge
                      variant="secondary"
                      className="rounded-full border border-amber-300/25 bg-amber-400/12 px-3 py-1 font-minecraft text-[10px] uppercase tracking-[0.15em] text-amber-50"
                    >
                      {t.LOGIN.DEV_CODE_LABEL} {developmentCode}
                    </Badge>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-10 flex-1 rounded-2xl font-minecraft text-[11px] uppercase tracking-[0.16em] shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
                  >
                    {t.LOGIN.VERIFY_BUTTON}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading || resendCountdown > 0}
                    onClick={() => void onResendCode()}
                    className="h-10 flex-1 rounded-2xl border-white/12 bg-white/4 font-minecraft text-[11px] uppercase tracking-[0.16em] hover:bg-white/8"
                  >
                    {resendCountdown > 0
                      ? t.LOGIN.RESEND_IN(resendCountdown)
                      : t.LOGIN.RESEND_BUTTON}
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  disabled={isLoading}
                  onClick={() => void onUseAnotherAccount()}
                  className="justify-start rounded-xl px-0 text-sm text-theme-muted hover:bg-transparent hover:text-theme"
                >
                  {t.LOGIN.USE_ANOTHER_ACCOUNT}
                </Button>
              </div>
            </>
          ) : (
            <>
              {isRegisterAccountStep && (
                <>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="register-email"
                      className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-muted"
                    >
                      Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(event) => onEmailChange(event.target.value)}
                      placeholder={t.LOGIN.EMAIL_PLACEHOLDER}
                      disabled={isLoading}
                      autoComplete="email"
                      className="auth-input h-10 rounded-2xl border-white/12 bg-white/6"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="auth-username"
                      className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-muted"
                    >
                      Username
                    </Label>
                    <Input
                      id="auth-username"
                      type="text"
                      value={username}
                      onChange={(event) => onUsernameChange(event.target.value)}
                      placeholder={t.LOGIN.REGISTER_USERNAME_PLACEHOLDER}
                      disabled={isLoading}
                      autoComplete="username"
                      className="auth-input h-10 rounded-2xl border-white/12 bg-white/6"
                    />
                  </div>
                </>
              )}

              {!isRegisterMode && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="auth-username"
                    className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-muted"
                  >
                    {t.LOGIN.USERNAME_PLACEHOLDER}
                  </Label>
                  <Input
                    id="auth-username"
                    type="text"
                    value={username}
                    onChange={(event) => onUsernameChange(event.target.value)}
                    placeholder={t.LOGIN.USERNAME_PLACEHOLDER}
                    disabled={isLoading}
                    autoComplete="username"
                    className="auth-input h-10 rounded-2xl border-white/12 bg-white/6"
                  />
                </div>
              )}

              {(!isRegisterMode || isRegisterPasswordStep) && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="auth-password"
                    className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-muted"
                  >
                    {t.LOGIN.PASSWORD_PLACEHOLDER}
                  </Label>
                  <Input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(event) => onPasswordChange(event.target.value)}
                    placeholder={t.LOGIN.PASSWORD_PLACEHOLDER}
                    disabled={isLoading}
                    autoComplete={isRegisterMode ? "new-password" : "current-password"}
                    className="auth-input h-10 rounded-2xl border-white/12 bg-white/6"
                  />
                </div>
              )}

              {isRegisterMode && (
                <div className="space-y-1.5">
                  {isRegisterPasswordStep && (
                    <>
                      <Label
                        htmlFor="auth-password-confirm"
                        className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-muted"
                      >
                        {t.LOGIN.CONFIRM_PASSWORD_PLACEHOLDER}
                      </Label>
                      <Input
                        id="auth-password-confirm"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => onConfirmPasswordChange(event.target.value)}
                        placeholder={t.LOGIN.CONFIRM_PASSWORD_PLACEHOLDER}
                        disabled={isLoading}
                        autoComplete="new-password"
                        className="auth-input h-10 rounded-2xl border-white/12 bg-white/6"
                      />
                    </>
                  )}
                </div>
              )}

              {isRegisterMode ? (
                <div className="flex gap-2">
                  {isRegisterPasswordStep ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isLoading}
                      onClick={onRegisterStepBack}
                      className="h-10 flex-1 rounded-2xl border-white/12 bg-white/4 font-minecraft text-[11px] uppercase tracking-[0.16em] hover:bg-white/8"
                    >
                      {t.LOGIN.REGISTER_BACK}
                    </Button>
                  ) : null}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-10 flex-1 rounded-2xl font-minecraft text-[11px] uppercase tracking-[0.16em] shadow-[0_18px_44px_rgba(0,0,0,0.24)]"
                  >
                    {isRegisterAccountStep
                      ? t.LOGIN.REGISTER_NEXT
                      : t.LOGIN.CREATE_ACCOUNT}
                  </Button>
                </div>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 w-full rounded-2xl font-minecraft text-[11px] uppercase tracking-[0.16em] shadow-[0_18px_44px_rgba(0,0,0,0.24)]"
                >
                  {t.LOGIN.SUBMIT_BUTTON}
                </Button>
              )}

              {!isRegisterMode && (
                <p className="text-center text-xs leading-5 text-theme-muted">
                  {t.LOGIN.FORGOT_PASSWORD}
                </p>
              )}
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
