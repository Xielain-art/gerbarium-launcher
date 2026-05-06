import { useEffect, useState } from "react";
import type { TranslationType } from "../../../../../shared/constants/translations";
import { Card } from "../../ui";
import { Cpu } from "lucide-react";

interface Props {
  t: TranslationType;
  maxRamGb: number;
  ramAllocation: number;
  onUpdateRam: (ram: number) => void;
}

export function JavaRamSection({
  t,
  maxRamGb,
  ramAllocation,
  onUpdateRam,
}: Props): React.JSX.Element {
  const [localRamAllocation, setLocalRamAllocation] = useState(ramAllocation);

  useEffect(() => {
    setLocalRamAllocation(Math.min(ramAllocation, maxRamGb));
  }, [ramAllocation, maxRamGb]);

  function commitRamAllocation(): void {
    const normalized = Math.max(1, Math.min(localRamAllocation, maxRamGb));
    if (normalized !== ramAllocation) {
      onUpdateRam(normalized);
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-theme-muted" />
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-[1.2px] text-theme-muted">
            {t.SETTINGS.JAVA.RAM_LABEL}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-theme-muted">
            Allocation
          </span>
          <span className="rounded-md border border-[var(--mc-accent)]/20 bg-[var(--mc-accent)]/10 px-3 py-1 font-mono text-sm font-bold text-[var(--mc-accent)] shadow-[0_0_12px_rgba(62,207,142,0.1)]">
            {localRamAllocation} {t.COMMON.GB}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="group relative flex items-center">
          <input
            type="range"
            min="1"
            max={String(maxRamGb)}
            step="1"
            value={localRamAllocation}
            onChange={(e) =>
              setLocalRamAllocation(Number.parseInt(e.target.value, 10))
            }
            onMouseUp={commitRamAllocation}
            onTouchEnd={commitRamAllocation}
            onKeyUp={commitRamAllocation}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full border border-theme bg-[var(--theme-surface-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--mc-accent)]/20
              [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--theme-bg)] [&::-webkit-slider-thumb]:bg-[var(--mc-accent)] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(62,207,142,0.4)] [&::-webkit-slider-thumb]:transition-all hover:[&::-webkit-slider-thumb]:scale-125 hover:[&::-webkit-slider-thumb]:bg-[var(--mc-accent-hi)]"
            style={{
              background: `linear-gradient(to right, var(--mc-accent) 0%, var(--mc-accent) ${(localRamAllocation / maxRamGb) * 100}%, var(--theme-surface-soft) ${(localRamAllocation / maxRamGb) * 100}%, var(--theme-surface-soft) 100%)`
            }}
          />
        </div>
        <div className="flex justify-between font-mono text-[10px] font-bold uppercase tracking-[1.2px] text-theme-muted">
          <span>
            1 {t.COMMON.GB}
          </span>
          <span>
            {maxRamGb} {t.COMMON.GB}
          </span>
        </div>
      </div>
    </Card>
  );
}
