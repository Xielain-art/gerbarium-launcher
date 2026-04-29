import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";
import { X } from "lucide-react";

type MultiSelectOption = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

function MultiSelect({ className, label, options, value, onChange, placeholder = "Select items..." }: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedLabels = options.filter((opt) => value.includes(opt.value));

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      {label ? <Label className="font-minecraft text-[10px] uppercase text-theme-muted">{label}</Label> : null}
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex min-h-9 w-full cursor-pointer flex-wrap gap-1 rounded-md border border-[var(--input)] bg-[var(--card)] px-3 py-1.5 text-sm text-theme shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]",
            className,
          )}
        >
          {selectedLabels.length === 0 ? (
            <span className="text-theme-muted">{placeholder}</span>
          ) : (
            selectedLabels.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 rounded bg-theme/20 px-2 py-0.5 text-xs text-theme"
              >
                {opt.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(opt.value);
                  }}
                  className="hover:text-theme-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-[var(--input)] bg-[var(--card)] shadow-lg">
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm text-theme hover:bg-white/10",
                    isSelected && "bg-theme/20",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="h-4 w-4"
                    />
                    {option.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export { MultiSelect };
