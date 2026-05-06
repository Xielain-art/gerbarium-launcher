import { app, BrowserWindow } from "electron";
import log from "electron-log";
import path from "node:path";
import os from "node:os";
import { IPC_CHANNELS, type GameProgressPayload } from "../../../shared/constants/ipc-chanels";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";

export const DEFAULT_GAME_ROOT = path.join(os.homedir(), ".gerbarium");
export const PROGRESS_EMIT_INTERVAL_MS = 50;

const gameLog = log.create({ logId: "minecraft" });
gameLog.transports.file.resolvePathFn = () => {
  const now = new Date();
  const day = now.getDate();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const dateFolder = `${day}.${month}.${year}`;

  return path.join(
    app.getPath("userData"),
    "logs",
    dateFolder,
    "minecraft.log",
  );
};

export function getGameLog(): typeof gameLog {
  return gameLog;
}

export function sendProgress(
  mainWindow: BrowserWindow,
  payload: GameProgressPayload,
): void {
  if (mainWindow.isDestroyed()) {
    return;
  }

  const { webContents } = mainWindow;
  if (webContents.isDestroyed() || webContents.isCrashed()) {
    return;
  }

  try {
    webContents.send(IPC_CHANNELS.GAME.PROGRESS, payload);
  } catch (error) {
    log.warn(LOG_MESSAGES.GAME_PROGRESS_EMIT_FAILED, error);
  }
}

export function createProgressSender(
  mainWindow: BrowserWindow,
): (payload: GameProgressPayload) => void {
  let lastEmitTs = 0;

  return function (payload: GameProgressPayload): void {
    if (payload.type !== "progress") {
      sendProgress(mainWindow, payload);
      return;
    }

    const now = Date.now();
    if (now - lastEmitTs < PROGRESS_EMIT_INTERVAL_MS) {
      return;
    }

    lastEmitTs = now;
    sendProgress(mainWindow, payload);
  };
}
