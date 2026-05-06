export const queryKeys = {
  publicNewsRoot: () => ["public-news"] as const,
  publicNews: (filters: {
    search?: string;
    tagId?: string;
    sortBy?: "createdAt" | "updatedAt" | "title";
    order?: "ASC" | "DESC";
  }) => [...queryKeys.publicNewsRoot(), filters] as const,
  publicChangelog: () => ["public-changelog"] as const,
  serverStatus: () => ["server-status"] as const,
  adminUsersRoot: () => ["admin-users"] as const,
  adminUsers: (filters: {
    search?: string;
    page?: number;
    role?: string;
    banned?: boolean;
  }) => [...queryKeys.adminUsersRoot(), filters] as const,
  adminRoles: () => ["admin-roles"] as const,
  adminStats: () => ["admin-stats"] as const,
  adminNewsRoot: () => ["admin-news"] as const,
  adminNews: (filters: {
    search?: string;
    tagId?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: "createdAt" | "updatedAt" | "title";
    order?: "ASC" | "DESC";
  }) => [...queryKeys.adminNewsRoot(), filters] as const,
  adminNewsTags: () => ["admin-news-tags"] as const,
  adminChangelogRoot: () => ["admin-changelog"] as const,
  adminChangelog: (filters: {
    fromDate?: string;
    toDate?: string;
    mandatory?: boolean;
    sortBy?: "releaseDate" | "version" | "createdAt";
    order?: "ASC" | "DESC";
  }) => [...queryKeys.adminChangelogRoot(), filters] as const,
  appVersion: () => ["app-version"] as const,
  installedVersions: (gamePath?: string) =>
    ["installed-versions", gamePath ?? "default"] as const,
  systemMemory: () => ["system-memory"] as const,
  crashReport: () => ["crash-report"] as const,
};
