import type { TranslationType } from "../../../../../shared/constants/translations";
import { Card } from "../../ui";
import { Info, Code } from "lucide-react";

interface Props {
  t: TranslationType;
  jvmArgs: string;
  onUpdateJvmArgs: (v: string) => void;
}

export function JavaJvmArgsSection({
  t,
  jvmArgs,
  onUpdateJvmArgs,
}: Props): React.JSX.Element {
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <Code size={16} className="text-theme-muted" />
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-[1.2px] text-theme-muted">
          {t.SETTINGS.JAVA.JVM_ARGS_LABEL}
        </h3>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={jvmArgs || ""}
            onChange={(e) => onUpdateJvmArgs(e.target.value)}
            placeholder={t.SETTINGS.JAVA.JVM_ARGS_PLACEHOLDER}
            rows={4}
            className="flex min-h-[120px] w-full rounded-md border border-theme bg-[var(--theme-surface)] px-4 py-3 font-mono text-sm leading-relaxed text-theme transition-all placeholder:text-theme-muted focus:border-[var(--mc-accent)]/50 focus:bg-[var(--theme-bg)] focus:outline-none focus:ring-1 focus:ring-[var(--mc-accent)]/30 disabled:cursor-not-allowed disabled:opacity-50 shadow-inner"
          />
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded border border-theme bg-[var(--theme-bg)] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-theme-muted">
            JVM
          </div>
        </div>
        
        <div className="flex items-start gap-3 rounded-lg border border-[var(--mc-accent)]/10 bg-[var(--mc-accent)]/10 p-4 text-theme-muted transition-all hover:bg-[var(--mc-accent)]/15">
          <Info size={16} className="mt-0.5 shrink-0 text-[var(--mc-accent)]" />
          <p className="text-[12px] leading-relaxed">
            {t.SETTINGS.JAVA.JVM_ARGS_HELP}
          </p>
        </div>
      </div>
    </Card>
  );
}
