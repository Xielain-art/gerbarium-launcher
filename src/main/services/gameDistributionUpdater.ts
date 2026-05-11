import type { GameUpdateResult } from "../../shared/distribution/manifest";
import { runPackwizUpdate } from "./packwiz/updater";
import { mainEnv } from "../config/env";

export type DistributionProgress = {
  percent: number;
  status: string;
};

export type DistributionProgressReporter = (
  progress: DistributionProgress,
) => void;

function pickPackUrl(): string | null {
  const normalized = mainEnv.PACKWIZ_PACK_URL?.trim();
  return normalized ? normalized : null;
}

export async function runDistributionUpdate(options: {
  gameRoot: string;
  verifyOnly?: boolean;
  cleanUnknownMods?: boolean;
  downloadConcurrency?: number;
  reportProgress?: DistributionProgressReporter;
}): Promise<GameUpdateResult> {
  const packUrl = pickPackUrl();
  if (!packUrl) {
    return {
      success: true,
      checked: 0,
      downloaded: 0,
      skipped: 0,
      deleted: 0,
    };
  }

  return runPackwizUpdate({
    gameRoot: options.gameRoot,
    packUrl,
    verifyOnly: options.verifyOnly,
    cleanUnknownMods: options.cleanUnknownMods ?? false,
    downloadConcurrency: options.downloadConcurrency ?? 4,
    reportProgress: options.reportProgress,
  });
}

