import { ipcMain, IpcMainInvokeEvent, App } from "electron";
import { IPC_CHANNELS } from "../shared/constants/ipc-chanels";

export default function sayHelloHandler(app: App) {
  ipcMain.handle(
    IPC_CHANNELS.HELLO.SAY_HELLO,
    (event: IpcMainInvokeEvent, username: string) => {
      return "Hello " + username;
    },
  );
}
