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
    <header className="title-bar-drag flex h-14 shrink-0 items-center justify-between border-b border-[#2e2e2e] bg-[#0c0c0c] px-6 shadow-sm">
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="group flex items-center gap-2 px-2 text-[#898989] hover:bg-[#1a1a1a] hover:text-[#fafafa]"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          <span className="font-medium text-xs uppercase tracking-wider">{t.SETTINGS.BACK_BUTTON}</span>
        </Button>
        <div className="h-4 w-[1px] bg-[#2e2e2e]" />
        <div className="flex items-center gap-2.5">
          <SettingsIcon size={16} className="text-[#3ecf8e]" />
          <h1 className="font-mono text-[11px] font-bold uppercase tracking-[1.2px] text-[#fafafa]">
            {t.SETTINGS.TITLE}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggleButton />
        <div className="h-4 w-[1px] bg-[#2e2e2e]" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="group flex items-center gap-2 text-[#898989] hover:bg-[#451212]/10 hover:text-[#ff8080]"
        >
          <LogOut size={16} className="transition-transform group-hover:translate-x-0.5" />
          <span className="font-medium text-xs uppercase tracking-wider">{t.SETTINGS.LOGOUT_BUTTON}</span>
        </Button>
        <div className="h-4 w-[1px] bg-[#2e2e2e]" />
        <WindowControls />
      </div>
    </header>
  );
}

