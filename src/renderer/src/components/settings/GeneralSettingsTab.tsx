import { Checkbox, Select } from "../ui";
import type { GeneralSettingsTabProps } from "./types";

export function GeneralSettingsTab({
  t,
  general,
  onUpdateGeneral,
  onSelectGameDirectory,
  onOpenGamePath,
  onOpenDataFolder,
}: GeneralSettingsTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-minecraft text-xl font-bold uppercase text-[#e0e0e0]">
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
        onChange={(e) =>
          onUpdateGeneral({ theme: e.target.value as "dark" | "light" | "gerbarium" })
        }
        options={[
          { value: "gerbarium", label: t.SETTINGS.GENERAL.THEMES.gerbarium },
          { value: "dark", label: t.SETTINGS.GENERAL.THEMES.dark },
          { value: "light", label: t.SETTINGS.GENERAL.THEMES.light },
        ]}
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

      <div className="space-y-2 pt-4 border-t border-[#1a1a1a]">
        <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
          Game Files Path
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={general.gamePath || ""}
            readOnly
            placeholder="Default (~/.gerbarium)"
            className="flex-1 rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-base text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:outline-none"
          />
          <button
            onClick={() => void onSelectGameDirectory()}
            className="rounded border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] px-4 py-3 font-minecraft text-sm text-[#e0e0e0] transition-colors hover:bg-[#3c3c3c]"
          >
            Browse
          </button>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={onOpenGamePath}
            className="font-minecraft text-xs text-[#55aaff] hover:underline"
          >
            Open game folder
          </button>
          <span className="text-[#3c3c3c]">|</span>
          <button
            onClick={onOpenDataFolder}
            className="font-minecraft text-xs text-[#55aaff] hover:underline"
          >
            Open launcher data
          </button>
        </div>
      </div>
    </div>
  );
}
