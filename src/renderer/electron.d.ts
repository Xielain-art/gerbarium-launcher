import { IpcChannelMap } from "../shared/constants/ipc-chanels";

type IpcArgs<K extends keyof IpcChannelMap> = IpcChannelMap[K]["args"];
type IpcReturn<K extends keyof IpcChannelMap> = IpcChannelMap[K]["return"];

export interface IElectronAPI {
  hello: (
    ...args: IpcArgs<"hello:say-hello">
  ) => Promise<IpcReturn<"hello:say-hello">>;

  closeApp: () => void;
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
