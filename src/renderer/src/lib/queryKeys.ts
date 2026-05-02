export const queryKeys = {
  publicNews: (filters: {
    search?: string;
    tagId?: string;
    sortBy?: "createdAt" | "updatedAt" | "title";
    order?: "ASC" | "DESC";
  }) => ["public-news", filters] as const,
  publicChangelog: () => ["public-changelog"] as const,
  serverStatus: () => ["server-status"] as const,
  adminUsers: (filters: {
    search?: string;
    role?: string;
    banned?: boolean;
  }) => ["admin-users", filters] as const,
  adminRoles: () => ["admin-roles"] as const,
  adminStats: () => ["admin-stats"] as const,
  adminNews: (filters: {
    search?: string;
    tagId?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: "createdAt" | "updatedAt" | "title";
    order?: "ASC" | "DESC";
  }) => ["admin-news", filters] as const,
  adminNewsTags: () => ["admin-news-tags"] as const,
  adminChangelog: (filters: {
    fromDate?: string;
    toDate?: string;
    mandatory?: boolean;
    sortBy?: "releaseDate" | "version" | "createdAt";
    order?: "ASC" | "DESC";
  }) => ["admin-changelog", filters] as const,
  appVersion: () => ["app-version"] as const,
  installedVersions: () => ["installed-versions"] as const,
  systemMemory: () => ["system-memory"] as const,
  crashReport: () => ["crash-report"] as const,
};
