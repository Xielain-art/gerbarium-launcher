import type { GameVersion } from "../../types";

type ModpackUpdateContext = {
  gamePath?: string;
  packwizPackUrl?: string;
  distributionUrl?: string;
  cleanUnknownMods?: boolean;
  packwizDownloadConcurrency?: number;
  selectedVersion: GameVersion;
  setLaunchStatus: (status: string) => void;
  appendLog: (message: string) => void;
};

function trimUrl(url?: string): string | undefined {
  const normalized = url?.trim();
  return normalized ? normalized : undefined;
}

export async function runPrelaunchModpackUpdate(
  context: ModpackUpdateContext,
): Promise<void> {
  const packwizPackUrl =
    trimUrl(context.packwizPackUrl) ?? trimUrl(context.distributionUrl);
  if (!packwizPackUrl) {
    context.appendLog(
      "Packwiz update skipped: pack URL is not configured.",
    );
    return;
  }

  context.appendLog(`Packwiz source: ${packwizPackUrl}`);
  context.setLaunchStatus("Fetching modpack metadata...");
  const result = await window.electronAPI.game.update({
    gamePath: context.gamePath,
    minecraftVersion:
      context.selectedVersion.version || context.selectedVersion.id,
    packwizPackUrl,
    cleanUnknownMods: context.cleanUnknownMods,
    downloadConcurrency: context.packwizDownloadConcurrency,
  });

  if (!result.success) {
    throw new Error(result.error || "Packwiz update failed.");
  }

  context.appendLog(
    `Packwiz ready: ${result.manifest?.version ?? "unknown"}`,
  );
  context.appendLog(
    `Checked ${result.checked}, downloaded ${result.downloaded}, skipped ${result.skipped}, deleted ${result.deleted}`,
  );
}
