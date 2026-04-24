// Requirements
const { app, BrowserWindow, Menu } = require("electron");
const isDev = require("./_legacy_app/assets/js/isdev");
const path = require("path");
const LangLoader = require("./_legacy_app/assets/js/langloader");
const log = require("electron-log");

// Handlers
const setupLogHandler = require("./dist/main/handlers/logHandler").default;
const windowControlsHandler = require("./dist/main/handlers/windowControlsHandler").default;
const secureStorageHandler = require("./dist/main/handlers/secureStorageHandler").default;
const updateHandler = require("./dist/main/handlers/updateHandler").default;
const javaHandler = require("./dist/main/handlers/javaHandlerWrapper").default;
const systemHandler = require("./dist/main/handlers/systemHandler").default;
const gameHandler = require("./dist/main/handlers/gameHandler").default;

// Try to load bundled constants
let CONSTANTS;
try {
  CONSTANTS = require("./dist/main/main-constants").MAIN_CONSTANTS;
} catch (e) {
  // Fallback if not yet bundled
  CONSTANTS = {
    APP_CONFIG: { DEV_URL: 'http://localhost:5173', PROD_INDEX: 'dist/index.html', BG_COLOR: '#171614' },
    WINDOW_CONFIG: { WIDTH: 980, HEIGHT: 552 },
    DIRECTORIES: { LOGS: 'logs', USER_DATA: 'userData' },
    LOG_FILE_NAMES: { MAIN: 'main.log' },
    LOG_MESSAGES: { APP_STARTING: 'Gerbarium starting...', APP_UNCAUGHT_EXCEPTION: 'Uncaught Exception:', APP_UNHANDLED_REJECTION: 'Unhandled Rejection:' },
    PLATFORMS: { WINDOWS: 'win32', MACOS: 'darwin' }
  };
}

// Setup log — files go into userData/logs/<D.MM.YYYY>/main.log
function getDateFolder() {
  const now = new Date();
  const day = now.getDate();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}.${month}.${year}`;
}

const dateFolder = getDateFolder();

log.transports.file.level = 'info';
log.transports.console.level = 'debug';
log.transports.file.fileName = CONSTANTS.LOG_FILE_NAMES.MAIN;
log.transports.file.resolvePathFn = () =>
  path.join(app.getPath(CONSTANTS.DIRECTORIES.USER_DATA), CONSTANTS.DIRECTORIES.LOGS, dateFolder, CONSTANTS.LOG_FILE_NAMES.MAIN);

// Global error handlers
process.on("uncaughtException", (error) => {
  log.error(CONSTANTS.LOG_MESSAGES.APP_UNCAUGHT_EXCEPTION, error);
  app.exit(1);
});

process.on("unhandledRejection", (reason) => {
  log.error(CONSTANTS.LOG_MESSAGES.APP_UNHANDLED_REJECTION, reason);
});

// Setup Lang
LangLoader.setupLanguage();

log.info(CONSTANTS.LOG_MESSAGES.APP_STARTING, {
  version: app.getVersion(),
  platform: process.platform,
  arch: process.arch,
});

let win;

function createWindow() {
  win = new BrowserWindow({
    width: CONSTANTS.WINDOW_CONFIG.WIDTH,
    height: CONSTANTS.WINDOW_CONFIG.HEIGHT,
    icon: getPlatformIcon("SealCircle"),
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "dist", "preload", "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: CONSTANTS.APP_CONFIG.BG_COLOR,
  });

  if (isDev) {
    win.loadURL(CONSTANTS.APP_CONFIG.DEV_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, CONSTANTS.APP_CONFIG.PROD_INDEX));
  }

  win.removeMenu();
  win.resizable = true;

  win.on("closed", () => {
    win = null;
  });
}

function createMenu() {
  if (process.platform === CONSTANTS.PLATFORMS.MACOS) {
    let applicationSubMenu = {
      label: "Application",
      submenu: [
        {
          label: "About Application",
          selector: "orderFrontStandardAboutPanel:",
        },
        {
          type: "separator",
        },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    };

    let editSubMenu = {
      label: "Edit",
      submenu: [
        {
          label: "Undo",
          accelerator: "CmdOrCtrl+Z",
          selector: "undo:",
        },
        {
          label: "Redo",
          accelerator: "Shift+CmdOrCtrl+Z",
          selector: "redo:",
        },
        {
          type: "separator",
        },
        {
          label: "Cut",
          accelerator: "CmdOrCtrl+X",
          selector: "cut:",
        },
        {
          label: "Copy",
          accelerator: "CmdOrCtrl+C",
          selector: "copy:",
        },
        {
          label: "Paste",
          accelerator: "CmdOrCtrl+V",
          selector: "paste:",
        },
        {
          label: "Select All",
          accelerator: "CmdOrCtrl+A",
          selector: "selectAll:",
        },
      ],
    };

    let menuTemplate = [applicationSubMenu, editSubMenu];
    let menuObject = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menuObject);
  }
}

function getPlatformIcon(filename) {
  let ext;
  switch (process.platform) {
    case CONSTANTS.PLATFORMS.WINDOWS:
      ext = "ico";
      break;
    default:
      ext = "png";
      break;
  }

  return path.join(
    __dirname,
    "_legacy_app",
    "assets",
    "images",
    `${filename}.${ext}`,
  );
}

app.on("ready", () => {
   createWindow();
   createMenu();
   windowControlsHandler(app);
   secureStorageHandler(app);
   updateHandler(app);
   javaHandler(app);
   systemHandler(app);
   gameHandler(win);
   setupLogHandler(app);
});

app.on("window-all-closed", () => {
  if (process.platform !== CONSTANTS.PLATFORMS.MACOS) {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
