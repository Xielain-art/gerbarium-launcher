import { useRef, useState } from "react";
import { useAdminStatsQuery } from "../../../hooks/queries/useAdminQueries";
import { getErrorMessage } from "../../../lib/queryHelpers";
import { useAdminUsersSection } from "./sections/useAdminUsersSection";
import { useAdminNewsSection } from "./sections/useAdminNewsSection";
import { useAdminChangelogSection } from "./sections/useAdminChangelogSection";

export type AdminTab = "users" | "news" | "changelog" | "stats";

export function useAdminScreenModel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const usersEndRef = useRef<HTMLDivElement>(null);
  const newsEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("users");

  const users = useAdminUsersSection(activeTab, scrollRef, usersEndRef);
  const news = useAdminNewsSection(activeTab, scrollRef, newsEndRef);
  const changelog = useAdminChangelogSection();
  const statsQuery = useAdminStatsQuery();

  const isAdminApiBusy = Boolean(users.vm.actionLoading || news.isNewsBusy || changelog.isChangelogBusy);

  return {
    scrollRef,
    usersEndRef,
    newsEndRef,
    activeTab,
    setActiveTab,
    statsQuery,
    statsError: statsQuery.isError ? getErrorMessage(statsQuery.error, "Failed to fetch admin stats") : null,
    isAdminApiBusy,
    ...users,
    ...news,
    ...changelog,
    newsActionLoadingId: news.isNewsBusy ? "pending" : null,
    changelogActionLoadingId: changelog.isChangelogBusy ? "pending" : null,
  };
}
