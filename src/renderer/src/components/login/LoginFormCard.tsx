import type { FormEvent } from "react";
import { Button, Input } from "../ui";
import type { TranslationType } from "../../../../shared/constants/translations";

interface LoginFormCardProps {
  t: TranslationType;
  isLoading: boolean;
  error: string | null;
  mode: "login" | "register";
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  offlineMode: boolean;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onToggleOfflineMode: (enabled: boolean) => void;
  onSwitchMode: (mode: "login" | "register") => void;
  onSubmit: (e: FormEvent) => Promise<void>;
}

export function LoginFormCard({
  t,
  isLoading,
  error,
  mode,
  username,
  email,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  offlineMode,
  onUsernameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onToggleOfflineMode,
  onSwitchMode,
  onSubmit,
}: LoginFormCardProps) {
  const isRegisterMode = mode === "register";

  return (
    <div className="w-full max-h-[90vh] overflow-y-auto rounded-2xl mc-panel p-6 backdrop-blur-md">
      {error && (
        <div className="mc-error mb-6" role="alert">
          <svg
            className="h-5 w-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="square"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-3">
        {isRegisterMode && (
          <Input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder={t.LOGIN.EMAIL_PLACEHOLDER}
            disabled={isLoading}
            autoComplete="email"
          />
        )}

        <Input
          type="text"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder={isRegisterMode ? t.LOGIN.REGISTER_USERNAME_PLACEHOLDER : t.LOGIN.USERNAME_PLACEHOLDER}
          disabled={isLoading}
          autoComplete={isRegisterMode ? "new-username" : "username"}
        />

        {(!offlineMode || isRegisterMode) && (
          <Input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder={t.LOGIN.PASSWORD_PLACEHOLDER}
            disabled={isLoading}
            autoComplete={isRegisterMode ? "new-password" : "current-password"}
            showPasswordExternal={showPassword}
            onTogglePassword={onTogglePassword}
          />
        )}

        {isRegisterMode && (
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder={t.LOGIN.CONFIRM_PASSWORD_PLACEHOLDER}
            disabled={isLoading}
            autoComplete="new-password"
            showPasswordExternal={showConfirmPassword}
            onTogglePassword={onToggleConfirmPassword}
          />
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="mt-2 w-full"
          isLoading={isLoading}
        >
          {isRegisterMode ? t.LOGIN.CREATE_ACCOUNT : t.LOGIN.SUBMIT_BUTTON}
        </Button>

        {!isRegisterMode && (
        <div className="flex items-center justify-center pt-1">
          <label className="mc-checkbox-label">
            <input
              type="checkbox"
              checked={offlineMode}
              onChange={(e) => onToggleOfflineMode(e.target.checked)}
              className="mc-checkbox"
              disabled={isLoading}
            />
            <div className="mc-checkbox-box">
              <svg
                className="h-4 w-4 text-[var(--theme-surface)] opacity-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="square" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-minecraft text-xs text-theme-muted">
              {t.LOGIN.OFFLINE_MODE}
            </span>
          </label>
        </div>
        )}

        <div className="mt-4 flex flex-col items-center gap-1 text-center">
          {!isRegisterMode && (
            <a
              href="#"
              className="font-minecraft text-xs text-theme-muted transition-colors hover:text-theme hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              {t.LOGIN.FORGOT_PASSWORD}
            </a>
          )}
          <a
            href="#"
            className="font-minecraft text-xs text-[var(--mc-progress-fill-a)] transition-colors hover:text-[var(--mc-progress-fill-b)] hover:underline"
            onClick={(e) => {
              e.preventDefault();
              onSwitchMode(isRegisterMode ? "login" : "register");
            }}
          >
            {isRegisterMode ? t.LOGIN.SWITCH_TO_LOGIN : t.LOGIN.CREATE_ACCOUNT}
          </a>
        </div>
      </form>
    </div>
  );
}
