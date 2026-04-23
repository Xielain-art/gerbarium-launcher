import { useState, useEffect } from 'react';

export interface ServerStatusData {
  online: boolean;
  players: {
    online: number;
    max: number;
  };
  version?: string;
  motd?: string;
}

export interface ServerStatusProps {
  serverIp?: string;
  serverPort?: number;
}

// Mock data - replace with actual API call to your server
const mockServerStatus: ServerStatusData = {
  online: true,
  players: {
    online: 142,
    max: 500,
  },
  version: '1.20.1',
  motd: '§b§lGerbarium §8| §aКристальное обновление!',
};

export function ServerStatus({ 
  serverIp = 'play.gerbarium.ru',
  serverPort = 25565 
}: ServerStatusProps) {
  const [status, setStatus] = useState<ServerStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // TODO: Replace with actual server status API call
        // Example: https://api.mcsrvstat.us/2/play.gerbarium.ru
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStatus(mockServerStatus);
      } catch (err) {
        setError('Не удалось получить статус сервера');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [serverIp, serverPort]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-[#8a8a8a] text-xs font-minecraft">
        <div className="w-2 h-2 bg-[#8a8a8a] animate-pulse rounded-full" />
        Загрузка...
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="flex items-center gap-2 text-[#ff5555] text-xs font-minecraft">
        <div className="w-2 h-2 bg-[#ff5555] rounded-full" />
        Ошибка
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-[#2b2d31] border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] px-4 py-2">
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            status.online ? 'bg-[#55ff55] animate-pulse' : 'bg-[#ff5555]'
          }`}
        />
        <span className="text-[#e0e0e0] text-xs font-minecraft">
          {status.online ? 'Онлайн' : 'Оффлайн'}
        </span>
      </div>

      {/* Player Count */}
      {status.online && (
        <div className="flex items-center gap-2 text-[#55aaff] text-xs font-minecraft">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          <span>
            {status.players.online}/{status.players.max}
          </span>
        </div>
      )}

      {/* Version */}
      {status.version && (
        <span className="text-[#aaaaaa] text-xs font-minecraft hidden sm:inline">
          v{status.version}
        </span>
      )}
    </div>
  );
}
