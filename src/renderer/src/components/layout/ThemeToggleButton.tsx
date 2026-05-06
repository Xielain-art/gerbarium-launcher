import { useSettingsStore } from "../../stores/useSettingsStore";
import { Sun, Moon } from "lucide-react";

export function ThemeToggleButton(): React.JSX.Element {
  const themeMode = useSettingsStore((state) => state.general.themeMode);
  const updateGeneral = useSettingsStore((state) => state.updateGeneral);
  const isDark = themeMode === "dark";

  function handleToggle(): void {
    updateGeneral({ themeMode: isDark ? "light" : "dark" });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-theme bg-[var(--theme-bg)] text-theme-muted transition-colors hover:border-[var(--theme-border-hi)] hover:bg-[var(--theme-surface-soft)] hover:text-theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-3.5 w-3.5" strokeWidth={2.5} />
      ) : (
        <Moon className="h-3.5 w-3.5" strokeWidth={2.5} />
      )}
    </button>
  );
}

