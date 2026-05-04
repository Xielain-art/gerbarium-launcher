import type { TranslationType } from "../../../../../shared/constants/translations";
import { Card } from "../../ui";
import { Info } from "lucide-react";

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
      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#4d4d4d]">
        {t.SETTINGS.JAVA.JVM_ARGS_LABEL}
      </h3>
      <div className="space-y-4">
        <textarea
          value={jvmArgs || ""}
          onChange={(e) => onUpdateJvmArgs(e.target.value)}
          placeholder={t.SETTINGS.JAVA.JVM_ARGS_PLACEHOLDER}
          rows={4}
          className="flex min-h-[100px] w-full rounded-md border border-[#2e2e2e] bg-[#0f0f0f] px-3 py-2 text-sm text-[#fafafa] transition-all placeholder:text-[#4d4d4d] focus:border-[#3ecf8e] focus:outline-none focus:ring-1 focus:ring-[#3ecf8e] disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="flex items-start gap-3 rounded-md bg-[#111111] p-4 text-[#898989]">
          <Info size={16} className="mt-0.5 shrink-0 text-[#3ecf8e]" />
          <p className="text-[12px] leading-relaxed">
            {t.SETTINGS.JAVA.JVM_ARGS_HELP}
          </p>
        </div>
      </div>
    </Card>
  );
}

