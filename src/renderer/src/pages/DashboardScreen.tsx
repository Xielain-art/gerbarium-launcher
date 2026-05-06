import { ThemeToggleButton } from "../components/layout/ThemeToggleButton";
import { WindowControls } from "../components/layout/WindowControls";
import { useDashboardScreen } from "../hooks/useDashboardScreen";
import newsPlaceholder from "../assets/photo_2026-04-23_10-34-22.jpg";
import { DashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { NewsFeed } from "../components/dashboard/NewsFeed";
import { ChangelogFeed } from "../components/dashboard/ChangelogFeed";
import { LaunchConsole } from "../components/dashboard/LaunchConsole";
import { DashboardActionBar } from "../components/dashboard/DashboardActionBar";
import { NewsPreviewModal } from "../components/dashboard/NewsPreviewModal";
import { ChangelogPreviewModal } from "../components/dashboard/ChangelogPreviewModal";
import { cn } from "@/lib/utils";

export function DashboardScreen(): React.JSX.Element {
  const vm = useDashboardScreen();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--theme-sidebar)]">
      <DashboardSidebar
        t={vm.t}
        user={vm.user}
        serverStatus={vm.serverStatus}
        versions={vm.versions}
        selectedVersionId={vm.selectedVersionId}
        onSelectVersion={vm.setSelectedVersionId}
        onLogout={vm.onLogout}
        onOpenSettings={vm.onOpenSettings}
        onOpenAdminPanel={vm.onOpenAdminPanel}
      />

      <main className="relative z-10 flex flex-1 flex-col overflow-hidden bg-[var(--theme-bg)]">
        <div className="absolute right-4 top-4 z-50 flex items-center gap-4">
          {vm.appVersion ? (
            <div className="font-mono text-[10px] uppercase tracking-wider text-theme-muted">
              {vm.t.DASHBOARD.VERSION_DISPLAY_LABEL} {vm.appVersion}
            </div>
          ) : null}
          <ThemeToggleButton />
          <WindowControls />
        </div>

        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto pb-4 pt-20">
          {!vm.isLaunching ? (
            <div className="mb-6 flex items-center gap-1 px-6">
              <button
                type="button"
                onClick={() => vm.setContentTab("news")}
                className={cn(
                  "rounded-[9999px] px-4 py-1.5 font-sans text-xs font-medium transition-all",
                  vm.contentTab === "news"
                    ? "bg-[var(--theme-surface)] text-theme"
                    : "text-theme-muted hover:text-theme",
                )}
              >
                {vm.t.DASHBOARD.TAB_NEWS}
              </button>
              <button
                type="button"
                onClick={() => vm.setContentTab("changelog")}
                className={cn(
                  "rounded-[9999px] px-4 py-1.5 font-sans text-xs font-medium transition-all",
                  vm.contentTab === "changelog"
                    ? "bg-[var(--theme-surface)] text-theme"
                    : "text-theme-muted hover:text-theme",
                )}
              >
                {vm.t.DASHBOARD.TAB_CHANGELOG}
              </button>
            </div>
          ) : null}

          {vm.isLaunching && vm.isConsoleVisible ? (
            <LaunchConsole logs={vm.logs} logsEndRef={vm.logsEndRef} />
          ) : vm.contentTab === "changelog" ? (
            <ChangelogFeed
              t={vm.t}
              changelog={vm.changelog}
              isLoading={vm.isLoadingChangelog}
              isLoadingMore={vm.isLoadingMoreChangelog}
              hasMore={vm.hasMoreChangelog}
              isInitialLoaded={vm.isChangelogInitialLoaded}
              onLoadMore={vm.onLoadMoreChangelog}
              onSelectChangelog={vm.onSelectChangelog}
              error={vm.changelogError}
            />
          ) : (
            <NewsFeed
              t={vm.t}
              news={vm.news}
              isLoadingNews={vm.isLoadingNews}
              isLoadingMoreNews={vm.isLoadingMoreNews}
              hasMoreNews={vm.hasMoreNews}
              isNewsInitialLoaded={vm.isNewsInitialLoaded}
              onLoadMoreNews={vm.onLoadMoreNews}
              placeholderImage={newsPlaceholder}
              newsError={vm.newsError}
              onSelectNews={vm.onSelectNews}
              order={vm.newsOrder}
              onOrderChange={vm.setNewsOrder}
              selectedTag={vm.newsTagFilter}
              onTagChange={vm.setNewsTagFilter}
              availableTags={vm.newsTags}
            />
          )}
        </div>

        <DashboardActionBar
          t={vm.t}
          selectedVersion={vm.selectedVersion}
          isDownloading={vm.isDownloading}
          progress={vm.progress}
          isLaunching={vm.isLaunching}
          launchProgress={vm.launchProgress}
          launchStatus={vm.launchStatus}
          isConsoleVisible={vm.isConsoleVisible}
          errorMessage={vm.launchError}
          playBlockReason={vm.playBlockReason}
          onPlay={vm.onPlay}
          onCancelDownload={vm.onCancelDownload}
          onToggleConsole={vm.onToggleConsole}
        />
      </main>

      <NewsPreviewModal
        t={vm.t}
        news={vm.selectedNews}
        placeholderImage={newsPlaceholder}
        onClose={vm.onCloseNews}
      />
      <ChangelogPreviewModal
        t={vm.t}
        changelog={vm.selectedChangelog}
        onClose={vm.onCloseChangelog}
      />
    </div>
  );
}


