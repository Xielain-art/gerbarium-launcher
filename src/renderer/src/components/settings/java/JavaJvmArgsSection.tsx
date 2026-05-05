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
        <Code size={16} className="text-[#4d4d4d]" />
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-[1.2px] text-[#4d4d4d]">
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
            className="flex min-h-[120px] w-full rounded-md border border-[#2e2e2e] bg-[#0c0c0c] px-4 py-3 font-mono text-sm leading-relaxed text-[#fafafa] transition-all placeholder:text-[#4d4d4d] focus:border-[#3ecf8e]/50 focus:bg-[#0f0f0f] focus:outline-none focus:ring-1 focus:ring-[#3ecf8e]/30 disabled:cursor-not-allowed disabled:opacity-50 shadow-inner"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded bg-[#111111] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4d4d4d] border border-[#1a1a1a]">
            JVM
          </div>
        </div>
        
        <div className="flex items-start gap-3 rounded-lg border border-[#3ecf8e]/10 bg-[#0b2b1a]/10 p-4 text-[#898989] transition-all hover:bg-[#0b2b1a]/20">
          <Info size={16} className="mt-0.5 shrink-0 text-[#3ecf8e]" />
          <p className="text-[12px] leading-relaxed">
            {t.SETTINGS.JAVA.JVM_ARGS_HELP}
          </p>
        </div>
      </div>
    </Card>
  );
}

