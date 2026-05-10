import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { typedInvoke } from "../ipc";

export function createLogsApi() {
  return {
    exportAndReport: () => typedInvoke(IPC_CHANNELS.LOG.EXPORT_AND_REPORT),
  };
}
