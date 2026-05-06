/**
 * Centralized log message constants.
 * All magic strings for logs MUST be defined here — never inline.
 */
export const LOG_MESSAGES = {
  // App Lifecycle
  APP_STARTING: 'Gerbarium starting...',
  APP_UNCAUGHT_EXCEPTION: 'Uncaught Exception:',
  APP_UNHANDLED_REJECTION: 'Unhandled Rejection:',
  APP_DEV_MODE: 'Running in development mode',
  APP_RECOVERY_UPDATE_FAILED: 'Failed to trigger recovery update after integrity mismatch',
  APP_LATEST_YML_MISSING_HASH: 'ASAR integrity check skipped: release metadata does not contain appAsarSha256/asarSha256',
  APP_LATEST_YML_FETCH_FAILED: 'Failed to fetch release metadata for ASAR integrity check',
  APP_EXPECTED_HASH_INVALID: 'ASAR integrity check skipped: expected hash is missing or invalid',
  APP_ASAR_NOT_FOUND: 'ASAR integrity check skipped: app.asar not found',
  APP_ASAR_INTEGRITY_OK: 'ASAR integrity check passed',
  APP_ASAR_INTEGRITY_MISMATCH: 'ASAR integrity mismatch detected',
  APP_ASAR_INTEGRITY_FAILED: 'ASAR integrity check failed',
  APP_RECOVERY_UPDATE_TRIGGERED: 'ASAR integrity mismatch: recovery update triggered',

  // Java
  JAVA_DOWNLOAD_START: '[JAVA] Starting download Java',
  JAVA_DOWNLOAD_COMPLETE: '[JAVA] Download complete, path:',
  JAVA_DOWNLOAD_FAILED: '[JAVA] Download failed:',
  JAVA_DOWNLOAD_IN_PROGRESS: '[JAVA] Download already in progress for version:',
  JAVA_REMOVE_FAILED: '[JAVA] Failed to remove Java:',
  JAVA_REMOVE_OK: '[JAVA] Removed Java version:',
  JAVA_ARM64_FALLBACK_ROSETTA:
    '[JAVA] Native ARM64 build not found, falling back to x64 via Rosetta 2',
  JAVA_ARM64_FALLBACK_X64:
    '[JAVA] Native ARM64 build not found, falling back to x64',

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
  AUTH_REGISTER_ATTEMPT: '[AUTH] Register attempt:',
  AUTH_REGISTER_SUCCESS: '[AUTH] Register success:',
  AUTH_REGISTER_FAILED: '[AUTH] Register failed:',
  AUTH_VERIFY_EMAIL_ATTEMPT: '[AUTH] Verify email attempt',
  AUTH_VERIFY_EMAIL_FAILED: '[AUTH] Verify email failed:',
  AUTH_EMAIL_STATUS_REQUESTED: '[AUTH] Email verification status requested',
  AUTH_EMAIL_STATUS_FAILED: '[AUTH] Email verification status failed:',
  AUTH_RESEND_EMAIL_REQUESTED: '[AUTH] Resend email verification requested',
  AUTH_RESEND_EMAIL_FAILED: '[AUTH] Resend email verification failed:',
  AUTH_API_ERROR: '[AUTH] API request failed:',
  AUTH_LOGIN_OFFLINE_ATTEMPT: '[AUTH] Offline login attempt:',
  AUTH_LOGIN_OFFLINE_SUCCESS: '[AUTH] Offline login success:',
  AUTH_LOGIN_OFFLINE_FAILED: '[AUTH] Offline login failed:',
  AUTH_TOKEN_REFRESH_ATTEMPT: '[AUTH] Refresh token attempt',
  AUTH_TOKEN_REFRESH_SUCCESS: '[AUTH] Refresh token success',
  AUTH_TOKEN_REFRESH_FAILED: '[AUTH] Refresh token failed:',
  AUTH_PROFILE_FETCH_FAILED: '[AUTH] Profile fetch failed:',
  AUTH_SESSION_READ: '[AUTH] Read auth session',
  AUTH_SESSION_READ_FAILED: '[AUTH] Failed to read auth session:',
  AUTH_ADMIN_SESSION_READ_FAILED: '[AUTH] Failed to read session for admin actions:',
  AUTH_LOGOUT: '[AUTH] Logout requested',
  AUTH_LOGOUT_FAILED: '[AUTH] Logout failed:',
  APP_CRASH_REPORT_WRITE_FAILED: '[APP] Failed to write crash report:',
  APP_CRASH_REPORT_READ_FAILED: '[APP] Failed to read crash report:',
  APP_CRASH_REPORT_CLEAR_FAILED: '[APP] Failed to clear crash report:',
  DISCORD_RPC_CLIENT_ID_MISSING: '[DISCORD_RPC] DISCORD_RPC_CLIENT_ID is not set',
  DISCORD_RPC_INIT_FAILED: '[DISCORD_RPC] Failed to initialize client',
  DISCORD_RPC_READY: '[DISCORD_RPC] Connected',
  DISCORD_RPC_LOGIN_FAILED: '[DISCORD_RPC] Login failed',
  DISCORD_RPC_NO_CLIENT: '[DISCORD_RPC] Discord client is not running',
  DISCORD_RPC_SET_ACTIVITY_FAILED: '[DISCORD_RPC] Failed to set activity',
  DISCORD_RPC_STOPPED: '[DISCORD_RPC] Disconnected',
  DISCORD_RPC_STOP_FAILED: '[DISCORD_RPC] Failed to disconnect cleanly',

  // Log Export
  LOG_EXPORT_STARTED: '[LOG] Export started',
  LOG_EXPORT_OK: '[LOG] Export completed:',
  LOG_EXPORT_FAILED: '[LOG] Failed to export logs:',
  LOG_EXPORT_CANCELED: '[LOG] Export canceled by user',
  LOG_EXPORT_RUNTIME_ERROR: '[LOG] Log export runtime error:',

  // System
  SYSTEM_GET_MEMORY: '[SYSTEM] Memory requested',
  SYSTEM_GET_CPUS: '[SYSTEM] CPUs requested',
  SYSTEM_USER_ACTION: '[USER_ACTION]',
  SYSTEM_BLOCKED_UNSAFE_EXTERNAL_URL: '[SYSTEM] Blocked unsafe external URL',
  SYSTEM_BLOCKED_UNSAFE_OPEN_PATH: '[SYSTEM] Blocked unsafe openPath target',
  SYSTEM_OPEN_PATH_FAILED: '[SYSTEM] Failed to open path',

  // Admin
  ADMIN_GET_USERS_FAILED: '[ADMIN] GET_USERS failed',
  ADMIN_BAN_USER_FAILED: '[ADMIN] BAN_USER failed',
  ADMIN_UNBAN_USER_FAILED: '[ADMIN] UNBAN_USER failed',
  ADMIN_UPDATE_ROLES_FAILED: '[ADMIN] UPDATE_ROLES failed',
  ADMIN_UPDATE_ROLE_FAILED: '[ADMIN] UPDATE_ROLE failed',
  ADMIN_GET_NEWS_FAILED: '[ADMIN] GET_NEWS failed',
  ADMIN_CREATE_NEWS_FAILED: '[ADMIN] CREATE_NEWS failed',
  ADMIN_UPDATE_NEWS_FAILED: '[ADMIN] UPDATE_NEWS failed',
  ADMIN_DELETE_NEWS_FAILED: '[ADMIN] DELETE_NEWS failed',
  ADMIN_GET_CHANGELOG_FAILED: '[ADMIN] GET_CHANGELOG failed',
  ADMIN_CREATE_CHANGELOG_FAILED: '[ADMIN] CREATE_CHANGELOG failed',
  ADMIN_UPDATE_CHANGELOG_FAILED: '[ADMIN] UPDATE_CHANGELOG failed',
  ADMIN_DELETE_CHANGELOG_FAILED: '[ADMIN] DELETE_CHANGELOG failed',

  // Game
  GAME_PROGRESS_EMIT_FAILED: '[GAME] Failed to emit game progress event',
  GAME_LAUNCH_ASYNC_FAILED: '[GAME] Failed to launch game asynchronously',
  GAME_LAUNCH_SETUP_FAILED: '[GAME] Failed to setup/launch game',
  GAME_DISTRIBUTION_UPDATE_FAILED: '[GAME] Distribution update failed',
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
