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
      <h2 className="font-minecraft text-xl font-bold uppercase text-[#e0e0e0]">
        {advancedTranslations.TITLE}
      </h2>

      <div className="rounded border-[2px] border-[#3a3a3a] bg-[#232428] p-4 space-y-3">
        <Checkbox
          label={
            advancedTranslations.SHOW_LAUNCH_CONSOLE
          }
          checked={general.showLaunchConsole}
          onChange={(e) => onUpdateGeneral({ showLaunchConsole: e.target.checked })}
        />
        <p className="font-minecraft text-xs text-[#8a8a8a]">
          {advancedTranslations.SHOW_LAUNCH_CONSOLE_HELP}
        </p>
      </div>
    </div>
  );
}
