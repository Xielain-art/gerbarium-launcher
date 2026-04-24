import os from "os";
import { ipcMain } from "electron";
import { app } from "electron";
import path from "path";
import fs from "fs-extra";
import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";

export interface SystemMemory {
  total: number;
  free: number;
}

export default function systemHandler() {
  ipcMain.handle("system:get-memory", (): SystemMemory => {
    return {
      total: Math.round(os.totalmem() / 1024 / 1024),
      free: Math.round(os.freemem() / 1024 / 1024),
    };
  });

  ipcMain.handle("system:get-cpus", () => {
    return os.cpus().length;
  });
}