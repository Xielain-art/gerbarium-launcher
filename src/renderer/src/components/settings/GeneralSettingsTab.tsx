import { Checkbox, Select, Button, Input, Card } from "../ui";
import type { GeneralSettingsTabProps } from "./types";
import { FolderOpen, ExternalLink, Monitor, Globe, Box, Save } from "lucide-react";

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
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-theme">
          {t.SETTINGS.GENERAL.TITLE}
        </h2>
        <p className="text-sm text-theme-muted">
          Manage your launcher preferences and appearance.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <Globe size={16} className="text-theme-muted" />
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[1.2px] text-theme-muted">
              Appearance & Localization
            </h3>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <Select
              label={t.SETTINGS.GENERAL.LANGUAGE_LABEL}
              value={general.language}
              onChange={(e) => onUpdateGeneral({ language: e.target.value })}
              options={t.SETTINGS.GENERAL.LANGUAGE_OPTIONS}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <Monitor size={16} className="text-theme-muted" />
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[1.2px] text-theme-muted">
              Launcher Behavior
            </h3>
          </div>
          <div className="grid gap-y-5 sm:grid-cols-2">
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
          <div className="mb-6 flex items-center gap-2">
            <Save size={16} className="text-theme-muted" />
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[1.2px] text-theme-muted">
              Storage & Paths
            </h3>
          </div>
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-[1.2px] text-theme-muted">
                Game Files Path
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={general.gamePath || ""}
                  readOnly
                  placeholder="Default (~/.gerbarium)"
                  className="flex-1 font-mono text-[13px]"
                />
                <Button
                  onClick={() => void onSelectGameDirectory()}
                  variant="secondary"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <FolderOpen size={16} className="text-theme-muted" />
                  Browse
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-6 border-t border-theme pt-2">
              <button
                onClick={onOpenGamePath}
                className="group flex items-center gap-2 text-xs font-medium text-[var(--mc-accent)] transition-all hover:text-[var(--mc-accent-hi)]"
              >
                <div className="rounded bg-[var(--mc-accent)]/15 p-1.5 transition-colors group-hover:bg-[var(--mc-accent)]/25">
                  <Box size={14} />
                </div>
                Open game folder
              </button>
              <button
                onClick={onOpenDataFolder}
                className="group flex items-center gap-2 text-xs font-medium text-[var(--mc-accent)] transition-all hover:text-[var(--mc-accent-hi)]"
              >
                <div className="rounded bg-[var(--mc-accent)]/15 p-1.5 transition-colors group-hover:bg-[var(--mc-accent)]/25">
                  <ExternalLink size={14} />
                </div>
                Open launcher data
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
