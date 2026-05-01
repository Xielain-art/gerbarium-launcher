import type { CardProps } from "../types";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className = "",
  onClick,
  active = false,
}: CardProps): React.JSX.Element {
  return (
    <div
      onClick={onClick}
      className={cn(
        "mc-card p-4",
        active &&
          "border-b-[var(--btn-primary-border-lo)] border-l-[var(--mc-accent)] border-r-[var(--btn-primary-border-lo)] border-t-[var(--mc-accent)] shadow-[inset_2px_2px_0px_var(--mc-accent-hi),inset_-2px_-2px_0px_var(--btn-primary-border-lo)]",
        onClick && "mc-card-clickable transition-colors",
        className,
      )}
    >
      {children}
    </div>
  );
}

