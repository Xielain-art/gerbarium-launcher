import { ipcMain } from "electron";
import {
  checkJavaVersion,
  findJavaInSystem,
  downloadAndExtractJRE,
  getInstalledJavaList,
  removeInstalledJava,
} from "./javaHandler";
import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { JAVA_VERSIONS } from "../config/javaConfig";
import log from "electron-log";

const downloadLocks: Map<number, boolean> = new Map();

export default function javaHandler() {
  ipcMain.handle(
    IPC_CHANNELS.JAVA.CHECK_VERSION,
    async (_, javaPath: string) => {
      return await checkJavaVersion(javaPath);
    },
  );

  ipcMain.handle(IPC_CHANNELS.JAVA.FIND_SYSTEM, async () => {
    return await findJavaInSystem();
  });

  ipcMain.handle(IPC_CHANNELS.JAVA.GET_INSTALLED, async () => {
    return await getInstalledJavaList();
  });

  ipcMain.handle(IPC_CHANNELS.JAVA.GET_VERSIONS, async () => {
    return JAVA_VERSIONS;
  });

  ipcMain.handle(IPC_CHANNELS.JAVA.REMOVE, async (_, javaVersion: number) => {
    try {
      const success = await removeInstalledJava(javaVersion as 8 | 17 | 21);
      return { success };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.JAVA.SELECT_EXECUTABLE, async () => {
    const { dialog } = require("electron");
    const filters =
      process.platform === "win32"
        ? [{ name: "Java Executable", extensions: ["exe"] }]
        : [];
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters,
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle(
    IPC_CHANNELS.JAVA.DOWNLOAD,
    async (event, javaVersion: number) => {
      const version = javaVersion as 8 | 17 | 21;
      
      if (downloadLocks.get(version)) {
        return { success: false, error: "Download already in progress" };
      }
      
      try {
        downloadLocks.set(version, true);
        const javaPath = await downloadAndExtractJRE(
          version,
          (update) => {
            event.sender.send(IPC_CHANNELS.JAVA.DOWNLOAD_PROGRESS, update);
          },
        );
         log.info("Download complete, path:", javaPath);
        return { success: true, javaPath };
      } catch (error) {
         log.error("Download failed:", error);
        return { success: false, error: (error as Error).message };
      } finally {
        downloadLocks.delete(version);
      }
    },
  );
}
