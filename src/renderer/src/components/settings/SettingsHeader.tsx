import { ArrowLeft, LogOut, Settings as SettingsIcon } from "lucide-react";
import { ThemeToggleButton, WindowControls } from "../layout";
import { Button } from "../ui";
import type { SettingsHeaderProps } from "./types";

export function SettingsHeader({
  t,
  onBack,
  onLogout,
}: SettingsHeaderProps): React.JSX.Element {
  return (
    <header className="fantasy-panel title-bar-drag flex h-14 shrink-0 items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="fantasy-button group flex items-center gap-2 px-2 text-theme-muted hover:text-theme"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          <span className="font-medium text-xs uppercase tracking-wider">{t.SETTINGS.BACK_BUTTON}</span>
        </Button>
        <div className="h-4 w-[1px] bg-[var(--fantasy-border-soft)]" />
        <div className="flex items-center gap-2.5">
          <SettingsIcon size={16} className="text-[var(--mc-accent)]" />
          <h1 className="fantasy-rune-label text-[11px] font-bold text-theme">
            {t.SETTINGS.TITLE}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggleButton />
        <div className="h-4 w-[1px] bg-[var(--fantasy-border-soft)]" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="fantasy-button group flex items-center gap-2 text-theme-muted hover:text-[color:var(--destructive)]"
        >
          <LogOut size={16} className="transition-transform group-hover:translate-x-0.5" />
          <span className="font-medium text-xs uppercase tracking-wider">{t.SETTINGS.LOGOUT_BUTTON}</span>
        </Button>
        <div className="h-4 w-[1px] bg-[var(--fantasy-border-soft)]" />
        <WindowControls />
      </div>
    </header>
  );
}
