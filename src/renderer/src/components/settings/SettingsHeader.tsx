import { WindowControls } from "../layout/WindowControls";
import type { SettingsBaseProps } from "./types";

interface SettingsHeaderProps extends SettingsBaseProps {
  onBack: () => void;
  onLogout: () => void;
}

export function SettingsHeader({ t, onBack, onLogout }: SettingsHeaderProps) {
  return (
    <header className="title-bar-drag flex h-16 shrink-0 items-center justify-between border-b-[3px] border-theme bg-theme-surface px-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="mc-btn px-4 py-2 font-minecraft text-sm transition-colors active:border-t-[var(--btn-border-lo)] active:border-l-[var(--btn-border-lo)] active:border-b-[var(--btn-border-hi)] active:border-r-[var(--btn-border-hi)]"
        >
          {t.SETTINGS.BACK_BUTTON}
        </button>
        <h1 className="font-minecraft text-lg font-bold uppercase text-theme">
          {t.SETTINGS.TITLE}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onLogout}
          className="font-minecraft text-xs text-theme-muted transition-colors hover:text-[var(--mc-error-text)]"
        >
          {t.SETTINGS.LOGOUT_BUTTON}
        </button>
        <WindowControls />
      </div>
    </header>
  );
}
