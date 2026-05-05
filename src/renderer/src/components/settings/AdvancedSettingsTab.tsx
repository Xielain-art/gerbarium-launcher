import { Checkbox, Card } from "../ui";
import type { AdvancedSettingsTabProps } from "./types";
import { Info, Sliders } from "lucide-react";

export function AdvancedSettingsTab({
  t,
  general,
  onUpdateGeneral,
}: AdvancedSettingsTabProps): React.JSX.Element {
  const advancedTranslations = t.SETTINGS.ADVANCED;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-[#fafafa]">
          {advancedTranslations.TITLE}
        </h2>
        <p className="text-sm text-[#898989]">
          Fine-tune the launcher behavior with advanced options.
        </p>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Sliders size={16} className="text-[#4d4d4d]" />
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-[1.2px] text-[#4d4d4d]">
            Debug & Console
          </h3>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-[#1a1a1a] bg-[#0c0c0c] p-4 transition-all hover:border-[#2e2e2e]">
            <Checkbox
              id="show-launch-console"
              label={advancedTranslations.SHOW_LAUNCH_CONSOLE}
              checked={general.showLaunchConsole}
              onChange={(e) =>
                onUpdateGeneral({ showLaunchConsole: e.target.checked })
              }
              className="font-medium"
            />
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-[#3ecf8e]/10 bg-[#0b2b1a]/10 p-4 text-[#898989] transition-all hover:bg-[#0b2b1a]/20">
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

