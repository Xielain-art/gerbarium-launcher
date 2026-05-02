import { Checkbox, Select } from "../ui";
import type { GeneralSettingsTabProps } from "./types";
import { THEME_REGISTRY } from "../../lib/themes/themeRegistry";
import type { ThemeId } from "../../lib/themes/themeRegistry";

export function GeneralSettingsTab({
  t,
  general,
  onUpdateGeneral,
  onSelectGameDirectory,
  onOpenGamePath,
  onOpenDataFolder,
}: GeneralSettingsTabProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <h2 className="font-minecraft text-xl font-bold uppercase text-theme">
        {t.SETTINGS.GENERAL.TITLE}
      </h2>

      <Select
        label={t.SETTINGS.GENERAL.LANGUAGE_LABEL}
        value={general.language}
        onChange={(e) => onUpdateGeneral({ language: e.target.value })}
        options={t.SETTINGS.GENERAL.LANGUAGE_OPTIONS}
      />

      <Select
        label={t.SETTINGS.GENERAL.THEME_LABEL}
        value={general.theme}
        onChange={(e) => onUpdateGeneral({ theme: e.target.value as ThemeId })}
        options={THEME_REGISTRY.map((theme) => ({
          value: theme.id,
          label:
            t.SETTINGS.GENERAL.THEMES[
              theme.translationKey as keyof typeof t.SETTINGS.GENERAL.THEMES
            ] ?? theme.fallbackLabel,
        }))}
      />

      <div className="space-y-3">
        <Checkbox
          label="Fullscreen"
          checked={general.fullscreen}
          onChange={(e) => onUpdateGeneral({ fullscreen: e.target.checked })}
        />
        <Checkbox
          label={t.SETTINGS.GENERAL.CLOSE_ON_LAUNCH}
          checked={general.closeOnLaunch}
          onChange={(e) => onUpdateGeneral({ closeOnLaunch: e.target.checked })}
        />
        <Checkbox
          label={t.SETTINGS.GENERAL.MINIMIZE_TO_TRAY}
          checked={general.minimizeToTray}
          onChange={(e) => onUpdateGeneral({ minimizeToTray: e.target.checked })}
        />
        <Checkbox
          label={t.SETTINGS.GENERAL.DISCORD_RPC}
          checked={general.discordRPC}
          onChange={(e) => onUpdateGeneral({ discordRPC: e.target.checked })}
        />
      </div>

      <div className="space-y-2 border-t border-theme pt-4">
        <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-theme">
          Game Files Path
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={general.gamePath || ""}
            readOnly
            placeholder="Default (~/.gerbarium)"
            className="mc-input flex-1"
          />
          <button
            onClick={() => void onSelectGameDirectory()}
            className="mc-btn px-4 py-3 font-minecraft text-sm transition-colors"
          >
            Browse
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={onOpenGamePath}
            className="font-minecraft text-xs text-[var(--mc-progress-fill-a)] hover:underline"
          >
            Open game folder
          </button>
          <span className="text-theme-muted">|</span>
          <button
            onClick={onOpenDataFolder}
            className="font-minecraft text-xs text-[var(--mc-progress-fill-a)] hover:underline"
          >
            Open launcher data
          </button>
        </div>
      </div>
    </div>
  );
}

