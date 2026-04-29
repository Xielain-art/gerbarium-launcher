import { useSettingsStore } from "../../stores/useSettingsStore";

export function ThemeToggleButton() {
  const themeMode = useSettingsStore((state) => state.general.themeMode);
  const updateGeneral = useSettingsStore((state) => state.updateGeneral);
  const isDark = themeMode === "dark";

  const handleToggle = () => {
    updateGeneral({ themeMode: isDark ? "light" : "dark" });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="mc-btn mc-btn-sm px-3"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? "☀" : "🌙"}
    </button>
  );
}
