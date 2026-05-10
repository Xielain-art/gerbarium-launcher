import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { typedInvoke } from "../ipc";

export function createAppApi() {
  return {
    getAppVersion: () => typedInvoke(IPC_CHANNELS.APP.GET_VERSION),
    verifyIntegrity: () => typedInvoke(IPC_CHANNELS.APP.VERIFY_INTEGRITY),
    getLastCrashReport: () => typedInvoke(IPC_CHANNELS.APP.GET_LAST_CRASH_REPORT),
    clearLastCrashReport: () => typedInvoke(IPC_CHANNELS.APP.CLEAR_LAST_CRASH_REPORT),
  };
}
