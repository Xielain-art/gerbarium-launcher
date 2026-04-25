/**
 * Centralized log message constants.
 * All magic strings for logs MUST be defined here — never inline.
 */
export const LOG_MESSAGES = {
  // App Lifecycle
  APP_STARTING: 'Gerbarium starting...',
  APP_UNCAUGHT_EXCEPTION: 'Uncaught Exception:',
  APP_UNHANDLED_REJECTION: 'Unhandled Rejection:',

  // Java
  JAVA_DOWNLOAD_START: '[JAVA] Starting download Java',
  JAVA_DOWNLOAD_COMPLETE: '[JAVA] Download complete, path:',
  JAVA_DOWNLOAD_FAILED: '[JAVA] Download failed:',
  JAVA_DOWNLOAD_IN_PROGRESS: '[JAVA] Download already in progress for version:',
  JAVA_REMOVE_FAILED: '[JAVA] Failed to remove Java:',
  JAVA_REMOVE_OK: '[JAVA] Removed Java version:',

  // Update
  UPDATE_CHECKING: '[UPDATE] Checking for updates...',
  UPDATE_AVAILABLE: '[UPDATE] Update available:',
  UPDATE_NOT_AVAILABLE: '[UPDATE] No updates available',
  UPDATE_DOWNLOAD_PROGRESS: '[UPDATE] Download progress:',
  UPDATE_DOWNLOADED: '[UPDATE] Update downloaded, installing...',
  UPDATE_ERROR: '[UPDATE] Error:',
  UPDATE_MANUAL_CHECK_STARTED: '[UPDATE] Manual check started',
  UPDATE_MANUAL_CHECK_FAILED: '[UPDATE] Check failed:',
  UPDATE_DOWNLOADING: '[UPDATE] Downloading update...',
  UPDATE_DOWNLOAD_COMPLETE: '[UPDATE] Download complete',
  UPDATE_DOWNLOAD_FAILED: '[UPDATE] Download failed:',
  UPDATE_INSTALLING: '[UPDATE] Installing and restarting...',

  // Secure Storage
  SECURE_STORAGE_SET: '[STORAGE] Storing key:',
  SECURE_STORAGE_SET_OK: '[STORAGE] Key stored successfully:',
  SECURE_STORAGE_SET_FAILED: '[STORAGE] Failed to store key:',
  SECURE_STORAGE_GET: '[STORAGE] Retrieving key:',
  SECURE_STORAGE_GET_FAILED: '[STORAGE] Failed to retrieve key:',
  SECURE_STORAGE_DELETE: '[STORAGE] Deleting key:',
  SECURE_STORAGE_DELETE_FAILED: '[STORAGE] Failed to delete key:',
  AUTH_LOGIN_ATTEMPT: '[AUTH] Login attempt:',
  AUTH_LOGIN_SUCCESS: '[AUTH] Login success:',
  AUTH_LOGIN_FAILED: '[AUTH] Login failed:',
  AUTH_LOGIN_OFFLINE_ATTEMPT: '[AUTH] Offline login attempt:',
  AUTH_LOGIN_OFFLINE_SUCCESS: '[AUTH] Offline login success:',
  AUTH_LOGIN_OFFLINE_FAILED: '[AUTH] Offline login failed:',
  AUTH_SESSION_READ: '[AUTH] Read auth session',
  AUTH_SESSION_READ_FAILED: '[AUTH] Failed to read auth session:',
  AUTH_LOGOUT: '[AUTH] Logout requested',
  AUTH_LOGOUT_FAILED: '[AUTH] Logout failed:',
  APP_CRASH_REPORT_WRITE_FAILED: '[APP] Failed to write crash report:',
  APP_CRASH_REPORT_READ_FAILED: '[APP] Failed to read crash report:',
  APP_CRASH_REPORT_CLEAR_FAILED: '[APP] Failed to clear crash report:',

  // Log Export
  LOG_EXPORT_STARTED: '[LOG] Export started',
  LOG_EXPORT_OK: '[LOG] Export completed:',
  LOG_EXPORT_FAILED: '[LOG] Failed to export logs:',
  LOG_EXPORT_CANCELED: '[LOG] Export canceled by user',

  // System
  SYSTEM_GET_MEMORY: '[SYSTEM] Memory requested',
  SYSTEM_GET_CPUS: '[SYSTEM] CPUs requested',
  SYSTEM_USER_ACTION: '[USER_ACTION]',
} as const;

/**
 * User-facing UI copy strings (shown in renderer).
 * Keep UI strings here so they are not scattered through handler code.
 */
export const UI_MESSAGES = {
  // General
  VERSION: 'Версия:',
  COPYRIGHT: '© 2026 Gerbarium. Radmir Klimau.',
  LOADING: 'Загрузка...',
  ERROR_PREFIX: 'Ошибка:',
  BACK: '← Назад',
  SAVE: 'Сохранить',
  SAVING: 'Сохранение...',
  RESET: 'Сбросить',
  CANCEL: 'Отмена',
  LOGOUT: 'Выйти',
  SETTINGS: 'Настройки',

  // Update Screen
  UPDATE_SEARCHING: 'Поиск обновлений...',
  UPDATE_FOUND: 'Найдено новое обновление',
  UPDATE_NONE: 'update-not-available',
  UPDATE_DOWNLOADED: 'Обновление скачано. Перезагрузка...',
  UPDATE_ERROR_PREFIX: 'Ошибка:',
  STARTING_LAUNCHER: 'Запуск лаунчера...',
  UPDATE_NOT_REQUIRED: 'Обновление не требуется',

  // Login Screen
  LOGIN_USERNAME: 'Логин',
  LOGIN_PASSWORD: 'Пароль',
  LOGIN_AUTHENTICATING: 'Авторизация...',
  LOGIN_SUBMIT: 'Вход',
  LOGIN_OFFLINE_MODE: 'Оффлайн режим',
  LOGIN_FORGOT_PASSWORD: 'Забыли пароль?',
  LOGIN_CREATE_ACCOUNT: 'Создать аккаунт',

  // Dashboard
  DASHBOARD_PLAYER: 'Игрок',
  DASHBOARD_ONLINE: 'ОНЛАЙН',
  DASHBOARD_OFFLINE: 'ОФФЛАЙН',
  DASHBOARD_VERSIONS: 'Версии',
  DASHBOARD_INSTALLED: '✓ Установлено',
  DASHBOARD_NOT_INSTALLED: '○ Не установлено',
  DASHBOARD_NEWS: 'Новости проекта',
  DASHBOARD_SELECTED_VERSION: 'Выбранная версия',
  DASHBOARD_NO_VERSION_SELECTED: 'Не выбрана',
  DASHBOARD_READY: '✓ Готово к запуску',
  DASHBOARD_REQUIRES_INSTALL: '○ Требуется установка',
  DASHBOARD_PLAY: 'ИГРАТЬ',
  DASHBOARD_CANCEL: 'ОТМЕНА',
  DASHBOARD_TIME_REMAINING: 'Осталось:',
  DASHBOARD_SELECT_VERSION_ALERT: 'Выберите версию для запуска!',

  // News Categories
  NEWS_CAT_UPDATE: 'Обновление',
  NEWS_CAT_EVENT: 'Событие',
  NEWS_CAT_COMMUNITY: 'Сообщество',
  NEWS_CAT_ANNOUNCEMENT: 'Анонс',

  // Settings
  SETTINGS_TAB_GENERAL: 'ОБЩИЕ',
  SETTINGS_TAB_JAVA: 'JAVA',
  SETTINGS_TAB_PROFILE: 'ПРОФИЛЬ',
  SETTINGS_GENERAL_TITLE: 'Общие настройки',
  SETTINGS_LANGUAGE: 'Язык',
  SETTINGS_CLOSE_ON_LAUNCH: 'Закрывать лаунчер при запуске игры',
  SETTINGS_MINIMIZE_TO_TRAY: 'Сворачивать в трей',
  SETTINGS_DISCORD_RPC: 'Показывать статус в Discord (RPC)',
  SETTINGS_JAVA_TITLE: 'Настройки Java',
  SETTINGS_INSTALLED_VERSIONS: 'Установленные версии',
  SETTINGS_JAVA_PATH: 'Путь к Java',
  SETTINGS_SELECT_FILE: 'Выбрать файл',
  SETTINGS_FINDING: 'Поиск...',
  SETTINGS_EXTRACTING: 'Распаковка...',
  SETTINGS_JAVA_ALREADY_INSTALLED: 'Java {version} уже установлена',
  SETTINGS_DOWNLOAD_JAVA: 'Скачать Java {version}',
  SETTINGS_RAM_ALLOCATION: 'Выделение ОЗУ:',
  SETTINGS_JVM_ARGS: 'Аргументы JVM',
  SETTINGS_JVM_ARGS_HELP: 'Дополнительные параметры для запуска Java',
  SETTINGS_PROFILE_TITLE: 'Настройки профиля',
  SETTINGS_USERNAME: 'Имя пользователя',
  SETTINGS_SKIN_URL: 'URL скина',
  SETTINGS_CAPE_URL: 'URL плаща',
  SETTINGS_SKIN_PREVIEW: 'Предпросмотр скина',
  SETTINGS_SKIN_NOT_SELECTED: 'Скин не выбран',
  SETTINGS_DEBUG_TITLE: 'Отладка и Поддержка',
  SETTINGS_DEBUG_HELP: 'Если вы столкнулись с проблемой, выгрузите логи и прикрепите их к баг-репорту на GitHub.',
  SETTINGS_EXPORT_LOGS: 'Сообщить об ошибке (Экспорт логов)',
  SETTINGS_EXPORTING: 'Архивация...',
  SETTINGS_EXPORT_SUCCESS: 'Логи успешно сохранены в:\n{path}\n\nОткроется браузер для создания Issue.',
  SETTINGS_EXPORT_ERROR: 'Ошибка при сохранении логов:\n{error}',
  SETTINGS_EXPORT_CRITICAL: 'Произошла непредвиденная ошибка при экспорте логов.',
  SETTINGS_CONFIRM_RESET_TITLE: 'Сброс настроек',
  SETTINGS_CONFIRM_RESET_TEXT: 'Вы уверены, что хотите сбросить все настройки до значений по умолчанию? Это действие нельзя отменить.',

  // Log Handler Errors
  LOG_FOLDER_NOT_FOUND: 'Папка с логами не найдена',
  LOG_FOLDER_EMPTY: 'Папка с логами пуста',
  LOG_EXPORT_CANCELED: 'Отменено пользователем',
} as const;

/**
 * Log file and folder name constants.
 * Keeps file-system path strings out of handler code.
 */
export const LOG_FILE_NAMES = {
  MAIN: 'main.log',
  USER_ACTIONS: 'user-actions.log',
  /** electron-log scope name for user-actions logger instance */
  USER_ACTIONS_SCOPE: 'user-actions',
} as const;
