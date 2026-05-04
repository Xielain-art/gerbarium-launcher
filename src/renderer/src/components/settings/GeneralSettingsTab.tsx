import { Checkbox, Select, Button, Input, Card } from "../ui";
import type { GeneralSettingsTabProps } from "./types";
import { THEME_REGISTRY } from "../../lib/themes/themeRegistry";
import type { ThemeId } from "../../lib/themes/themeRegistry";
import { FolderOpen, ExternalLink } from "lucide-react";

export function GeneralSettingsTab({
  t,
  general,
  onUpdateGeneral,
  onSelectGameDirectory,
  onOpenGamePath,
  onOpenDataFolder,
}: GeneralSettingsTabProps): React.JSX.Element {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#fafafa]">
          {t.SETTINGS.GENERAL.TITLE}
        </h2>
        <p className="mt-1 text-sm text-[#898989]">
          Manage your launcher preferences and appearance.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
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
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#4d4d4d]">
            Behavior
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Checkbox
              label="Fullscreen Mode"
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
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#4d4d4d]">
            Storage & Paths
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-medium uppercase tracking-wider text-[#898989]">
                Game Files Path
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={general.gamePath || ""}
                  readOnly
                  placeholder="Default (~/.gerbarium)"
                  className="flex-1"
                />
                <Button
                  onClick={() => void onSelectGameDirectory()}
                  variant="secondary"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <FolderOpen size={16} />
                  Browse
                </Button>
              </div>
            </div>
            
            <div className="flex gap-4 pt-2">
              <button
                onClick={onOpenGamePath}
                className="flex items-center gap-1.5 text-xs font-medium text-[#3ecf8e] transition-colors hover:text-[#50e3a1]"
              >
                <ExternalLink size={12} />
                Open game folder
              </button>
              <div className="h-4 w-[1px] bg-[#2e2e2e]" />
              <button
                onClick={onOpenDataFolder}
                className="flex items-center gap-1.5 text-xs font-medium text-[#3ecf8e] transition-colors hover:text-[#50e3a1]"
              >
                <ExternalLink size={12} />
                Open launcher data
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

