import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

type SelectOption = {
  label: string;
  value: string;
};

interface SelectProps extends React.ComponentProps<"select"> {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

function Select({
  className,
  label,
  options,
  value,
  onChange,
  ...props
}: SelectProps): React.JSX.Element {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="font-mono text-[10px] uppercase text-theme-muted">
          {label}
        </Label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={cn(
          "flex h-9 w-full rounded-[6px] border border-theme bg-[var(--theme-surface)] px-3 py-1 text-sm text-theme focus-visible:border-[var(--mc-accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--mc-accent)]/30",
          className,
        )}
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
    </div>
  );
}


export { Select };
