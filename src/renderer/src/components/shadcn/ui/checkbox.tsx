import * as React from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  label?: string;
  checked: boolean;
  onChange: () => void;
}

function Checkbox({
  className,
  label,
  checked,
  onChange,
  ...props
}: CheckboxProps): React.JSX.Element {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={cn("h-4 w-4 rounded border border-[var(--input)]", className)}
        {...props}
      />
      {label && (
        <span className="font-mono text-xs text-theme">{label}</span>
      )}
    </label>
  );
}


export { Checkbox };
