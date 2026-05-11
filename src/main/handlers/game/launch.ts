import { ipcMain, type IpcMainInvokeEvent, BrowserWindow } from "electron";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { Client, Authenticator } from "minecraft-launcher-core";
import log from "electron-log";
import fs from "node:fs/promises";
import path from "node:path";
import got from "got";
import { IPC_CHANNELS, type GameLaunchOptions } from "../../../shared/constants/ipc-chanels";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import {
  createProgressSender,
  getGameLog,
  parseMemoryGb,
  resolveInstanceRootPath,
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

function parseAutoConnectAddress(rawAddress: string): {
  host: string;
  port: number;
} {
  const trimmed = rawAddress.trim();
  if (!trimmed) {
    throw new Error("Auto-connect address is empty.");
  }

  const normalized = trimmed.includes("://") ? trimmed : `http://${trimmed}`;
  const parsed = new URL(normalized);
  const host = parsed.hostname.trim();
  const port = parsed.port ? Number(parsed.port) : 25565;

  if (!host) {
    throw new Error("Auto-connect host is invalid.");
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Auto-connect port is invalid.");
  }

  return { host, port };
}

let activeGameProcess: ChildProcessWithoutNullStreams | null = null;
const ASSET_DEBUG_PREFIX = "[MCLC]: Attempting to download assets";

type FabricLoaderEntry = {
  loader: {
    version: string;
    stable: boolean;
  };
};

type FabricProfile = {
  id: string;
};

async function ensureFabricProfile(
  rootPath: string,
  minecraftVersion: string,
  fabricLoaderVersion?: string,
): Promise<string> {
  const encodedMinecraftVersion = encodeURIComponent(minecraftVersion);
  let loaderVersion = fabricLoaderVersion?.trim();

  if (!loaderVersion) {
    const loaders = await got(
      `https://meta.fabricmc.net/v2/versions/loader/${encodedMinecraftVersion}`,
      { timeout: { request: 30000 } },
    ).json<FabricLoaderEntry[]>();
    loaderVersion =
      loaders.find((entry) => entry.loader.stable)?.loader.version ??
      loaders[0]?.loader.version;
  }

  if (!loaderVersion) {
    throw new Error(`Fabric loader not found for Minecraft ${minecraftVersion}`);
  }

  const encodedLoaderVersion = encodeURIComponent(loaderVersion);
  const profile = await got(
    `https://meta.fabricmc.net/v2/versions/loader/${encodedMinecraftVersion}/${encodedLoaderVersion}/profile/json`,
    { timeout: { request: 30000 } },
  ).json<FabricProfile>();

  if (!profile.id?.trim()) {
    throw new Error("Fabric profile response is missing version id");
  }

  const versionDir = path.join(rootPath, "versions", profile.id);
  await fs.mkdir(versionDir, { recursive: true });
  await fs.writeFile(
    path.join(versionDir, `${profile.id}.json`),
    JSON.stringify(profile, null, 2),
    "utf8",
  );

  return profile.id;
}

export default function setupGameHandlers(mainWindow: BrowserWindow): void {
  const gameLog = getGameLog();

  const clearActiveGameProcess = (): void => {
    activeGameProcess = null;
  };

  ipcMain.handle(
    IPC_CHANNELS.GAME.CLOSE,
    async (): Promise<{ success: boolean; error?: string }> => {
      try {
        if (!activeGameProcess) {
          return { success: false, error: "Game is not running." };
        }

        const processToStop = activeGameProcess;
        if (!processToStop.killed) {
          processToStop.kill();
        }

        clearActiveGameProcess();

        return { success: true };
      } catch (error: unknown) {
        log.error(LOG_MESSAGES.GAME_LAUNCH_SETUP_FAILED, error);
        return { success: false, error: toErrorMessage(error) };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.GAME.LAUNCH,
    async (
      _event: IpcMainInvokeEvent,
      options: GameLaunchOptions,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        if (activeGameProcess && !activeGameProcess.killed) {
          return {
            success: false,
            error: "Game is already running.",
          };
        }

        const username = validateRequiredText(options.username, "username");
        const version = validateRequiredText(options.version, "version");
        const minMemory = validateMemoryValue(options.memory.min, "min");
        const maxMemory = validateMemoryValue(options.memory.max, "max");

        if (parseMemoryGb(minMemory) > parseMemoryGb(maxMemory)) {
          throw new Error("memory.min cannot be greater than memory.max");
        }

        const rootPath = options.minecraftVersion?.trim()
          ? await resolveInstanceRootPath(options.gamePath, options.minecraftVersion)
          : await resolveInstanceRootPath(options.gamePath, version);
        const javaPath = await validateJavaPath(options.javaPath);
        await validateJavaCompatibility(javaPath, version);
        const jvmArgs = sanitizeJvmArgs(options.jvmArgs);
        const auth = await Authenticator.getAuth(username);
        const emitProgress = createProgressSender(mainWindow);
        if (options.loader === "fabric") {
          emitProgress({
            type: "progress",
            content: { percent: 8, status: "Preparing Fabric profile..." },
          });
        }
        const customVersion =
          options.loader === "fabric"
            ? await ensureFabricProfile(
                rootPath,
                version,
                options.fabricLoaderVersion,
              )
            : undefined;
        const autoConnect = options.autoConnect?.address
          ? parseAutoConnectAddress(options.autoConnect.address)
          : null;

        const opts = {
          authorization: auth,
          root: rootPath,
          version: {
            number: version,
            type: "release",
            custom: customVersion,
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
          quickPlay: autoConnect
            ? {
                type: "multiplayer" as const,
                identifier: `${autoConnect.host}:${autoConnect.port}`,
              }
            : undefined,
        };

        const launcher = new Client();

        launcher.on("debug", (e) => {
          if (String(e).includes(ASSET_DEBUG_PREFIX)) {
            gameLog.debug("[MCLC]: Checking game assets");
            return;
          }
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
          clearActiveGameProcess();
          emitProgress({ type: "close", content: Number(e) || 0 });
        });

        const launchPromise = launcher.launch(
          opts as Parameters<Client["launch"]>[0],
        );
        launchPromise.then((process) => {
          if (process) {
            activeGameProcess = process as ChildProcessWithoutNullStreams;
            process.once("close", () => {
              if (activeGameProcess === process) {
                clearActiveGameProcess();
              }
            });
          }
        });
        launchPromise.catch((error) => {
          const errorMessage = toErrorMessage(error);
          log.error(LOG_MESSAGES.GAME_LAUNCH_ASYNC_FAILED, error);
          emitProgress({ type: "error", content: errorMessage });
        });

        await waitForLaunchStart(launcher, launchPromise);

        return { success: true };
      } catch (error: unknown) {
        log.error(LOG_MESSAGES.GAME_LAUNCH_SETUP_FAILED, error);
        clearActiveGameProcess();
        return { success: false, error: toErrorMessage(error) };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.GAME.GET_INSTALLED_VERSIONS,
    async (_event: IpcMainInvokeEvent, gamePath?: string): Promise<string[]> => {
      try {
        const baseRoot = await resolveRootPath(gamePath);
        const instancesRoot = path.join(baseRoot, "instances");
        const instanceFolders = await fs.readdir(instancesRoot);
        const installedVersions = new Set<string>();

        await Promise.all(
          instanceFolders.map(async (instanceFolder) => {
            const versionsPath = path.join(
              instancesRoot,
              instanceFolder,
              "versions",
            );
            try {
              const folders = await fs.readdir(versionsPath);
              for (const folder of folders) {
                installedVersions.add(folder);
              }
            } catch {
              // No versions folder in this instance yet.
            }
          }),
        );

        return Array.from(installedVersions);
      } catch {
        return [];
      }
    },
  );
}
