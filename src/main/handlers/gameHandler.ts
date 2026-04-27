import { app, ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import {
  IPC_CHANNELS,
  GameLaunchOptions,
  GameProgressPayload,
} from "../../shared/constants/ipc-chanels";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";
import { Client, Authenticator } from "minecraft-launcher-core";
import os from "node:os";
import path from "node:path";
import log from "electron-log";
import fs from "node:fs";
import { checkJavaVersion } from "./javaHandler";
import { getRequiredJavaVersion } from "../config/javaConfig";

// Create a separate logger for Minecraft
const gameLog = log.create("minecraft");
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
    "minecraft.log"
  );
};

const DEFAULT_GAME_ROOT = path.join(os.homedir(), ".gerbarium");
const MAX_JVM_ARGS = 12;
const MAX_JVM_ARG_LENGTH = 256;
const LAUNCH_START_TIMEOUT_MS = 15_000;
const PROGRESS_EMIT_INTERVAL_MS = 50;

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

function validateRequiredText(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${field} is required`);
  }
  if (normalized.length > 128) {
    throw new Error(`${field} is too long`);
  }
  return normalized;
}

function validateMemoryValue(value: string, field: "min" | "max"): string {
  const normalized = value.trim().toUpperCase();
  if (!/^\d+[MG]$/.test(normalized)) {
    throw new Error(`Invalid memory.${field} format`);
  }
  return normalized;
}

function parseMemoryGb(value: string): number {
  const normalized = value.toUpperCase();
  const amount = Number.parseInt(normalized, 10);
  if (Number.isNaN(amount)) return 0;
  return normalized.endsWith("M") ? amount / 1024 : amount;
}

function validateAbsolutePath(inputPath: string, field: string): string {
  const normalized = inputPath.trim();
  if (!normalized) {
    throw new Error(`${field} is required`);
  }
  if (normalized.includes("\0")) {
    throw new Error(`${field} contains invalid characters`);
  }
  if (!path.isAbsolute(normalized)) {
    throw new Error(`${field} must be an absolute path`);
  }
  return path.resolve(normalized);
}

async function validateJavaPath(inputPath: string): Promise<string> {
  const resolvedPath = validateAbsolutePath(inputPath, "javaPath");
  const javaExecutableNames = new Set(["java", "java.exe", "javaw.exe"]);

  if (!javaExecutableNames.has(path.basename(resolvedPath).toLowerCase())) {
    throw new Error("javaPath must point to a Java executable");
  }

  try {
    const stat = await fs.promises.stat(resolvedPath);
    if (!stat.isFile()) {
      throw new Error("javaPath must be a file");
    }
    await fs.promises.access(resolvedPath, fs.constants.R_OK);
  } catch (error) {
    throw new Error(`Invalid javaPath: ${toErrorMessage(error)}`);
  }

  return resolvedPath;
}

async function resolveRootPath(gamePath?: string): Promise<string> {
  if (!gamePath || !gamePath.trim()) {
    await fs.promises.mkdir(DEFAULT_GAME_ROOT, { recursive: true });
    return DEFAULT_GAME_ROOT;
  }

  const resolvedPath = validateAbsolutePath(gamePath, "gamePath");
  await fs.promises.mkdir(resolvedPath, { recursive: true });
  return resolvedPath;
}

function sanitizeJvmArgs(jvmArgs: string[]): string[] {
  if (!Array.isArray(jvmArgs)) {
    throw new Error("jvmArgs must be an array");
  }

  if (jvmArgs.length > MAX_JVM_ARGS) {
    throw new Error(`Too many JVM arguments (max ${MAX_JVM_ARGS})`);
  }

  return jvmArgs
    .map((arg) => arg.trim())
    .filter(Boolean)
    .map((arg) => {
      if (arg.length > MAX_JVM_ARG_LENGTH) {
        throw new Error("JVM argument is too long");
      }

      if (!(arg.startsWith("-X") || arg.startsWith("-D"))) {
        throw new Error(`Blocked JVM argument: ${arg}`);
      }

      if (
        arg.includes(";")
        || arg.includes("|")
        || arg.includes("&&")
        || arg.includes("||")
        || arg.includes("\n")
        || arg.includes("\r")
        || arg.includes("`")
      ) {
        throw new Error(`Blocked JVM argument: ${arg}`);
      }

      return arg;
    });
}

function sendProgress(mainWindow: BrowserWindow, payload: GameProgressPayload): void {
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

function parseJavaMajor(version: string): number {
  const trimmed = version.trim();
  if (trimmed.startsWith("1.")) {
    const legacyMajor = Number.parseInt(trimmed.split(".")[1] ?? "", 10);
    return Number.isNaN(legacyMajor) ? 0 : legacyMajor;
  }

  const major = Number.parseInt(trimmed.split(".")[0] ?? "", 10);
  return Number.isNaN(major) ? 0 : major;
}

async function validateJavaCompatibility(javaPath: string, minecraftVersion: string): Promise<void> {
  const detectedVersion = await checkJavaVersion(javaPath);
  if (!detectedVersion) {
    throw new Error("Unable to determine Java version from javaPath");
  }

  const detectedMajor = parseJavaMajor(detectedVersion);
  const requiredMajor = getRequiredJavaVersion(minecraftVersion);

  if (detectedMajor < requiredMajor) {
    throw new Error(
      `Minecraft ${minecraftVersion} requires Java ${requiredMajor}+ (detected Java ${detectedVersion})`,
    );
  }
}

function createProgressSender(mainWindow: BrowserWindow): (payload: GameProgressPayload) => void {
  let lastEmitTs = 0;

  return (payload: GameProgressPayload) => {
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

function waitForLaunchStart(
  launcher: Client,
  launchPromise: Promise<void>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let isSettled = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const settle = (fn: () => void) => {
      if (isSettled) {
        return;
      }
      isSettled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      launcher.removeListener("arguments", onSpawned);
      launcher.removeListener("close", onCloseBeforeSpawn);
      fn();
    };

    const onSpawned = () => {
      settle(resolve);
    };

    const onCloseBeforeSpawn = (code: number | string) => {
      const exitCode = Number(code);
      const normalizedCode = Number.isFinite(exitCode) ? exitCode : 0;
      settle(() => reject(new Error(`Game process exited before startup (code ${normalizedCode})`)));
    };

    launcher.once("arguments", onSpawned);
    launcher.once("close", onCloseBeforeSpawn);

    launchPromise.catch((error) => {
      settle(() => reject(new Error(`Failed to launch game: ${toErrorMessage(error)}`)));
    });

    timeoutId = setTimeout(() => {
      settle(() => reject(new Error("Game process did not start in time")));
    }, LAUNCH_START_TIMEOUT_MS);
  });
}

export default function setupGameHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle(
    IPC_CHANNELS.GAME.LAUNCH,
    async (
      _event: IpcMainInvokeEvent,
      options: GameLaunchOptions
    ) => {
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
          clientPackage: null,
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
          // Keep sending individual download progress too
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

        const launchPromise = launcher.launch(opts);
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
    }
  );

  ipcMain.handle(IPC_CHANNELS.GAME.GET_INSTALLED_VERSIONS, async () => {
    const rootPath = DEFAULT_GAME_ROOT;
    const versionsPath = path.join(rootPath, "versions");

    try {
      const folders = await fs.promises.readdir(versionsPath);
      return folders;
    } catch {
      return [];
    }
  });
}
