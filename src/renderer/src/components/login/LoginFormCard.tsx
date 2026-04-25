import type { FormEvent } from "react";
import { Button, Input } from "../ui";
import type { TranslationType } from "../../../../shared/constants/translations";

interface LoginFormCardProps {
  t: TranslationType;
  isLoading: boolean;
  error: string | null;
  username: string;
  password: string;
  showPassword: boolean;
  offlineMode: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleOfflineMode: (enabled: boolean) => void;
  onSubmit: (e: FormEvent) => Promise<void>;
}

export function LoginFormCard({
  t,
  isLoading,
  error,
  username,
  password,
  showPassword,
  offlineMode,
  onUsernameChange,
  onPasswordChange,
  onTogglePassword,
  onToggleOfflineMode,
  onSubmit,
}: LoginFormCardProps) {
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
        <Input
          type="text"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder={t.LOGIN.USERNAME_PLACEHOLDER}
          disabled={isLoading}
          autoComplete="username"
        />

        {!offlineMode && (
          <Input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder={t.LOGIN.PASSWORD_PLACEHOLDER}
            disabled={isLoading}
            autoComplete="current-password"
            showPasswordExternal={showPassword}
            onTogglePassword={onTogglePassword}
          />
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="mt-2 w-full"
          isLoading={isLoading}
        >
          {t.LOGIN.SUBMIT_BUTTON}
        </Button>

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
                className="h-4 w-4 text-white opacity-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="square" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-minecraft text-xs text-gray-400">
              {t.LOGIN.OFFLINE_MODE}
            </span>
          </label>
        </div>

        <div className="mt-4 flex flex-col items-center gap-1 text-center">
          <a
            href="#"
            className="font-minecraft text-xs text-gray-400 transition-colors hover:text-cyan-400 hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            {t.LOGIN.FORGOT_PASSWORD}
          </a>
          <a
            href="#"
            className="font-minecraft text-xs text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            {t.LOGIN.CREATE_ACCOUNT}
          </a>
        </div>
      </form>
    </div>
  );
}
