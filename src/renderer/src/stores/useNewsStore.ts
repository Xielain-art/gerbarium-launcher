import { create } from 'zustand';
import type { NewsItem } from '../types';

interface NewsState {
  // State
  items: NewsItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNews: () => Promise<void>;
  clearError: () => void;
}

// Mock news data
const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Кристальные мобы: Обновление Гербариум!',
    content:
      'Новое крупное обновление добавляет кристальных мобов, новые биомы и улучшенную систему крафта. Исследуйте новые измерения и сражайтесь с эпическими боссами!',
    date: '2026-04-20',
    category: 'update',
    author: 'Gerbarium Team',
    tags: ['update', 'mobs', 'crystals'],
  },
  {
    id: '2',
    title: 'Новая система скинов',
    content:
      'Теперь вы можете загружать собственные скины прямо в лаунчере! Поддержка HD текстур и плащей.',
    date: '2026-04-15',
    category: 'announcement',
    author: 'Gerbarium Team',
    tags: ['skins', 'customization'],
  },
  {
    id: '3',
    title: 'Турнир сообщества',
    content:
      'Присоединяйтесь к еженедельному турниру! Призовой фонд: 10,000 кристаллов. Регистрация открыта до конца недели.',
    date: '2026-04-10',
    category: 'event',
    author: 'Community Team',
    tags: ['tournament', 'community', 'event'],
  },
];

export const useNewsStore = create<NewsState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  
  fetchNews: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock API call - replace with real news API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      set({ 
        items: mockNews, 
        isLoading: false 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить новости';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
    }
  },
  
  clearError: () => {
    set({ error: null });
  },
}));

// Auto-fetch on store creation
useNewsStore.getState().fetchNews();
