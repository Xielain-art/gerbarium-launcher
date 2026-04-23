import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, AuthCredentials } from '../types';

type SocialProvider = 'google' | 'vk' | 'telegram' | 'yandex';

interface AuthState {
  // State
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  // UI State
  isLoading: boolean;
  error: string | null;
  showPassword: boolean;

  // Actions
  login: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  clearError: () => void;
  setShowPassword: (show: boolean) => void;

  // Social providers
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithVK: () => Promise<{ success: boolean; error?: string }>;
  loginWithTelegram: () => Promise<{ success: boolean; error?: string }>;
  loginWithYandex: () => Promise<{ success: boolean; error?: string }>;

  // Offline mode
  loginOffline: (username: string) => Promise<{ success: boolean; error?: string }>;
}

const defaultState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  showPassword: false,
};

// Mock user creation helper
const createMockUser = (provider: SocialProvider, id: string): AuthUser => ({
  id: `${provider}_${id}`,
  username: `${provider}_user_${id.slice(-6)}`,
  email: `${provider}_user_${id.slice(-6)}@example.com`,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...defaultState,

      setShowPassword: (show) => set({ showPassword: show }),

      clearError: () => set({ error: null }),

      logout: () => {
        set(defaultState);
        localStorage.removeItem('gerbarium-auth-storage');
      },

      login: async (credentials: AuthCredentials) => {
        set({ isLoading: true, error: null });

        try {
          await new Promise((resolve) => setTimeout(resolve, 1500));

          if (!credentials.login.trim() || !credentials.password.trim()) {
            set({ isLoading: false, error: 'Введите логин и пароль' });
            return { success: false, error: 'Введите логин и пароль' };
          }

          const mockUser: AuthUser = {
            id: 'user_' + Date.now(),
            username: credentials.login,
            email: credentials.login.includes('@') ? credentials.login : undefined,
          };

          const mockToken = 'mock_token_' + Date.now();

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Ошибка входа';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });

        try {
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const mockUser = createMockUser('google', Date.now().toString());
          const mockToken = 'google_token_' + Date.now();

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Ошибка входа через Google';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      loginWithVK: async () => {
        set({ isLoading: true, error: null });

        try {
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const mockUser = createMockUser('vk', Date.now().toString());
          const mockToken = 'vk_token_' + Date.now();

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Ошибка входа через VK';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      loginWithTelegram: async () => {
        set({ isLoading: true, error: null });

        try {
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const mockUser = createMockUser('telegram', Date.now().toString());
          const mockToken = 'telegram_token_' + Date.now();

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Ошибка входа через Telegram';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      loginWithYandex: async () => {
        set({ isLoading: true, error: null });

        try {
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const mockUser = createMockUser('yandex', Date.now().toString());
          const mockToken = 'yandex_token_' + Date.now();

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Ошибка входа через Yandex';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      loginOffline: async (username: string) => {
        set({ isLoading: true, error: null });

        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          if (!username.trim()) {
            set({ isLoading: false, error: 'Введите имя пользователя' });
            return { success: false, error: 'Введите имя пользователя' };
          }

          const mockUser: AuthUser = {
            id: 'offline_' + Date.now(),
            username: username,
          };

          set({
            user: mockUser,
            token: 'offline_token',
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Ошибка оффлайн входа';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },
    }),
    {
      name: 'gerbarium-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
