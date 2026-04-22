const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  // Функция для вызова окна логина
  hello: (username) => ipcRenderer.invoke("hello:say-hello", username),
  // Оставим старые функции для теста
  closeApp: () => ipcRenderer.send("close-app"),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
});
