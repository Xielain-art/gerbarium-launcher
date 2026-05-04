import { useEffect, useState } from "react";
import type { TranslationType } from "../../../../../shared/constants/translations";
import { Card } from "../../ui";

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
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#4d4d4d]">
          {t.SETTINGS.JAVA.RAM_LABEL}
        </h3>
        <span className="rounded-full bg-[#111111] px-3 py-1 text-sm font-semibold text-[#3ecf8e] border border-[#2e2e2e]">
          {localRamAllocation} {t.COMMON.GB}
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
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
            className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-[#111111] border border-[#2e2e2e] focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0f0f0f] [&::-webkit-slider-thumb]:bg-[#3ecf8e] [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110"
          />
        </div>
        <div className="flex justify-between text-[11px] font-medium tracking-wide text-[#898989]">
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

