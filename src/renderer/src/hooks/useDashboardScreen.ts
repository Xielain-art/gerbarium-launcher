import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useDownloadStore } from "../stores/useDownloadStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useTranslation } from "./useTranslation";
import { ROUTES, LOG_ACTIONS } from "../../../shared/constants/system";

import type { ChangelogItem, GameVersion, NewsItem } from "../types";
import {
  toQueryErrorMessage,
  usePublicChangelogQuery,
  usePublicNewsQuery,
  useServerStatusQuery,
} from "./queries/useContentQueries";
import {
  useAppVersionQuery,
  useInstalledVersionsQuery,
} from "./queries/useSystemQueries";
import { UI_STRINGS } from "../../../shared/constants/ui-strings";


// --- Main Hook ---

import type { DashboardScreenResult } from "./dashboard/types";
import { parseJvmArgs, toErrorMessage, logAction, toLauncherSettingsPatch, INITIAL_VERSIONS, CHANGELOG_PAGE_SIZE } from "./dashboard/utils";

export function useDashboardScreen(): DashboardScreenResult {
  const t = useTranslation();
  const navigate = useNavigate();

  // Stores
  const { user, logout, isAuthenticated } = useAuthStore();
  const { isDownloading, progress, cancelDownload } = useDownloadStore();

  // Local UI State
  const [newsOrder, setNewsOrder] = useState<"newest" | "oldest">("newest");
  const [newsTagFilter, setNewsTagFilter] = useState("all");
  const [versions, setVersions] = useState<GameVersion[]>(INITIAL_VERSIONS);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    INITIAL_VERSIONS[0]?.id ?? null,
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState<number | null>(null);
  const [launchStatus, setLaunchStatus] = useState("");
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [isConsoleVisible, setIsConsoleVisible] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedChangelog, setSelectedChangelog] =
    useState<ChangelogItem | null>(null);
  const [contentTab, setContentTab] = useState<"news" | "changelog">("news");
  const [changelogPage, setChangelogPage] = useState(1);

  // Refs
  const closeOnLaunchRequestedRef = useRef(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const newsQuery = usePublicNewsQuery({
    tagId: newsTagFilter === "all" ? undefined : newsTagFilter,
    sortBy: "createdAt",
    order: newsOrder === "newest" ? "DESC" : "ASC",
  });
  const changelogQuery = usePublicChangelogQuery();
  const serverStatusQuery = useServerStatusQuery();
  const appVersionQuery = useAppVersionQuery();
  const installedVersionsQuery = useInstalledVersionsQuery();

  // Derived Data
  const selectedVersion = versions.find(
    (version) => version.id === selectedVersionId,
  );
  const hasAdminAccess = Boolean(
    user?.roles?.some((role) => role.name === "admin") ||
      user?.permissions?.some((permission) => permission.name === "admin"),
  );
  const banReason = user?.banReason?.trim();
  const playBlockReason = user?.isBanned
    ? `You are banned${banReason ? `: ${banReason}` : "."}`
    : null;

  const news = useMemo(() => newsQuery.data?.items ?? [], [newsQuery.data]);
  const newsTags = useMemo(() => {
    const tagsMap = new Map<string, string>();
    for (const item of news) {
      const names = item.tags ?? [];
      const ids = item.tagIds ?? [];
      for (let i = 0; i < names.length; i += 1) {
        const id = ids[i]?.trim();
        const name = names[i]?.trim();
        if (id && name) {
          tagsMap.set(id, name);
        }
      }
    }
    return Array.from(tagsMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }, [news]);

  const changelogItems = useMemo(
    () => changelogQuery.data ?? [],
    [changelogQuery.data],
  );
  const changelog = changelogItems.slice(0, changelogPage * CHANGELOG_PAGE_SIZE);
  const hasMoreChangelog = changelog.length < changelogItems.length;

  const newsError = newsQuery.isError
    ? toQueryErrorMessage(newsQuery.error, UI_STRINGS.STORE_ERRORS.NEWS_LOAD)
    : null;
  const changelogError = changelogQuery.isError
    ? toQueryErrorMessage(
        changelogQuery.error,
        UI_STRINGS.STORE_ERRORS.NEWS_LOAD,
      )
    : null;

  // --- Effects ---

  // Update installed versions
  useEffect(() => {
    if (!installedVersionsQuery.data) {
      return;
    }
    setVersions((prev) =>
      prev.map((version) => ({
        ...version,
        isInstalled: installedVersionsQuery.data.includes(
          version.version || version.id,
        ),
      })),
    );
  }, [installedVersionsQuery.data]);

  // Scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Handle Game Process IPC Events
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

  // Protect route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: ROUTES.LOGIN });
    }
  }, [isAuthenticated, navigate]);

  // Sync settings with main process
  useEffect(() => {
    if (!window.electronAPI) {
      return;
    }
    const currentSettings = useSettingsStore.getState().general;
    window.electronAPI.system?.sendSettingsUpdate?.(
      toLauncherSettingsPatch(currentSettings),
    );
  }, []);

  // Reset changelog pagination when items change
  useEffect(() => {
    setChangelogPage(1);
  }, [changelogItems]);

  // --- Handlers ---

  async function onPlay(): Promise<void> {
    if (playBlockReason) {
      setLaunchError(playBlockReason);
      return;
    }
    if (!selectedVersion) {
      setLaunchError(t.DASHBOARD.SELECT_VERSION_ALERT);
      return;
    }
    if (!user?.username) {
      setLaunchError("User is not logged in.");
      return;
    }

    setLaunchError(null);
    setIsLaunching(true);
    setLaunchProgress(0);
    setLaunchStatus("Preparing...");
    setLogs([]);
    logAction("GAME_LAUNCH_START", selectedVersion.name);

    try {
      const installedJava = await window.electronAPI.java.getInstalledJava();
      const bestJava =
        installedJava.find((javaItem) => javaItem.version >= 17) ??
        installedJava[0];

      let javaPath: string | null | undefined = bestJava?.path;
      if (!javaPath) {
        javaPath = await window.electronAPI.java.findSystemJava();
      }

      if (!javaPath) {
        throw new Error("Java not found. Install Java in settings.");
      }

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

      if (!result.success) {
        throw new Error(result.error || "Game launch failed.");
      }

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
  }

  function onOpenSettings(): void {
    navigate({ to: ROUTES.SETTINGS });
  }

  function onOpenAdminPanel(): void {
    if (!hasAdminAccess) {
      setLaunchError("Access denied.");
      logAction("ADMIN_PANEL_ACCESS_DENIED", user?.username || "unknown");
      return;
    }
    navigate({ to: ROUTES.ADMIN });
  }

  async function onLogout(): Promise<void> {
    await logout();
    navigate({ to: ROUTES.LOGIN });
  }

  function onToggleConsole(): void {
    setIsConsoleVisible((prev) => {
      const next = !prev;
      logAction(
        LOG_ACTIONS.SAVE_SETTINGS,
        `Launch console visibility toggled: ${next ? "on" : "off"}`,
      );
      return next;
    });
  }

  return {
    t,
    user,
    serverStatus: serverStatusQuery.data ?? null,
    versions,
    selectedVersionId,
    setSelectedVersionId,
    selectedVersion,
    appVersion: appVersionQuery.data ?? "",
    news,
    newsOrder,
    setNewsOrder,
    newsTagFilter,
    setNewsTagFilter,
    newsTags,
    changelog,
    contentTab,
    setContentTab,
    isLoadingNews: newsQuery.isLoading,
    isLoadingChangelog: changelogQuery.isLoading,
    isLoadingMoreChangelog: false,
    hasMoreChangelog,
    isChangelogInitialLoaded: changelogQuery.isFetched,
    isLoadingMoreNews: newsQuery.isFetchingNextPage,
    hasMoreNews: Boolean(newsQuery.hasNextPage),
    isNewsInitialLoaded: newsQuery.isFetched,
    onLoadMoreNews: async () => {
      await newsQuery.fetchNextPage();
    },
    newsError,
    changelogError,
    onLoadMoreChangelog: async () => {
      setChangelogPage((prev) => prev + 1);
    },
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
    hasAdminAccess,
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

