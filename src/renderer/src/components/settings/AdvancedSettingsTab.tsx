import { Checkbox } from "../ui";
import type { AdvancedSettingsTabProps } from "./types";

export function AdvancedSettingsTab({
  t,
  general,
  onUpdateGeneral,
}: AdvancedSettingsTabProps) {
  const advancedTranslations = (t.SETTINGS as unknown as { ADVANCED?: {
    TITLE?: string;
    SHOW_LAUNCH_CONSOLE?: string;
    SHOW_LAUNCH_CONSOLE_HELP?: string;
  } }).ADVANCED;

  return (
    <div className="space-y-6">
      <h2 className="font-minecraft text-xl font-bold uppercase text-[#e0e0e0]">
        {advancedTranslations?.TITLE || "Advanced"}
      </h2>

      <div className="rounded border-[2px] border-[#3a3a3a] bg-[#232428] p-4 space-y-3">
        <Checkbox
          label={
            advancedTranslations?.SHOW_LAUNCH_CONSOLE ||
            "Show console while Minecraft launches"
          }
          checked={general.showLaunchConsole}
          onChange={(e) => onUpdateGeneral({ showLaunchConsole: e.target.checked })}
        />
        <p className="font-minecraft text-xs text-[#8a8a8a]">
          {advancedTranslations?.SHOW_LAUNCH_CONSOLE_HELP ||
            "Disable this to keep the console hidden by default during startup."}
        </p>
      </div>
    </div>
  );
}
