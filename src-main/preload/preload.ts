import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS, IpcChannelMap } from "../shared/constants/ipc-chanels";

async function typedInvoke<K extends keyof IpcChannelMap>(
  channel: K,
  ...args: IpcChannelMap[K]["args"]
): Promise<IpcChannelMap[K]["return"]> {
  return ipcRenderer.invoke(channel, ...args);
}

contextBridge.exposeInMainWorld("electronAPI", {
  hello: (username: string) =>
    typedInvoke(IPC_CHANNELS.HELLO.SAY_HELLO, username),

  closeApp: () => ipcRenderer.send("close-app"),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
});
