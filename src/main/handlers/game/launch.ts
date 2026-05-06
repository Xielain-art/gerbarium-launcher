import { ipcMain, type IpcMainInvokeEvent, BrowserWindow } from "electron";
import { Client, Authenticator } from "minecraft-launcher-core";
import log from "electron-log";
import fs from "node:fs/promises";
import path from "node:path";
import { IPC_CHANNELS, type GameLaunchOptions } from "../../../shared/constants/ipc-chanels";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import {
  createProgressSender,
  DEFAULT_GAME_ROOT,
  getGameLog,
  parseMemoryGb,
  resolveRootPath,
  sanitizeJvmArgs,
  validateJavaCompatibility,
  validateJavaPath,
  validateMemoryValue,
  validateRequiredText,
  waitForLaunchStart,
} from "./shared";

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export default function setupGameHandlers(mainWindow: BrowserWindow): void {
  const gameLog = getGameLog();

  ipcMain.handle(
    IPC_CHANNELS.GAME.LAUNCH,
    async (
      _event: IpcMainInvokeEvent,
      options: GameLaunchOptions,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const username = validateRequiredText(options.username, "username");
        const version = validateRequiredText(options.version, "version");
        const minMemory = validateMemoryValue(options.memory.min, "min");
        const maxMemory = validateMemoryValue(options.memory.max, "max");

        if (parseMemoryGb(minMemory) > parseMemoryGb(maxMemory)) {
          throw new Error("memory.min cannot be greater than memory.max");
        }

        const rootPath = await resolveRootPath(options.gamePath);
        const javaPath = await validateJavaPath(options.javaPath);
        await validateJavaCompatibility(javaPath, version);
        const jvmArgs = sanitizeJvmArgs(options.jvmArgs);
        const auth = await Authenticator.getAuth(username);
        const emitProgress = createProgressSender(mainWindow);

        const opts = {
          authorization: auth,
          root: rootPath,
          version: {
            number: version,
            type: "release",
          },
          memory: {
            max: maxMemory,
            min: minMemory,
          },
          javaPath,
          customArgs: jvmArgs,
          window: {
            fullscreen: options.fullscreen || false,
          },
        };

        const launcher = new Client();

        launcher.on("debug", (e) => {
          gameLog.debug(e);
          emitProgress({ type: "data", content: String(e) });
        });

        launcher.on("data", (e) => {
          gameLog.info(e);
          emitProgress({ type: "data", content: String(e) });
        });

        launcher.on("progress", (e) => {
          emitProgress({
            type: "progress",
            content:
              typeof e === "object" && e !== null
                ? (e as Record<string, unknown>)
                : { status: String(e) },
          });
        });

        launcher.on("download", (e) => {
          emitProgress({
            type: "progress",
            content:
              typeof e === "object" && e !== null
                ? (e as Record<string, unknown>)
                : { status: String(e) },
          });
        });

        launcher.on("arguments", () => {
          emitProgress({ type: "state", content: { phase: "spawned" } });
        });

        launcher.on("close", (e) => {
          gameLog.info(`Closed with code ${e}`);
          emitProgress({ type: "close", content: Number(e) || 0 });
        });

        const launchPromise = launcher.launch(
          opts as Parameters<Client["launch"]>[0],
        );
        launchPromise.catch((error) => {
          const errorMessage = toErrorMessage(error);
          log.error(LOG_MESSAGES.GAME_LAUNCH_ASYNC_FAILED, error);
          emitProgress({ type: "error", content: errorMessage });
        });

        await waitForLaunchStart(launcher, launchPromise);

        return { success: true };
      } catch (error: unknown) {
        log.error(LOG_MESSAGES.GAME_LAUNCH_SETUP_FAILED, error);
        return { success: false, error: toErrorMessage(error) };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.GAME.GET_INSTALLED_VERSIONS,
    async (): Promise<string[]> => {
      const versionsPath = path.join(DEFAULT_GAME_ROOT, "versions");
      try {
        const folders = await fs.readdir(versionsPath);
        return folders;
      } catch {
        return [];
      }
    },
  );
}
