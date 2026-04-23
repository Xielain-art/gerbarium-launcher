const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  // Функция для вызова окна логина
  hello: (username) => ipcRenderer.invoke("hello:say-hello", username),
  // Оставим старые функции для теста
  closeApp: () => ipcRenderer.send("close-app"),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
  maximizeWindow: () => ipcRenderer.invoke("window:maximize"),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  toggleFullScreen: () => ipcRenderer.invoke("window:toggle-fullscreen"),
  onWindowStateChange: (callback) => {
    const handler = (state) => callback(state);
    ipcRenderer.on("window:on-state-change", (_, state) => handler(state));
    return () => {
      ipcRenderer.removeListener("window:on-state-change", handler);
    };
  },

  // Update events
  onUpdateMessage: (callback) => {
    const handler = (_, message) => callback(message);
    ipcRenderer.on("update-message", handler);
    return () => {
      ipcRenderer.removeListener("update-message", handler);
    };
  },
  onUpdateProgress: (callback) => {
    const handler = (_, progress) => callback(progress);
    ipcRenderer.on("update-progress", handler);
    return () => {
      ipcRenderer.removeListener("update-progress", handler);
    };
  },
  // Trigger update check from renderer
  startUpdateCheck: () => ipcRenderer.send("start-update-check"),
});
