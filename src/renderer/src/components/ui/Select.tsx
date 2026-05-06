import React from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

export function Select({
  label,
  options,
  className = "",
  id,
  ...props
}: SelectProps): React.JSX.Element {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-[12px] font-medium uppercase tracking-wider text-theme-muted"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className="flex h-10 w-full appearance-none rounded-md border border-theme bg-[var(--theme-surface)] px-3 py-2 text-sm text-theme transition-all focus:border-[var(--mc-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--mc-accent)] disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[var(--theme-surface)] text-theme"
            >
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom Arrow */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
