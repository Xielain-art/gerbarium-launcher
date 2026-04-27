import { WindowControls } from "../components";
import { useDashboardScreen } from "../hooks/useDashboardScreen";
import newsPlaceholder from "../assets/photo_2026-04-23_10-34-22.jpg";
import { DashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { NewsFeed } from "../components/dashboard/NewsFeed";
import { ChangelogFeed } from "../components/dashboard/ChangelogFeed";
import { LaunchConsole } from "../components/dashboard/LaunchConsole";
import { DashboardActionBar } from "../components/dashboard/DashboardActionBar";
import DOMPurify from "dompurify";
import { useMemo } from "react";

export function DashboardScreen() {
  const vm = useDashboardScreen();
  const sanitizedFullHtml = useMemo(
    () => (vm.selectedNews?.htmlContent ? DOMPurify.sanitize(vm.selectedNews.htmlContent) : ""),
    [vm.selectedNews],
  );

  return (
    <div className="bg-theme-main-gradient flex h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

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

      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <div className="absolute right-4 top-4 z-50 flex items-center gap-4">
          {vm.appVersion && (
            <div className="text-theme-muted font-minecraft text-xs">
              {vm.t.DASHBOARD.VERSION_DISPLAY_LABEL} {vm.appVersion}
            </div>
          )}
          <WindowControls />
        </div>

        <div className="flex-1 overflow-y-auto pt-20 pb-4 flex flex-col">
          {!vm.isLaunching && (
            <div className="mb-4 flex items-center gap-2 px-6">
              <button
                type="button"
                onClick={() => vm.setContentTab("news")}
                className={`mc-btn mc-btn-sm ${vm.contentTab === "news" ? "mc-btn-primary" : ""}`}
              >
                Новости
              </button>
              <button
                type="button"
                onClick={() => vm.setContentTab("changelog")}
                className={`mc-btn mc-btn-sm ${vm.contentTab === "changelog" ? "mc-btn-primary" : ""}`}
              >
                Changelog
              </button>
            </div>
          )}
          {vm.isLaunching && vm.isConsoleVisible ? (
            <LaunchConsole logs={vm.logs} logsEndRef={vm.logsEndRef} />
          ) : vm.contentTab === "changelog" ? (
            <ChangelogFeed
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
          isPlayBlocked={Boolean(vm.playBlockReason)}
          playBlockReason={vm.playBlockReason}
          onPlay={vm.onPlay}
          onCancelDownload={vm.onCancelDownload}
          onToggleConsole={vm.onToggleConsole}
        />
      </main>

      {vm.selectedNews && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
          <div className="mc-card max-h-[85vh] w-full max-w-4xl overflow-y-auto p-0">
            <div className="flex items-center justify-between border-b-[3px] border-theme p-4">
              <h3 className="font-minecraft text-lg text-theme">{vm.selectedNews.title}</h3>
              <button
                type="button"
                className="mc-btn mc-btn-sm"
                onClick={vm.onCloseNews}
              >
                Закрыть
              </button>
            </div>
            <div className="p-5">
              <img
                src={vm.selectedNews.imageUrl || newsPlaceholder}
                alt={vm.selectedNews.title}
                className="mb-4 max-h-72 w-full rounded object-cover"
              />
              <div
                className="font-minecraft text-sm leading-relaxed text-theme-muted [&_a]:text-[var(--mc-accent)] [&_a]:underline"
                dangerouslySetInnerHTML={{
                  __html: sanitizedFullHtml || vm.selectedNews.content,
                }}
              />
            </div>
          </div>
        </div>
      )}
      {vm.selectedChangelog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
          <div className="mc-card max-h-[85vh] w-full max-w-3xl overflow-y-auto p-0">
            <div className="flex items-center justify-between border-b-[3px] border-theme p-4">
              <h3 className="font-minecraft text-lg text-theme">
                Changelog v{vm.selectedChangelog.version}
              </h3>
              <button
                type="button"
                className="mc-btn mc-btn-sm"
                onClick={vm.onCloseChangelog}
              >
                Закрыть
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                {vm.selectedChangelog.mandatory && (
                  <span className="rounded bg-red-500/20 px-2 py-1 font-minecraft text-[10px] uppercase text-red-400">
                    Mandatory
                  </span>
                )}
                <span className="font-minecraft text-xs text-theme-muted">
                  {new Date(vm.selectedChangelog.releaseDate).toLocaleDateString("ru-RU")}
                </span>
              </div>
              <ul className="list-disc space-y-2 pl-5 font-minecraft text-sm leading-relaxed text-theme-muted">
                {vm.selectedChangelog.changes.map((change, idx) => (
                  <li key={`${vm.selectedChangelog?.id}-${idx}`}>{change}</li>
                ))}
              </ul>
              <button
                type="button"
                className="mc-btn mc-btn-primary"
                onClick={() =>
                  void window.electronAPI.system.openExternal(vm.selectedChangelog!.downloadUrl)
                }
              >
                Скачать релиз
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
