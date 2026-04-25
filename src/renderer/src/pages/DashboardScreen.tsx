import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useDownloadStore } from "../stores/useDownloadStore";
import { useNewsStore } from "../stores/useNewsStore";
import { useServerStatusStore } from "../stores/useServerStatusStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { WindowControls } from "../components";
import { useTranslation } from "../hooks/useTranslation";
import { ROUTES, STORAGE_KEYS } from "../../../shared/constants/system";
import type { GameVersion } from "../types";
import newsPlaceholder from "../assets/photo_2026-04-23_10-34-22.jpg";
import { DashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { NewsFeed } from "../components/dashboard/NewsFeed";
import { LaunchConsole } from "../components/dashboard/LaunchConsole";
import { DashboardActionBar } from "../components/dashboard/DashboardActionBar";

const INITIAL_VERSIONS: GameVersion[] = [
  {
    id: "gerbarium-1.2",
    name: "Gerbarium v1.2",
    type: "gerbarium",
    isInstalled: false,
    version: "1.20.4",
  },
  {
    id: "fabric-1.21",
    name: "Fabric 1.21",
    type: "fabric",
    isInstalled: false,
    version: "1.21",
  },
  {
    id: "forge-1.20.1",
    name: "Forge 1.20.1",
    type: "forge",
    isInstalled: false,
    version: "1.20.1",
  },
  {
    id: "vanilla-1.21.4",
    name: "Vanilla 1.21.4",
    type: "vanilla",
    isInstalled: true,
    version: "1.21.4",
  },
];

function parseJvmArgs(jvmArgsText: string): string[] {
  return jvmArgsText
    .split(/\s+/)
    .map((arg) => arg.trim())
    .filter(Boolean);
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export function DashboardScreen() {
  const t = useTranslation();
  const navigate = useNavigate();

  const { user, logout, isAuthenticated } = useAuthStore();
  const { isDownloading, progress, cancelDownload } = useDownloadStore();
  const { items: news, isLoading: isLoadingNews } = useNewsStore();
  const { data: serverStatus } = useServerStatusStore();

  const [versions, setVersions] = useState<GameVersion[]>(INITIAL_VERSIONS);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    INITIAL_VERSIONS[0]?.id ?? null,
  );
  const selectedVersion = versions.find((v) => v.id === selectedVersionId);

  const [shouldLogout, setShouldLogout] = useState(false);
  const [appVersion, setAppVersion] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState<number | null>(null);
  const [launchStatus, setLaunchStatus] = useState<string>("");
  const [launchError, setLaunchError] = useState<string | null>(null);
  const closeOnLaunchRequestedRef = useRef(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.electronAPI?.game) return;

    const fetchInstalled = async () => {
      try {
        const installed = await window.electronAPI.game.getInstalledVersions();
        setVersions((prev) =>
          prev.map((version) => ({
            ...version,
            isInstalled: installed.includes(version.version || version.id),
          })),
        );
      } catch {
        setLaunchError("Failed to fetch installed game versions.");
      }
    };

    fetchInstalled();
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (!window.electronAPI?.game) return;

    const unsubscribe = window.electronAPI.game.onProgress((data) => {
      if (data.type === "progress") {
        const percent = data.content.percent;
        if (typeof percent === "number" && Number.isFinite(percent)) {
          setLaunchProgress(Math.max(0, Math.min(100, percent)));
        }

        if (typeof data.content.status === "string" && data.content.status.trim()) {
          setLaunchStatus(data.content.status.trim());
        }
        return;
      }

      if (data.type === "data") {
        setLogs((prev) => [...prev, data.content]);
        return;
      }

      if (data.type === "state" && data.content.phase === "spawned") {
        setLaunchProgress(100);
        setLaunchStatus("Running...");

        if (closeOnLaunchRequestedRef.current) {
          if (useSettingsStore.getState().general.minimizeToTray) {
            void window.electronAPI.closeWindow();
          } else {
            void window.electronAPI.minimizeWindow();
          }
        }
        return;
      }

      if (data.type === "close") {
        setIsLaunching(false);
        setLaunchProgress(null);
        setLaunchStatus("");
        closeOnLaunchRequestedRef.current = false;
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && shouldLogout) {
      navigate({ to: ROUTES.HOME });
    }
  }, [isAuthenticated, shouldLogout, navigate]);

  useEffect(() => {
    if (!window.electronAPI) return;

    window.electronAPI.getAppVersion().then(setAppVersion);
    const currentSettings = useSettingsStore.getState().general;
    if (window.electronAPI.system?.sendSettingsUpdate) {
      window.electronAPI.system.sendSettingsUpdate(currentSettings);
    }
  }, []);

  const handlePlay = async () => {
    if (!selectedVersion) {
      setLaunchError(t.DASHBOARD.SELECT_VERSION_ALERT);
      return;
    }

    if (!user?.username) {
      setLaunchError("User is not logged in.");
      return;
    }

    setLaunchError(null);
    setIsLaunching(true);
    setLaunchProgress(0);
    setLaunchStatus("Preparing...");
    setLogs([]);

    try {
      const installedJava = await window.electronAPI.java.getInstalledJava();
      const bestJava = installedJava.find((j) => j.version >= 17) || installedJava[0];

      let javaPath = bestJava?.path;
      if (!javaPath) {
        javaPath = await window.electronAPI.java.findSystemJava();
      }

      if (!javaPath) {
        throw new Error("Java not found. Install Java in settings.");
      }

      const settings = useSettingsStore.getState().general;
      closeOnLaunchRequestedRef.current = settings.closeOnLaunch;

      const launchOptions = {
        username: user.username,
        version: selectedVersion.version || selectedVersion.id,
        memory: {
          min: `${Math.max(1, Math.floor(settings.ramAllocation / 2))}G`,
          max: `${Math.max(1, settings.ramAllocation)}G`,
        },
        javaPath,
        gamePath: settings.gamePath,
        fullscreen: settings.fullscreen,
        jvmArgs: parseJvmArgs(settings.jvmArgs),
      };

      const result = await window.electronAPI.game.launch(launchOptions);
      if (!result.success) {
        throw new Error(result.error || "Game launch failed.");
      }

      setLaunchStatus("Starting game process...");
      setLaunchProgress(95);
    } catch (error: unknown) {
      setIsLaunching(false);
      setLaunchProgress(null);
      setLaunchStatus("");
      setLaunchError(`Launch error: ${toErrorMessage(error)}`);
      closeOnLaunchRequestedRef.current = false;
    }
  };

  const handleSettings = () => navigate({ to: ROUTES.SETTINGS });

  const handleLogout = () => {
    setShouldLogout(true);
    logout();
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-[#1a1c20] via-[#2b2d31] to-[#1a1c20]">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <DashboardSidebar
        t={t}
        user={user}
        serverStatus={serverStatus}
        versions={versions}
        selectedVersionId={selectedVersionId}
        onSelectVersion={setSelectedVersionId}
        onLogout={handleLogout}
        onOpenSettings={handleSettings}
      />

      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <div className="absolute right-4 top-4 z-50 flex items-center gap-4">
          {appVersion && (
            <div className="font-minecraft text-xs text-[#6a6a6a]">
              {t.DASHBOARD.VERSION_DISPLAY_LABEL} {appVersion}
            </div>
          )}
          <WindowControls />
        </div>

        <div className="flex-1 overflow-y-auto pt-20 pb-4 flex flex-col">
          {isLaunching ? (
            <LaunchConsole logs={logs} logsEndRef={logsEndRef} />
          ) : (
            <NewsFeed
              t={t}
              news={news}
              isLoadingNews={isLoadingNews}
              placeholderImage={newsPlaceholder}
            />
          )}
        </div>

        <DashboardActionBar
          t={t}
          selectedVersion={selectedVersion}
          isDownloading={isDownloading}
          progress={progress}
          isLaunching={isLaunching}
          launchProgress={launchProgress}
          launchStatus={launchStatus}
          errorMessage={launchError}
          onPlay={handlePlay}
          onCancelDownload={cancelDownload}
          onHideConsole={() => setIsLaunching(false)}
        />
      </main>
    </div>
  );
}
