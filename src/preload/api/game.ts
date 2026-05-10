import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { typedInvoke, typedSubscribe } from "../ipc";
import type {
  GameLaunchOptions,
  GameProgressPayload,
  GameUpdateOptions,
  GameUpdateResult,
} from "../../shared/constants/ipc-chanels";

export function createGameApi() {
  return {
    launch: (options: GameLaunchOptions) =>
      typedInvoke(IPC_CHANNELS.GAME.LAUNCH, options),
    close: () => typedInvoke(IPC_CHANNELS.GAME.CLOSE),
    update: (options?: GameUpdateOptions): Promise<GameUpdateResult> =>
      typedInvoke(IPC_CHANNELS.GAME.UPDATE, options),
    verify: (options?: GameUpdateOptions): Promise<GameUpdateResult> =>
      typedInvoke(IPC_CHANNELS.GAME.VERIFY, options),
    onProgress: (callback: (data: GameProgressPayload) => void) =>
      typedSubscribe(IPC_CHANNELS.GAME.PROGRESS, callback),
    getInstalledVersions: (gamePath?: string) =>
      typedInvoke(IPC_CHANNELS.GAME.GET_INSTALLED_VERSIONS, gamePath),
  };
}
