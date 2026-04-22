export const IPC_CHANNELS = {
  HELLO: {
    SAY_HELLO: "hello:say-hello",
  },
} as const;

// Карта типов для всех наших IPC событий
export interface IpcChannelMap {
  [IPC_CHANNELS.HELLO.SAY_HELLO]: {
    args: [username: string]; // аргументы в виде кортежа
    return: string; // что возвращает промис
  };
  // Сюда будешь добавлять новые ивенты:
  // 'auth:login': { args: [u: string, p: string]; return: any; };
}
