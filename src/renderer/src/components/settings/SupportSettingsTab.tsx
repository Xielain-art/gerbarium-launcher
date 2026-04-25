import { Button } from "../ui";
import type { SupportSettingsTabProps } from "./types";

export function SupportSettingsTab({
  t,
  isExporting,
  notice,
  onExportLogs,
  onOpenGithub,
  showDevToolsButton,
  onOpenDevTools,
}: SupportSettingsTabProps) {
  const debugTranslations = t.SETTINGS.DEBUG as unknown as {
    OPEN_DEVTOOLS_BUTTON?: string;
  };

  return (
    <div className="space-y-6">
      <h2 className="font-minecraft text-xl font-bold uppercase text-[#e0e0e0]">
        {t.SETTINGS.DEBUG.TITLE}
      </h2>

      <div className="space-y-4">
        <p className="font-minecraft text-sm text-[#e0e0e0]">
          {t.SETTINGS.DEBUG.HELP_TEXT}
        </p>

        {notice && (
          <div
            className={`rounded border-[2px] px-3 py-2 font-minecraft text-xs whitespace-pre-line ${
              notice.type === "success"
                ? "border-[#2a5a2a] bg-[#3a753a]/20 text-[#b7ffb7]"
                : "border-[#5a1a1a] bg-[#8b2a2a]/20 text-[#ffb3b3]"
            }`}
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

          <Button
            variant="danger"
            onClick={onOpenGithub}
            className="w-full"
          >
            {t.SETTINGS.DEBUG.GITHUB_ISSUES_BUTTON}
          </Button>

          {showDevToolsButton && (
            <Button
              variant="secondary"
              onClick={() => void onOpenDevTools()}
              className="w-full"
            >
              {debugTranslations.OPEN_DEVTOOLS_BUTTON || "Open DevTools"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
