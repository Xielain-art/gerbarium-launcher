import type { UseQueryResult } from "@tanstack/react-query";
import type { ApiAdminStats, ApiChangelog, ApiNews } from "../../../../../lib/api/admin";
import { useAdminUsersSection } from "./sections/useAdminUsersSection";
import { useAdminNewsSection } from "./sections/useAdminNewsSection";
import { useAdminChangelogSection } from "./sections/useAdminChangelogSection";

export type AdminTab = "users" | "news" | "changelog" | "stats";

type UsersSection = ReturnType<typeof useAdminUsersSection>;
type NewsSection = ReturnType<typeof useAdminNewsSection>;
type ChangelogSection = ReturnType<typeof useAdminChangelogSection>;

export interface AdminBaseModel {
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
}

export interface AdminUsersModel {
  vm: UsersSection["vm"];
  userSearchInput: UsersSection["userSearchInput"];
  setUserSearchInput: UsersSection["setUserSearchInput"];
  userRoleFilter: UsersSection["userRoleFilter"];
  setUserRoleFilter: UsersSection["setUserRoleFilter"];
  userBanFilter: UsersSection["userBanFilter"];
  setUserBanFilter: UsersSection["setUserBanFilter"];
  newRoleName: UsersSection["newRoleName"];
  setNewRoleName: UsersSection["setNewRoleName"];
  newRoleDescription: UsersSection["newRoleDescription"];
  setNewRoleDescription: UsersSection["setNewRoleDescription"];
  roleFormError: UsersSection["roleFormError"];
  roleSearchQuery: UsersSection["roleSearchQuery"];
  setRoleSearchQuery: UsersSection["setRoleSearchQuery"];
  isApplyingUserFilters: UsersSection["isApplyingUserFilters"];
  handleConfirmBan: UsersSection["handleConfirmBan"];
  handleConfirmUnban: UsersSection["handleConfirmUnban"];
  handleSaveRoles: UsersSection["handleSaveRoles"];
  handleCreateRole: UsersSection["handleCreateRole"];
  handleUpdateRole: UsersSection["handleUpdateRole"];
  editingRole: UsersSection["editingRole"];
  setEditingRole: UsersSection["setEditingRole"];
  currentPage: UsersSection["currentPage"];
  totalPages: UsersSection["totalPages"];
  setPage: UsersSection["setPage"];
}

export interface AdminNewsModel {
  newsTab: NewsSection["newsTab"];
  setNewsTab: NewsSection["setNewsTab"];
  newsSearch: NewsSection["newsSearch"];
  setNewsSearch: NewsSection["setNewsSearch"];
  newsTag: NewsSection["newsTag"];
  setNewsTag: NewsSection["setNewsTag"];
  newsFromDate: NewsSection["newsFromDate"];
  setNewsFromDate: NewsSection["setNewsFromDate"];
  newsToDate: NewsSection["newsToDate"];
  setNewsToDate: NewsSection["setNewsToDate"];
  newsSortDraft: NewsSection["newsSortDraft"];
  setNewsSortDraft: NewsSection["setNewsSortDraft"];
  newsOrderDraft: NewsSection["newsOrderDraft"];
  setNewsOrderDraft: NewsSection["setNewsOrderDraft"];
  editingNews: NewsSection["editingNews"];
  newsTitle: NewsSection["newsTitle"];
  setNewsTitle: NewsSection["setNewsTitle"];
  newsSlug: NewsSection["newsSlug"];
  setNewsSlug: NewsSection["setNewsSlug"];
  newsImage: NewsSection["newsImage"];
  setNewsImage: NewsSection["setNewsImage"];
  selectedNewsTagIds: NewsSection["selectedNewsTagIds"];
  setSelectedNewsTagIds: NewsSection["setSelectedNewsTagIds"];
  newNewsTagName: NewsSection["newNewsTagName"];
  setNewNewsTagName: NewsSection["setNewNewsTagName"];
  newsContentHtml: NewsSection["newsContentHtml"];
  setNewsContentHtml: NewsSection["setNewsContentHtml"];
  newsFormError: NewsSection["newsFormError"];
  newsTagFormError: NewsSection["newsTagFormError"];
  editingTagId: NewsSection["editingTagId"];
  setEditingTagId: NewsSection["setEditingTagId"];
  editingTagName: NewsSection["editingTagName"];
  setEditingTagName: NewsSection["setEditingTagName"];
  news: NewsSection["news"];
  newsTags: NewsSection["newsTags"];
  filteredNewsTags: NewsSection["filteredNewsTags"];
  isLoadingNews: NewsSection["isLoadingNews"];
  isLoadingMoreNews: NewsSection["isLoadingMoreNews"];
  isLoadingNewsTags: NewsSection["isLoadingNewsTags"];
  isApplyingNewsFilters: NewsSection["isApplyingNewsFilters"];
  isNewsBusy: NewsSection["isNewsBusy"];
  resetNewsForm: NewsSection["resetNewsForm"];
  startEditNews: (item: ApiNews) => void;
  handleCreateNews: NewsSection["handleCreateNews"];
  handleUpdateNews: NewsSection["handleUpdateNews"];
  handleDeleteNews: NewsSection["handleDeleteNews"];
  handleCreateNewsTag: NewsSection["handleCreateNewsTag"];
  handleUpdateNewsTag: NewsSection["handleUpdateNewsTag"];
  handleDeleteNewsTag: NewsSection["handleDeleteNewsTag"];
  newsFormValidation: NewsSection["newsFormValidation"];
  newsTagValidation: NewsSection["newsTagValidation"];
}

export interface AdminChangelogModel {
  changelogTab: ChangelogSection["changelogTab"];
  setChangelogTab: ChangelogSection["setChangelogTab"];
  editingChangelog: ChangelogSection["editingChangelog"];
  previewChangelog: ChangelogSection["previewChangelog"];
  setPreviewChangelog: ChangelogSection["setPreviewChangelog"];
  changelogVersion: ChangelogSection["changelogVersion"];
  setChangelogVersion: ChangelogSection["setChangelogVersion"];
  changelogReleaseDate: ChangelogSection["changelogReleaseDate"];
  setChangelogReleaseDate: ChangelogSection["setChangelogReleaseDate"];
  changelogDownloadUrl: ChangelogSection["changelogDownloadUrl"];
  setChangelogDownloadUrl: ChangelogSection["setChangelogDownloadUrl"];
  changelogChangesInput: ChangelogSection["changelogChangesInput"];
  setChangelogChangesInput: ChangelogSection["setChangelogChangesInput"];
  changelogMandatory: ChangelogSection["changelogMandatory"];
  setChangelogMandatory: ChangelogSection["setChangelogMandatory"];
  changelogFormError: ChangelogSection["changelogFormError"];
  changelogFromDate: ChangelogSection["changelogFromDate"];
  setChangelogFromDate: ChangelogSection["setChangelogFromDate"];
  changelogToDate: ChangelogSection["changelogToDate"];
  setChangelogToDate: ChangelogSection["setChangelogToDate"];
  changelogSortDraft: ChangelogSection["changelogSortDraft"];
  setChangelogSortDraft: ChangelogSection["setChangelogSortDraft"];
  changelogOrderDraft: ChangelogSection["changelogOrderDraft"];
  setChangelogOrderDraft: ChangelogSection["setChangelogOrderDraft"];
  changelogMandatoryDraft: ChangelogSection["changelogMandatoryDraft"];
  setChangelogMandatoryDraft: ChangelogSection["setChangelogMandatoryDraft"];
  changelog: ChangelogSection["changelog"];
  changelogError: ChangelogSection["changelogError"];
  isChangelogBusy: ChangelogSection["isChangelogBusy"];
  resetChangelogForm: ChangelogSection["resetChangelogForm"];
  startEditChangelog: (item: ApiChangelog) => void;
  handleCreateChangelog: ChangelogSection["handleCreateChangelog"];
  handleUpdateChangelog: ChangelogSection["handleUpdateChangelog"];
  handleDeleteChangelog: ChangelogSection["handleDeleteChangelog"];
}

export type AdminScreenModel =
  & AdminBaseModel
  & AdminUsersModel
  & AdminNewsModel
  & AdminChangelogModel;
