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

export function AdminScreen() {
  const navigate = useNavigate();
  const m = useAdminScreenModel();

  return (
    <div className="flex h-screen flex-col bg-theme-main-gradient p-4 text-theme lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ButtonShadcn variant="ghost" size="icon" onClick={() => navigate({ to: ROUTES.DASHBOARD })} className="h-10 w-10 text-theme hover:bg-white/10"><ArrowLeft className="h-6 w-6" /></ButtonShadcn>
          <h1 className="font-minecraft text-2xl font-bold tracking-tighter">{m.vm.t.ADMIN.TITLE}</h1>
        </div>
        <WindowControls />
      </div>

      <div ref={m.scrollRef} className="relative z-10 flex-1 overflow-y-auto pr-2">
        <div className="mb-6 flex gap-2">
          <ButtonShadcn variant={m.activeTab === "users" ? "default" : "secondary"} onClick={() => m.setActiveTab("users")} className="font-minecraft uppercase tracking-wider">{m.vm.t.ADMIN.TAB_USERS}</ButtonShadcn>
          <ButtonShadcn variant={m.activeTab === "news" ? "default" : "secondary"} onClick={() => m.setActiveTab("news")} className="font-minecraft uppercase tracking-wider">{m.vm.t.ADMIN.TAB_NEWS}</ButtonShadcn>
          <ButtonShadcn variant={m.activeTab === "changelog" ? "default" : "secondary"} onClick={() => m.setActiveTab("changelog")} className="font-minecraft uppercase tracking-wider">Changelog</ButtonShadcn>
          <ButtonShadcn variant={m.activeTab === "stats" ? "default" : "secondary"} onClick={() => m.setActiveTab("stats")} className="font-minecraft uppercase tracking-wider">Stats</ButtonShadcn>
        </div>

        {m.activeTab === "users" && (
          <AdminUsersTab
            t={m.vm.t}
            users={m.vm.users}
            availableRoles={m.vm.availableRoles}
            error={m.vm.error}
            isLoading={m.vm.isLoading}
            isLoadingMore={m.vm.isLoadingMore}
            hasMore={m.vm.hasMore}
            isApplyingUserFilters={m.isApplyingUserFilters}
            isAdminApiBusy={m.isAdminApiBusy}
            usersEndRef={m.usersEndRef}
            userSearchInput={m.userSearchInput}
            setUserSearchInput={m.setUserSearchInput}
            userRoleFilter={m.userRoleFilter}
            setUserRoleFilter={m.setUserRoleFilter}
            userBanFilter={m.userBanFilter}
            setUserBanFilter={m.setUserBanFilter}
            newRoleName={m.newRoleName}
            setNewRoleName={m.setNewRoleName}
            newRoleDescription={m.newRoleDescription}
            setNewRoleDescription={m.setNewRoleDescription}
            roleFormError={m.roleFormError}
            onRefresh={() => m.vm.fetchUsers()}
            onSetUserFilters={(filters) => m.vm.setFilters(filters)}
            onCreateRole={() => void m.handleCreateRole()}
            onOpenRoles={m.vm.openRolesModal}
            onOpenBan={m.vm.openBanModal}
            onOpenUnban={m.vm.openUnbanModal}
          />
        )}

        {m.activeTab === "news" && <AdminNewsTab newsTab={m.newsTab} setNewsTab={m.setNewsTab} isApplyingNewsFilters={m.isApplyingNewsFilters} newsRows={m.news} newsTags={m.newsTags} isLoadingNews={m.isLoadingNews} isLoadingMoreNews={m.isLoadingMoreNews} newsEndRef={m.newsEndRef} newsSearch={m.newsSearch} setNewsSearch={m.setNewsSearch} newsTag={m.newsTag} setNewsTag={m.setNewsTag} newsSortDraft={m.newsSortDraft} setNewsSortDraft={m.setNewsSortDraft} newsOrderDraft={m.newsOrderDraft} setNewsOrderDraft={m.setNewsOrderDraft} newsFromDate={m.newsFromDate} setNewsFromDate={m.setNewsFromDate} newsToDate={m.newsToDate} setNewsToDate={m.setNewsToDate} editingNews={m.editingNews} resetNewsForm={m.resetNewsForm} startEditNews={m.startEditNews} handleDeleteNews={(id) => void m.handleDeleteNews(id)} newsTitle={m.newsTitle} setNewsTitle={m.setNewsTitle} newsSlug={m.newsSlug} setNewsSlug={m.setNewsSlug} newsImage={m.newsImage} setNewsImage={m.setNewsImage} newsContentHtml={m.newsContentHtml} setNewsContentHtml={m.setNewsContentHtml} newsFormError={m.newsFormError} newsActionLoadingId={m.newsActionLoadingId} handleCreateNews={() => void m.handleCreateNews()} handleUpdateNews={() => void m.handleUpdateNews()} newNewsTagName={m.newNewsTagName} setNewNewsTagName={m.setNewNewsTagName} filteredNewsTags={m.filteredNewsTags} isLoadingNewsTags={m.isLoadingNewsTags} editingTagId={m.editingTagId} setEditingTagId={m.setEditingTagId} editingTagName={m.editingTagName} setEditingTagName={m.setEditingTagName} handleCreateNewsTag={() => void m.handleCreateNewsTag()} handleUpdateNewsTag={() => void m.handleUpdateNewsTag()} handleDeleteNewsTag={(id) => void m.handleDeleteNewsTag(id)} isAdminApiBusy={m.isAdminApiBusy} newsTagFormError={m.newsTagFormError} />}

        {m.activeTab === "changelog" && <AdminChangelogTab changelogTab={m.changelogTab} setChangelogTab={m.setChangelogTab} changelog={m.changelog} changelogError={m.changelogError} isLoadingChangelog={false} isAdminApiBusy={m.isAdminApiBusy} changelogFromDate={m.changelogFromDate} setChangelogFromDate={m.setChangelogFromDate} changelogToDate={m.changelogToDate} setChangelogToDate={m.setChangelogToDate} changelogMandatoryDraft={m.changelogMandatoryDraft} setChangelogMandatoryDraft={m.setChangelogMandatoryDraft} changelogSortDraft={m.changelogSortDraft} setChangelogSortDraft={m.setChangelogSortDraft} changelogOrderDraft={m.changelogOrderDraft} setChangelogOrderDraft={m.setChangelogOrderDraft} setPreviewChangelog={m.setPreviewChangelog} startEditChangelog={m.startEditChangelog} handleDeleteChangelog={(id) => void m.handleDeleteChangelog(id)} editingChangelog={m.editingChangelog} changelogVersion={m.changelogVersion} setChangelogVersion={m.setChangelogVersion} changelogReleaseDate={m.changelogReleaseDate} setChangelogReleaseDate={m.setChangelogReleaseDate} changelogDownloadUrl={m.changelogDownloadUrl} setChangelogDownloadUrl={m.setChangelogDownloadUrl} changelogMandatory={m.changelogMandatory} setChangelogMandatory={m.setChangelogMandatory} changelogChangesInput={m.changelogChangesInput} setChangelogChangesInput={m.setChangelogChangesInput} changelogFormError={m.changelogFormError} resetChangelogForm={m.resetChangelogForm} handleCreateChangelog={() => void m.handleCreateChangelog()} handleUpdateChangelog={() => void m.handleUpdateChangelog()} changelogActionLoadingId={m.changelogActionLoadingId} />}

        {m.activeTab === "stats" && <AdminStatsPanel stats={m.statsQuery.data} isLoading={m.statsQuery.isLoading} isFetching={m.statsQuery.isFetching} errorMessage={m.statsError} onRefresh={() => { void m.statsQuery.refetch(); }} />}
      </div>

      <ChangelogPreviewModal changelog={m.previewChangelog} onClose={() => m.setPreviewChangelog(null)} />
      <AdminDialogs banModalOpen={m.vm.banModalOpen} setBanModalOpen={m.vm.setBanModalOpen} unbanModalOpen={m.vm.unbanModalOpen} setUnbanModalOpen={m.vm.setUnbanModalOpen} rolesModalOpen={m.vm.rolesModalOpen} setRolesModalOpen={m.vm.setRolesModalOpen} selectedUsername={m.vm.selectedUser?.username} banReason={m.vm.banReason} setBanReason={m.vm.setBanReason} actionError={m.vm.actionError} isAdminApiBusy={m.isAdminApiBusy} onConfirmBan={() => void m.handleConfirmBan()} onConfirmUnban={() => void m.handleConfirmUnban()} onSaveRoles={() => void m.handleSaveRoles()} roleSearchQuery={m.roleSearchQuery} setRoleSearchQuery={m.setRoleSearchQuery} selectedRolesCount={m.vm.selectedRoles.length} availableRoles={m.vm.availableRoles} selectedRoles={m.vm.selectedRoles} toggleRole={m.vm.toggleRole} />
    </div>
  );
}
