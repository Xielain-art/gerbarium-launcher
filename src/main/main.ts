import { app, BrowserWindow, Menu, Tray, dialog, ipcMain, type MenuItemConstructorOptions } from "electron";
import path from "node:path";
import log from "electron-log";
import { MAIN_CONSTANTS } from "./main-constants";
import setupLogHandler from "./handlers/logHandler";
import windowControlsHandler from "./handlers/windowControlsHandler";
import secureStorageHandler from "./handlers/secureStorageHandler";
import updateHandler from "./handlers/updateHandler";
import javaHandler from "./handlers/javaHandlerWrapper";
import systemHandler from "./handlers/systemHandler";
import gameHandler from "./handlers/gameHandler";

type LegacyLangLoader = {
  setupLanguage: () => void;
};

type LauncherSettings = {
  minimizeToTray: boolean;
  gamePath?: string;
};

const appRoot = path.resolve(__dirname, "..", "..");

const isDev = require(path.join(appRoot, "_legacy_app", "assets", "js", "isdev")) as boolean;
const LangLoader = require(path.join(appRoot, "_legacy_app", "assets", "js", "langloader")) as LegacyLangLoader;

function getDateFolder(): string {
  const now = new Date();
  const day = now.getDate();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}.${month}.${year}`;
}

const dateFolder = getDateFolder();
let isHandlingFatalError = false;

log.transports.file.level = "info";
log.transports.console.level = "debug";
log.transports.file.fileName = MAIN_CONSTANTS.LOG_FILE_NAMES.MAIN;
function getMainLogPath(): string {
  return path.join(
    app.getPath(MAIN_CONSTANTS.DIRECTORIES.USER_DATA),
    MAIN_CONSTANTS.DIRECTORIES.LOGS,
    dateFolder,
    MAIN_CONSTANTS.LOG_FILE_NAMES.MAIN
  );
}

log.transports.file.resolvePathFn = getMainLogPath;

function handleFatalError(title: string, details: unknown): void {
  if (isHandlingFatalError) {
    return;
  }
  isHandlingFatalError = true;

  log.error(title, details);

  let logPath = "unknown";
  try {
    logPath = getMainLogPath();
  } catch {
    // Ignore path resolution errors and still exit.
  }

  dialog.showErrorBox(
    "Критическая ошибка",
    `Лаунчер завершил работу из-за критической ошибки.\nЛоги сохранены в:\n${logPath}`
  );

  app.exit(1);
}

process.on("uncaughtException", (error) => {
  handleFatalError(MAIN_CONSTANTS.LOG_MESSAGES.APP_UNCAUGHT_EXCEPTION, error);
});

process.on("unhandledRejection", (reason) => {
  handleFatalError(MAIN_CONSTANTS.LOG_MESSAGES.APP_UNHANDLED_REJECTION, reason);
});

log.info(MAIN_CONSTANTS.LOG_MESSAGES.APP_STARTING, {
  version: app.getVersion(),
  platform: process.platform,
  arch: process.arch,
});

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let settings: LauncherSettings = { minimizeToTray: false };
let isQuiting = false;
let traySyncTimer: NodeJS.Timeout | null = null;

function getPlatformIcon(filename: string): string {
  const ext = process.platform === MAIN_CONSTANTS.PLATFORMS.WINDOWS ? "ico" : "png";
  return path.join(appRoot, "_legacy_app", "assets", "images", `${filename}.${ext}`);
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

  if (isDev) {
    window.loadURL(MAIN_CONSTANTS.APP_CONFIG.DEV_URL);
    window.webContents.openDevTools();
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

function scheduleTrayStateSync(): void {
  if (traySyncTimer) {
    clearTimeout(traySyncTimer);
  }
  traySyncTimer = setTimeout(() => {
    traySyncTimer = null;
    syncTrayState();
  }, 120);
}

ipcMain.on("settings-updated", (_event, newSettings: Partial<LauncherSettings>) => {
  settings = { ...settings, ...newSettings };
  scheduleTrayStateSync();
});

app.on("before-quit", () => {
  isQuiting = true;
});

app.whenReady().then(() => {
  LangLoader.setupLanguage();
  mainWindow = createWindow();
  createMenu();

  windowControlsHandler(app);
  secureStorageHandler(app);
  updateHandler(app);
  javaHandler(app);
  systemHandler(app, () => settings);
  gameHandler(mainWindow);
  setupLogHandler(app);

  mainWindow.on("minimize", (event) => {
    if (!settings.minimizeToTray) return;
    event.preventDefault();
    mainWindow?.hide();
  });

  mainWindow.on("close", (event) => {
    if (isQuiting || !settings.minimizeToTray) {
      return;
    }

    event.preventDefault();
    mainWindow?.hide();
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
