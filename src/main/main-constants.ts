import { DIRECTORIES, APP_CONFIG, WINDOW_CONFIG, PLATFORMS } from '../shared/constants/system';
import { LOG_MESSAGES, LOG_FILE_NAMES } from '../shared/constants/log-messages';
import { IPC_CHANNELS } from "../shared/constants/ipc/channels";

export const MAIN_CONSTANTS = {
  DIRECTORIES,
  APP_CONFIG,
  WINDOW_CONFIG,
  PLATFORMS,
  IPC_CHANNELS,
  LOG_MESSAGES,
  LOG_FILE_NAMES,
} as const;
