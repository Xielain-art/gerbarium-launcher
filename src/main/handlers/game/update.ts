import { BrowserWindow, ipcMain, type IpcMainInvokeEvent } from "electron";
import log from "electron-log";
import {
  IPC_CHANNELS,
  type GameUpdateOptions,
  type GameUpdateResult,
} from "../../../shared/constants/ipc-chanels";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import { runDistributionUpdate } from "../../services/gameDistributionUpdater";
import {
  resolveRootPath,
  resolveInstanceRootPath,
  sendProgress,
} from "./shared";

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

function emitUpdateProgress(
  mainWindow: BrowserWindow,
  percent: number,
  status: string,
): void {
  sendProgress(mainWindow, {
    type: "progress",
    content: { percent, status },
  });
}

async function handleDistributionUpdate(
  mainWindow: BrowserWindow,
  options: GameUpdateOptions | undefined,
  verifyOnly: boolean,
): Promise<GameUpdateResult> {
  try {
    const gameRoot = await resolveRootPath(options?.gamePath);
    const instanceRoot = options?.minecraftVersion?.trim()
      ? await resolveInstanceRootPath(options?.gamePath, options.minecraftVersion)
      : gameRoot;
    const result = await runDistributionUpdate({
      gameRoot: instanceRoot,
      verifyOnly,
      cleanUnknownMods: options?.cleanUnknownMods,
      downloadConcurrency: options?.downloadConcurrency,
      reportProgress: (progress) =>
        emitUpdateProgress(mainWindow, progress.percent, progress.status),
    });
    return result;
  } catch (error: unknown) {
    log.error(LOG_MESSAGES.GAME_DISTRIBUTION_UPDATE_FAILED, error);
    return {
      success: false,
      checked: 0,
      downloaded: 0,
      skipped: 0,
      deleted: 0,
      error: toErrorMessage(error),
    };
  }
}

export default function setupGameUpdateHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle(
    IPC_CHANNELS.GAME.UPDATE,
    async (
      _event: IpcMainInvokeEvent,
      options?: GameUpdateOptions,
    ): Promise<GameUpdateResult> =>
      handleDistributionUpdate(mainWindow, options, false),
  );

  ipcMain.handle(
    IPC_CHANNELS.GAME.VERIFY,
    async (
      _event: IpcMainInvokeEvent,
      options?: GameUpdateOptions,
    ): Promise<GameUpdateResult> =>
      handleDistributionUpdate(mainWindow, options, true),
  );
}
