export const IPC_CHANNELS = {
  HELLO: {
    SAY_HELLO: "hello:say-hello",
  },
  WINDOW: {
    MINIMIZE: "window:minimize",
    MAXIMIZE: "window:maximize",
    CLOSE: "window:close",
    TOGGLE_FULLSCREEN: "window:toggle-fullscreen",
    ON_STATE_CHANGE: "window:on-state-change",
  },
  UPDATE: {
    MESSAGE: "update-message",
    PROGRESS: "update-progress",
    START_CHECK: "start-update-check",
  },
} as const;

// Карта типов для всех наших IPC событий
export interface IpcChannelMap {
  [IPC_CHANNELS.HELLO.SAY_HELLO]: {
    args: [username: string];
    return: string;
  };
  [IPC_CHANNELS.WINDOW.MINIMIZE]: {
    args: [];
    return: void;
  };
  [IPC_CHANNELS.WINDOW.MAXIMIZE]: {
    args: [];
    return: void;
  };
  [IPC_CHANNELS.WINDOW.CLOSE]: {
    args: [];
    return: void;
  };
  [IPC_CHANNELS.WINDOW.TOGGLE_FULLSCREEN]: {
    args: [];
    return: void;
  };
  [IPC_CHANNELS.UPDATE.MESSAGE]: {
    args: [message: string];
    return: void;
  };
  [IPC_CHANNELS.UPDATE.PROGRESS]: {
    args: [progress: { percent: number; transferred: number; total: number; bytesPerSecond: number }];
    return: void;
  };
  [IPC_CHANNELS.UPDATE.START_CHECK]: {
    args: [];
    return: void;
  };
}

// Window state interface
export interface WindowState {
  isMinimized: boolean;
  isMaximized: boolean;
  isFullScreen: boolean;
}
