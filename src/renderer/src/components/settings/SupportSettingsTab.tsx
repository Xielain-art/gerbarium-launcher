import { Button, Card } from "../ui";
import type { SupportSettingsTabProps } from "./types";
import { cn } from "@/lib/utils";
import { Bug, Download, Terminal, ExternalLink, Info } from "lucide-react";

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
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#fafafa]">
          {t.SETTINGS.DEBUG.TITLE}
        </h2>
        <p className="mt-1 text-sm text-[#898989]">
          Troubleshooting tools and support resources.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-[#111111] p-2 text-[#3ecf8e]">
              <Bug size={20} />
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#fafafa]">
                  Diagnostic Tools
                </h3>
                <p className="text-sm text-[#898989]">
                  {t.SETTINGS.DEBUG.HELP_TEXT}
                </p>
              </div>

              {notice && (
                <div
                  className={cn(
                    "rounded-md border p-3 text-xs leading-relaxed transition-all",
                    notice.type === "success"
                      ? "border-[#0b2b1a] bg-[#0b2b1a]/50 text-[#3ecf8e]"
                      : "border-[#451212] bg-[#451212]/50 text-[#ff8080]",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Info size={14} className="mt-0.5 shrink-0" />
                    <span className="whitespace-pre-line">{notice.text}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  onClick={() => void onExportLogs()}
                  disabled={isExporting}
                  isLoading={isExporting}
                  variant="primary"
                  className="min-w-[160px]"
                >
                  <Download size={16} className="mr-2" />
                  {t.SETTINGS.DEBUG.EXPORT_BUTTON}
                </Button>

                <Button
                  variant="outline"
                  onClick={onOpenGithub}
                  className="min-w-[160px]"
                >
                  <ExternalLink size={16} className="mr-2" />
                  {t.SETTINGS.DEBUG.GITHUB_ISSUES_BUTTON}
                </Button>

                {showDevToolsButton && (
                  <Button
                    variant="secondary"
                    onClick={() => void onOpenDevTools()}
                    className="min-w-[160px]"
                  >
                    <Terminal size={16} className="mr-2" />
                    {t.SETTINGS.DEBUG.OPEN_DEVTOOLS_BUTTON}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

