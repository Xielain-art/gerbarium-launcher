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
        <Label className="font-minecraft text-[10px] uppercase text-theme-muted">
          {label}
        </Label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={cn(
          "flex h-9 w-full rounded-[6px] border border-[#2e2e2e] bg-[#0f0f0f] px-3 py-1 text-sm text-[#fafafa] focus-visible:border-[#3ecf8e] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3ecf8e]/30",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[#171717] text-[#fafafa]"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}


export { Select };
