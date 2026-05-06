import type * as React from "react";
import { Toaster as Sonner } from "sonner";
import { useSettingsStore } from "../../../stores/useSettingsStore";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps): React.JSX.Element {
  const themeMode = useSettingsStore((state) => state.general.themeMode);

  return (
    <Sonner
      theme={themeMode}
      richColors
      toastOptions={{
        classNames: {
          toast: "font-mono",
          title: "font-mono text-xs",
          description: "font-mono text-xs",
        },
      }}
      {...props}
    />
  );
}


export { Toaster };
