import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  ipcMain,
  type MenuItemConstructorOptions,
} from "electron";
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import got from "got";
import { MAIN_CONSTANTS } from "./main-constants";
import {
  IPC_CHANNELS,
  type CrashReportPayload,
  type IntegrityCheckResult,
  type LauncherSettings,
} from "../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../shared/constants/errors";
import { LOG_MESSAGES } from "../shared/constants/log-messages";
import { getDateFolder } from "./utils/dateFolder";
import setupLogHandler from "./handlers/logHandler";
import windowControlsHandler from "./handlers/windowControlsHandler";
import authHandler from "./handlers/authHandler";
import updateHandler from "./handlers/updateHandler";
import adminHandler from "./handlers/adminHandler";
import javaHandler from "./handlers/javaHandlerWrapper";
import systemHandler from "./handlers/systemHandler";
import gameHandler from "./handlers/gameHandler";
import { createDiscordRpcService } from "./services/discordRpcService";
import {
  calculateFileSha256,
  normalizeHexHash,
  isHexHash,
  isSimpleYamlComment,
  parseSimpleYamlKeyValue,
  extractAsarSha256FromLatestYml,
} from "./utils/integrity";
import {
  writeCrashReport,
  readCrashReport,
  clearCrashReport,
} from "./utils/crashReport";

type LegacyLangLoader = {
  setupLanguage: () => void;
};

function sanitizeSettingsPatch(
  newSettings: unknown,
): Partial<LauncherSettings> {
  if (!newSettings || typeof newSettings !== "object") {
    return {};
  }

  const patch = newSettings as Record<string, unknown>;
  const safePatch: Partial<LauncherSettings> = {};

  if (typeof patch.minimizeToTray === "boolean") {
    safePatch.minimizeToTray = patch.minimizeToTray;
  }

  if (typeof patch.gamePath === "string") {
    const trimmed = patch.gamePath.trim();
    safePatch.gamePath = trimmed;
  }

  if (typeof patch.discordRPC === "boolean") {
    safePatch.discordRPC = patch.discordRPC;
  }

  return safePatch;
}

const appRoot = path.resolve(__dirname, "..", "..");
const require = createRequire(__filename);

const isDev = !app.isPackaged;
const LangLoader = require(
  path.join(appRoot, "_legacy_app", "assets", "js", "langloader"),
) as LegacyLangLoader;

const dateFolder = getDateFolder();
let isHandlingFatalError = false;
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuiting = false;
let settings: LauncherSettings = {
  minimizeToTray: false,
  discordRPC: true,
};

const discordRpcService = createDiscordRpcService();

function getLatestYmlFilename(): string {
  if (process.platform === MAIN_CONSTANTS.PLATFORMS.MACOS) {
    return "latest-mac.yml";
  }
  if (process.platform === "linux") {
    return "latest-linux.yml";
  }
  return "latest.yml";
}

const LATEST_YML_URL = `https://github.com/Xielain-art/gerbarium-releases/releases/latest/download/${getLatestYmlFilename()}`;

async function triggerRecoveryUpdate(): Promise<void> {
  log.info(LOG_MESSAGES.APP_RECOVERY_UPDATE_TRIGGERED);
  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    log.error(LOG_MESSAGES.APP_RECOVERY_UPDATE_FAILED, error);
  }
}

log.transports.file.level = "info";
log.transports.console.level = "debug";
log.transports.file.fileName = MAIN_CONSTANTS.LOG_FILE_NAMES.MAIN;
function getMainLogPath(): string {
  return path.join(
    app.getPath(MAIN_CONSTANTS.DIRECTORIES.USER_DATA),
    MAIN_CONSTANTS.DIRECTORIES.LOGS,
    dateFolder,
    MAIN_CONSTANTS.LOG_FILE_NAMES.MAIN,
  );
}

log.transports.file.resolvePathFn = getMainLogPath;

function handleFatalError(title: string, details: unknown): void {
  if (isHandlingFatalError) {
    return;
  }
  isHandlingFatalError = true;

  const message =
    details instanceof Error
      ? details.stack || details.message
      : String(details);

  log.error(title, details);
  void writeCrashReport({
    title,
    message,
    timestamp: new Date().toISOString(),
  })
    .catch((error) => {
      log.error(LOG_MESSAGES.APP_CRASH_REPORT_WRITE_FAILED, error);
    })
    .finally(() => {
      app.exit(1);
    });
}

process.on("uncaughtException", (error) => {
  handleFatalError(MAIN_CONSTANTS.LOG_MESSAGES.APP_UNCAUGHT_EXCEPTION, error);
});

process.on("unhandledRejection", (reason) => {
  handleFatalError(MAIN_CONSTANTS.LOG_MESSAGES.APP_UNHANDLED_REJECTION, reason);
});

async function fetchExpectedAsarSha256(): Promise<string | null> {
  try {
    const latestYml = await got(LATEST_YML_URL, {
      timeout: { request: 7000 },
      retry: { limit: 1 },
    }).text();
    const expectedHash = extractAsarSha256FromLatestYml(latestYml);

    if (!expectedHash) {
      log.warn(LOG_MESSAGES.APP_LATEST_YML_MISSING_HASH);
      return null;
    }

    return expectedHash;
  } catch (error) {
    log.warn(LOG_MESSAGES.APP_LATEST_YML_FETCH_FAILED, error);
    return null;
  }
}

async function verifyAsarIntegrity(): Promise<IntegrityCheckResult> {
  if (isDev) {
    return {
      ok: true,
      status: "skipped",
      message: "Integrity check is skipped in development mode.",
    };
  }

  const expectedHashRaw = await fetchExpectedAsarSha256();
  if (!expectedHashRaw || !isHexHash(expectedHashRaw)) {
    log.warn(LOG_MESSAGES.APP_EXPECTED_HASH_INVALID);
    return {
      ok: true,
      status: "offline",
      message: "Unable to fetch hash from latest.yml (offline or missing key).",
    };
  }

  const asarPath = path.join(process.resourcesPath, "app.asar");
  try {
    await fs.promises.access(asarPath, fs.constants.F_OK);
  } catch {
    log.warn(LOG_MESSAGES.APP_ASAR_NOT_FOUND, asarPath);
    return {
      ok: true,
      status: "skipped",
      message: "app.asar is not present in current runtime.",
    };
  }

  try {
    const expectedHash = normalizeHexHash(expectedHashRaw);
    const actualHash = normalizeHexHash(await calculateFileSha256(asarPath));
    if (actualHash === expectedHash) {
      log.info(LOG_MESSAGES.APP_ASAR_INTEGRITY_OK);
      return {
        ok: true,
        status: "ok",
        message: "ASAR integrity check passed.",
        expectedHash,
        actualHash,
      };
    }

    log.warn(LOG_MESSAGES.APP_ASAR_INTEGRITY_MISMATCH, { expectedHash, actualHash });
    await triggerRecoveryUpdate();
    return {
      ok: false,
      status: "mismatch",
      message:
        "ASAR integrity mismatch detected. Recovery update was triggered.",
      expectedHash,
      actualHash,
    };
  } catch (error) {
    log.error(LOG_MESSAGES.APP_ASAR_INTEGRITY_FAILED, error);
    return {
      ok: false,
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unknown integrity check error",
    };
  }
}

function getPlatformIcon(filename: string): string {
  const ext =
    process.platform === MAIN_CONSTANTS.PLATFORMS.WINDOWS ? "ico" : "png";
  return path.join(
    appRoot,
    "_legacy_app",
    "assets",
    "images",
    `${filename}.${ext}`,
  );
}

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: MAIN_CONSTANTS.WINDOW_CONFIG.WIDTH,
    height: MAIN_CONSTANTS.WINDOW_CONFIG.HEIGHT,
    icon: getPlatformIcon("SealCircle"),
    frame: false,
    webPreferences: {
      preload: path.join(appRoot, "dist", "preload", "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: MAIN_CONSTANTS.APP_CONFIG.BG_COLOR,
  });

  log.info("MAIN_WINDOW_CREATED");

  if (isDev) {
    log.info(LOG_MESSAGES.APP_DEV_MODE);
    window.loadURL(MAIN_CONSTANTS.APP_CONFIG.DEV_URL);
    window.webContents.once("did-finish-load", () => {
      window.webContents.openDevTools({ mode: "detach" });
    });
  } else {
    window.loadFile(path.join(appRoot, MAIN_CONSTANTS.APP_CONFIG.PROD_INDEX));
  }

  window.removeMenu();
  window.resizable = true;

  window.on("closed", () => {
    mainWindow = null;
  });

  return window;
}

function createMenu(): void {
  if (process.platform !== MAIN_CONSTANTS.PLATFORMS.MACOS) {
    return;
  }

  const menuTemplate: MenuItemConstructorOptions[] = [
    { role: "appMenu" },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

function createTray(): void {
  if (tray) return;

  tray = new Tray(getPlatformIcon("SealCircle"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show launcher",
      click: () => {
        if (!mainWindow) return;
        mainWindow.show();
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Gerbarium Launcher");
  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    if (!mainWindow) return;
    mainWindow.show();
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  });
}

function destroyTray(): void {
  if (!tray) {
    return;
  }

  tray.removeAllListeners();
  tray.destroy();
  tray = null;
}

function syncTrayState(): void {
  if (settings.minimizeToTray) {
    createTray();
    return;
  }
  destroyTray();
}

ipcMain.on(
  IPC_CHANNELS.SYSTEM.SETTINGS_UPDATED,
  (_event, newSettings: unknown) => {
    const safePatch = sanitizeSettingsPatch(newSettings);
    settings = { ...settings, ...safePatch };
    syncTrayState();
    if (typeof safePatch.discordRPC === "boolean") {
      discordRpcService.setEnabled(safePatch.discordRPC);
    }
  },
);

ipcMain.handle(IPC_CHANNELS.APP.VERIFY_INTEGRITY, async () => {
  return await verifyAsarIntegrity();
});

ipcMain.handle(IPC_CHANNELS.APP.GET_LAST_CRASH_REPORT, async () => {
  try {
    const report = await readCrashReport();
    return { success: true, report };
  } catch (error) {
    log.error(LOG_MESSAGES.APP_CRASH_REPORT_READ_FAILED, error);
    return { success: false, error: ERROR_CODES.APP_CRASH_REPORT_READ_FAILED };
  }
});

ipcMain.handle(IPC_CHANNELS.APP.CLEAR_LAST_CRASH_REPORT, async () => {
  try {
    await clearCrashReport();
    return { success: true };
  } catch (error) {
    log.error(LOG_MESSAGES.APP_CRASH_REPORT_CLEAR_FAILED, error);
    return { success: false, error: ERROR_CODES.APP_CRASH_REPORT_CLEAR_FAILED };
  }
});

app.on("before-quit", () => {
  isQuiting = true;
  discordRpcService.shutdown();
});

app.whenReady().then(() => {
  LangLoader.setupLanguage();
  mainWindow = createWindow();
  createMenu();

  windowControlsHandler(app);
  authHandler(app);
  adminHandler(app);
  updateHandler(app);
  javaHandler();
  systemHandler(app, () => settings);
  gameHandler(mainWindow);
  setupLogHandler(app);
  discordRpcService.setEnabled(settings.discordRPC !== false);

  const currentWindow = mainWindow;
  if (!currentWindow) {
    return;
  }

  currentWindow.on("minimize", () => {
    if (!settings.minimizeToTray) return;
    currentWindow.hide();
  });

  currentWindow.on("close", (event) => {
    if (isQuiting || !settings.minimizeToTray) {
      return;
    }

    event.preventDefault();
    currentWindow.hide();
  });
});

app.on("window-all-closed", () => {
  if (process.platform === MAIN_CONSTANTS.PLATFORMS.MACOS) {
    return;
  }

  if (!settings.minimizeToTray) {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    mainWindow = createWindow();
  }
});
