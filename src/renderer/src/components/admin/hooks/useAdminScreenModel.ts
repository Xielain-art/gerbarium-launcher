import { useRef, useState } from "react";
import { useAdminStatsQuery } from "../../../hooks/queries/useAdminQueries";
import { getErrorMessage } from "../../../lib/queryHelpers";
import { useAdminUsersSection } from "./sections/useAdminUsersSection";
import { useAdminNewsSection } from "./sections/useAdminNewsSection";
import { useAdminChangelogSection } from "./sections/useAdminChangelogSection";
import type { UseQueryResult } from "@tanstack/react-query";
import type { ApiAdminStats } from "../../../../lib/api/admin";

export type AdminTab = "users" | "news" | "changelog" | "stats";

export interface AdminScreenModel {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  usersEndRef: React.RefObject<HTMLDivElement | null>;
  newsEndRef: React.RefObject<HTMLDivElement | null>;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  statsQuery: UseQueryResult<ApiAdminStats, Error>;
  statsError: string | null;
  isAdminApiBusy: boolean;
  newsActionLoadingId: string | null;
  changelogActionLoadingId: string | null;
  // Spread from sections
  vm: ReturnType<typeof useAdminUsersSection>["vm"];
  userSearchInput: string;
  setUserSearchInput: (v: string) => void;
  userRoleFilter: string;
  setUserRoleFilter: (v: string) => void;
  userBanFilter: "all" | "banned" | "active";
  setUserBanFilter: (v: "all" | "banned" | "active") => void;
  newRoleName: string;
  setNewRoleName: (v: string) => void;
  newRoleDescription: string;
  setNewRoleDescription: (v: string) => void;
  roleFormError: string | null;
  roleSearchQuery: string;
  setRoleSearchQuery: (v: string) => void;
  isApplyingUserFilters: boolean;
  handleConfirmBan: () => Promise<void>;
  handleConfirmUnban: () => Promise<void>;
  handleSaveRoles: () => Promise<void>;
  handleCreateRole: () => Promise<void>;
  newsTab: ReturnType<typeof useAdminNewsSection>["newsTab"];
  setNewsTab: ReturnType<typeof useAdminNewsSection>["setNewsTab"];
  newsSearch: string;
  setNewsSearch: (v: string) => void;
  newsTag: string;
  setNewsTag: (v: string) => void;
  newsFromDate: string;
  setNewsFromDate: (v: string) => void;
  newsToDate: string;
  setNewsToDate: (v: string) => void;
  newsSortDraft: ReturnType<typeof useAdminNewsSection>["newsSortDraft"];
  setNewsSortDraft: (v: string) => void;
  newsOrderDraft: ReturnType<typeof useAdminNewsSection>["newsOrderDraft"];
  setNewsOrderDraft: (v: string) => void;
  editingNews: ReturnType<typeof useAdminNewsSection>["editingNews"];
  newsTitle: string;
  setNewsTitle: (v: string) => void;
  newsSlug: string;
  setNewsSlug: (v: string) => void;
  newsImage: string;
  setNewsImage: (v: string) => void;
  selectedNewsTagIds: string[];
  setSelectedNewsTagIds: (v: string[]) => void;
  newNewsTagName: string;
  setNewNewsTagName: (v: string) => void;
  newsContentHtml: string;
  setNewsContentHtml: (v: string) => void;
  newsFormError: string | null;
  newsTagFormError: string | null;
  editingTagId: string | null;
  setEditingTagId: (v: string | null) => void;
  editingTagName: string;
  setEditingTagName: (v: string) => void;
  news: ReturnType<typeof useAdminNewsSection>["news"];
  newsTags: ReturnType<typeof useAdminNewsSection>["newsTags"];
  filteredNewsTags: ReturnType<typeof useAdminNewsSection>["filteredNewsTags"];
  isLoadingNews: boolean;
  isLoadingMoreNews: boolean;
  isLoadingNewsTags: boolean;
  isApplyingNewsFilters: boolean;
  isNewsBusy: boolean;
  resetNewsForm: () => void;
  startEditNews: (item: ApiNews) => void;
  handleCreateNews: () => Promise<void>;
  handleUpdateNews: () => Promise<void>;
  handleDeleteNews: (id: string) => Promise<void>;
  handleCreateNewsTag: () => Promise<void>;
  handleUpdateNewsTag: () => Promise<void>;
  handleDeleteNewsTag: (id: string) => Promise<void>;
  changelogTab: ReturnType<typeof useAdminChangelogSection>["changelogTab"];
  setChangelogTab: ReturnType<typeof useAdminChangelogSection>["setChangelogTab"];
  editingChangelog: ReturnType<typeof useAdminChangelogSection>["editingChangelog"];
  previewChangelog: ReturnType<typeof useAdminChangelogSection>["previewChangelog"];
  setPreviewChangelog: ReturnType<typeof useAdminChangelogSection>["setPreviewChangelog"];
  changelogVersion: string;
  setChangelogVersion: (v: string) => void;
  changelogReleaseDate: string;
  setChangelogReleaseDate: (v: string) => void;
  changelogDownloadUrl: string;
  setChangelogDownloadUrl: (v: string) => void;
  changelogChangesInput: string;
  setChangelogChangesInput: (v: string) => void;
  changelogMandatory: boolean;
  setChangelogMandatory: React.Dispatch<React.SetStateAction<boolean>>;
  changelogFormError: string | null;
  changelogFromDate: string;
  setChangelogFromDate: (v: string) => void;
  changelogToDate: string;
  setChangelogToDate: (v: string) => void;
  changelogSortDraft: ReturnType<typeof useAdminChangelogSection>["changelogSortDraft"];
  setChangelogSortDraft: (v: string) => void;
  changelogOrderDraft: ReturnType<typeof useAdminChangelogSection>["changelogOrderDraft"];
  setChangelogOrderDraft: (v: string) => void;
  changelogMandatoryDraft: ReturnType<typeof useAdminChangelogSection>["changelogMandatoryDraft"];
  setChangelogMandatoryDraft: (v: "all" | "mandatory" | "optional") => void;
  changelog: ReturnType<typeof useAdminChangelogSection>["changelog"];
  changelogError: string | null;
  isChangelogBusy: boolean;
  resetChangelogForm: () => void;
  startEditChangelog: (item: ApiChangelog) => void;
  handleCreateChangelog: () => Promise<void>;
  handleUpdateChangelog: () => Promise<void>;
  handleDeleteChangelog: (id: string) => Promise<void>;

  newsFormValidation: ReturnType<typeof useAdminNewsSection>["newsFormValidation"];
  newsTagValidation: ReturnType<typeof useAdminNewsSection>["newsTagValidation"];
}

export function useAdminScreenModel(): AdminScreenModel {
  const scrollRef = useRef<HTMLDivElement>(null);
  const usersEndRef = useRef<HTMLDivElement>(null);
  const newsEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("users");

  const users = useAdminUsersSection(activeTab, scrollRef, usersEndRef);
  const news = useAdminNewsSection(activeTab, scrollRef, newsEndRef);
  const changelog = useAdminChangelogSection();
  const statsQuery = useAdminStatsQuery();

  const isAdminApiBusy = Boolean(
    users.vm.actionLoading || news.isNewsBusy || changelog.isChangelogBusy,
  );

  return {
    scrollRef,
    usersEndRef,
    newsEndRef,
    activeTab,
    setActiveTab,
    statsQuery,
    statsError: statsQuery.isError
      ? getErrorMessage(statsQuery.error, "Failed to fetch admin stats")
      : null,
    isAdminApiBusy,
    ...users,
    currentPage: users.currentPage,
    totalPages: users.totalPages,
    setPage: users.setPage,
    ...news,
    ...changelog,
    newsActionLoadingId: news.isNewsBusy ? "pending" : null,
    changelogActionLoadingId: changelog.isChangelogBusy ? "pending" : null,
  };
}

