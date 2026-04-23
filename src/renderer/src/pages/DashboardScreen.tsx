import { useState } from 'react';
import { useAuth } from '../hooks';
import { Button, Card, WindowControls, ProgressBar, ServerStatus, Avatar, Skeleton } from '../components';
import type { GameVersion, NewsItem } from '../types';
import { useNavigate } from '@tanstack/react-router';
import miniLogo from '../assets/photo_2026-04-23_10-35-12.jpg';

// Mock data - replace with actual API calls
const mockVersions: GameVersion[] = [
  {
    id: 'gerbarium-1.2',
    name: 'Gerbarium v1.2',
    type: 'gerbarium',
    isInstalled: true,
  },
  {
    id: 'fabric-1.21',
    name: 'Fabric 1.21',
    type: 'fabric',
    isInstalled: true,
  },
  {
    id: 'forge-1.20.1',
    name: 'Forge 1.20.1',
    type: 'forge',
    isInstalled: true,
  },
  {
    id: 'vanilla-1.21.4',
    name: 'Vanilla 1.21.4',
    type: 'vanilla',
    isInstalled: false,
  },
];

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Кристальные мобы: Обновление Гербариум!',
    content:
      'Новое крупное обновление добавляет кристальных мобов, новые биомы и улучшенную систему крафта. Исследуйте новые измерения и сражайтесь с эпическими боссами!',
    date: '2026-04-20',
    category: 'update',
  },
  {
    id: '2',
    title: 'Новая система скинов',
    content:
      'Теперь вы можете загружать собственные скины прямо в лаунчере! Поддержка HD текстур и плащей.',
    date: '2026-04-15',
    category: 'announcement',
  },
  {
    id: '3',
    title: 'Турнир сообщества',
    content:
      'Присоединяйтесь к еженедельному турниру! Призовой фонд: 10,000 кристаллов. Регистрация открыта до конца недели.',
    date: '2026-04-10',
    category: 'event',
  },
];

function getVersionIcon(type: GameVersion['type']) {
  const icons: Record<GameVersion['type'], string> = {
    gerbarium: '💎',
    fabric: '🧵',
    forge: '⚒️',
    vanilla: '🟩',
  };
  return icons[type] || '📦';
}

function getCategoryColor(category: NewsItem['category']) {
  const colors: Record<NewsItem['category'], string> = {
    update: 'bg-[#3a753a]',
    event: 'bg-[#8b5a2a]',
    community: 'bg-[#5a5a8b]',
    announcement: 'bg-[#8b2a2a]',
  };
  return colors[category] || 'bg-[#5a5a5a]';
}

function getCategoryLabel(category: NewsItem['category']) {
  const labels: Record<NewsItem['category'], string> = {
    update: 'Обновление',
    event: 'Событие',
    community: 'Сообщество',
    announcement: 'Анонс',
  };
  return labels[category] || category;
}

export function DashboardScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedVersion, setSelectedVersion] = useState<string | null>(
    mockVersions[0]?.id || null
  );
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  
  // Download progress state
  const [downloadProgress, setDownloadProgress] = useState<{
    progress: number;
    status: string;
    speed?: string;
    eta?: string;
  } | null>(null);

  // Simulate news loading
  useState(() => {
    setTimeout(() => setIsLoadingNews(false), 1500);
  });

  const handlePlay = async () => {
    if (!selectedVersion) return;

    setIsLaunching(true);
    
    // Simulate download progress
    setDownloadProgress({
      progress: 0,
      status: 'Инициализация загрузки...',
      speed: '0 МБ/с',
      eta: 'Calculating...',
    });

    // Simulate download stages
    const stages = [
      { progress: 10, status: 'Проверка файлов игры...', speed: '0 МБ/с' },
      { progress: 25, status: 'Скачивание библиотек...', speed: '2.5 МБ/с', eta: '~30 сек' },
      { progress: 50, status: 'Загрузка ассетов...', speed: '3.2 МБ/с', eta: '~20 сек' },
      { progress: 75, status: 'Установка модов...', speed: '4.1 МБ/с', eta: '~10 сек' },
      { progress: 90, status: 'Проверка целостности...', speed: '0 МБ/с' },
      { progress: 100, status: 'Готово!', speed: '0 МБ/с' },
    ];

    for (const stage of stages) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setDownloadProgress({
        progress: stage.progress,
        status: stage.status,
        speed: stage.speed,
        eta: stage.eta,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLaunching(false);
    setDownloadProgress(null);
    
    // TODO: Implement actual game launch logic
  };

  const handleSettings = () => {
    navigate({ to: '/settings' });
  };

  return (
    <div className="w-full h-screen bg-[#1a1a1a] overflow-hidden flex flex-col">
      {/* Top Bar */}
      <header className="h-16 bg-[#2b2d31] border-b-[3px] border-[#1a1a1a] flex items-center justify-between px-4 shrink-0 title-bar-drag">
        <div className="flex items-center gap-4">
          {/* Mini Logo */}
          <img
            src={miniLogo}
            alt="MG"
            className="h-12 w-auto object-contain"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* Navigation */}
          <nav className="flex items-center gap-2 ml-4">
            <button
              onClick={handleSettings}
              className="px-4 py-2 text-[#e0e0e0] hover:bg-[#3c3c3c] font-minecraft text-sm transition-colors
                border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a]
                active:border-t-[#1a1a1a] active:border-l-[#1a1a1a] active:border-b-[#5a5a5a] active:border-r-[#5a5a5a]"
            >
              Настройки
            </button>
          </nav>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4">
          {/* Server Status */}
          <ServerStatus />

          <div className="flex items-center gap-3">
            <Avatar username={user?.username} size="md" />
            <span className="text-[#e0e0e0] font-minecraft text-sm">
              Привет, {user?.username || 'Игрок'}!
            </span>
          </div>

          <button
            onClick={logout}
            className="text-[#8a8a8a] hover:text-[#e0e0e0] text-xs font-minecraft transition-colors"
          >
            Выйти
          </button>

          {/* Window Controls */}
          <div className="ml-2">
            <WindowControls />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Version List */}
        <aside className="w-80 bg-[#252525] border-r-[3px] border-[#1a1a1a] flex flex-col shrink-0">
          <div className="p-4 border-b-[3px] border-[#1a1a1a]">
            <h2 className="text-lg font-bold text-[#e0e0e0] font-minecraft uppercase">
              Версии
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mockVersions.map((version) => (
              <Card
                key={version.id}
                active={selectedVersion === version.id}
                onClick={() => setSelectedVersion(version.id)}
                className="flex items-center gap-3"
              >
                <div className="text-2xl">{getVersionIcon(version.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#e0e0e0] font-minecraft text-sm font-bold truncate">
                    {version.name}
                  </div>
                  <div
                    className={`text-xs font-minecraft ${version.isInstalled ? 'text-[#5a5]' : 'text-[#8a8a8a]'}`}
                  >
                    {version.isInstalled ? 'Установлено' : 'Не установлено'}
                  </div>
                </div>
                {!version.isInstalled && (
                  <Button variant="secondary" size="sm">
                    Скачать
                  </Button>
                )}
              </Card>
            ))}
          </div>

          {/* Play Button - BIG and PROMINENT */}
          <div className="p-4 border-t-[3px] border-[#1a1a1a] bg-[#2b2d31] space-y-3">
            {/* Download Progress */}
            {downloadProgress && (
              <ProgressBar
                progress={downloadProgress.progress}
                status={downloadProgress.status}
                speed={downloadProgress.speed}
                eta={downloadProgress.eta}
              />
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full text-xl font-bold py-6"
              onClick={handlePlay}
              isLoading={isLaunching && !downloadProgress}
              disabled={isLaunching}
            >
              {isLaunching ? (downloadProgress?.progress === 100 ? 'Запуск...' : 'Загрузка...') : 'ИГРАТЬ'}
            </Button>
          </div>
        </aside>

        {/* Right Panel - News Feed */}
        <section className="flex-1 bg-[#1a1a1a] overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-[#e0e0e0] font-minecraft uppercase mb-6">
            Новости
          </h2>

          <div className="space-y-4">
            {isLoadingNews ? (
              // Skeleton loading states
              <>
                <Skeleton variant="news-card" />
                <Skeleton variant="news-card" />
                <Skeleton variant="news-card" />
              </>
            ) : (
              mockNews.map((news) => (
                <Card key={news.id} className="p-0 overflow-hidden">
                  <div className="flex">
                    {/* Category Badge */}
                    <div
                      className={`w-1 ${getCategoryColor(news.category)}`}
                    />

                    <div className="flex-1 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 text-xs font-minecraft text-[#e0e0e0] ${getCategoryColor(news.category)}`}
                        >
                          {getCategoryLabel(news.category)}
                        </span>
                        <span className="text-[#6a6a6a] text-xs font-minecraft">
                          {new Date(news.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <h3 className="text-[#e0e0e0] font-minecraft font-bold text-base mb-2">
                        {news.title}
                      </h3>

                      <p className="text-[#a0a0a0] font-minecraft text-sm leading-relaxed">
                        {news.content}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
