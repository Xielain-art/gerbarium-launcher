import type * as React from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      richColors
      toastOptions={{
        classNames: {
          toast: "font-minecraft",
          title: "font-minecraft text-xs",
          description: "font-minecraft text-xs",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
