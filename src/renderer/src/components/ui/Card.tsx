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
      data-slot="launcher-card"
      className={cn(
        "relative overflow-hidden rounded-lg border border-theme bg-[var(--theme-surface)] transition-all duration-200",
        active && "border-[var(--mc-accent)] ring-1 ring-[var(--mc-accent)]",
        onClick && "cursor-pointer hover:border-[var(--theme-border-hi)] hover:bg-[var(--theme-surface-soft)] active:scale-[0.99]",
        className,
      )}
    >
      {children}
    </div>
  );
}
