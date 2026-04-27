import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "minecraft" | "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Button({
  variant = "minecraft",
  size = "md",
  isLoading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "mc-btn gap-2";

  const variantStyles = {
    minecraft: "",
    primary: "mc-btn-primary",
    secondary: "mc-btn-secondary",
    danger: "mc-btn-danger",
    ghost: "mc-btn-ghost",
  };

  const sizeStyles = {
    sm: "mc-btn-sm",
    md: "mc-btn-md",
    lg: "mc-btn-lg",
    xl: "mc-btn-xl",
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
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
      <span className={isLoading ? "opacity-90" : ""}>{children}</span>
    </button>
  );
}
