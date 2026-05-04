import { useState } from "react";
import type { InputProps } from "../types";
import { useTranslation } from "../../hooks/useTranslation";
import { cn } from "@/lib/utils";

interface ExtendedInputProps extends InputProps {
  showPasswordExternal?: boolean;
  onTogglePassword?: () => void;
}

export function Input({
  label,
  error,
  className = "",
  id,
  type = "text",
  showPasswordExternal,
  onTogglePassword,
  ...props
}: ExtendedInputProps): React.JSX.Element {
  const { t } = useTranslation();
  const [internalShowPassword, setInternalShowPassword] = useState(false);

  const showPassword =
    showPasswordExternal !== undefined
      ? showPasswordExternal
      : internalShowPassword;

  const togglePassword =
    onTogglePassword ||
    (() => setInternalShowPassword((prev) => !prev));

  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const isPassword = type === "password";
  const effectiveType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[12px] font-medium uppercase tracking-wider text-[#898989]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={effectiveType}
          className={cn(
            "flex h-10 w-full rounded-md border border-[#2e2e2e] bg-[#0f0f0f] px-3 py-2 text-sm text-[#fafafa] transition-all placeholder:text-[#4d4d4d] focus:border-[#3ecf8e] focus:outline-none focus:ring-1 focus:ring-[#3ecf8e] disabled:cursor-not-allowed disabled:opacity-50",
            isPassword && "pr-10",
          )}
          {...props}
        />

        {/* Password Visibility Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-[#898989] transition-colors hover:text-[#fafafa] focus:outline-none"
            title={showPassword ? t.LOGIN.PASSWORD_HIDE : t.LOGIN.PASSWORD_SHOW}
          >
            {showPassword ? (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.591a9.98 9.98 0 012.053-1.14m3.097-2.187a9.954 9.954 0 013.543 2.187M6.375 6.375C4.5 8.25 3 10.5 3 12c0 1.5 1.5 3.75 3.375 5.625m3.75 3.75a10.05 10.05 0 001.875-.175M18 12a6 6 0 11-12 0 6 6 0 0112 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <span className="mt-1 text-[11px] text-[#ff8080]">
          {error}
        </span>
      )}
    </div>
  );
}

