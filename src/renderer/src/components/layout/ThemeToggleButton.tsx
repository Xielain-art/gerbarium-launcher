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
      className="flex h-8 w-8 items-center justify-center rounded-md border border-[#2e2e2e] bg-[#0f0f0f] text-[#898989] transition-colors hover:border-[#363636] hover:bg-[#242424] hover:text-[#fafafa]"
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

