import type { RefObject } from "react";
import type { TranslationType } from "../../../../shared/constants/translations";
import type {
  ChangelogItem,
  GameVersion,
  NewsItem,
  AuthUser,
  ServerStatusData,
  DownloadProgress,
} from "../../types";

export interface DashboardScreenResult {
  t: TranslationType;
  user: AuthUser | null;
  serverStatus: ServerStatusData | null;
  selectedVersion: GameVersion | undefined;
  appVersion: string;
  news: NewsItem[];
  newsOrder: "newest" | "oldest";
  setNewsOrder: (order: "newest" | "oldest") => void;
  newsTagFilter: string;
  setNewsTagFilter: (tag: string) => void;
  newsTags: Array<{ id: string; name: string }>;
  changelog: ChangelogItem[];
  contentTab: "news" | "changelog";
  setContentTab: (tab: "news" | "changelog") => void;
  isLoadingNews: boolean;
  isLoadingChangelog: boolean;
  isLoadingMoreChangelog: boolean;
  hasMoreChangelog: boolean;
  isChangelogInitialLoaded: boolean;
  isLoadingMoreNews: boolean;
  hasMoreNews: boolean;
  isNewsInitialLoaded: boolean;
  onLoadMoreNews: () => Promise<void>;
  newsError: string | null;
  changelogError: string | null;
  onLoadMoreChangelog: () => Promise<void>;
  isDownloading: boolean;
  progress: DownloadProgress | null;
  isLaunching: boolean;
  isGameRunning: boolean;
  launchProgress: number | null;
  launchStatus: string;
  launchError: string | null;
  isConsoleVisible: boolean;
  logs: string[];
  consoleScrollRef: RefObject<HTMLDivElement | null>;
  playBlockReason: string | null;
  hasAdminAccess: boolean;
  onPlay: () => Promise<void>;
  onCloseGame: () => Promise<void>;
  onCancelDownload: () => void;
  onToggleConsole: () => void;
  onOpenSettings: () => void;
  onOpenAdminPanel: () => void;
  onLogout: () => Promise<void>;
  selectedNews: NewsItem | null;
  onSelectNews: (news: NewsItem | null) => void;
  onCloseNews: () => void;
  selectedChangelog: ChangelogItem | null;
  onSelectChangelog: (changelog: ChangelogItem | null) => void;
  onCloseChangelog: () => void;
}
