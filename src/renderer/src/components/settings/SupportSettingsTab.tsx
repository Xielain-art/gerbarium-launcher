import { Button, Card } from "../ui";
import type { SupportSettingsTabProps } from "./types";
import { cn } from "@/lib/utils";
import { Bug, Download, Terminal, ExternalLink, Info, HelpCircle } from "lucide-react";

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
      <div className="flex flex-col gap-1">
        <h2 className="fantasy-hero-title text-2xl font-semibold text-theme">
          {t.SETTINGS.DEBUG.TITLE}
        </h2>
        <p className="text-sm text-theme-muted">
          Troubleshooting tools and support resources.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="fantasy-card p-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--mc-accent)]/15 text-[var(--mc-accent)] shadow-[0_0_20px_rgba(62,207,142,0.1)]">
              <Bug size={24} />
            </div>
            <div className="flex-1 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <HelpCircle size={14} className="text-theme-muted" />
                  <h3 className="fantasy-rune-label text-[11px] font-bold">
                    Diagnostic Engine
                  </h3>
                </div>
                <h4 className="text-base font-semibold text-theme">
                  Diagnostic Tools
                </h4>
                <p className="text-sm leading-relaxed text-theme-muted">
                  {t.SETTINGS.DEBUG.HELP_TEXT}
                </p>
              </div>

              {notice && (
                <div
                  className={cn(
                    "fantasy-chip flex items-start gap-3 rounded-md border p-4 text-xs font-medium transition-all",
                    notice.type === "success"
                      ? "border-[var(--mc-accent)]/20 bg-[var(--mc-accent)]/12 text-[var(--mc-accent)]"
                      : "border-[color:var(--destructive)]/20 bg-[color:var(--destructive)]/10 text-[color:var(--destructive)]",
                  )}
                >
                  <Info size={14} className="mt-0.5 shrink-0" />
                  <span className="whitespace-pre-line">{notice.text}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-2">
                  <Button
                    onClick={() => void onExportLogs()}
                    disabled={isExporting}
                    isLoading={isExporting}
                    variant="primary"
                    className="fantasy-button fantasy-button--primary min-w-[180px] font-semibold"
                  >
                    <Download size={16}  />
                    {t.SETTINGS.DEBUG.EXPORT_BUTTON}
                </Button>

                  <Button
                    variant="outline"
                    onClick={onOpenGithub}
                    className="fantasy-button min-w-[180px] font-semibold"
                  >
                    <ExternalLink size={16}  />
                    {t.SETTINGS.DEBUG.GITHUB_ISSUES_BUTTON}
                </Button>

                {showDevToolsButton && (
                  <Button
                    variant="secondary"
                    onClick={() => void onOpenDevTools()}
                    className="fantasy-button min-w-[180px] border-dashed font-semibold"
                  >
                    <Terminal size={16}  />
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

