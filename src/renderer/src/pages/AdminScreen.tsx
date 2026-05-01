import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button as ButtonShadcn } from "@/components/shadcn/ui";
import { ROUTES } from "../../../shared/constants/system";
import { WindowControls } from "../components";
import { AdminStatsPanel } from "../components/admin/AdminStatsPanel";
import { ChangelogPreviewModal } from "../components/admin/ChangelogPreviewModal";
import { AdminDialogs } from "../components/admin/AdminDialogs";
import { AdminUsersTab } from "../components/admin/tabs/AdminUsersTab";
import { AdminNewsTab } from "../components/admin/tabs/AdminNewsTab";
import { AdminChangelogTab } from "../components/admin/tabs/AdminChangelogTab";
import { useAdminScreenModel } from "../components/admin/hooks/useAdminScreenModel";

export function AdminScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const model = useAdminScreenModel();

  const {
    scrollRef,
    usersEndRef,
    newsEndRef,
    activeTab,
    setActiveTab,
    vm,
    statsQuery,
    statsError,
    isAdminApiBusy,
    isApplyingUserFilters,
    isApplyingNewsFilters,
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
    previewChangelog,
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
  } = model;

  return (
    <div className="flex h-screen flex-col bg-theme-main-gradient p-4 text-theme lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ButtonShadcn
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: ROUTES.DASHBOARD })}
            className="h-10 w-10 text-theme hover:bg-white/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </ButtonShadcn>
          <h1 className="font-minecraft text-2xl font-bold tracking-tighter">
            {vm.t.ADMIN.TITLE}
          </h1>
        </div>
        <WindowControls />
      </div>

      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto pr-2">
        <div className="mb-6 flex gap-2">
          <ButtonShadcn
            variant={activeTab === "users" ? "default" : "secondary"}
            onClick={() => setActiveTab("users")}
            className="font-minecraft uppercase tracking-wider"
          >
            {vm.t.ADMIN.TAB_USERS}
          </ButtonShadcn>
          <ButtonShadcn
            variant={activeTab === "news" ? "default" : "secondary"}
            onClick={() => setActiveTab("news")}
            className="font-minecraft uppercase tracking-wider"
          >
            {vm.t.ADMIN.TAB_NEWS}
          </ButtonShadcn>
          <ButtonShadcn
            variant={activeTab === "changelog" ? "default" : "secondary"}
            onClick={() => setActiveTab("changelog")}
            className="font-minecraft uppercase tracking-wider"
          >
            Changelog
          </ButtonShadcn>
          <ButtonShadcn
            variant={activeTab === "stats" ? "default" : "secondary"}
            onClick={() => setActiveTab("stats")}
            className="font-minecraft uppercase tracking-wider"
          >
            Stats
          </ButtonShadcn>
        </div>

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
      </div>

      <ChangelogPreviewModal
        changelog={previewChangelog}
        onClose={() => setPreviewChangelog(null)}
      />
      <AdminDialogs
        banModalOpen={vm.banModalOpen}
        setBanModalOpen={vm.setBanModalOpen}
        unbanModalOpen={vm.unbanModalOpen}
        setUnbanModalOpen={vm.setUnbanModalOpen}
        rolesModalOpen={vm.rolesModalOpen}
        setRolesModalOpen={vm.setRolesModalOpen}
        selectedUsername={vm.selectedUser?.username}
        banReason={vm.banReason}
        setBanReason={vm.setBanReason}
        actionError={vm.actionError}
        isAdminApiBusy={isAdminApiBusy}
        onConfirmBan={() => void handleConfirmBan()}
        onConfirmUnban={() => void handleConfirmUnban()}
        onSaveRoles={() => void handleSaveRoles()}
        roleSearchQuery={roleSearchQuery}
        setRoleSearchQuery={setRoleSearchQuery}
        selectedRolesCount={vm.selectedRoles.length}
        availableRoles={vm.availableRoles}
        selectedRoles={vm.selectedRoles}
        toggleRole={vm.toggleRole}
      />
    </div>
  );
}

