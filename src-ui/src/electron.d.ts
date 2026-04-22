import { IpcChannelMap } from "../../shared/constants/ipc-chanels";

export interface IElectronAPI {
  hello: (
    username: IpcChannelMap["hello:say-hello"]["args"][0],
  ) => Promise<IpcChannelMap["hello:say-hello"]["return"]>;

  closeApp: () => void;
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
