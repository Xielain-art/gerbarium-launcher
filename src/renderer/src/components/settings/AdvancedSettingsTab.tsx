import { Checkbox, Card } from "../ui";
import type { AdvancedSettingsTabProps } from "./types";
import { Info } from "lucide-react";

export function AdvancedSettingsTab({
  t,
  general,
  onUpdateGeneral,
}: AdvancedSettingsTabProps): React.JSX.Element {
  const advancedTranslations = t.SETTINGS.ADVANCED;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#fafafa]">
          {advancedTranslations.TITLE}
        </h2>
        <p className="mt-1 text-sm text-[#898989]">
          Fine-tune the launcher behavior with advanced options.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <Checkbox
            id="show-launch-console"
            label={advancedTranslations.SHOW_LAUNCH_CONSOLE}
            checked={general.showLaunchConsole}
            onChange={(e) =>
              onUpdateGeneral({ showLaunchConsole: e.target.checked })
            }
          />
          <div className="flex items-start gap-3 rounded-md bg-[#111111] p-4 text-[#898989]">
            <Info size={16} className="mt-0.5 shrink-0 text-[#3ecf8e]" />
            <p className="text-sm leading-relaxed">
              {advancedTranslations.SHOW_LAUNCH_CONSOLE_HELP}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

