import { ShieldCheck } from "lucide-react";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useIntegrityCheckScreen } from "../hooks/useIntegrityCheckScreen";

export function IntegrityCheckScreen(): React.JSX.Element {
  const vm = useIntegrityCheckScreen();

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-[var(--theme-surface)] overflow-hidden">
      <div className="auth-grid-overlay opacity-[0.05]" />
      
      <div className="relative w-full max-w-md p-8 border border-theme bg-[var(--theme-bg)] rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded bg-[var(--mc-accent)]/10">
            <ShieldCheck size={20} className="text-[var(--mc-accent)]" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--mc-accent)]">
              Security Preflight
            </div>
            <h1 className="font-sans text-lg font-medium text-theme leading-tight">
              Verifying Integrity
            </h1>
          </div>
        </div>

        <ProgressBar
          progress={vm.progress}
          status={vm.phaseText}
          className="mb-4"
        />

        <div className="font-mono text-[9px] text-theme-muted leading-relaxed">
          {vm.statusMessage}
        </div>
      </div>
    </div>
  );
}

