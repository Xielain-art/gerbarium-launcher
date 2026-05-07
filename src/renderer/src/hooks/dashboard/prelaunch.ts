import type { GameVersion } from "../../types";

type ModpackUpdateContext = {
  gamePath?: string;
  distributionUrl?: string;
  selectedVersion: GameVersion;
  setLaunchStatus: (status: string) => void;
  appendLog: (message: string) => void;
};

function trimDistributionUrl(url?: string): string | undefined {
  const normalized = url?.trim();
  return normalized ? normalized : undefined;
}

export async function runPrelaunchModpackUpdate(
  context: ModpackUpdateContext,
): Promise<void> {
  const manifestUrl = trimDistributionUrl(context.distributionUrl);
  if (!manifestUrl) {
    context.appendLog(
      "Distribution update skipped: distribution URL is not configured.",
    );
    return;
  }

  context.setLaunchStatus("Checking modpack files...");
  const result = await window.electronAPI.game.update({
    gamePath: context.gamePath,
    minecraftVersion:
      context.selectedVersion.version || context.selectedVersion.id,
    manifestUrl,
  });

  if (!result.success) {
    throw new Error(result.error || "Game update failed.");
  }

  context.appendLog(
    `Distribution ready: ${result.manifest?.version ?? "unknown"}`,
  );
  context.appendLog(
    `Checked ${result.checked}, downloaded ${result.downloaded}, skipped ${result.skipped}, deleted ${result.deleted}`,
  );
}

