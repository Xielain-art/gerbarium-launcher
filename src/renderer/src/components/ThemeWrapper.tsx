import { useEffect } from "react";
import { useSettingsStore } from "../stores/useSettingsStore";

export function ThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const themeMode = useSettingsStore((state) => state.general.themeMode);
  const isDark = themeMode === "dark";

  useEffect(() => {
    document.body.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("dark", isDark);
    document.body.classList.toggle("theme-dark", isDark);
    document.documentElement.classList.toggle("theme-dark", isDark);
    document.body.classList.toggle("theme-light", !isDark);
    document.documentElement.classList.toggle("theme-light", !isDark);

    return () => {
      document.body.classList.remove("dark");
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("theme-light", "theme-dark");
      document.documentElement.classList.remove("theme-light", "theme-dark");
    };
  }, [isDark]);

  return <>{children}</>;
}
