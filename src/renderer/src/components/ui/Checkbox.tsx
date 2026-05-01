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
        "mc-checkbox-label group [-webkit-app-region:no-drag]",
        className,
      )}
    >
      <input id={checkboxId} type="checkbox" className="mc-checkbox" {...props} />
      <div className="mc-checkbox-box">
        <svg
          className="h-4 w-4 text-white opacity-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="font-minecraft text-sm text-theme transition-colors group-hover:text-[var(--mc-accent-hi)]">
        {label}
      </span>
    </label>
  );
}

