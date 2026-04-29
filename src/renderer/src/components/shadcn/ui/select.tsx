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

function Select({ className, label, options, value, onChange, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label ? <Label className="font-minecraft text-[10px] uppercase text-theme-muted">{label}</Label> : null}
      <select
        value={value}
        onChange={onChange}
        className={cn(
          "flex h-9 w-full rounded-md border border-[var(--input)] bg-[var(--card)] px-3 py-1 text-sm text-theme shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[var(--card)] text-theme"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export { Select };
