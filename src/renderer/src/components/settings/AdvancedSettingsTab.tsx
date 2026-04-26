import { Checkbox } from "../ui";
import type { AdvancedSettingsTabProps } from "./types";

export function AdvancedSettingsTab({
  t,
  general,
  onUpdateGeneral,
}: AdvancedSettingsTabProps) {
  const advancedTranslations = t.SETTINGS.ADVANCED;

  return (
    <div className="space-y-6">
      <h2 className="font-minecraft text-xl font-bold uppercase text-theme">
        {advancedTranslations.TITLE}
      </h2>

      <div className="rounded border-[2px] border-theme bg-[var(--theme-surface-soft)] p-4 space-y-3">
        <Checkbox
          id="show-launch-console"
          label={
            advancedTranslations.SHOW_LAUNCH_CONSOLE
          }
          checked={general.showLaunchConsole}
          onChange={(e) => onUpdateGeneral({ showLaunchConsole: e.target.checked })}
        />
        <p className="font-minecraft text-xs text-theme-muted">
          {advancedTranslations.SHOW_LAUNCH_CONSOLE_HELP}
        </p>
      </div>
    </div>
  );
}
