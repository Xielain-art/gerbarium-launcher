import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { Client, Authenticator } from "minecraft-launcher-core";
import os from "node:os";
import path from "node:path";
import log from "electron-log";

export default function setupGameHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle(
    IPC_CHANNELS.GAME.LAUNCH,
    async (
      _event: IpcMainInvokeEvent,
      options: { username: string; version: string; memory: { min: string; max: string }; javaPath: string }
    ) => {
      try {
        const rootPath = path.join(os.homedir(), ".gerbarium");
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
          javaPath: options.javaPath
        };

        const launcher = new Client();

        launcher.on("debug", (e) => {
          log.debug(`[Minecraft] ${e}`);
          mainWindow.webContents.send(IPC_CHANNELS.GAME.PROGRESS, { type: "data", content: e });
        });

        launcher.on("data", (e) => {
          log.info(`[Minecraft] ${e}`);
          mainWindow.webContents.send(IPC_CHANNELS.GAME.PROGRESS, { type: "data", content: e });
        });

        launcher.on("download", (e) => {
          mainWindow.webContents.send(IPC_CHANNELS.GAME.PROGRESS, { type: "progress", content: e });
        });

        launcher.on("close", (e) => {
          log.info(`[Minecraft] closed with code ${e}`);
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
}
