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
import log from "electron-log";
import { MAIN_CONSTANTS } from "./main-constants";
import {
  IPC_CHANNELS,
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
import { verifyAsarIntegrity } from "./utils/integrity";
import {
  writeCrashReport,
  readCrashReport,
  clearCrashReport,
} from "./utils/crashReport";
import { sanitizeSettingsPatch } from "./utils/settings";

type LegacyLangLoader = {
  setupLanguage: () => void;
};

const appRoot = path.resolve(__dirname, "..", "..");
const require = createRequire(__filename);

const isSmokeTest = process.env.SMOKE_TEST === "true";
const isDev = !app.isPackaged && !isSmokeTest;
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

ipcMain.on(IPC_CHANNELS.SYSTEM.UI_READY, (): void => {
  log.info("RENDERER_READY");
});

ipcMain.on(IPC_CHANNELS.SYSTEM.SMOKE_TEST_PASSED, (): void => {
  log.info("SMOKE_TEST_PASSED");
});

ipcMain.on(
  IPC_CHANNELS.SYSTEM.SETTINGS_UPDATED,
  (_event, newSettings: unknown): void => {
    const safePatch = sanitizeSettingsPatch(newSettings);
    settings = { ...settings, ...safePatch };
    syncTrayState();
    if (typeof safePatch.discordRPC === "boolean") {
      discordRpcService.setEnabled(safePatch.discordRPC);
    }
  },
);

ipcMain.handle(
  IPC_CHANNELS.APP.VERIFY_INTEGRITY,
  async (): Promise<unknown> => {
    return await verifyAsarIntegrity(isDev, process.resourcesPath);
  },
);

ipcMain.handle(
  IPC_CHANNELS.APP.GET_LAST_CRASH_REPORT,
  async (): Promise<{
    success: boolean;
    report?: CrashReportPayload | null;
    error?: string;
  }> => {
    try {
      const report = await readCrashReport();
      return { success: true, report };
    } catch (error) {
      log.error(LOG_MESSAGES.APP_CRASH_REPORT_READ_FAILED, error);
      return { success: false, error: ERROR_CODES.APP_CRASH_REPORT_READ_FAILED };
    }
  },
);

ipcMain.handle(
  IPC_CHANNELS.APP.CLEAR_LAST_CRASH_REPORT,
  async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await clearCrashReport();
      return { success: true };
    } catch (error) {
      log.error(LOG_MESSAGES.APP_CRASH_REPORT_CLEAR_FAILED, error);
      return {
        success: false,
        error: ERROR_CODES.APP_CRASH_REPORT_CLEAR_FAILED,
      };
    }
  },
);

app.on("before-quit", (): void => {
  isQuiting = true;
  discordRpcService.shutdown();
});

app.whenReady().then((): void => {
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

  currentWindow.on("minimize", (): void => {
    if (!settings.minimizeToTray) return;
    currentWindow.hide();
  });

  currentWindow.on("close", (event: Electron.Event): void => {
    if (isQuiting || !settings.minimizeToTray) {
      return;
    }

    event.preventDefault();
    currentWindow.hide();
  });
});

app.on("window-all-closed", (): void => {
  if (process.platform === MAIN_CONSTANTS.PLATFORMS.MACOS) {
    return;
  }

  if (!settings.minimizeToTray) {
    app.quit();
  }
});

app.on("activate", (): void => {
  if (mainWindow === null) {
    mainWindow = createWindow();
  }
});
