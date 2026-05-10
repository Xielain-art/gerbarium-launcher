import { AdminStatsPanel } from "../AdminStatsPanel";
import { AdminUsersTab } from "../tabs/AdminUsersTab";
import { AdminNewsTab } from "../tabs/AdminNewsTab";
import { AdminChangelogTab } from "../tabs/AdminChangelogTab";
import type { AdminScreenModel } from "../hooks/useAdminScreenModel";

interface AdminScreenContentProps {
  model: AdminScreenModel;
}

export function AdminScreenContent({ model }: AdminScreenContentProps): React.JSX.Element {
  const {
    activeTab,
    vm,
    usersEndRef,
    newsEndRef,
    isApplyingUserFilters,
    isAdminApiBusy,
    userSearchInput,
    setUserSearchInput,
    userRoleFilter,
    setUserRoleFilter,
    userBanFilter,
    setUserBanFilter,
    newRoleName,
    setNewRoleName,
    newRoleDescription,
    setNewRoleDescription,
    roleFormError,
    roleSearchQuery,
    setRoleSearchQuery,
    handleConfirmBan,
    handleConfirmUnban,
    handleSaveRoles,
    handleCreateRole,
    newsFormValidation,
    newsTagValidation,
    newsTab,
    setNewsTab,
    news,
    newsTags,
    isLoadingNews,
    isLoadingMoreNews,
    isApplyingNewsFilters,
    newsSearch,
    setNewsSearch,
    newsTag,
    setNewsTag,
    newsSortDraft,
    setNewsSortDraft,
    newsOrderDraft,
    setNewsOrderDraft,
    newsFromDate,
    setNewsFromDate,
    newsToDate,
    setNewsToDate,
    editingNews,
    resetNewsForm,
    startEditNews,
    handleDeleteNews,
    newsTitle,
    setNewsTitle,
    newsSlug,
    setNewsSlug,
    newsImage,
    setNewsImage,
    newsContentHtml,
    setNewsContentHtml,
    selectedNewsTagIds,
    setSelectedNewsTagIds,
    newsFormError,
    newsActionLoadingId,
    handleCreateNews,
    handleUpdateNews,
    newNewsTagName,
    setNewNewsTagName,
    filteredNewsTags,
    isLoadingNewsTags,
    editingTagId,
    setEditingTagId,
    editingTagName,
    setEditingTagName,
    handleCreateNewsTag,
    handleUpdateNewsTag,
    handleDeleteNewsTag,
    newsTagFormError,
    changelogTab,
    setChangelogTab,
    changelog,
    changelogError,
    changelogFromDate,
    setChangelogFromDate,
    changelogToDate,
    setChangelogToDate,
    changelogMandatoryDraft,
    setChangelogMandatoryDraft,
    changelogSortDraft,
    setChangelogSortDraft,
    changelogOrderDraft,
    setChangelogOrderDraft,
    setPreviewChangelog,
    startEditChangelog,
    handleDeleteChangelog,
    editingChangelog,
    changelogVersion,
    setChangelogVersion,
    changelogReleaseDate,
    setChangelogReleaseDate,
    changelogDownloadUrl,
    setChangelogDownloadUrl,
    changelogMandatory,
    setChangelogMandatory,
    changelogChangesInput,
    setChangelogChangesInput,
    changelogFormError,
    resetChangelogForm,
    handleCreateChangelog,
    handleUpdateChangelog,
    changelogActionLoadingId,
    statsQuery,
    statsError,
  } = model;

  return (
    <>
      {activeTab === "users" && (
        <AdminUsersTab
          t={vm.t}
          users={vm.users}
          availableRoles={vm.availableRoles}
          error={vm.error}
          isLoading={vm.isLoading}
          isLoadingMore={vm.isLoadingMore}
          hasMore={vm.hasMore}
          isApplyingUserFilters={isApplyingUserFilters}
          isAdminApiBusy={isAdminApiBusy}
          usersEndRef={usersEndRef}
          userSearchInput={userSearchInput}
          setUserSearchInput={setUserSearchInput}
          userRoleFilter={userRoleFilter}
          setUserRoleFilter={setUserRoleFilter}
          userBanFilter={userBanFilter}
          setUserBanFilter={setUserBanFilter}
          newRoleName={newRoleName}
          setNewRoleName={setNewRoleName}
          newRoleDescription={newRoleDescription}
          setNewRoleDescription={setNewRoleDescription}
          roleFormError={roleFormError}
          onRefresh={() => vm.fetchUsers()}
          onSetUserFilters={(filters) => vm.setFilters(filters)}
          onCreateRole={() => void handleCreateRole()}
          onUpdateRole={() => void model.handleUpdateRole()}
          editingRole={model.editingRole}
          setEditingRole={model.setEditingRole}
          onOpenRoles={vm.openRolesModal}
          onOpenBan={vm.openBanModal}
          onOpenUnban={vm.openUnbanModal}
          currentPage={model.currentPage}
          totalPages={model.totalPages}
          setPage={model.setPage}
        />
      )}

      {activeTab === "news" && (
        <AdminNewsTab
          newsFormValidation={newsFormValidation}
          newsTagValidation={newsTagValidation}
          newsTab={newsTab}
          setNewsTab={setNewsTab}
          isApplyingNewsFilters={isApplyingNewsFilters}
          newsRows={news}
          newsTags={newsTags}
          isLoadingNews={isLoadingNews}
          isLoadingMoreNews={isLoadingMoreNews}
          newsEndRef={newsEndRef}
          newsSearch={newsSearch}
          setNewsSearch={setNewsSearch}
          newsTag={newsTag}
          setNewsTag={setNewsTag}
          newsSortDraft={newsSortDraft}
          setNewsSortDraft={setNewsSortDraft}
          newsOrderDraft={newsOrderDraft}
          setNewsOrderDraft={setNewsOrderDraft}
          newsFromDate={newsFromDate}
          setNewsFromDate={setNewsFromDate}
          newsToDate={newsToDate}
          setNewsToDate={setNewsToDate}
          editingNews={editingNews}
          resetNewsForm={resetNewsForm}
          startEditNews={startEditNews}
          handleDeleteNews={(id) => void handleDeleteNews(id)}
          newsTitle={newsTitle}
          setNewsTitle={setNewsTitle}
          newsSlug={newsSlug}
          setNewsSlug={setNewsSlug}
          newsImage={newsImage}
          setNewsImage={setNewsImage}
          newsContentHtml={newsContentHtml}
          setNewsContentHtml={setNewsContentHtml}
          selectedNewsTagIds={selectedNewsTagIds}
          setSelectedNewsTagIds={setSelectedNewsTagIds}
          newsFormError={newsFormError}
          newsActionLoadingId={newsActionLoadingId}
          handleCreateNews={() => void handleCreateNews()}
          handleUpdateNews={() => void handleUpdateNews()}
          newNewsTagName={newNewsTagName}
          setNewNewsTagName={setNewNewsTagName}
          filteredNewsTags={filteredNewsTags}
          isLoadingNewsTags={isLoadingNewsTags}
          editingTagId={editingTagId}
          setEditingTagId={setEditingTagId}
          editingTagName={editingTagName}
          setEditingTagName={setEditingTagName}
          handleCreateNewsTag={() => void handleCreateNewsTag()}
          handleUpdateNewsTag={() => void handleUpdateNewsTag()}
          handleDeleteNewsTag={(id) => void handleDeleteNewsTag(id)}
          isAdminApiBusy={isAdminApiBusy}
          newsTagFormError={newsTagFormError}
        />
      )}

      {activeTab === "changelog" && (
        <AdminChangelogTab
          changelogTab={changelogTab}
          setChangelogTab={setChangelogTab}
          changelog={changelog}
          changelogError={changelogError}
          isLoadingChangelog={false}
          isAdminApiBusy={isAdminApiBusy}
          changelogFromDate={changelogFromDate}
          setChangelogFromDate={setChangelogFromDate}
          changelogToDate={changelogToDate}
          setChangelogToDate={setChangelogToDate}
          changelogMandatoryDraft={changelogMandatoryDraft}
          setChangelogMandatoryDraft={setChangelogMandatoryDraft}
          changelogSortDraft={changelogSortDraft}
          setChangelogSortDraft={setChangelogSortDraft}
          changelogOrderDraft={changelogOrderDraft}
          setChangelogOrderDraft={setChangelogOrderDraft}
          setPreviewChangelog={setPreviewChangelog}
          startEditChangelog={startEditChangelog}
          handleDeleteChangelog={(id) => void handleDeleteChangelog(id)}
          editingChangelog={editingChangelog}
          changelogVersion={changelogVersion}
          setChangelogVersion={setChangelogVersion}
          changelogReleaseDate={changelogReleaseDate}
          setChangelogReleaseDate={setChangelogReleaseDate}
          changelogDownloadUrl={changelogDownloadUrl}
          setChangelogDownloadUrl={setChangelogDownloadUrl}
          changelogMandatory={changelogMandatory}
          setChangelogMandatory={setChangelogMandatory}
          changelogChangesInput={changelogChangesInput}
          setChangelogChangesInput={setChangelogChangesInput}
          changelogFormError={changelogFormError}
          resetChangelogForm={resetChangelogForm}
          handleCreateChangelog={() => void handleCreateChangelog()}
          handleUpdateChangelog={() => void handleUpdateChangelog()}
          changelogActionLoadingId={changelogActionLoadingId}
        />
      )}

      {activeTab === "stats" && (
        <AdminStatsPanel
          stats={statsQuery.data}
          isLoading={statsQuery.isLoading}
          isFetching={statsQuery.isFetching}
          errorMessage={statsError}
          onRefresh={() => {
            void statsQuery.refetch();
          }}
        />
      )}
    </>
  );
}
