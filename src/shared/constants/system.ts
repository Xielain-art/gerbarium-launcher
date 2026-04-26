export const PLATFORMS = {
  WINDOWS: 'win32',
  MACOS: 'darwin',
  LINUX: 'linux',
} as const;

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
} as const;

export const DIRECTORIES = {
  LOGS: 'logs',
  JAVA: 'java',
  BIN: 'bin',
  DESKTOP: 'desktop',
  USER_DATA: 'userData',
} as const;

export const EXTERNAL_URLS = {
  GITHUB_ISSUES: 'https://github.com/Xielain-art/gerbarium-releases/issues/new',
} as const;

export const FILE_EXTENSIONS = {
  ZIP: 'zip',
  EXE: 'exe',
  YML: 'yml',
} as const;

export const FILENAMES = {
  DEV_APP_UPDATE: 'dev-app-update.yml',
  JRE_ARCHIVE: 'jre.archive',
  JAVA_EXE: 'java.exe',
  JAVA: 'java',
  GERBARIUM_LOGS_PREFIX: 'GerbariumLogs_',
} as const;

export const DIALOG_TITLES = {
  SAVE_LOGS: 'Сохранить архив с логами',
} as const;

export const DIALOG_FILTERS = {
  ZIP_ARCHIVE: 'Zip Archive',
  JAVA_EXECUTABLE: 'Java Executable',
} as const;

export const COMMANDS = {
  JAVA_VERSION: '-version',
  WHERE_JAVA: 'where java',
  WHICH_JAVA: 'which java',
} as const;

export const ARCHIVE_FORMATS = {
  ZIP: 'zip',
} as const;

export const GITHUB_TEMPLATES = {
  ISSUE_BODY: (platform: string, arch: string, version: string) => 
    '**Системные данные:**\n' +
    `- ОС: ${platform} ${arch}\n` +
    `- Версия: ${version}\n\n` +
    '*(Пожалуйста, прикрепите архив логов сюда)*',
  CONTACT_BODY: (platform: string, arch: string, version: string) => 
    '**Опишите вашу проблему или вопрос:**\n' +
    '*(Писать тут)*\n\n' +
    '**Системные данные:**\n' +
    `- ОС: ${platform} ${arch}\n` +
    `- Версия лаунчера: ${version}\n`
} as const;

export const TIMEOUTS = {
  UPDATE_RESTART: 3000,
  JAVA_DOWNLOAD_SOCKET: 15000,
} as const;

export const REGEX = {
  JAVA_VERSION: /version "([^"]+)"/,
  JRE_FOLDER: /^jre(\d+)$/,
} as const;

export const JAVA_CONSTANTS = {
  SUPPORTED_VERSIONS: [8, 17, 21],
  JRE_PREFIX: 'jre',
} as const;

export const HEADERS = {
  CONTENT_LENGTH: 'content-length',
} as const;

export const STORAGE_KEYS = {
  SETTINGS: 'gerbarium-settings-storage',
  AUTH: 'gerbarium-auth-storage',
  USER: 'gerbarium-auth-user',
  TOKEN: 'auth_token',
} as const;

export const LOG_ACTIONS = {
  SAVE_SETTINGS: 'SAVE_SETTINGS',
  SAVE_SETTINGS_ERROR: 'SAVE_SETTINGS_ERROR',
  RESET_SETTINGS: 'RESET_SETTINGS',
  SELECT_JAVA: 'SELECT_JAVA',
  LOGS_EXPORT_STARTED: 'LOGS_EXPORT_STARTED',
  LOGS_EXPORT_SUCCESS: 'LOGS_EXPORT_SUCCESS',
  LOGS_EXPORT_ERROR: 'LOGS_EXPORT_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_ERROR: 'REGISTER_ERROR',
  LOGIN_OFFLINE: 'LOGIN_OFFLINE',
  LOGIN_OFFLINE_ERROR: 'LOGIN_OFFLINE_ERROR',
  LOGIN_VALIDATION_ERROR: 'LOGIN_VALIDATION_ERROR',
  TOKEN_LOADED: 'TOKEN_LOADED',
  TOKEN_LOAD_ERROR: 'TOKEN_LOAD_ERROR',
  LOGOUT: 'LOGOUT',
  APP_START: 'APP_START',
  VERSION_CHECK: 'VERSION_CHECK',
  CHECK_JAVA: 'CHECK_JAVA',
  CHECK_JAVA_SUCCESS: 'CHECK_JAVA_SUCCESS',
  CHECK_JAVA_ERROR: 'CHECK_JAVA_ERROR',
  FIND_JAVA_START: 'FIND_JAVA_START',
  FIND_JAVA_SUCCESS: 'FIND_JAVA_SUCCESS',
  FIND_JAVA_NOT_FOUND: 'FIND_JAVA_NOT_FOUND',
  FIND_JAVA_ERROR: 'FIND_JAVA_ERROR',
  DOWNLOAD_JAVA_START: 'DOWNLOAD_JAVA_START',
  DOWNLOAD_JAVA_COMPLETE: 'DOWNLOAD_JAVA_COMPLETE',
  DOWNLOAD_JAVA_ERROR: 'DOWNLOAD_JAVA_ERROR',
  GET_INSTALLED_JAVA_START: 'GET_INSTALLED_JAVA_START',
  GET_INSTALLED_JAVA_SUCCESS: 'GET_INSTALLED_JAVA_SUCCESS',
  GET_INSTALLED_JAVA_ERROR: 'GET_INSTALLED_JAVA_ERROR',
  GET_JAVA_VERSIONS_START: 'GET_JAVA_VERSIONS_START',
  GET_JAVA_VERSIONS_SUCCESS: 'GET_JAVA_VERSIONS_SUCCESS',
  GET_JAVA_VERSIONS_ERROR: 'GET_JAVA_VERSIONS_ERROR',
  REMOVE_JAVA_START: 'REMOVE_JAVA_START',
  REMOVE_JAVA_COMPLETE: 'REMOVE_JAVA_COMPLETE',
  REMOVE_JAVA_ERROR: 'REMOVE_JAVA_ERROR',
} as const;

export const SERVER_INFO = {
  IP: 'play.gerbarium.ru',
  PORT: 25565,
} as const;

export const DEFAULT_SETTINGS = {
  JVM_ARGS: '-XX:+UseG1GC -XX:MaxGCPauseMillis=50',
  RAM_GB: 4,
  LANGUAGE: 'ru',
  MODPACK: 'gerbarium',
  USERNAME: 'Player',
} as const;

export const DOWNLOAD_STATUS = {
  DOWNLOADING: 'DOWNLOADING',
  EXTRACTING: 'EXTRACTING',
  VERIFYING: 'VERIFYING',
  DONE: 'DONE',
} as const;

export const ROUTES = {
  HOME: '/',
  UPDATE: '/update',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
} as const;

export const APP_CONFIG = {
  DEV_URL: 'http://127.0.0.1:5173',
  PROD_INDEX: 'dist/index.html',
  BG_COLOR: '#171614',
} as const;

export const WINDOW_CONFIG = {
  WIDTH: 980,
  HEIGHT: 552,
} as const;
