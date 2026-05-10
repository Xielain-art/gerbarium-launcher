import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { typedInvoke, typedSubscribe } from "../ipc";
import type { JavaDownloadProgressPayload } from "../../shared/constants/ipc-chanels";

export function createJavaApi() {
  return {
    checkVersion: (javaPath: string) =>
      typedInvoke(IPC_CHANNELS.JAVA.CHECK_VERSION, javaPath),
    findSystemJava: () => typedInvoke(IPC_CHANNELS.JAVA.FIND_SYSTEM),
    selectJavaExecutable: () =>
      typedInvoke(IPC_CHANNELS.JAVA.SELECT_EXECUTABLE),
    downloadJRE: (javaVersion: number) =>
      typedInvoke(IPC_CHANNELS.JAVA.DOWNLOAD, javaVersion),
    getInstalledJava: () => typedInvoke(IPC_CHANNELS.JAVA.GET_INSTALLED),
    getJavaVersions: () => typedInvoke(IPC_CHANNELS.JAVA.GET_VERSIONS),
    removeJava: (javaVersion: number) =>
      typedInvoke(IPC_CHANNELS.JAVA.REMOVE, javaVersion),
    onDownloadProgress: (callback: (update: JavaDownloadProgressPayload) => void) =>
      typedSubscribe(IPC_CHANNELS.JAVA.DOWNLOAD_PROGRESS, callback),
  };
}
