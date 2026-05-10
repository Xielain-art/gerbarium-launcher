import { ipcRenderer } from "electron";
import type { IpcChannelMap } from "../shared/constants/ipc-chanels";

export async function typedInvoke<K extends keyof IpcChannelMap>(
  channel: K,
  ...args: IpcChannelMap[K]["args"]
): Promise<IpcChannelMap[K]["return"]> {
  return ipcRenderer.invoke(channel, ...args);
}

export function typedSend<K extends keyof IpcChannelMap>(
  channel: K,
  ...args: IpcChannelMap[K]["args"]
): void {
  ipcRenderer.send(channel, ...args);
}

export function typedSubscribe<T>(
  channel: string,
  callback: (payload: T) => void,
): () => void {
  const subscription = (_event: unknown, payload: T) => callback(payload);
  ipcRenderer.on(channel, subscription);
  return () => {
    ipcRenderer.removeListener(channel, subscription);
  };
}
