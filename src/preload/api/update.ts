import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { typedInvoke, typedSend, typedSubscribe } from "../ipc";
import type { UpdateInfoPayload } from "../../shared/constants/ipc-chanels";

export function createUpdateApi() {
  return {
    onUpdateMessage: (callback: (message: string) => void) =>
      typedSubscribe(IPC_CHANNELS.UPDATE.MESSAGE, callback),
    onUpdateProgress: (
      callback: (progress: {
        percent: number;
        transferred: number;
        total: number;
        bytesPerSecond: number;
      }) => void,
    ) => typedSubscribe(IPC_CHANNELS.UPDATE.PROGRESS, callback),
    onUpdateInfo: (callback: (info: UpdateInfoPayload) => void) =>
      typedSubscribe(IPC_CHANNELS.UPDATE.INFO, callback),
    startUpdateCheck: () => typedSend(IPC_CHANNELS.UPDATE.START_CHECK),
  };
}
