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
          className="peer absolute h-full w-full cursor-pointer opacity-0"
          {...props}
        />
        <div className="flex h-5 w-5 items-center justify-center rounded border border-[#363636] bg-[#0f0f0f] transition-all peer-checked:border-[#3ecf8e] peer-checked:bg-[#3ecf8e] peer-focus-visible:ring-2 peer-focus-visible:ring-[#3ecf8e] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#171717] group-hover:border-[#4d4d4d] peer-checked:group-hover:border-[#50e3a1]">
          <svg
            className="h-3.5 w-3.5 text-[#0f0f0f] opacity-0 transition-opacity peer-checked:opacity-100"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={4}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <span className="text-sm font-medium text-[#fafafa] transition-colors group-hover:text-white">
        {label}
      </span>
    </label>
  );
}

