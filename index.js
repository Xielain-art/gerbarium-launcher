// Requirements
const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const isDev = require("./_legacy_app/assets/js/isdev");
const path = require("path");
const fs = require("fs");
const LangLoader = require("./_legacy_app/assets/js/langloader");
const log = require("electron-log");
const setupLogHandler = require("./dist/main/handlers/logHandler").default;

const helloHandler = require("./dist/main/handlers/helloHandler").default;
const windowControlsHandler = require("./dist/main/handlers/windowControlsHandler").default;
const secureStorageHandler = require("./dist/main/handlers/secureStorageHandler").default;
const updateHandler = require("./dist/main/handlers/updateHandler").default;
const javaHandler = require("./dist/main/handlers/javaHandlerWrapper").default;
const systemHandler = require("./dist/main/handlers/systemHandler").default;

// Setup log
const currentDate = new Date().toISOString().split('T')[0]; // Получаем строгую дату (YYYY-MM-DD)

log.transports.file.level = "info";
log.transports.console.level = "debug";
// Жестко задаем имя файла с датой
log.transports.file.fileName = `main-${currentDate}.log`;
log.transports.file.resolvePathFn = () => path.join(app.getPath('userData'), 'logs', log.transports.file.fileName);

// Global error handlers
process.on("uncaughtException", (error) => {
  log.error("Uncaught Exception:", error);
  app.exit(1);
});

process.on("unhandledRejection", (reason) => {
  log.error("Unhandled Rejection:", reason);
});

// Setup Lang
LangLoader.setupLanguage();

log.info("Gerbarium starting...", {
  version: app.getVersion(),
  platform: process.platform,
  arch: process.arch,
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 980,
    height: 552,
    icon: getPlatformIcon("SealCircle"),
    frame: false,
    webPreferences: {
      //   preload: path.join(__dirname, "app", "assets", "js", "preloader.js"),
      preload: path.join(__dirname, "dist", "preload", "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: "#171614",
  });

  // const data = {
  //     bkid: Math.floor((Math.random() * fs.readdirSync(path.join(__dirname, 'app', 'assets', 'images', 'backgrounds')).length)),
  //     lang: (str, placeHolders) => LangLoader.queryEJS(str, placeHolders)
  // }
  // Object.entries(data).forEach(([key, val]) => ejse.data(key, val))

  // win.loadURL(pathToFileURL(path.join(__dirname, 'app', 'app.ejs')).toString())
  if (isDev) {
    // Загружаем локальный сервер Vite для разработки
    win.loadURL("http://localhost:5173");
    // Сразу открываем панель разработчика (DevTools), чтобы видеть ошибки React
    win.webContents.openDevTools();
  } else {
    // Для продакшена (когда будешь собирать .exe файл)
    win.loadFile(path.join(__dirname, "dist", "index.html"));
  }

  /*win.once('ready-to-show', () => {
        win.show()
    })*/

  win.removeMenu();

  win.resizable = true;

  win.on("closed", () => {
    win = null;
  });
}

function createMenu() {
  if (process.platform === "darwin") {
    // Extend default included application menu to continue support for quit keyboard shortcut
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

    // New edit menu adds support for text-editing keyboard shortcuts
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

    // Bundle submenus into a single template and build a menu object with it
    let menuTemplate = [applicationSubMenu, editSubMenu];
    let menuObject = Menu.buildFromTemplate(menuTemplate);

    // Assign it to the application
    Menu.setApplicationMenu(menuObject);
  }
}

function getPlatformIcon(filename) {
  let ext;
  switch (process.platform) {
    case "win32":
      ext = "ico";
      break;
    case "darwin":
    case "linux":
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
   helloHandler(app);
   windowControlsHandler(app);
   secureStorageHandler(app);
   updateHandler(app);
   javaHandler(app);
   systemHandler(app);
   setupLogHandler(app);
});

app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// Отвечаем на запрос версии
ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});
