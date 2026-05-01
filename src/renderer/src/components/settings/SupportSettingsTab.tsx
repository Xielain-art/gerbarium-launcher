import { Button } from "../ui";
import type { SupportSettingsTabProps } from "./types";
import { cn } from "@/lib/utils";

export function SupportSettingsTab({
  t,
  isExporting,
  notice,
  onExportLogs,
  onOpenGithub,
  showDevToolsButton,
  onOpenDevTools,
}: SupportSettingsTabProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <h2 className="font-minecraft text-xl font-bold uppercase text-theme">
        {t.SETTINGS.DEBUG.TITLE}
      </h2>

      <div className="space-y-4">
        <p className="font-minecraft text-sm text-theme">
          {t.SETTINGS.DEBUG.HELP_TEXT}
        </p>

        {notice && (
          <div
            className={cn(
              "rounded border-[2px] px-3 py-2 font-minecraft text-xs whitespace-pre-line",
              notice.type === "success"
                ? "border-[var(--btn-primary-border-lo)] bg-[color-mix(in_srgb,var(--mc-accent)_22%,transparent)] text-[color-mix(in_srgb,var(--mc-accent-hi)_50%,white)]"
                : "border-[var(--mc-error-border)] bg-[var(--mc-error-bg)] text-[var(--mc-error-text)]",
            )}
          >
            {notice.text}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => void onExportLogs()}
            disabled={isExporting}
            isLoading={isExporting}
            className="w-full"
          >
            {t.SETTINGS.DEBUG.EXPORT_BUTTON}
          </Button>

          <Button variant="danger" onClick={onOpenGithub} className="w-full">
            {t.SETTINGS.DEBUG.GITHUB_ISSUES_BUTTON}
          </Button>

          {showDevToolsButton && (
            <Button
              variant="secondary"
              onClick={() => void onOpenDevTools()}
              className="w-full"
            >
              {t.SETTINGS.DEBUG.OPEN_DEVTOOLS_BUTTON}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

