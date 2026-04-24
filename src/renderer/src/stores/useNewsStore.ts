import { create } from 'zustand';
import type { NewsItem } from '../types';
import { UI_STRINGS } from '../../../shared/constants/ui-strings';

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
    title: UI_STRINGS.NEWS.MOCK[0].title,
    content: UI_STRINGS.NEWS.MOCK[0].content,
    date: '2026-04-20',
    category: 'update',
    author: 'Gerbarium Team',
    tags: ['update', 'mobs', 'crystals'],
  },
  {
    id: '2',
    title: UI_STRINGS.NEWS.MOCK[1].title,
    content: UI_STRINGS.NEWS.MOCK[1].content,
    date: '2026-04-15',
    category: 'announcement',
    author: 'Gerbarium Team',
    tags: ['skins', 'customization'],
  },
  {
    id: '3',
    title: UI_STRINGS.NEWS.MOCK[2].title,
    content: UI_STRINGS.NEWS.MOCK[2].content,
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
      const errorMessage = err instanceof Error ? err.message : UI_STRINGS.STORE_ERRORS.NEWS_LOAD;
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
