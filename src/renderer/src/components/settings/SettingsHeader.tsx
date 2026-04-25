import { WindowControls } from "../layout/WindowControls";
import type { SettingsBaseProps } from "./types";

interface SettingsHeaderProps extends SettingsBaseProps {
  onBack: () => void;
  onLogout: () => void;
}

export function SettingsHeader({ t, onBack, onLogout }: SettingsHeaderProps) {
  return (
    <header className="title-bar-drag flex h-16 shrink-0 items-center justify-between border-b-[3px] border-[#1a1a1a] bg-[#2b2d31] px-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] px-4 py-2 font-minecraft text-sm text-[#e0e0e0] transition-colors hover:bg-[#3c3c3c] active:border-t-[#1a1a1a] active:border-l-[#1a1a1a] active:border-b-[#5a5a5a] active:border-r-[#5a5a5a]"
        >
          {t.SETTINGS.BACK_BUTTON}
        </button>
        <h1 className="font-minecraft text-lg font-bold uppercase text-[#e0e0e0]">
          {t.SETTINGS.TITLE}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onLogout}
          className="font-minecraft text-xs text-[#8a8a8a] transition-colors hover:text-[#ff5555]"
        >
          {t.SETTINGS.LOGOUT_BUTTON}
        </button>
        <WindowControls />
      </div>
    </header>
  );
}
