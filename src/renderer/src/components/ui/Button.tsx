import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline" | "minecraft";
type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps): React.JSX.Element {
  const variantStyles = {
    primary: "bg-[#3ecf8e] text-[#0f0f0f] hover:bg-[#50e3a1] rounded-full border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.1)]",
    secondary: "bg-[#171717] text-[#fafafa] hover:bg-[#1c1c1c] border border-[#2e2e2e] rounded-md",
    outline: "bg-transparent text-[#fafafa] hover:bg-[#171717] border border-[#2e2e2e] rounded-md",
    danger: "bg-[#451212] text-[#ff8080] hover:bg-[#5a1818] border border-[#802020] rounded-md",
    ghost: "bg-transparent text-[#898989] hover:text-[#fafafa] hover:bg-[#171717] rounded-md border border-transparent",
    minecraft: "mc-btn", // Legacy fallback
  };

  const sizeStyles = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    xl: "h-14 px-8 text-lg font-medium",
  };

  const isPill = variant === "primary";

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-sans transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variantStyles[variant],
        sizeStyles[size],
        isPill && "rounded-full",
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span className={cn(isLoading && "opacity-90")}>{children}</span>
    </button>
  );
}

