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
        <h2 className="fantasy-hero-title text-2xl font-semibold text-theme">
          {advancedTranslations.TITLE}
        </h2>
        <p className="text-sm text-theme-muted">
          Fine-tune the launcher behavior with advanced options.
        </p>
      </div>

      <Card className="fantasy-card p-6">
        <div className="mb-6 flex items-center gap-2">
          <Sliders size={16} className="text-theme-muted" />
          <h3 className="fantasy-rune-label text-[11px] font-bold">
            Debug & Console
          </h3>
        </div>
        
        <div className="space-y-6">
          <div className="fantasy-chip flex items-center justify-between rounded-lg p-4 transition-all hover:border-[var(--theme-border-hi)]">
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

          <div className="fantasy-chip flex items-start gap-3 rounded-lg border border-[var(--mc-accent)]/10 bg-[var(--mc-accent)]/10 p-4 text-theme-muted transition-all hover:bg-[var(--mc-accent)]/15">
            <Info size={16} className="mt-0.5 shrink-0 text-[var(--mc-accent)]" />
            <p className="text-sm leading-relaxed">
              {advancedTranslations.SHOW_LAUNCH_CONSOLE_HELP}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
