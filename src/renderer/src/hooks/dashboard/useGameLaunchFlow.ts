import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDownloadStore } from "../../stores/useDownloadStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { queryKeys } from "../../lib/queryKeys";
import type { AuthUser, GameVersion } from "../../types";
import {
  logAction,
  parseJvmArgs,
  selectBestJavaPath,
  toAutoConnectConfig,
  toErrorMessage,
} from "./utils";
import { runPrelaunchModpackUpdate } from "./prelaunch";

export type LaunchPhase =
  | "idle"
  | "precheck"
  | "updating"
  | "launching"
  | "running"
  | "error";

type UseGameLaunchFlowOptions = {
  user: AuthUser | null;
  selectedVersion: GameVersion | undefined;
  playBlockReason: string | null;
  selectVersionAlert: string;
};

export function useGameLaunchFlow(options: UseGameLaunchFlowOptions): {
  phase: LaunchPhase;
  isLaunching: boolean;
  isGameRunning: boolean;
  launchProgress: number | null;
  launchStatus: string;
  launchError: string | null;
  isConsoleVisible: boolean;
  logs: string[];
  consoleScrollRef: React.RefObject<HTMLDivElement | null>;
  isDownloading: boolean;
  progress: ReturnType<typeof useDownloadStore.getState>["progress"];
  onPlay: () => Promise<void>;
  onCloseGame: () => Promise<void>;
  onCancelDownload: () => void;
  onToggleConsole: () => void;
} {
  const queryClient = useQueryClient();
  const { isDownloading, progress, cancelDownload } = useDownloadStore();

  const [phase, setPhase] = useState<LaunchPhase>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [launchProgress, setLaunchProgress] = useState<number | null>(null);
  const [launchStatus, setLaunchStatus] = useState("");
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [isConsoleVisible, setIsConsoleVisible] = useState(true);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const consoleScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const consoleNode = consoleScrollRef.current;
    if (!consoleNode) {
      return;
    }
    consoleNode.scrollTop = consoleNode.scrollHeight;
  }, [logs]);

  useEffect(() => {
    if (!window.electronAPI?.game) {
      return;
    }

    const unsubscribe = window.electronAPI.game.onProgress((data) => {
      if (data.type === "progress") {
        const percent = data.content.percent;
        if (typeof percent === "number" && Number.isFinite(percent)) {
          setLaunchProgress(Math.max(0, Math.min(100, percent)));
        }
        if (
          typeof data.content.status === "string" &&
          data.content.status.trim()
        ) {
          setLaunchStatus(data.content.status.trim());
        }
        return;
      }

      if (data.type === "data") {
        setLogs((prev) => [...prev, data.content]);
        return;
      }

      if (data.type === "state" && data.content.phase === "spawned") {
        setPhase("running");
        setIsGameRunning(true);
        setLaunchProgress(null);
        setLaunchStatus("Running...");
        logAction("GAME_PROCESS_SPAWNED", "Spawn event received");
        return;
      }

      if (data.type === "close") {
        setPhase("idle");
        setIsGameRunning(false);
        setLaunchProgress(null);
        setLaunchStatus("");
        logAction("GAME_PROCESS_CLOSED", "Game process exited");
        return;
      }

      if (data.type === "error") {
        setPhase("error");
        setIsGameRunning(false);
        setLaunchProgress(null);
        setLaunchStatus("");
        setLaunchError(`Launch error: ${data.content}`);
        logAction("GAME_LAUNCH_ERROR", data.content);
      }
    });

    return () => unsubscribe();
  }, []);

  async function onPlay(): Promise<void> {
    if (phase === "launching" || phase === "precheck" || phase === "updating") {
      return;
    }
    if (options.playBlockReason) {
      setPhase("error");
      setLaunchError(options.playBlockReason);
      return;
    }
    if (!options.selectedVersion) {
      setPhase("error");
      setLaunchError(options.selectVersionAlert);
      return;
    }
    if (!options.user?.username) {
      setPhase("error");
      setLaunchError("User is not logged in.");
      return;
    }

    setLaunchError(null);
    setPhase("precheck");
    setIsGameRunning(false);
    setLaunchProgress(null);
    setLaunchStatus("Preparing...");
    setLogs([]);
    logAction("GAME_LAUNCH_START", options.selectedVersion.name);

    try {
      const settings = useSettingsStore.getState().general;
      const installedJava = await window.electronAPI.java.getInstalledJava();
      const minecraftVersion =
        options.selectedVersion.version || options.selectedVersion.id;
      let javaPath: string | null | undefined = selectBestJavaPath(
        installedJava,
        minecraftVersion,
        settings.javaPath,
      );
      if (!javaPath) {
        javaPath = await window.electronAPI.java.findSystemJava();
      }
      if (!javaPath) {
        throw new Error("Java not found. Install Java in settings.");
      }

      setIsConsoleVisible(true);
      setPhase("updating");
      await runPrelaunchModpackUpdate({
        gamePath: settings.gamePath,
        distributionUrl: settings.distributionUrl,
        selectedVersion: options.selectedVersion,
        setLaunchStatus,
        appendLog: (message) => setLogs((prev) => [...prev, message]),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.installedVersions(settings.gamePath),
      });

      setPhase("launching");
      setLaunchStatus("Starting Minecraft...");
      const result = await window.electronAPI.game.launch({
        username: options.user.username,
        version: minecraftVersion,
        minecraftVersion,
        loader: options.selectedVersion.loader,
        fabricLoaderVersion: options.selectedVersion.fabricLoaderVersion,
        forgeInstallerUrl: options.selectedVersion.forgeInstallerUrl,
        memory: {
          min: `${Math.max(1, Math.floor(settings.ramAllocation / 2))}G`,
          max: `${Math.max(1, settings.ramAllocation)}G`,
        },
        javaPath,
        gamePath: settings.gamePath,
        fullscreen: settings.fullscreen,
        jvmArgs: parseJvmArgs(settings.jvmArgs),
        autoConnect: toAutoConnectConfig(settings),
      });

      if (!result.success) {
        throw new Error(result.error || "Game launch failed.");
      }

      setLaunchStatus("Running...");
      setLaunchProgress(null);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.installedVersions(settings.gamePath),
      });
      logAction("GAME_LAUNCH_REQUESTED", options.selectedVersion.name);
    } catch (error: unknown) {
      const message = toErrorMessage(error);
      setPhase("error");
      setIsGameRunning(false);
      setLaunchProgress(null);
      setLaunchStatus("");
      setLaunchError(`Launch error: ${message}`);
      logAction("GAME_LAUNCH_ERROR", message);
    }
  }

  async function onCloseGame(): Promise<void> {
    if (!isGameRunning) {
      return;
    }

    setLaunchError(null);
    setLaunchStatus("Closing game...");
    try {
      const result = await window.electronAPI.game.close();
      if (!result.success) {
        setLaunchStatus("Running...");
        throw new Error(result.error || "Game close failed.");
      }

      logAction("GAME_CLOSE_REQUESTED", options.selectedVersion?.name || "unknown");
    } catch (error: unknown) {
      const message = toErrorMessage(error);
      setLaunchError(`Close error: ${message}`);
      setLaunchStatus("Running...");
      logAction("GAME_CLOSE_ERROR", message);
    }
  }

  function onToggleConsole(): void {
    setIsConsoleVisible((prev) => {
      const next = !prev;
      logAction(
        "SAVE_SETTINGS",
        `Launch console visibility toggled: ${next ? "on" : "off"}`,
      );
      return next;
    });
  }

  return {
    phase,
    isLaunching:
      phase === "precheck" || phase === "updating" || phase === "launching",
    isGameRunning,
    launchProgress,
    launchStatus,
    launchError,
    isConsoleVisible,
    logs,
    consoleScrollRef,
    isDownloading,
    progress,
    onPlay,
    onCloseGame,
    onCancelDownload: cancelDownload,
    onToggleConsole,
  };
}

