import { useEffect, useState } from "react";
import type { TranslationType } from "../../../../../shared/constants/translations";

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
    <div className="space-y-2">
      <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-theme">
        {t.SETTINGS.JAVA.RAM_LABEL} {localRamAllocation} {t.COMMON.GB}
      </label>
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
          className="h-3 flex-1 cursor-pointer appearance-none rounded border-[3px] border-b-[var(--mc-panel-border-hi)] border-l-[var(--mc-panel-border-lo)] border-r-[var(--mc-panel-border-hi)] border-t-[var(--mc-panel-border-lo)] bg-[var(--mc-input-bg)] [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-b-[var(--btn-primary-border-lo)] [&::-webkit-slider-thumb]:border-l-[var(--mc-accent-hi)] [&::-webkit-slider-thumb]:border-r-[var(--btn-primary-border-lo)] [&::-webkit-slider-thumb]:border-t-[var(--mc-accent-hi)] [&::-webkit-slider-thumb]:bg-[var(--mc-accent)] [&::-webkit-slider-thumb]:shadow-[inset_2px_2px_0px_var(--mc-accent-hi),inset_-2px_-2px_0px_var(--btn-primary-border-lo)]"
        />
        <span className="w-16 text-right font-minecraft text-sm text-theme">
          {localRamAllocation} {t.COMMON.GB}
        </span>
      </div>
      <div className="flex justify-between font-minecraft text-xs text-theme-muted">
        <span>
          1 {t.COMMON.GB}
        </span>
        <span>
          {maxRamGb} {t.COMMON.GB}
        </span>
      </div>
    </div>
  );
}

