import { ArrowLeft, LogOut } from "lucide-react";
import { ThemeToggleButton, WindowControls } from "../layout";
import { Button } from "../ui";
import type { SettingsHeaderProps } from "./types";

export function SettingsHeader({
  t,
  onBack,
  onLogout,
}: SettingsHeaderProps): React.JSX.Element {
  return (
    <header className="title-bar-drag flex h-14 shrink-0 items-center justify-between border-b border-[#2e2e2e] bg-[#0f0f0f] px-6">
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2 text-[#898989] hover:text-[#fafafa]"
        >
          <ArrowLeft size={16} />
          <span className="font-medium">{t.SETTINGS.BACK_BUTTON}</span>
        </Button>
        <div className="h-4 w-[1px] bg-[#2e2e2e]" />
        <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#fafafa]">
          {t.SETTINGS.TITLE}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggleButton />
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="text-[#898989] hover:text-[#ff8080]"
        >
          <LogOut size={16} className="mr-2" />
          {t.SETTINGS.LOGOUT_BUTTON}
        </Button>
        <div className="h-4 w-[1px] bg-[#2e2e2e]" />
        <WindowControls />
      </div>
    </header>
  );
}

