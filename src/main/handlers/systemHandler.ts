import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { ipcMain, shell, dialog, app, type App } from "electron";
import log from "electron-log";
import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";
import { EXTERNAL_URLS, GITHUB_TEMPLATES } from "../../shared/constants/system";

export interface SystemMemory {
  total: number;
  free: number;
}

type RuntimeSettings = {
  gamePath?: string;
};

type SettingsReader = () => RuntimeSettings;

const DEFAULT_GAME_ROOT = path.join(os.homedir(), ".gerbarium");

function isSafeHttpUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isSubPath(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function resolveAllowedRoots(electronApp: App, settings: RuntimeSettings): string[] {
  const roots = [
    path.resolve(DEFAULT_GAME_ROOT),
    path.resolve(electronApp.getPath("userData")),
  ];

  if (settings.gamePath && settings.gamePath.trim()) {
    roots.push(path.resolve(settings.gamePath.trim()));
  }

  return Array.from(new Set(roots));
}

async function resolveValidatedDirectory(
  electronApp: App,
  rawPath: string,
  settingsReader: SettingsReader,
): Promise<string | null> {
  const trimmed = rawPath.trim();
  const resolved = trimmed ? path.resolve(trimmed) : path.resolve(DEFAULT_GAME_ROOT);

  let stat;
  try {
    stat = await fs.stat(resolved);
  } catch {
    return null;
  }

  if (!stat.isDirectory()) {
    return null;
  }

  const allowedRoots = resolveAllowedRoots(electronApp, settingsReader());
  const isAllowed = allowedRoots.some((root) => isSubPath(resolved, root));
  return isAllowed ? resolved : null;
}

export default function systemHandler(
  electronApp: App,
  settingsReader: SettingsReader = () => ({}),
) {
  ipcMain.handle(IPC_CHANNELS.SYSTEM.GET_MEMORY, (): SystemMemory => {
    log.debug(LOG_MESSAGES.SYSTEM_GET_MEMORY);
    return {
      total: Math.round(os.totalmem() / 1024 / 1024),
      free: Math.round(os.freemem() / 1024 / 1024),
    };
  });

  ipcMain.handle(IPC_CHANNELS.SYSTEM.GET_CPUS, () => {
    log.debug(LOG_MESSAGES.SYSTEM_GET_CPUS);
    return os.cpus().length;
  });

  ipcMain.handle(IPC_CHANNELS.APP.GET_VERSION, () => {
    return electronApp.getVersion();
  });

  ipcMain.handle(IPC_CHANNELS.SYSTEM.OPEN_EXTERNAL, async (_event, url: string) => {
    if (!isSafeHttpUrl(url)) {
      log.warn("Blocked unsafe external URL", url);
      return;
    }

    await shell.openExternal(url);
  });

  ipcMain.handle(IPC_CHANNELS.SYSTEM.OPEN_GITHUB_ISSUE, async () => {
    const issueBody = encodeURIComponent(
      GITHUB_TEMPLATES.CONTACT_BODY(process.platform, process.arch, electronApp.getVersion()),
    );

    await shell.openExternal(`${EXTERNAL_URLS.GITHUB_ISSUES}?body=${issueBody}`);
  });

  ipcMain.handle(IPC_CHANNELS.SYSTEM.SELECT_DIRECTORY, async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle(IPC_CHANNELS.SYSTEM.OPEN_PATH, async (_event, targetPath: string) => {
    const safeDirectory = await resolveValidatedDirectory(
      electronApp,
      typeof targetPath === "string" ? targetPath : "",
      settingsReader,
    );

    if (!safeDirectory) {
      log.warn("Blocked unsafe openPath target", targetPath);
      return;
    }

    const openError = await shell.openPath(safeDirectory);
    if (openError) {
      log.error("Failed to open path", { safeDirectory, openError });
    }
  });

  ipcMain.handle(IPC_CHANNELS.SYSTEM.OPEN_DATA_FOLDER, async () => {
    await shell.openPath(electronApp.getPath("userData"));
  });
}
