import type { CheckboxProps } from "../types";
import { cn } from "@/lib/utils";

export function Checkbox({
  label,
  className = "",
  id,
  ...props
}: CheckboxProps): React.JSX.Element {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "group flex cursor-pointer items-center gap-3 select-none",
        className,
      )}
    >
      <div className="relative flex h-5 w-5 items-center justify-center">
        <input
          id={checkboxId}
          type="checkbox"
          data-slot="launcher-checkbox"
          className="peer absolute h-full w-full cursor-pointer opacity-0"
          {...props}
        />
        <div className="flex h-5 w-5 items-center justify-center rounded border border-theme bg-[var(--theme-bg)] transition-all peer-checked:border-[var(--mc-accent)] peer-checked:bg-[var(--mc-accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--mc-accent)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--theme-surface)] group-hover:border-[var(--theme-border-hi)] peer-checked:group-hover:border-[var(--mc-accent-hi)]">
          <svg
            className="h-3.5 w-3.5 text-[var(--theme-bg)] opacity-0 transition-opacity peer-checked:opacity-100"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={4}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <span className="text-sm font-medium text-theme transition-colors group-hover:text-theme">
        {label}
      </span>
    </label>
  );
}
