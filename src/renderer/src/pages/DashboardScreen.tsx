import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../stores/useAuthStore';
import { useDownloadStore } from '../stores/useDownloadStore';
import { useNewsStore } from '../stores/useNewsStore';
import { useServerStatusStore } from '../stores/useServerStatusStore';
import { WindowControls, Avatar } from '../components';
import miniLogo from '../assets/photo_2026-04-23_10-35-12.jpg';
import newsPlaceholder from '../assets/photo_2026-04-23_10-34-22.jpg';

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
  const { isDownloading, progress, startDownload, cancelDownload, resetDownload } = useDownloadStore();
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

  const handleCancel = () => {
    cancelDownload();
  };

  const handleSettings = () => {
    console.log('Navigating to settings...');
    navigate({ to: '/settings' });
  };

  const handleLogout = () => {
    setShouldLogout(true);
    logout();
    localStorage.removeItem('gerbarium-auth-storage');
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#1a1a1a]">
      {/* Main layout: sidebar + content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* ZONE 1: Left Sidebar - Navigation & Versions */}
        <aside className="flex w-72 flex-col border-r-[3px] border-[#1a1a1a] bg-[#252525]">
          {/* Logo */}
          <div className="flex items-center justify-center border-b-[3px] border-[#1a1a1a] bg-[#2b2d31] p-6">
            <img
              src={miniLogo}
              alt="Gerbarium"
              className="h-16 w-auto object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Versions List */}
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="mb-4 font-minecraft text-sm font-bold uppercase text-gray-400">
              Версии
            </h2>
            <div className="space-y-2">
              {mockVersions.map((version) => (
                <div
                  key={version.id}
                  onClick={() => setSelectedVersion(version.id)}
                  className={`mc-card mc-card-clickable ${
                    selectedVersion === version.id ? 'mc-panel-active' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
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
                </div>
              ))}
            </div>
          </div>

          {/* Settings Button (bottom) */}
          <div className="relative z-10 border-t-[3px] border-[#1a1a1a] bg-[#2b2d31] p-4">
            <button
              onClick={handleSettings}
              className="mc-btn mc-btn-secondary w-full"
              style={{ zIndex: 999 }}
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="square" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Настройки
            </button>
          </div>
        </aside>

        {/* ZONE 2 & 3: Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* ZONE 2: Content with Header & News */}
          <div className="flex-1 overflow-y-auto bg-[#1a1a1a]">
            {/* Header */}
            <header className="title-bar-drag sticky top-0 z-20 flex items-center justify-between border-b-[3px] border-[#1a1a1a] bg-[#2b2d31]/95 px-6 py-4 backdrop-blur">
              <div>
                <h1 className="font-minecraft text-xl font-bold text-[#e0e0e0]">
                  Gerbarium Launcher
                </h1>
                <p className="font-minecraft text-xs text-gray-400">
                  Добро пожаловать, {user?.username || 'Игрок'}!
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Server Status */}
                {serverStatus && (
                  <div className="mc-panel px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${serverStatus.online ? 'bg-[#55ff55] animate-pulse' : 'bg-[#ff5555]'}`} />
                      <span className="font-minecraft text-xs text-[#e0e0e0]">
                        {serverStatus.online ? 'Онлайн' : 'Оффлайн'}
                      </span>
                      {serverStatus.online && (
                        <span className="font-minecraft text-xs text-[#55aaff]">
                          {serverStatus.players.online}/{serverStatus.players.max}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Settings Button in Header */}
                <button
                  onClick={handleSettings}
                  className="mc-btn mc-btn-sm"
                  title="Настройки"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="square" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3">
                  <Avatar username={user?.username} size="md" />
                  <span className="font-minecraft text-sm text-[#e0e0e0]">
                    {user?.username || 'Игрок'}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="font-minecraft text-xs text-[#8a8a8a] transition-colors hover:text-[#ff5555]"
                >
                  Выйти
                </button>

                {/* Window Controls */}
                <div className="ml-4">
                  <WindowControls />
                </div>
              </div>
            </header>

            {/* News Feed */}
            <div className="p-6">
              <h2 className="mb-6 font-minecraft text-lg font-bold uppercase text-[#e0e0e0]">
                Новости
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                {isLoadingNews ? (
                  // Skeleton loading
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="mc-card animate-pulse">
                      <div className="mb-3 h-32 bg-gray-700" />
                      <div className="mb-2 h-4 w-3/4 bg-gray-700" />
                      <div className="h-3 w-full bg-gray-700" />
                    </div>
                  ))
                ) : (
                  news.map((item) => (
                    <article
                      key={item.id}
                      className="mc-card mc-card-clickable overflow-hidden"
                    >
                      <div className="mb-3 h-32 w-full overflow-hidden">
                        <img
                          src={newsPlaceholder}
                          alt={item.title}
                          className="h-full w-full object-cover"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className={`px-2 py-0.5 font-minecraft text-xs text-[#e0e0e0] ${getCategoryColor(item.category)}`}>
                          {getCategoryLabel(item.category)}
                        </span>
                        <span className="font-minecraft text-xs text-gray-500">
                          {new Date(item.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                          })}
                        </span>
                      </div>
                      <h3 className="mb-2 font-minecraft text-base font-bold text-[#e0e0e0]">
                        {item.title}
                      </h3>
                      <p className="font-minecraft text-sm leading-relaxed text-[#a0a0a0]">
                        {item.content.slice(0, 150)}...
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ZONE 3: Action Bar (Fixed at bottom) */}
          <div className="border-t-[3px] border-[#1a1a1a] bg-[#2b2d31] px-6 py-4">
            {!isDownloading ? (
              /* Play Button State */
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-minecraft text-xs text-gray-400">
                      Выбранная версия
                    </div>
                    <div className="font-minecraft text-sm font-bold text-[#e0e0e0]">
                      {mockVersions.find((v) => v.id === selectedVersion)?.name || 'Не выбрана'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlay}
                  className="mc-btn mc-btn-primary mc-btn-xl min-w-[280px]"
                >
                  <span className="text-lg">🎮</span>
                  <span className="ml-2">ИГРАТЬ</span>
                </button>
              </div>
            ) : (
              /* Downloading State */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-minecraft text-xs text-gray-400">
                        {progress?.status || 'Загрузка...'}
                      </div>
                      <div className="font-minecraft text-sm text-[#55aaff]">
                        {progress?.speed && `${progress.speed} • `}
                        {progress?.eta && `Осталось: ${progress.eta}`}
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
                    <span className="font-minecraft text-sm font-bold text-white drop-shadow-[2px_2px_0_#000]">
                      {progress?.progress || 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
