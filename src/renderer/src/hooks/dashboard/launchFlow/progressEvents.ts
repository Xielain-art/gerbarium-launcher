import type { GameProgressPayload } from "../../../../../shared/constants/ipc/models";
import type { LaunchPhase } from "./types";
import { logAction } from "../utils";

type ProgressEventHandlers = {
  setPhaseSmooth: (next: LaunchPhase, immediate?: boolean) => void;
  setIsGameRunning: (value: boolean) => void;
  setLaunchProgress: (value: number | null) => void;
  setLaunchStatus: (value: string) => void;
  setLaunchError: (value: string | null) => void;
  appendLog: (line: string) => void;
};

function normalizeProgressPercent(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const normalized = value >= 0 && value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, normalized));
}

export function handleGameProgressEvent(
  data: GameProgressPayload,
  handlers: ProgressEventHandlers,
): void {
  if (data.type === "progress") {
    const normalizedPercent = normalizeProgressPercent(data.content.percent);
    if (normalizedPercent !== null) {
      handlers.setLaunchProgress(normalizedPercent);
    }
    if (
      typeof data.content.status === "string" &&
      data.content.status.trim()
    ) {
      handlers.setLaunchStatus(data.content.status.trim());
    }
    return;
  }

  if (data.type === "data") {
    handlers.appendLog(data.content);
    return;
  }

  if (data.type === "state" && data.content.phase === "spawned") {
    handlers.setPhaseSmooth("running");
    handlers.setIsGameRunning(true);
    handlers.setLaunchProgress(100);
    handlers.setLaunchStatus("Running...");
    setTimeout(() => {
      handlers.setLaunchProgress(null);
    }, 600);
    logAction("GAME_PROCESS_SPAWNED", "Spawn event received");
    return;
  }

  if (data.type === "close") {
    handlers.setPhaseSmooth("idle", true);
    handlers.setIsGameRunning(false);
    handlers.setLaunchProgress(null);
    handlers.setLaunchStatus("");
    logAction("GAME_PROCESS_CLOSED", "Game process exited");
    return;
  }

  if (data.type === "error") {
    handlers.setPhaseSmooth("error", true);
    handlers.setIsGameRunning(false);
    handlers.setLaunchProgress(null);
    handlers.setLaunchStatus("");
    handlers.setLaunchError(`Launch error: ${data.content}`);
    logAction("GAME_LAUNCH_ERROR", data.content);
  }
}
