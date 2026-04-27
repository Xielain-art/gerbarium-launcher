import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useDownloadStore } from "../stores/useDownloadStore";
import { useNewsStore } from "../stores/useNewsStore";
import { useChangelogStore } from "../stores/useChangelogStore";
import { useServerStatusStore } from "../stores/useServerStatusStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useTranslation } from "./useTranslation";
import { ROUTES, LOG_ACTIONS } from "../../../shared/constants/system";
import type { LauncherSettings } from "../../../shared/constants/ipc-chanels";
import type { ChangelogItem, GameVersion, NewsItem } from "../types";

const INITIAL_VERSIONS: GameVersion[] = [
  { id: "gerbarium-1.2", name: "Gerbarium v1.2", type: "gerbarium", isInstalled: false, version: "1.20.4" },
  { id: "fabric-1.21", name: "Fabric 1.21", type: "fabric", isInstalled: false, version: "1.21" },
  { id: "forge-1.20.1", name: "Forge 1.20.1", type: "forge", isInstalled: false, version: "1.20.1" },
  { id: "vanilla-1.21.4", name: "Vanilla 1.21.4", type: "vanilla", isInstalled: true, version: "1.21.4" },
];

const parseJvmArgs = (jvmArgsText: string): string[] =>
  jvmArgsText.split(/\s+/).map((arg) => arg.trim()).filter(Boolean);

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Unknown error";

const logAction = (action: string, details?: string): void => {
  void window.electronAPI?.system.logAction(action, details);
};

const toLauncherSettingsPatch = (
  settings: { minimizeToTray: boolean; gamePath?: string },
): Partial<LauncherSettings> => ({
  minimizeToTray: settings.minimizeToTray,
  gamePath: settings.gamePath,
});

export function useDashboardScreen() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { isDownloading, progress, cancelDownload } = useDownloadStore();
  const {
    items: news,
    isLoading: isLoadingNews,
    isLoadingMore: isLoadingMoreNews,
    hasMore: hasMoreNews,
    isInitialLoaded: isNewsInitialLoaded,
    fetchNews,
    fetchMoreNews,
    error: newsError,
  } = useNewsStore();
  const { data: serverStatus } = useServerStatusStore();
  const {
    items: changelog,
    isLoading: isLoadingChangelog,
    isLoadingMore: isLoadingMoreChangelog,
    hasMore: hasMoreChangelog,
    isInitialLoaded: isChangelogInitialLoaded,
    error: changelogError,
    fetchChangelog,
    fetchMoreChangelog,
  } = useChangelogStore();

  const [versions, setVersions] = useState<GameVersion[]>(INITIAL_VERSIONS);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    INITIAL_VERSIONS[0]?.id ?? null,
  );
  const selectedVersion = versions.find((v) => v.id === selectedVersionId);
  const [appVersion, setAppVersion] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState<number | null>(null);
  const [launchStatus, setLaunchStatus] = useState("");
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [isConsoleVisible, setIsConsoleVisible] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedChangelog, setSelectedChangelog] = useState<ChangelogItem | null>(null);
  const [contentTab, setContentTab] = useState<"news" | "changelog">("news");
  const closeOnLaunchRequestedRef = useRef(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const banReason = user?.banReason?.trim();
  const playBlockReason = user?.isBanned
    ? `You are banned${banReason ? `: ${banReason}` : "."}`
    : null;

  useEffect(() => {
    if (!window.electronAPI?.game) return;
    void window.electronAPI.game
      .getInstalledVersions()
      .then((installed) => {
        setVersions((prev) =>
          prev.map((version) => ({
            ...version,
            isInstalled: installed.includes(version.version || version.id),
          })),
        );
      })
      .catch(() => setLaunchError("Failed to fetch installed game versions."));
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (!window.electronAPI?.game) return;
    const unsubscribe = window.electronAPI.game.onProgress((data) => {
      if (data.type === "progress") {
        const percent = data.content.percent;
        if (typeof percent === "number" && Number.isFinite(percent)) {
          setLaunchProgress(Math.max(0, Math.min(100, percent)));
        }
        if (typeof data.content.status === "string" && data.content.status.trim()) {
          setLaunchStatus(data.content.status.trim());
        }
        return;
      }
      if (data.type === "data") {
        setLogs((prev) => [...prev, data.content]);
        return;
      }
      if (data.type === "state" && data.content.phase === "spawned") {
        setLaunchProgress(100);
        setLaunchStatus("Running...");
        logAction("GAME_PROCESS_SPAWNED", "Spawn event received");
        if (closeOnLaunchRequestedRef.current) {
          if (useSettingsStore.getState().general.minimizeToTray) {
            void window.electronAPI.closeWindow();
          } else {
            void window.electronAPI.minimizeWindow();
          }
        }
        return;
      }
      if (data.type === "close") {
        setIsLaunching(false);
        setLaunchProgress(null);
        setLaunchStatus("");
        closeOnLaunchRequestedRef.current = false;
        logAction("GAME_PROCESS_CLOSED", "Game process exited");
        return;
      }
      if (data.type === "error") {
        setIsLaunching(false);
        setLaunchProgress(null);
        setLaunchStatus("");
        setLaunchError(`Launch error: ${data.content}`);
        closeOnLaunchRequestedRef.current = false;
        logAction("GAME_LAUNCH_ERROR", data.content);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) navigate({ to: ROUTES.LOGIN });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!window.electronAPI) return;
    void window.electronAPI.getAppVersion().then(setAppVersion);
    const currentSettings = useSettingsStore.getState().general;
    window.electronAPI.system?.sendSettingsUpdate?.(
      toLauncherSettingsPatch(currentSettings),
    );
    void fetchNews();
    void fetchChangelog();
  }, []);

  const onPlay = async () => {
    if (playBlockReason) return setLaunchError(playBlockReason);
    if (!selectedVersion) return setLaunchError(t.DASHBOARD.SELECT_VERSION_ALERT);
    if (!user?.username) return setLaunchError("User is not logged in.");

    setLaunchError(null);
    setIsLaunching(true);
    setLaunchProgress(0);
    setLaunchStatus("Preparing...");
    setLogs([]);
    logAction("GAME_LAUNCH_START", selectedVersion.name);

    try {
      const installedJava = await window.electronAPI.java.getInstalledJava();
      const bestJava = installedJava.find((j) => j.version >= 17) || installedJava[0];
      let javaPath: string | null | undefined = bestJava?.path;
      if (!javaPath) javaPath = await window.electronAPI.java.findSystemJava();
      if (!javaPath) throw new Error("Java not found. Install Java in settings.");

      const settings = useSettingsStore.getState().general;
      closeOnLaunchRequestedRef.current = settings.closeOnLaunch;
      setIsConsoleVisible(settings.showLaunchConsole);

      const result = await window.electronAPI.game.launch({
        username: user.username,
        version: selectedVersion.version || selectedVersion.id,
        memory: {
          min: `${Math.max(1, Math.floor(settings.ramAllocation / 2))}G`,
          max: `${Math.max(1, settings.ramAllocation)}G`,
        },
        javaPath,
        gamePath: settings.gamePath,
        fullscreen: settings.fullscreen,
        jvmArgs: parseJvmArgs(settings.jvmArgs),
      });
      if (!result.success) throw new Error(result.error || "Game launch failed.");
      setLaunchStatus("Starting game process...");
      setLaunchProgress(95);
      logAction("GAME_LAUNCH_REQUESTED", selectedVersion.name);
    } catch (error: unknown) {
      const message = toErrorMessage(error);
      setIsLaunching(false);
      setLaunchProgress(null);
      setLaunchStatus("");
      setLaunchError(`Launch error: ${message}`);
      closeOnLaunchRequestedRef.current = false;
      logAction("GAME_LAUNCH_ERROR", message);
    }
  };

  const onOpenSettings = () => navigate({ to: ROUTES.SETTINGS });
  const onOpenAdminPanel = () => navigate({ to: ROUTES.ADMIN });
  const onLogout = async () => {
    await logout();
    navigate({ to: ROUTES.LOGIN });
  };
  const onToggleConsole = () => {
    setIsConsoleVisible((prev) => {
      const next = !prev;
      logAction(
        LOG_ACTIONS.SAVE_SETTINGS,
        `Launch console visibility toggled: ${next ? "on" : "off"}`,
      );
      return next;
    });
  };

  return {
    t,
    user,
    serverStatus,
    versions,
    selectedVersionId,
    setSelectedVersionId,
    selectedVersion,
    appVersion,
    news,
    changelog,
    contentTab,
    setContentTab,
    isLoadingNews,
    isLoadingChangelog,
    isLoadingMoreChangelog,
    hasMoreChangelog,
    isChangelogInitialLoaded,
    isLoadingMoreNews,
    hasMoreNews,
    isNewsInitialLoaded,
    onLoadMoreNews: fetchMoreNews,
    newsError,
    changelogError,
    onLoadMoreChangelog: fetchMoreChangelog,
    isDownloading,
    progress,
    isLaunching,
    launchProgress,
    launchStatus,
    launchError,
    isConsoleVisible,
    logs,
    logsEndRef,
    playBlockReason,
    onPlay,
    onCancelDownload: cancelDownload,
    onToggleConsole,
    onOpenSettings,
    onOpenAdminPanel,
    onLogout,
    selectedNews,
    onSelectNews: setSelectedNews,
    onCloseNews: () => setSelectedNews(null),
    selectedChangelog,
    onSelectChangelog: setSelectedChangelog,
    onCloseChangelog: () => setSelectedChangelog(null),
  };
}
