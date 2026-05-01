import * as React from "react";
import { cn } from "@/lib/utils";

function TabsList({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  return <div className={cn("mb-4 flex gap-2", className)} {...props} />;
}


export { TabsList };
