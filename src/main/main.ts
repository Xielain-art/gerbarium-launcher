import {
  app,
  BrowserWindow,
} from "electron";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import log from "electron-log";
import { MAIN_CONSTANTS } from "./main-constants";
import type {
  LauncherSettings,
} from "../shared/constants/ipc-chanels";
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
import { registerCrashHandlers } from "./runtime/crash";
import {
  createMainWindow,
  createAppMenu,
  bindMainWindowLifecycle,
} from "./runtime/window";
import { syncTrayState, type TrayState } from "./runtime/tray";
import { registerMainIpcHandlers } from "./runtime/ipc";

const appRoot = path.resolve(__dirname, "..", "..");
const require = createRequire(__filename);

function loadRuntimeEnv(): void {
  const candidates = [
    path.join(process.cwd(), ".env"),
    path.join(appRoot, ".env"),
  ];

  for (const envPath of candidates) {
    if (!existsSync(envPath)) {
      continue;
    }
    try {
      process.loadEnvFile?.(envPath);
      return;
    } catch {
      // best-effort load; env can still be provided by shell/CI
    }
  }
}

loadRuntimeEnv();

const isSmokeTest = process.env.SMOKE_TEST === "true";
const isDev = !app.isPackaged && !isSmokeTest;
app.setAppUserModelId("gerbariumlauncher");

const dateFolder = getDateFolder();
const trayState: TrayState = { tray: null };
const appState = {
  mainWindow: null as BrowserWindow | null,
  isQuiting: false,
  settings: {
    minimizeToTray: false,
    discordRPC: true,
    distributionUrl: "",
    devServerAddress: "",
    devServerPassword: "",
    gameServerAddress: "",
  } as LauncherSettings,
};

const discordRpcService = createDiscordRpcService();

log.transports.file.level = "info";
log.transports.console.level = "debug";
log.transports.file.fileName = MAIN_CONSTANTS.LOG_FILE_NAMES.MAIN;

log.transports.file.resolvePathFn = (): string =>
  path.join(
    app.getPath(MAIN_CONSTANTS.DIRECTORIES.USER_DATA),
    MAIN_CONSTANTS.DIRECTORIES.LOGS,
    dateFolder,
    MAIN_CONSTANTS.LOG_FILE_NAMES.MAIN,
  );

registerCrashHandlers();

registerMainIpcHandlers({
  isDev,
  getSettings: () => appState.settings,
  setSettings: (nextSettings) => {
    appState.settings = nextSettings;
  },
  syncTrayState: () =>
    syncTrayState(
      appState.settings.minimizeToTray,
      trayState,
      () => appState.mainWindow,
      () => {
        appState.isQuiting = true;
      },
      appRoot,
    ),
  discordRpcService,
  appRoot,
});

app.on("before-quit", (): void => {
  appState.isQuiting = true;
  discordRpcService.shutdown();
});

app.whenReady().then((): void => {
  appState.mainWindow = createMainWindow(appRoot, isDev);
  createAppMenu();

  windowControlsHandler(app);
  authHandler(app);
  adminHandler(app);
  updateHandler(app);
  javaHandler();
  systemHandler(app, () => appState.settings);
  gameHandler(appState.mainWindow);
  setupLogHandler(app);
  discordRpcService.setEnabled(appState.settings.discordRPC !== false);

  const currentWindow = appState.mainWindow;
  if (!currentWindow) {
    return;
  }

  bindMainWindowLifecycle(currentWindow, {
    onClosed: (): void => {
      appState.mainWindow = null;
    },
    onMinimize: (): void => {
      if (!appState.settings.minimizeToTray) return;
      currentWindow.hide();
    },
    onClose: (event: Electron.Event): void => {
      if (appState.isQuiting || !appState.settings.minimizeToTray) {
        return;
      }

      event.preventDefault();
      currentWindow.hide();
    },
  });
});

app.on("window-all-closed", (): void => {
  if (process.platform === MAIN_CONSTANTS.PLATFORMS.MACOS) {
    return;
  }

  if (!appState.settings.minimizeToTray) {
    app.quit();
  }
});

app.on("activate", (): void => {
  if (appState.mainWindow === null) {
    appState.mainWindow = createMainWindow(appRoot, isDev);
    bindMainWindowLifecycle(appState.mainWindow, {
      onClosed: (): void => {
        appState.mainWindow = null;
      },
      onMinimize: (): void => {
        if (!appState.settings.minimizeToTray) return;
        appState.mainWindow?.hide();
      },
      onClose: (event: Electron.Event): void => {
        if (appState.isQuiting || !appState.settings.minimizeToTray) {
          return;
        }

        event.preventDefault();
        appState.mainWindow?.hide();
      },
    });
  }
});
