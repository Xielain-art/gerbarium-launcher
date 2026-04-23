import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, AuthCredentials } from '../types';

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
  loginWithMicrosoft: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  clearError: () => void;
  setShowPassword: (show: boolean) => void;
  
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...defaultState,
      
      setShowPassword: (show) => set({ showPassword: show }),
      
      clearError: () => set({ error: null }),
      
      logout: () => {
        set(defaultState);
        // Clear persisted state
        localStorage.removeItem('gerbarium-auth-storage');
      },
      
      login: async (credentials: AuthCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call - replace with real authentication
          await new Promise((resolve) => setTimeout(resolve, 1500));
          
          // Validation
          if (!credentials.login.trim() || !credentials.password.trim()) {
            set({ 
              isLoading: false, 
              error: 'Введите логин и пароль' 
            });
            return { success: false, error: 'Введите логин и пароль' };
          }
          
          // Mock successful login
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
      
      loginWithMicrosoft: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // @ts-ignore - Electron API
          const data = await window.electronAPI?.openMicrosoftLogin();
          
          if (!data) {
            set({ 
              isLoading: false, 
              error: 'Не удалось получить данные от Microsoft' 
            });
            return { success: false, error: 'Не удалось получить данные от Microsoft' };
          }
          
          const mockUser: AuthUser = {
            id: data.id || 'user_' + Date.now(),
            username: data.username || data.email || 'User',
            email: data.email,
            avatar: data.avatar,
            xuid: data.xuid,
          };
          
          set({
            user: mockUser,
            token: data.token || 'microsoft_token_' + Date.now(),
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Ошибка входа через Microsoft';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },
      
      loginOffline: async (username: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          
          if (!username.trim()) {
            set({ 
              isLoading: false, 
              error: 'Введите имя пользователя' 
            });
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
