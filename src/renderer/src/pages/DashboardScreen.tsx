import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../stores/useAuthStore';
import { useDownloadStore } from '../stores/useDownloadStore';
import { useNewsStore } from '../stores/useNewsStore';
import { useServerStatusStore } from '../stores/useServerStatusStore';
import { WindowControls, Avatar, ProgressBar, Skeleton, NewsCardSkeleton } from '../components';
import miniLogo from '../assets/photo_2026-04-23_10-35-12.jpg';

// Mock versions data
const mockVersions = [
  { id: 'gerbarium-1.2', name: 'Gerbarium v1.2', type: 'gerbarium' as const, isInstalled: true },
  { id: 'fabric-1.21', name: 'Fabric 1.21', type: 'fabric' as const, isInstalled: true },
  { id: 'forge-1.20.1', name: 'Forge 1.20.1', type: 'forge' as const, isInstalled: true },
  { id: 'vanilla-1.21.4', name: 'Vanilla 1.21.4', type: 'vanilla' as const, isInstalled: false },
];

function getVersionIcon(type: string) {
  const icons: Record<string, string> = {
    gerbarium: '💎',
    fabric: '🧵',
    forge: '⚒️',
    vanilla: '🟩',
  };
  return icons[type] || '📦';
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    update: 'bg-[#3a753a]',
    event: 'bg-[#8b5a2a]',
    community: 'bg-[#5a5a8b]',
    announcement: 'bg-[#8b2a2a]',
  };
  return colors[category] || 'bg-[#5a5a5a]';
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    update: 'Обновление',
    event: 'Событие',
    community: 'Сообщество',
    announcement: 'Анонс',
  };
  return labels[category] || category;
}

export function DashboardScreen() {
  const navigate = useNavigate();
  
  // Zustand stores
  const { user, logout, isAuthenticated } = useAuthStore();
  const { isDownloading, progress, startDownload } = useDownloadStore();
  const { items: news, isLoading: isLoadingNews } = useNewsStore();
  const { data: serverStatus } = useServerStatusStore();
  
  // Local state
  const [selectedVersion, setSelectedVersion] = useState<string | null>(
    mockVersions[0]?.id || null
  );
  const [shouldLogout, setShouldLogout] = useState(false);

  // Handle logout redirect
  useEffect(() => {
    if (!isAuthenticated && shouldLogout) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, shouldLogout, navigate]);

  const handlePlay = async () => {
    if (!selectedVersion) return;
    await startDownload(selectedVersion);
  };

  const handleSettings = () => {
    navigate({ to: '/settings' });
  };

  const handleLogout = () => {
    setShouldLogout(true);
    logout();
    localStorage.removeItem('gerbarium-auth-storage');
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#1a1a1a]">
      {/* Top Bar */}
      <header className="title-bar-drag flex h-16 shrink-0 items-center justify-between border-b-[3px] border-[#1a1a1a] bg-[#2b2d31] px-4">
        <div className="flex items-center gap-4">
          {/* Mini Logo */}
          <img
            src={miniLogo}
            alt="MG"
            className="h-12 w-auto object-contain"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <button
              onClick={handleSettings}
              className="border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] px-4 py-2 font-minecraft text-sm text-[#e0e0e0] transition-colors hover:bg-[#3c3c3c] active:border-t-[#1a1a1a] active:border-l-[#1a1a1a] active:border-b-[#5a5a5a] active:border-r-[#5a5a5a]"
            >
              Настройки
            </button>
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Server Status */}
          <div className="flex items-center gap-3 rounded border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] px-4 py-2">
            <div className={`h-2 w-2 rounded-full ${serverStatus?.online ? 'bg-[#55ff55] animate-pulse' : 'bg-[#ff5555]'}`} />
            <span className="font-minecraft text-xs text-[#e0e0e0]">
              {serverStatus?.online ? 'Онлайн' : 'Оффлайн'}
            </span>
            {serverStatus?.online && (
              <span className="font-minecraft text-xs text-[#55aaff]">
                 {serverStatus.players.online}/{serverStatus.players.max}
              </span>
            )}
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <Avatar username={user?.username} size="md" />
            <span className="font-minecraft text-sm text-[#e0e0e0]">
              Привет, {user?.username || 'Игрок'}!
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="font-minecraft text-xs text-[#8a8a8a] transition-colors hover:text-[#e0e0e0]"
          >
            Выйти
          </button>

          {/* Window Controls */}
          <div>
            <WindowControls />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Panel - Version List */}
        <aside className="flex w-80 flex-col shrink-0 border-r-[3px] border-[#1a1a1a] bg-[#252525]">
          <div className="border-b-[3px] border-[#1a1a1a] p-4">
            <h2 className="font-minecraft text-lg font-bold uppercase text-[#e0e0e0]">
              Версии
            </h2>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {mockVersions.map((version) => (
              <div
                key={version.id}
                onClick={() => setSelectedVersion(version.id)}
                className={`flex cursor-pointer items-center gap-3 rounded border-[3px] p-4 transition-colors ${
                  selectedVersion === version.id
                    ? 'border-t-[#3a753a] border-l-[#3a753a] border-b-[#2a5a2a] border-r-[#2a5a2a] bg-[#3a753a]/20'
                    : 'border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] hover:bg-[#36393f]'
                }`}
              >
                <span className="text-2xl">{getVersionIcon(version.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-minecraft text-sm font-bold text-[#e0e0e0] truncate">
                    {version.name}
                  </div>
                  <div className={`font-minecraft text-xs ${version.isInstalled ? 'text-[#5a5]' : 'text-[#8a8a8a]'}`}>
                    {version.isInstalled ? 'Установлено' : 'Не установлено'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Play Button & Progress */}
          <div className="border-t-[3px] border-[#1a1a1a] bg-[#2b2d31] p-4 space-y-3">
            {isDownloading && progress && (
              <ProgressBar
                progress={progress.progress}
                status={progress.status}
                speed={progress.speed}
                eta={progress.eta}
              />
            )}

            <button
              onClick={handlePlay}
              disabled={isDownloading}
              className="flex w-full items-center justify-center rounded border-[3px] border-t-[#4a9a4a] border-l-[#4a9a4a] border-b-[#2a5a2a] border-r-[#2a5a2a] bg-gradient-to-br from-[#3a753a] to-[#2d5a2d] py-6 font-minecraft text-xl font-bold text-white shadow-[inset_2px_2px_0px_#4a9a4a,inset_-2px_-2px_0px_#2a5a2a] transition-all duration-75 hover:from-[#4a8a4a] hover:to-[#3d6a3d] active:border-t-[#2a5a2a] active:border-l-[#2a5a2a] active:border-b-[#4a9a4a] active:border-r-[#4a9a4a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloading ? 'Загрузка...' : 'ИГРАТЬ'}
            </button>
          </div>
        </aside>

        {/* Right Panel - News Feed */}
        <section className="flex-1 overflow-y-auto bg-[#1a1a1a] p-6">
          <h2 className="mb-6 font-minecraft text-xl font-bold uppercase text-[#e0e0e0]">
            Новости
          </h2>

          <div className="space-y-4">
            {isLoadingNews ? (
              <>
                <NewsCardSkeleton />
                <NewsCardSkeleton />
                <NewsCardSkeleton />
              </>
            ) : (
              news.map((item) => (
                <div
                  key={item.id}
                  className="flex overflow-hidden rounded border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] shadow-[inset_2px_2px_0px_#5a5a5a,inset_-2px_-2px_0px_#1a1a1a]"
                >
                  <div className={`w-1 ${getCategoryColor(item.category)}`} />
                  <div className="flex-1 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`px-2 py-0.5 font-minecraft text-xs text-[#e0e0e0] ${getCategoryColor(item.category)}`}>
                        {getCategoryLabel(item.category)}
                      </span>
                      <span className="font-minecraft text-xs text-[#6a6a6a]">
                        {new Date(item.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="mb-2 font-minecraft text-base font-bold text-[#e0e0e0]">
                      {item.title}
                    </h3>
                    <p className="font-minecraft text-sm leading-relaxed text-[#a0a0a0]">
                      {item.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
