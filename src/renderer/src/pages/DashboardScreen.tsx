import { WindowControls } from "../components";
import { useDashboardScreen } from "../hooks/useDashboardScreen";
import newsPlaceholder from "../assets/photo_2026-04-23_10-34-22.jpg";
import { DashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { NewsFeed } from "../components/dashboard/NewsFeed";
import { LaunchConsole } from "../components/dashboard/LaunchConsole";
import { DashboardActionBar } from "../components/dashboard/DashboardActionBar";

export function DashboardScreen() {
  const vm = useDashboardScreen();

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
          {vm.isLaunching && vm.isConsoleVisible ? (
            <LaunchConsole logs={vm.logs} logsEndRef={vm.logsEndRef} />
          ) : (
            <NewsFeed
              t={vm.t}
              news={vm.news}
              isLoadingNews={vm.isLoadingNews}
              placeholderImage={newsPlaceholder}
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
    </div>
  );
}
