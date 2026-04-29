import { Button } from "../../ui/Button";
import type { GameVersion } from "../../../types";
import type { TranslationType } from "../../../../../shared/constants/translations";

interface Props {
  t: TranslationType;
  selectedVersion: GameVersion | undefined;
  isPlayBlocked?: boolean;
  onPlay: () => void;
}

export function IdleActionState({ t, selectedVersion, isPlayBlocked, onPlay }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <div className="font-minecraft text-xs text-theme-muted">{t.DASHBOARD.SELECTED_VERSION_LABEL}</div>
        <div className="truncate font-minecraft text-base font-bold text-theme">{selectedVersion?.name || t.DASHBOARD.VERSION_NOT_SELECTED}</div>
        <div className="font-minecraft text-xs">{selectedVersion?.isInstalled ? <span className="text-[#55ff55]">{t.DASHBOARD.READY_TO_PLAY}</span> : <span className="text-theme-muted">{t.DASHBOARD.NEEDS_INSTALLATION}</span>}</div>
      </div>
      <Button onClick={onPlay} variant="primary" size="xl" className="min-w-[320px]" disabled={isPlayBlocked}><span className="text-xl">{t.DASHBOARD.PLAY_ICON}</span><span className="ml-3 text-lg">{t.DASHBOARD.PLAY_BUTTON}</span></Button>
    </div>
  );
}
