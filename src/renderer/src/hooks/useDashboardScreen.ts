import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useTranslation } from "./useTranslation";
import { ROUTES } from "../../../shared/constants/system";

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
import { logAction, toLauncherSettingsPatch, INITIAL_VERSIONS, CHANGELOG_PAGE_SIZE, isVersionInstalled } from "./dashboard/utils";
import { useGameLaunchFlow } from "./dashboard/useGameLaunchFlow";

export function useDashboardScreen(): DashboardScreenResult {
  const t = useTranslation();
  const navigate = useNavigate();

  // Stores
  const { user, logout, isAuthenticated } = useAuthStore();
  const gamePath = useSettingsStore((state) => state.general.gamePath);

  // Local UI State
  const [newsOrder, setNewsOrder] = useState<"newest" | "oldest">("newest");
  const [newsTagFilter, setNewsTagFilter] = useState("all");
  const [versions, setVersions] = useState<GameVersion[]>(INITIAL_VERSIONS);
  const [selectedVersionId] = useState<string | null>(
    INITIAL_VERSIONS[0]?.id ?? null,
  );
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedChangelog, setSelectedChangelog] =
    useState<ChangelogItem | null>(null);
  const [contentTab, setContentTab] = useState<"news" | "changelog">("news");
  const [changelogPage, setChangelogPage] = useState(1);

  // Queries
  const newsQuery = usePublicNewsQuery({
    tagId: newsTagFilter === "all" ? undefined : newsTagFilter,
    sortBy: "createdAt",
    order: newsOrder === "newest" ? "DESC" : "ASC",
  });
  const changelogQuery = usePublicChangelogQuery();
  const serverStatusQuery = useServerStatusQuery();
  const appVersionQuery = useAppVersionQuery();
  const installedVersionsQuery = useInstalledVersionsQuery(gamePath);

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
  const launchFlow = useGameLaunchFlow({
    user,
    selectedVersion,
    playBlockReason,
    selectVersionAlert: t.DASHBOARD.SELECT_VERSION_ALERT,
  });

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
        isInstalled: isVersionInstalled(version, installedVersionsQuery.data),
      })),
    );
  }, [installedVersionsQuery.data]);

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

  return {
    t,
    user,
    serverStatus: serverStatusQuery.data ?? null,
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
    isDownloading: launchFlow.isDownloading,
    progress: launchFlow.progress,
    isLaunching: launchFlow.isLaunching,
    isGameRunning: launchFlow.isGameRunning,
    launchProgress: launchFlow.launchProgress,
    launchStatus: launchFlow.launchStatus,
    launchPhase: launchFlow.phase,
    launchError: launchFlow.launchError,
    isConsoleVisible: launchFlow.isConsoleVisible,
    logs: launchFlow.logs,
    consoleScrollRef: launchFlow.consoleScrollRef,
    playBlockReason,
    hasAdminAccess,
    onPlay: launchFlow.onPlay,
    onCloseGame: launchFlow.onCloseGame,
    onCancelDownload: launchFlow.onCancelDownload,
    onToggleConsole: launchFlow.onToggleConsole,
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
