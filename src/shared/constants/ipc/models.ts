import type { ApiRole, ApiUser } from "../../../lib/api/admin";
import type { ApiAdminStats } from "../../../lib/api/types";
import type {
  ApiNews,
  ApiCreateNewsDto,
  ApiUpdateNewsDto,
  ApiNewsListPayload,
  ApiNewsTag,
  ApiCreateNewsTagDto,
} from "../../../lib/api/news";
import type {
  GameUpdateOptions,
  GameUpdateResult,
} from "../../distribution/manifest";
import type {
  ApiChangelog,
  ApiCreateChangelogDto,
  ApiUpdateChangelogDto,
} from "../../../lib/api/changelog";



export interface GameLaunchOptions {
  username: string;
  version: string;
  minecraftVersion?: string;
  loader?: "fabric";
  fabricLoaderVersion?: string;
  memory: { min: string; max: string };
  javaPath: string;
  gamePath?: string;
  fullscreen: boolean;
  jvmArgs: string[];
  autoConnect?: {
    address: string;
    password?: string;
  };
}

export type {
  GameUpdateOptions,
  GameUpdateResult,
};

export interface AuthSessionUser {
  id: string;
  username: string;
  email: string;
  roles: Array<{ id: string; name: string }>;
  permissions?: Array<{ id: string; name: string }>;
  emailVerified?: boolean;
  emailVerifiedAt?: string;
  emailVerificationResendAvailableInSeconds?: number;
  isBanned: boolean;
  banReason?: string;
}

export interface AuthEmailVerificationStatus {
  emailVerified: boolean;
  resendAvailableInSeconds: number;
  emailSent: boolean;
  developmentCode?: string;
}

export interface AdminUsersResponse {
  success: boolean;
  data?: ApiUser[] | { data: ApiUser[] };
  error?: string;
}

export interface AdminUserMutationResponse {
  success: boolean;
  data?: ApiUser;
  error?: string;
}

export interface AdminRolesResponse {
  success: boolean;
  data?: ApiRole[];
  error?: string;
}

export interface AdminRoleMutationResponse {
  success: boolean;
  data?: ApiRole;
  error?: string;
}

export interface AdminStatsResponse {
  success: boolean;
  data?: ApiAdminStats;
  error?: string;
}

export interface AdminNewsListResponse {
  success: boolean;
  data?: ApiNews[] | ApiNewsListPayload;
  error?: string;
}

export interface AdminNewsMutationResponse {
  success: boolean;
  data?: ApiNews;
  error?: string;
}

export interface AdminNewsTagsResponse {
  success: boolean;
  data?: ApiNewsTag[];
  error?: string;
}

export interface AdminNewsTagMutationResponse {
  success: boolean;
  data?: ApiNewsTag;
  error?: string;
}

export interface AdminNewsDeleteResponse {
  success: boolean;
  error?: string;
}

export interface AdminChangelogListResponse {
  success: boolean;
  data?: ApiChangelog[];
  error?: string;
}

export interface AdminChangelogMutationResponse {
  success: boolean;
  data?: ApiChangelog;
  error?: string;
}

export interface AdminChangelogDeleteResponse {
  success: boolean;
  error?: string;
}

export type GameProgressPayload =
  | { type: "data"; content: string }
  | {
      type: "progress";
      content: {
        percent?: number;
        status?: string;
        [key: string]: unknown;
      };
    }
  | { type: "state"; content: { phase: "spawned" } }
  | { type: "close"; content: number }
  | { type: "error"; content: string };

export interface LauncherSettings {
  minimizeToTray: boolean;
  gamePath?: string;
  cleanUnknownMods?: boolean;
  packwizDownloadConcurrency?: number;
  discordRPC?: boolean;
  devServerAddress?: string;
  devServerPassword?: string;
  gameServerAddress?: string;
}

export interface UpdateInfoPayload {
  version: string;
  releaseName?: string | null;
  releaseNotes?: string | null;
  releaseDate?: string;
}

export interface IntegrityCheckResult {
  ok: boolean;
  status: "ok" | "skipped" | "offline" | "mismatch" | "error";
  message: string;
  expectedHash?: string;
  actualHash?: string;
}

export interface CrashReportPayload {
  title: string;
  message: string;
  timestamp: string;
}



// Window state interface
export interface WindowState {
  isMinimized: boolean;
  isMaximized: boolean;
  isFullScreen: boolean;
}

export type DownloadStatus =
  | "DOWNLOADING"
  | "EXTRACTING"
  | "VERIFYING"
  | "DONE"
  | "checking"
  | "downloading"
  | "installing"
  | "verifying"
  | "completed"
  | "cancelled"
  | "idle";

export interface JavaDownloadProgressPayload {
  status: DownloadStatus;
  progress?: number;
}

export type {
  ApiRole,
  ApiUser,
  ApiAdminStats,
  ApiNews,
  ApiCreateNewsDto,
  ApiUpdateNewsDto,
  ApiNewsListPayload,
  ApiNewsTag,
  ApiCreateNewsTagDto,
  ApiChangelog,
  ApiCreateChangelogDto,
  ApiUpdateChangelogDto,
};
