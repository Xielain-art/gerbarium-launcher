import { DIRECTORIES, APP_CONFIG, WINDOW_CONFIG, PLATFORMS } from '../shared/constants/system';
import { LOG_MESSAGES, LOG_FILE_NAMES } from '../shared/constants/log-messages';

export const MAIN_CONSTANTS = {
  DIRECTORIES,
  APP_CONFIG,
  WINDOW_CONFIG,
  PLATFORMS,
  LOG_MESSAGES,
  LOG_FILE_NAMES,
} as const;
