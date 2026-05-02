import { useEffect } from "react";
import { useSettingsStore } from "../stores/useSettingsStore";
import { THEME_CLASSNAMES, THEME_REGISTRY } from "../lib/themes/themeRegistry";

export function ThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const theme = useSettingsStore((state) => state.general.theme);
  const themeMode = useSettingsStore((state) => state.general.themeMode);

  useEffect(() => {
    const fallbackTheme = THEME_REGISTRY[0]?.id ?? "oxide";
    const themeExists = THEME_REGISTRY.some((entry) => entry.id === theme);
    const appliedTheme = themeExists ? theme : fallbackTheme;

    document.body.classList.remove(...THEME_CLASSNAMES);
    document.documentElement.classList.remove(...THEME_CLASSNAMES);

    document.body.classList.add(`theme-${appliedTheme}`);
    document.documentElement.classList.add(`theme-${appliedTheme}`);

    document.body.classList.toggle("dark", themeMode === "dark");
    document.documentElement.classList.toggle("dark", themeMode === "dark");

    return () => {
      document.body.classList.remove(...THEME_CLASSNAMES);
      document.documentElement.classList.remove(...THEME_CLASSNAMES);
      document.body.classList.remove("dark");
      document.documentElement.classList.remove("dark");
    };
  }, [theme, themeMode]);

  return <>{children}</>;
}

