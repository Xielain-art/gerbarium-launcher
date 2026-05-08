import type { GameUpdateResult } from "../../shared/distribution/manifest";
import { runPackwizUpdate } from "./packwiz/updater";

export type DistributionProgress = {
  percent: number;
  status: string;
};

export type DistributionProgressReporter = (
  progress: DistributionProgress,
) => void;

function pickPackUrl(manifestUrl?: string): string | null {
  const fromOptions = manifestUrl?.trim();
  if (fromOptions) {
    return fromOptions;
  }

  const envCandidates = [
    process.env.BASE_PACKWIZ_URL,
    process.env.PACKWIZ_PACK_URL,
    process.env.GERBARIUM_PACKWIZ_PACK_URL,
    process.env.GERBARIUM_DISTRIBUTION_URL,
  ];

  for (const candidate of envCandidates) {
    const normalized = candidate?.trim();
    if (normalized) {
      return normalized;
    }
  }
  return null;
}

export async function runDistributionUpdate(options: {
  gameRoot: string;
  manifestUrl?: string;
  verifyOnly?: boolean;
  cleanUnknownMods?: boolean;
  downloadConcurrency?: number;
  reportProgress?: DistributionProgressReporter;
}): Promise<GameUpdateResult> {
  const packUrl = pickPackUrl(options.manifestUrl);
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

