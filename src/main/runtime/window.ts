import { BrowserWindow, Menu, type MenuItemConstructorOptions } from "electron";
import path from "node:path";
import log from "electron-log";
import { MAIN_CONSTANTS } from "../main-constants";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";
import { getAppIcon } from "./icons";

export function createMainWindow(appRoot: string, isDev: boolean): BrowserWindow {
  const window = new BrowserWindow({
    width: MAIN_CONSTANTS.WINDOW_CONFIG.WIDTH,
    height: MAIN_CONSTANTS.WINDOW_CONFIG.HEIGHT,
    icon: getAppIcon(appRoot, "SealCircle"),
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

  return window;
}

export function createAppMenu(): void {
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

export function bindMainWindowLifecycle(
  window: BrowserWindow,
  handlers: {
    onClosed: () => void;
    onMinimize: () => void;
    onClose: (event: Electron.Event) => void;
  },
): void {
  window.on("closed", handlers.onClosed);
  window.on("minimize", handlers.onMinimize);
  window.on("close", handlers.onClose);
}
