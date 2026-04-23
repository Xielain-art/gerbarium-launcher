import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useDownloadStore } from "../stores/useDownloadStore";
import { useNewsStore } from "../stores/useNewsStore";
import { useServerStatusStore } from "../stores/useServerStatusStore";
import { WindowControls, Avatar } from "../components";
import miniLogo from "../assets/photo_2026-04-23_10-35-12.jpg";
import newsPlaceholder from "../assets/photo_2026-04-23_10-34-22.jpg";

// Mock versions data
const mockVersions = [
  {
    id: "gerbarium-1.2",
    name: "Gerbarium v1.2",
    type: "gerbarium" as const,
    isInstalled: true,
  },
  {
    id: "fabric-1.21",
    name: "Fabric 1.21",
    type: "fabric" as const,
    isInstalled: true,
  },
  {
    id: "forge-1.20.1",
    name: "Forge 1.20.1",
    type: "forge" as const,
    isInstalled: true,
  },
  {
    id: "vanilla-1.21.4",
    name: "Vanilla 1.21.4",
    type: "vanilla" as const,
    isInstalled: false,
  },
  {
    id: "vanilla-42",
    name: "ТЕСТ РЕЛИЗА 1.0.1",
    type: "vanilla" as const,
    isInstalled: false,
  },
];

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
  const labels: Record<string, string> = {
    update: "Обновление",
    event: "Событие",
    community: "Сообщество",
    announcement: "Анонс",
  };
  return labels[category] || category;
}

export function DashboardScreen() {
  const navigate = useNavigate();

  // Zustand stores
  const { user, logout, isAuthenticated } = useAuthStore();
  const { isDownloading, progress, startDownload, cancelDownload } =
    useDownloadStore();
  const { items: news, isLoading: isLoadingNews } = useNewsStore();
  const { data: serverStatus } = useServerStatusStore();

  // Local state
  const [selectedVersion, setSelectedVersion] = useState<string | null>(
    mockVersions[0]?.id || null,
  );
  const [shouldLogout, setShouldLogout] = useState(false);
  const [appVersion, setAppVersion] = useState<string>("");

  // Handle logout redirect
  useEffect(() => {
    if (!isAuthenticated && shouldLogout) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, shouldLogout, navigate]);

  // Get app version on mount
  useEffect(() => {
    window.electronAPI.getAppVersion().then(setAppVersion);
  }, []);

  const handlePlay = async () => {
    if (!selectedVersion) {
      alert("Выберите версию для запуска!");
      return;
    }
    await startDownload(selectedVersion);
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersion(versionId);
  };

  const handleCancel = () => {
    cancelDownload();
  };

  const handleSettings = () => {
    navigate({ to: "/settings" });
  };

  const handleLogout = () => {
    setShouldLogout(true);
    logout();
    localStorage.removeItem("gerbarium-auth-storage");
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
                    {user?.username || "Игрок"}
                  </span>
                  <span className="rounded bg-[#3a753a] px-1.5 py-0.5 font-minecraft text-[10px] font-bold text-white">
                    VIP
                  </span>
                </div>
                <div className="font-minecraft text-xs text-[#8a8a8a]">
                  ID: {user?.id?.slice(0, 8) || "???"}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="mc-btn mc-btn-sm shrink-0"
              title="Выйти"
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
                  {serverStatus.online ? "ОНЛАЙН" : "ОФФЛАЙН"}
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
              Версии
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {mockVersions.map((version) => (
                <div
                  key={version.id}
                  onClick={() => handleVersionSelect(version.id)}
                  className={`mc-card mc-card-clickable cursor-pointer transition-all ${
                    selectedVersion === version.id ? "mc-panel-active" : ""
                  }`}
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
                          ? "✓ Установлено"
                          : "○ Не установлено"}
                      </div>
                    </div>
                    {selectedVersion === version.id && (
                      <span className="text-green-400 text-lg font-bold">
                        ▶
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Button (Fixed at Bottom) */}
        <div className="border-t-[3px] border-[#1a1a1a] bg-[#2b2d31]/95 p-4">
          <button onClick={handleSettings} className="mc-btn mc-btn-md w-full">
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
            Настройки
          </button>
        </div>
      </aside>

      {/* ZONE 2: Main Content Area */}
      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Top Bar with Window Controls and Version */}
        <div className="absolute right-4 top-4 z-50 flex items-center gap-4">
          {/* Version Display */}
          {appVersion && (
            <div className="font-minecraft text-xs text-[#6a6a6a]">
              Версия: {appVersion}
            </div>
          )}
          {/* Window Controls */}
          <WindowControls />
        </div>

        {/* Content with padding for window controls */}
        <div className="flex-1 overflow-y-auto pt-20 pb-4">
          {/* News Section */}
          <div className="px-6">
            <h2 className="mb-6 font-minecraft text-lg font-bold uppercase tracking-wider text-[#e0e0e0]">
              Новости проекта
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
                    <article
                      key={item.id}
                      className="mc-card mc-card-clickable overflow-hidden"
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
                    </article>
                  ))}
            </div>
          </div>
        </div>

        {/* ZONE 3: Action Bar (Fixed at Bottom) */}
        <div className="shrink-0 border-t-[4px] border-[#1a1a1a] bg-[#2b2d31]/95 backdrop-blur-md p-6 shadow-2xl">
          {!isDownloading ? (
            /* Play Button State */
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="min-w-0">
                  <div className="font-minecraft text-xs text-gray-400">
                    Выбранная версия
                  </div>
                  <div className="font-minecraft text-base font-bold text-[#e0e0e0] truncate">
                    {mockVersions.find((v) => v.id === selectedVersion)?.name ||
                      "Не выбрана"}
                  </div>
                  <div className="font-minecraft text-xs">
                    {mockVersions.find((v) => v.id === selectedVersion)
                      ?.isInstalled ? (
                      <span className="text-[#5a5]">✓ Готово к запуску</span>
                    ) : (
                      <span className="text-[#8a8a8a]">
                        ○ Требуется установка
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlay}
                className="mc-btn mc-btn-primary mc-btn-xl min-w-[320px] shrink-0"
              >
                <span className="text-xl">🎮</span>
                <span className="ml-3 text-lg">ИГРАТЬ</span>
              </button>
            </div>
          ) : (
            /* Downloading State */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-minecraft text-sm text-gray-400">
                      {progress?.status || "Загрузка..."}
                    </div>
                    <div className="font-minecraft text-sm text-[#55aaff]">
                      {progress?.speed && <span>{progress.speed}</span>}
                      {progress?.speed && progress?.eta && (
                        <span className="mx-2">•</span>
                      )}
                      {progress?.eta && <span>Осталось: {progress.eta}</span>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCancel}
                  className="mc-btn mc-btn-danger mc-btn-lg"
                >
                  <span className="mr-2">❌</span>
                  ОТМЕНА
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mc-progress">
                <div
                  className="mc-progress-fill mc-progress-striped"
                  style={{ width: `${progress?.progress || 0}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-minecraft text-base font-bold text-white drop-shadow-[2px_2px_0_#000]">
                    {progress?.progress || 0}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
