import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { Client, Authenticator } from "minecraft-launcher-core";
import os from "node:os";
import path from "node:path";
import log from "electron-log";
import fs from "node:fs";

// Create a separate logger for Minecraft
const gameLog = log.create("minecraft");
gameLog.transports.file.resolvePathFn = (variables) => {
  const { app } = require("electron") as typeof import("electron");
  const path = require("path");

  const now = new Date();
  const day = now.getDate();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const dateFolder = `${day}.${month}.${year}`;

  return path.join(
    app.getPath("userData"),
    "logs",
    dateFolder,
    "minecraft.log"
  );
};

export default function setupGameHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle(
    IPC_CHANNELS.GAME.LAUNCH,
    async (
      _event: IpcMainInvokeEvent,
      options: { username: string; version: string; memory: { min: string; max: string }; javaPath: string; gamePath?: string }
    ) => {
      try {
        const rootPath = options.gamePath || path.join(os.homedir(), ".gerbarium");
        const auth = await Authenticator.getAuth(options.username);

        const opts = {
          clientPackage: null,
          authorization: auth,
          root: rootPath,
          version: {
            number: options.version,
            type: "release"
          },
          memory: {
            max: options.memory.max,
            min: options.memory.min
          },
          javaPath: options.javaPath,
          customArgs: options.jvmArgs || [],
          window: {
             fullscreen: options.fullscreen || false
          }
        };

        const launcher = new Client();

        launcher.on("debug", (e) => {
          gameLog.debug(e);
          mainWindow.webContents.send(IPC_CHANNELS.GAME.PROGRESS, { type: "data", content: e });
        });

        launcher.on("data", (e) => {
          gameLog.info(e);
          mainWindow.webContents.send(IPC_CHANNELS.GAME.PROGRESS, { type: "data", content: e });
        });

        launcher.on("progress", (e) => {
          mainWindow.webContents.send(IPC_CHANNELS.GAME.PROGRESS, { type: "progress", content: e });
        });

        launcher.on("download", (e) => {
          // Keep sending individual download progress too
          mainWindow.webContents.send(IPC_CHANNELS.GAME.PROGRESS, { type: "progress", content: e });
        });

        launcher.on("close", (e) => {
          gameLog.info(`Closed with code ${e}`);
          mainWindow.webContents.send(IPC_CHANNELS.GAME.PROGRESS, { type: "close", content: e });
        });

        launcher.launch(opts).catch(err => {
            log.error("Failed to launch game asynchronously", err);
        });

        return { success: true };
      } catch (error: any) {
        log.error("Failed to setup/launch game", error);
        return { success: false, error: error.message || "Unknown error" };
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.GAME.GET_INSTALLED_VERSIONS, async () => {
    const fs = require('fs').promises;
    const path = require('path');
    const os = require('os');
    
    // Default path
    const rootPath = path.join(os.homedir(), ".gerbarium");
    const versionsPath = path.join(rootPath, "versions");
    
    try {
      const folders = await fs.readdir(versionsPath);
      return folders;
    } catch {
      return [];
    }
  });
}
