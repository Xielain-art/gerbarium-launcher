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
    <header className="title-bar-drag flex h-14 shrink-0 items-center justify-between border-b border-theme bg-[var(--theme-sidebar)] px-6 shadow-sm">
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="group flex items-center gap-2 px-2 text-theme-muted hover:bg-[var(--theme-surface)] hover:text-theme"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          <span className="font-medium text-xs uppercase tracking-wider">{t.SETTINGS.BACK_BUTTON}</span>
        </Button>
        <div className="h-4 w-[1px] bg-[var(--theme-border)]" />
        <div className="flex items-center gap-2.5">
          <SettingsIcon size={16} className="text-[var(--mc-accent)]" />
          <h1 className="font-mono text-[11px] font-bold uppercase tracking-[1.2px] text-theme">
            {t.SETTINGS.TITLE}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggleButton />
        <div className="h-4 w-[1px] bg-[var(--theme-border)]" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="group flex items-center gap-2 text-theme-muted hover:bg-[color:var(--destructive)]/10 hover:text-[color:var(--destructive)]"
        >
          <LogOut size={16} className="transition-transform group-hover:translate-x-0.5" />
          <span className="font-medium text-xs uppercase tracking-wider">{t.SETTINGS.LOGOUT_BUTTON}</span>
        </Button>
        <div className="h-4 w-[1px] bg-[var(--theme-border)]" />
        <WindowControls />
      </div>
    </header>
  );
}
