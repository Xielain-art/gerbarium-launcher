import { create } from 'zustand';
import type { ServerStatusData } from '../types';

interface ServerStatusState {
  // State
  data: ServerStatusData | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchStatus: () => Promise<void>;
  refreshStatus: () => void;
  clearError: () => void;
}

// Mock server status data
const mockServerStatus: ServerStatusData = {
  online: true,
  players: {
    online: 142,
    max: 500,
  },
  version: '1.20.1',
  motd: '§b§lGerbarium §8| §aКристальное обновление!',
  latency: 45,
};

export const useServerStatusStore = create<ServerStatusState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  
  fetchStatus: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock API call - replace with real server status API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      set({ 
        data: mockServerStatus, 
        isLoading: false 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось получить статус сервера';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
    }
  },
  
  refreshStatus: () => {
    get().fetchStatus();
  },
  
  clearError: () => {
    set({ error: null });
  },
}));

// Auto-fetch on store creation
useServerStatusStore.getState().fetchStatus();

// Poll every 30 seconds
if (typeof window !== 'undefined') {
  setInterval(() => {
    useServerStatusStore.getState().fetchStatus();
  }, 30000);
}
