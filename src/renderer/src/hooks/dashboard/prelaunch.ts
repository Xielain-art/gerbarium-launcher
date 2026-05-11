import type { GameVersion } from "../../types";

type ModpackUpdateContext = {
  gamePath?: string;
  cleanUnknownMods?: boolean;
  packwizDownloadConcurrency?: number;
  selectedVersion: GameVersion;
  setLaunchStatus: (status: string) => void;
  appendLog: (message: string) => void;
};

export async function runPrelaunchModpackUpdate(
  context: ModpackUpdateContext,
): Promise<void> {
  context.appendLog("Packwiz source: environment configuration");
  context.setLaunchStatus("Fetching modpack metadata...");
  const result = await window.electronAPI.game.update({
    gamePath: context.gamePath,
    minecraftVersion:
      context.selectedVersion.version || context.selectedVersion.id,
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
