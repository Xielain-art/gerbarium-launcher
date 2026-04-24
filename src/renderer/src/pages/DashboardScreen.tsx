import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useDownloadStore } from "../stores/useDownloadStore";
import { useNewsStore } from "../stores/useNewsStore";
import { useServerStatusStore } from "../stores/useServerStatusStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { 
  WindowControls, 
  Avatar, 
  Button, 
  Card, 
  ProgressBar 
} from "../components";
import { useTranslation } from "../hooks/useTranslation";
import { ROUTES, STORAGE_KEYS } from "../../../shared/constants/system";
import miniLogo from "../assets/photo_2026-04-23_10-35-12.jpg";
import newsPlaceholder from "../assets/photo_2026-04-23_10-34-22.jpg";

function getVersionIcon(type: string) {
  const icons: Record<string, string> = {
    gerbarium: "💎",
    fabric: "🧵",
    forge: "⚒️",
    vanilla: "🟩",
  };
  return icons[type] || "📦";
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    update: "bg-[#3a753a]",
    event: "bg-[#8b5a2a]",
    community: "bg-[#5a5a8b]",
    announcement: "bg-[#8b2a2a]",
  };
  return colors[category] || "bg-[#5a5a5a]";
}

function getCategoryLabel(category: string) {
  return t.NEWS.CATEGORIES[category as keyof typeof t.NEWS.CATEGORIES] || category;
}

export function DashboardScreen() {
  const t = useTranslation();
  const navigate = useNavigate();

  // Mock versions data moved inside to use translation hook
  const INITIAL_VERSIONS = [
    {
      id: "gerbarium-1.2",
      name: "Gerbarium v1.2",
      type: "gerbarium" as const,
      isInstalled: false,
      version: "1.20.4",
    },
    {
      id: "fabric-1.21",
      name: "Fabric 1.21",
      type: "fabric" as const,
      isInstalled: false,
      version: "1.21",
    },
    {
      id: "forge-1.20.1",
      name: "Forge 1.20.1",
      type: "forge" as const,
      isInstalled: false,
      version: "1.20.1",
    },
    {
      id: "vanilla-1.21.4",
      name: "Vanilla 1.21.4",
      type: "vanilla" as const,
      isInstalled: true,
      version: "1.21.4",
    },
    {
      id: "vanilla-42",
      name: "ТЕСТ РЕЛИЗА 1.0.1",
      type: "vanilla" as const,
      isInstalled: true,
      version: "1.21.4",
    }
  ];

  // Zustand stores
  const { user, logout, isAuthenticated } = useAuthStore();
  const { isDownloading, progress, startDownload, cancelDownload } =
    useDownloadStore();
  const { items: news, isLoading: isLoadingNews } = useNewsStore();
  const { data: serverStatus } = useServerStatusStore();

  // Local state
  const [versions, setVersions] = useState(INITIAL_VERSIONS);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    INITIAL_VERSIONS[0]?.id || null,
  );
  const selectedVersion = versions.find(v => v.id === selectedVersionId) || versions[0];
  
  const [shouldLogout, setShouldLogout] = useState(false);
  const [appVersion, setAppVersion] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState<number | null>(null);
  const [launchStatus, setLaunchStatus] = useState<string>("");
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Fetch installed versions
  useEffect(() => {
    if (!window.electronAPI?.game) return;
    
    const fetchInstalled = async () => {
      try {
        const installed = await window.electronAPI.game.getInstalledVersions();
        setVersions(prev => prev.map(v => ({
          ...v,
          isInstalled: installed.includes(v.version || v.id)
        })));
      } catch (e) {
        console.error("Failed to fetch installed versions", e);
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
          setLaunchProgress(data.content.percent);
          if (data.content.status) setLaunchStatus(data.content.status);
        } else if (data.type === "data") {
          const logText = String(data.content);
          setLaunchLogs((prev) => prev + logText + "\n");
          
          // Check for "fully started" indicators in logs
          if (logText.includes("Sound engine started") || 
              logText.includes("Started in") || 
              logText.includes("Setting user:")) {
            setLaunchProgress(100);
            setLaunchStatus("Running...");
          }
        } else if (data.type === "close") {
          setIsLaunching(false);
          setLaunchProgress(null);
          setLaunchStatus("");
        }
      });

    return () => unsubscribe();
  }, []);

  // Handle logout redirect
  useEffect(() => {
    if (!isAuthenticated && shouldLogout) {
      navigate({ to: ROUTES.HOME });
    }
  }, [isAuthenticated, shouldLogout, navigate]);

  // Get app version on mount
  useEffect(() => {
    if (!window.electronAPI) return;

    window.electronAPI.getAppVersion().then(setAppVersion);
    
    // Sync settings with main process
    const currentSettings = useSettingsStore.getState().general;
    if (window.electronAPI.system?.sendSettingsUpdate) {
      window.electronAPI.system.sendSettingsUpdate(currentSettings);
    }
  }, []);

  const handlePlay = async () => {
    if (!selectedVersion) {
      alert(t.DASHBOARD.SELECT_VERSION_ALERT);
      return;
    }
    
    if (!user?.username) {
       alert("User not logged in");
       return;
    }

    setIsLaunching(true);
    setLaunchProgress(0);
    setLaunchStatus("Preparing...");
    setLogs([]);

    try {
      // 1. Try to find Java in internal launcher storage
      const installedJava = await window.electronAPI.java.getInstalledJava();
      // Minecraft 1.20.4 needs Java 17 or higher
      const bestJava = installedJava.find(j => j.version >= 17) || installedJava[0];
      
      let javaPath = bestJava?.path;

      // 2. Fallback to system Java if no internal Java found
      if (!javaPath) {
        javaPath = await window.electronAPI.java.findSystemJava();
      }
      
      if (!javaPath) {
        setIsLaunching(false);
        alert("Java not found! Please install Java in settings.");
        return;
      }

      const settings = useSettingsStore.getState().general;
      const launchOptions = {
        username: user.username,
        version: selectedVersion.version || selectedVersion.id,
        memory: { 
          min: `${Math.floor(settings.ramAllocation / 2)}G`, 
          max: `${settings.ramAllocation}G` 
        },
        javaPath: javaPath,
        gamePath: settings.gamePath,
        fullscreen: settings.fullscreen,
        jvmArgs: settings.jvmArgs.split(' ').filter(arg => arg.trim() !== "")
      };


      const result = await window.electronAPI.game.launch(launchOptions);
      if (!result.success) {
         setIsLaunching(false);
         setLaunchProgress(null);
         setLaunchStatus("");
         alert(`Failed to launch: ${result.error}`);
      } else {
         setLaunchStatus("Running...");
         // Don't set to 100% immediately, let it be 95% while game is loading
         setLaunchProgress(95); 
         
         // Handle close on launch
         if (settings.closeOnLaunch) {
            setTimeout(() => {
               // Use hide instead of close to be safer for child process
               window.electronAPI.minimizeWindow(); 
               // Or better, if we have a tray, hide to tray
               if (settings.minimizeToTray) {
                 window.electronAPI.closeWindow(); // This will hide to tray if logic is correct
               } else {
                 window.electronAPI.minimizeWindow();
               }
            }, 5000); 
         }
      }
    } catch (error: any) {
      setIsLaunching(false);
      setLaunchProgress(null);
      setLaunchStatus("");
      alert(`Launch error: ${error.message}`);
    }
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersion(versionId);
  };

  const handleCancel = () => {
    cancelDownload();
  };

  const handleSettings = () => {
    navigate({ to: ROUTES.SETTINGS });
  };

  const handleLogout = () => {
    setShouldLogout(true);
    logout();
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-[#1a1c20] via-[#2b2d31] to-[#1a1c20]">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* ZONE 1: Full-Height Left Sidebar */}
      <aside className="relative z-40 flex h-full w-80 flex-col border-r-[4px] border-[#1a1a1a] bg-[#1e2025]/95 backdrop-blur-md shadow-2xl">
        {/* Player Profile Block (Top of Sidebar) */}
        <div className="border-b-[3px] border-[#1a1a1a] bg-[#2b2d31]/50 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar username={user?.username} size="lg" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="font-minecraft text-sm font-bold text-[#e0e0e0] truncate"
                    title={user?.username || ""}
                  >
                    {user?.username || t.DASHBOARD.PLAYER_DEFAULT}
                  </span>
                  <span className="rounded bg-[#3a753a] px-1.5 py-0.5 font-minecraft text-[10px] font-bold text-white">
                    {t.DASHBOARD.PLAYER_RANK_VIP}
                  </span>
                </div>
                <div className="font-minecraft text-xs text-[#8a8a8a]">
                  {t.DASHBOARD.PLAYER_ID_LABEL} {user?.id?.slice(0, 8) || t.DASHBOARD.PLAYER_ID_UNKNOWN}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="mc-btn mc-btn-sm shrink-0"
              title={t.DASHBOARD.LOGOUT_TOOLTIP}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="square"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Server Status (Compact) */}
        {serverStatus && (
          <div className="border-b-[3px] border-[#1a1a1a] bg-[#25272c]/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${serverStatus.online ? "bg-[#55ff55] animate-pulse" : "bg-[#ff5555]"}`}
                />
                <span className="font-minecraft text-xs font-bold text-[#e0e0e0]">
                  {serverStatus.online ? t.DASHBOARD.SERVER_ONLINE : t.DASHBOARD.SERVER_OFFLINE}
                </span>
              </div>
              {serverStatus.online && (
                <div className="font-minecraft text-xs">
                  <span className="text-[#55aaff]">
                    {serverStatus.players.online}
                  </span>
                  <span className="text-[#6a6a6a]"> / </span>
                  <span className="text-[#55aaff]">
                    {serverStatus.players.max}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Versions Section */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b-[2px] border-[#1a1a1a] bg-[#2b2d31]/30 px-4 py-3">
            <h2 className="font-minecraft text-xs font-bold uppercase tracking-wider text-[#8a8a8a]">
              {t.DASHBOARD.VERSIONS_TITLE}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {versions.map((version) => (
                <Card
                  key={version.id}
                  active={selectedVersionId === version.id}
                  onClick={() => setSelectedVersionId(version.id)}
                  className="p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getVersionIcon(version.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-minecraft text-sm font-bold text-[#e0e0e0] truncate">
                        {version.name}
                      </div>
                      <div
                        className={`font-minecraft text-xs ${version.isInstalled ? "text-[#5a5]" : "text-[#8a8a8a]"}`}
                      >
                        {version.isInstalled
                          ? t.DASHBOARD.VERSION_INSTALLED
                          : t.DASHBOARD.VERSION_NOT_INSTALLED}
                      </div>
                    </div>
                    {selectedVersionId === version.id && (
                      <span className="text-green-400 text-lg font-bold">
                        {t.DASHBOARD.PLAY_ARROW_ICON}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Button (Fixed at Bottom) */}
        <div className="border-t-[3px] border-[#1a1a1a] bg-[#2b2d31]/95 p-4">
          <Button 
            onClick={handleSettings} 
            className="w-full justify-start"
            variant="minecraft"
            size="md"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="square"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="square"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {t.DASHBOARD.SETTINGS_BUTTON}
          </Button>
        </div>
      </aside>

      {/* ZONE 2: Main Content Area */}
      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Top Bar with Window Controls and Version */}
        <div className="absolute right-4 top-4 z-50 flex items-center gap-4">
          {/* Version Display */}
          {appVersion && (
            <div className="font-minecraft text-xs text-[#6a6a6a]">
              {t.DASHBOARD.VERSION_DISPLAY_LABEL} {appVersion}
            </div>
          )}
          {/* Window Controls */}
          <WindowControls />
        </div>

        {/* Content with padding for window controls */}
        <div className="flex-1 overflow-y-auto pt-20 pb-4 flex flex-col">
          {isLaunching ? (
            <div className="px-6 h-full flex flex-col">
              <h2 className="mb-4 font-minecraft text-lg font-bold uppercase tracking-wider text-[#e0e0e0]">
                Console
              </h2>
              <div className="flex-1 bg-[#101010] border-[2px] border-[#1a1a1a] rounded p-4 font-mono text-xs text-[#55ff55] overflow-y-auto shadow-inner">
                {logs.length === 0 && <div className="text-gray-500">Waiting for logs...</div>}
                {logs.map((log, i) => (
                  <div key={i} className="break-words mb-1 opacity-90 hover:opacity-100">{log}</div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          ) : (
          <div className="px-6">
            <h2 className="mb-6 font-minecraft text-lg font-bold uppercase tracking-wider text-[#e0e0e0]">
              {t.DASHBOARD.NEWS_TITLE}
            </h2>

            <div className="grid gap-5">
              {isLoadingNews
                ? // Skeleton loading
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="mc-card animate-pulse">
                      <div className="mb-4 h-48 bg-gray-700" />
                      <div className="mb-3 h-6 w-2/3 bg-gray-700" />
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-700" />
                        <div className="h-4 w-5/6 bg-gray-700" />
                      </div>
                    </div>
                  ))
                : news.map((item) => (
                    <Card
                      key={item.id}
                      className="overflow-hidden p-0"
                    >
                      <div className="mb-4 h-48 w-full overflow-hidden rounded-none border-b-[3px] border-[#1a1a1a]">
                        <img
                          src={newsPlaceholder}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                      <div className="mb-3 flex items-center gap-3">
                        <span
                          className={`px-3 py-1 font-minecraft text-xs font-bold text-[#e0e0e0] ${getCategoryColor(item.category)}`}
                        >
                          {getCategoryLabel(item.category)}
                        </span>
                        <span className="font-minecraft text-xs text-[#6a6a6a]">
                          {new Date(item.date).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className="mb-3 font-minecraft text-lg font-bold text-[#e0e0e0]">
                        {item.title}
                      </h3>
                      <p className="font-minecraft text-sm leading-relaxed text-[#a0a0a0]">
                        {item.content}
                      </p>
                    </Card>
                  ))}
            </div>
          </div>
          )}
        </div>

        {/* ZONE 3: Action Bar (Fixed at Bottom) */}
        <div className="shrink-0 border-t-[4px] border-[#1a1a1a] bg-[#2b2d31]/95 backdrop-blur-md p-6 shadow-2xl">
          {!isDownloading && !isLaunching ? (
            /* Play Button State */
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="min-w-0">
                  <div className="font-minecraft text-xs text-gray-400">
                    {t.DASHBOARD.SELECTED_VERSION_LABEL}
                  </div>
                  <div className="font-minecraft text-base font-bold text-[#e0e0e0] truncate">
                    {selectedVersion?.name || t.DASHBOARD.VERSION_NOT_SELECTED}
                  </div>
                  <div className="font-minecraft text-xs">
                    {selectedVersion?.isInstalled ? (
                      <span className="text-[#5a5]">{t.DASHBOARD.READY_TO_PLAY}</span>
                    ) : (
                      <span className="text-[#8a8a8a]">
                        {t.DASHBOARD.NEEDS_INSTALLATION}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePlay}
                variant="primary"
                size="xl"
                className="min-w-[320px]"
              >
                <span className="text-xl">{t.DASHBOARD.PLAY_ICON}</span>
                <span className="ml-3 text-lg">{t.DASHBOARD.PLAY_BUTTON}</span>
              </Button>
            </div>
          ) : isLaunching ? (
            /* Launching State */
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full border-4 border-[#55aaff] border-t-transparent animate-spin" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-minecraft text-sm text-[#55aaff] flex items-center gap-2">
                      <span className="capitalize">{launchStatus}</span>
                      {launchProgress === null && <span className="animate-pulse">...</span>}
                    </div>
                    {launchProgress !== null && (
                      <div className="font-minecraft text-xs text-[#55aaff]">
                        {launchProgress}%
                      </div>
                    )}
                  </div>
                  <div className="font-minecraft text-base font-bold text-[#e0e0e0] truncate">
                    {selectedVersion?.name || "Minecraft 1.20.4"}
                  </div>
                  
                  <ProgressBar 
                    progress={launchProgress !== null ? launchProgress : 0} 
                    className="mt-3"
                  />
                </div>
              </div>

              <Button
                onClick={() => setIsLaunching(false)}
                variant="danger"
                size="lg"
              >
                <span className="mr-2">{t.DASHBOARD.CANCEL_ICON}</span>
                Hide Console
              </Button>
            </div>
          ) : (
            /* Downloading State */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-minecraft text-sm text-gray-400">
                      {progress?.status || t.COMMON.LOADING}
                    </div>
                    <div className="font-minecraft text-sm text-[#55aaff]">
                      {progress?.speed && <span>{progress.speed}</span>}
                      {progress?.speed && progress?.eta && (
                        <span className="mx-2">•</span>
                      )}
                      {progress?.eta && <span>{t.DASHBOARD.TIME_REMAINING_LABEL} {progress.eta}</span>}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCancel}
                  variant="danger"
                  size="lg"
                >
                  <span className="mr-2">{t.DASHBOARD.CANCEL_ICON}</span>
                  {t.COMMON.CANCEL}
                </Button>
              </div>

              <ProgressBar
                progress={progress?.progress || 0}
                status={progress?.status || t.COMMON.LOADING}
                speed={progress?.speed}
                eta={progress?.eta}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
