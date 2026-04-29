import { create } from 'zustand';
import type { DownloadProgress, DownloadStatus } from '../types';
import { UI_STRINGS } from '../../../shared/constants/ui-strings';

interface DownloadState {
  // State
  isDownloading: boolean;
  progress: DownloadProgress | null;
  javaProgress: number;

  // Actions
  setJavaProgress: (progress: number) => void;
  startDownload: (versionId: string) => Promise<void>;
  updateProgress: (progress: Partial<DownloadProgress>) => void;
  cancelDownload: () => void;
  resetDownload: () => void;
}

const defaultProgress: DownloadProgress = {
  status: 'idle',
  progress: 0,
  speed: '0 MB/s',
  eta: UI_STRINGS.DOWNLOAD.CALCULATING,
};

export const useDownloadStore = create<DownloadState>((set, get) => ({
  isDownloading: false,
  progress: null,
  javaProgress: 0,
  setJavaProgress: (progress) => set({ javaProgress: progress }),
  
  startDownload: async (_versionId: string) => {
    set({ 
      isDownloading: true, 
      progress: { ...defaultProgress, status: 'checking' } 
    });
    
    // Mock download stages
    const stages: Array<{ 
      status: DownloadStatus; 
      progress: number; 
      speed?: string; 
      eta?: string;
      currentFile?: string;
    }> = [
      { status: 'checking', progress: 5, currentFile: UI_STRINGS.DOWNLOAD.CHECKING },
      { status: 'downloading', progress: 15, speed: '2.5 MB/s', eta: '~45 sec', currentFile: 'minecraft.jar' },
      { status: 'downloading', progress: 35, speed: '3.2 MB/s', eta: '~30 sec', currentFile: 'libraries' },
      { status: 'downloading', progress: 60, speed: '4.1 MB/s', eta: '~15 sec', currentFile: 'assets' },
      { status: 'installing', progress: 80, currentFile: UI_STRINGS.DOWNLOAD.INSTALLING },
      { status: 'verifying', progress: 95, currentFile: UI_STRINGS.DOWNLOAD.VERIFYING },
      { status: 'completed', progress: 100 },
    ];
    
    for (const stage of stages) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      set({ 
        progress: { 
          ...get().progress, 
          ...stage,
          totalFiles: 100,
          downloadedFiles: Math.floor(stage.progress),
        } 
      });
      
      if (stage.status === 'completed') {
        break;
      }
    }
    
    // Reset after completion
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({ isDownloading: false, progress: null });
  },
  
  updateProgress: (progress) => {
    set((state) => ({
      progress: state.progress ? { ...state.progress, ...progress } : null,
    }));
  },
  
  cancelDownload: () => {
    set({ 
      isDownloading: false, 
      progress: { ...defaultProgress, status: 'cancelled' } 
    });
  },
  
  resetDownload: () => {
    set({ isDownloading: false, progress: null });
  },
}));
