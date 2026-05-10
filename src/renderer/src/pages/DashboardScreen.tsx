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
    <div
      className="fantasy-ui fantasy-shell flex overflow-hidden bg-[var(--theme-sidebar)]"
      style={{
        position: "absolute",
        inset: 0,
      }}
    >
      <div className="fantasy-orb fantasy-orb--violet left-[-9rem] top-[-6rem] h-[26rem] w-[26rem]" />
      <div className="fantasy-orb fantasy-orb--emerald right-[-7rem] top-[14%] h-[24rem] w-[24rem]" />
      <div className="fantasy-orb fantasy-orb--gold left-[30%] bottom-[-7rem] h-[18rem] w-[18rem]" />
      <DashboardSidebar
        t={vm.t}
        user={vm.user}
        serverStatus={vm.serverStatus}
        selectedVersion={vm.selectedVersion}
        onOpenVersionDescription={() => vm.setContentTab("changelog")}
        onLogout={vm.onLogout}
        onOpenSettings={vm.onOpenSettings}
        onOpenAdminPanel={vm.onOpenAdminPanel}
      />

      <main className="relative z-10 flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[var(--theme-bg)]">
        <div className="absolute right-4 top-4 z-[80] flex items-center gap-4">
          {vm.appVersion ? (
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-theme-muted">
              {vm.t.DASHBOARD.VERSION_DISPLAY_LABEL} {vm.appVersion}
            </div>
          ) : null}
          <ThemeToggleButton />
          <WindowControls />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto pb-28 pt-20">
          <div className="mb-6 flex items-center gap-2 px-6">
            <button
              type="button"
              onClick={() => vm.setContentTab("news")}
              className={cn(
                "fantasy-button rounded-[9999px] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all",
                vm.contentTab === "news"
                  ? "fantasy-button--primary text-[var(--theme-bg)]"
                  : "text-theme-muted hover:text-theme",
              )}
            >
              {vm.t.DASHBOARD.TAB_NEWS}
            </button>
            <button
              type="button"
              onClick={() => vm.setContentTab("changelog")}
              className={cn(
                "fantasy-button rounded-[9999px] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all",
                vm.contentTab === "changelog"
                  ? "fantasy-button--primary text-[var(--theme-bg)]"
                  : "text-theme-muted hover:text-theme",
              )}
            >
              {vm.t.DASHBOARD.TAB_CHANGELOG}
            </button>
          </div>

          {vm.contentTab === "changelog" ? (
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

        {(vm.isLaunching || vm.isGameRunning) && vm.isConsoleVisible ? (
          <div className="shrink-0 px-6 pb-3">
            <LaunchConsole
              logs={vm.logs}
              consoleScrollRef={vm.consoleScrollRef}
            />
          </div>
        ) : null}

        <div className="sticky bottom-0 z-30 shrink-0 border-t border-[var(--fantasy-border-soft)] bg-[linear-gradient(180deg,rgba(10,10,16,0.28)_0%,rgba(10,10,16,0.82)_48%,rgba(10,10,16,0.96)_100%)] px-6 pb-4 pt-3 backdrop-blur-xl">
          <DashboardActionBar
            t={vm.t}
            selectedVersion={vm.selectedVersion}
            isDownloading={vm.isDownloading}
            isLaunching={vm.isLaunching}
            isGameRunning={vm.isGameRunning}
            launchStatus={vm.launchStatus}
            launchPhase={vm.launchPhase}
            launchProgress={vm.launchProgress}
            progress={vm.progress}
            errorMessage={vm.launchError}
            playBlockReason={vm.playBlockReason}
            onPlay={vm.onPlay}
            onCloseGame={vm.onCloseGame}
            onCancelDownload={vm.onCancelDownload}
            isConsoleVisible={vm.isConsoleVisible}
            onToggleConsole={vm.onToggleConsole}
          />
        </div>
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


