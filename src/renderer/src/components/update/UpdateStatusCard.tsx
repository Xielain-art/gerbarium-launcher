import { RefreshCw } from "lucide-react";
import { ProgressBar } from "../ui/ProgressBar";

interface UpdateStatusCardProps {
  appVersion: string;
  updateMessage: string;
  updateProgress: number;
}

export function UpdateStatusCard({
  appVersion,
  updateMessage,
  updateProgress,
}: UpdateStatusCardProps) {
  return (
    <div className="fantasy-card fantasy-card--hero w-full max-w-md p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl border border-[var(--fantasy-border-soft)] bg-[var(--mc-accent)]/10 p-2">
          <RefreshCw size={20} className="text-[var(--mc-accent)] animate-spin-slow" />
        </div>
        <div>
          <div className="fantasy-rune-label text-[10px] text-[var(--mc-accent)]">
            System Update
          </div>
          <h1 className="fantasy-hero-title font-sans text-lg font-medium text-theme">
            Gerbarium Launcher
          </h1>
        </div>
      </div>

      <div className="space-y-6">
        <ProgressBar
          progress={updateProgress}
          status={updateMessage}
        />

        {appVersion && (
          <div className="flex items-center justify-between border-t border-[var(--fantasy-border-soft)] pt-4 font-mono text-[10px] uppercase tracking-wider text-theme-muted">
            <span>Version</span>
            <span>{appVersion}</span>
          </div>
        )}
      </div>

      <p className="mt-8 text-center font-mono text-[9px] uppercase tracking-widest text-theme-muted/60">
        © 2026 Gerbarium. Radmir Klimau.
      </p>
    </div>
  );
}
