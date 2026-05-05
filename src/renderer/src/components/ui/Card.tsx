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
        "relative overflow-hidden rounded-lg border border-[#2e2e2e] bg-[#111111] transition-all duration-200",
        active && "border-[#3ecf8e] ring-1 ring-[#3ecf8e]",
        onClick && "cursor-pointer hover:border-[#363636] hover:bg-[#141414] active:scale-[0.99]",
        className,
      )}
    >
      {children}
    </div>
  );
}

