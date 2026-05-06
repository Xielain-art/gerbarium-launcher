import os from "node:os";
import log from "electron-log";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";

export interface SystemMemory {
  total: number;
  free: number;
}

export function getSystemMemory(): SystemMemory {
  log.debug(LOG_MESSAGES.SYSTEM_GET_MEMORY);
  return {
    total: Math.round(os.totalmem() / 1024 / 1024),
    free: Math.round(os.freemem() / 1024 / 1024),
  };
}

export function getSystemCpuCount(): number {
  log.debug(LOG_MESSAGES.SYSTEM_GET_CPUS);
  return os.cpus().length;
}
