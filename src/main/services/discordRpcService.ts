import { createRequire } from "node:module";
import log from "electron-log";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";

interface DiscordRpcClient {
  on(event: "ready", listener: () => void): void;
  login(params: { clientId: string }): Promise<void>;
  setActivity(activity: Record<string, unknown>): void;
  clearActivity(): void;
  destroy(): void;
}

interface DiscordRpcModule {
  Client: new (options: { transport: "ipc" }) => DiscordRpcClient;
}

const require = createRequire(__filename);

function readDiscordClientId(): string | null {
  const raw = process.env.DISCORD_RPC_CLIENT_ID?.trim();
  if (!raw) return null;
  return raw;
}

function buildDefaultActivity(): Record<string, unknown> {
  return {
    details: "In launcher",
    state: "Choosing version",
    largeImageKey: "launcher",
    largeImageText: "Gerbarium Launcher",
    startTimestamp: Date.now(),
    instance: false,
  };
}

export function createDiscordRpcService() {
  let client: DiscordRpcClient | null = null;
  let enabled = false;
  const clientId = readDiscordClientId();

  function disconnect(): void {
    if (!client) return;

    try {
      if (client.clearActivity) {
        client.clearActivity();
      }
      client.destroy();
      log.info(LOG_MESSAGES.DISCORD_RPC_STOPPED);
    } catch (error) {
      log.warn(LOG_MESSAGES.DISCORD_RPC_STOP_FAILED, error);
    } finally {
      client = null;
    }
  }

  function connect(): void {
    if (client || !enabled) return;

    if (!clientId) {
      log.warn(LOG_MESSAGES.DISCORD_RPC_CLIENT_ID_MISSING);
      return;
    }

    try {
      const discordRpc = require("discord-rpc-patch") as DiscordRpcModule;
      client = new discordRpc.Client({ transport: "ipc" });
      const activity = buildDefaultActivity();

      client.on("ready", () => {
        try {
          client?.setActivity(activity);
          log.info(LOG_MESSAGES.DISCORD_RPC_READY);
        } catch (error) {
          log.warn(LOG_MESSAGES.DISCORD_RPC_SET_ACTIVITY_FAILED, error);
        }
      });

      void client.login({ clientId }).catch((error: unknown) => {
        const errorText = error instanceof Error ? error.message : String(error);
        if (errorText.includes("ENOENT")) {
          log.info(LOG_MESSAGES.DISCORD_RPC_NO_CLIENT);
        } else {
          log.warn(LOG_MESSAGES.DISCORD_RPC_LOGIN_FAILED, errorText);
        }
        client = null;
      });
    } catch (error) {
      log.warn(LOG_MESSAGES.DISCORD_RPC_INIT_FAILED, error);
      client = null;
    }
  }

  function setEnabled(next: boolean): void {
    enabled = next;
    if (enabled) {
      connect();
    } else {
      disconnect();
    }
  }

  function shutdown(): void {
    disconnect();
  }

  return {
    setEnabled,
    shutdown,
  };
}
