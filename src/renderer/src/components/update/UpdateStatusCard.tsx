import { RefreshCw } from "lucide-react";
import { UI_STRINGS } from "../../../../shared/constants/ui-strings";
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
    <div className="w-full max-w-md p-8 border border-[#2e2e2e] bg-[#0f0f0f] rounded-lg">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded bg-[#3ecf8e]/10">
          <RefreshCw size={20} className="text-[#3ecf8e] animate-spin-slow" />
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3ecf8e]">
            System Update
          </div>
          <h1 className="font-sans text-lg font-medium text-[#fafafa] leading-tight">
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
          <div className="flex justify-between items-center border-t border-[#2e2e2e] pt-4 font-mono text-[10px] uppercase tracking-wider text-[#4d4d4d]">
            <span>{UI_STRINGS.COMMON.VERSION}</span>
            <span>{appVersion}</span>
          </div>
        )}
      </div>

      <p className="mt-8 text-center font-mono text-[9px] uppercase tracking-widest text-[#4d4d4d]/60">
        {UI_STRINGS.UPDATE_SCREEN.COPYRIGHT}
      </p>
    </div>
  );
}
