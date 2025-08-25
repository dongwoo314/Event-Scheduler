import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { AuthState, AuthActions } from '@types/store';
import authService from '@services/auth';
import type { User, UserPreferences } from '@types/index';

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        preferences: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        tokens: {
          accessToken: null,
          refreshToken: null,
        },

        // Actions
        login: async (credentials) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await authService.login(credentials);
            
            set({
              user: response.user,
              preferences: response.preferences || null,
              isAuthenticated: true,
              isLoading: false,
              tokens: {
                accessToken: response.tokens.access_token,
                refreshToken: response.tokens.refresh_token,
              },
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '로그인에 실패했습니다.',
              isLoading: false,
              isAuthenticated: false,
            });
            throw error;
          }
        },

        register: async (userData) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await authService.register(userData);
            
            set({
              user: response.user,
              preferences: response.preferences || null,
              isAuthenticated: true,
              isLoading: false,
              tokens: {
                accessToken: response.tokens.access_token,
                refreshToken: response.tokens.refresh_token,
              },
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '회원가입에 실패했습니다.',
              isLoading: false,
              isAuthenticated: false,
            });
            throw error;
          }
        },

        logout: () => {
          authService.logout();
          set({
            user: null,
            preferences: null,
            isAuthenticated: false,
            tokens: {
              accessToken: null,
              refreshToken: null,
            },
            error: null,
          });
        },

        refreshToken: async () => {
          try {
            const response = await authService.refreshToken();
            
            set({
              tokens: {
                accessToken: response.tokens.access_token,
                refreshToken: response.tokens.refresh_token,
              },
            });
          } catch (error) {
            // Token refresh failed, logout user
            get().logout();
            throw error;
          }
        },

        updateProfile: async (data) => {
          set({ isLoading: true, error: null });
          
          try {
            // API call would be made here
            // const updatedUser = await userService.updateProfile(data);
            
            set((state) => ({
              user: state.user ? { ...state.user, ...data } : null,
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다.',
              isLoading: false,
            });
            throw error;
          }
        },

        updatePreferences: async (data) => {
          set({ isLoading: true, error: null });
          
          try {
            // API call would be made here
            // const updatedPreferences = await userService.updatePreferences(data);
            
            set((state) => ({
              preferences: state.preferences ? { ...state.preferences, ...data } : null,
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '설정 업데이트에 실패했습니다.',
              isLoading: false,
            });
            throw error;
          }
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          preferences: state.preferences,
          isAuthenticated: state.isAuthenticated,
          tokens: state.tokens,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// Initialize auth state from stored tokens
export const initializeAuth = async () => {
  const { isAuthenticated, refreshToken } = useAuthStore.getState();
  
  if (isAuthenticated) {
    try {
      const { user, preferences } = await authService.getCurrentUser();
      useAuthStore.setState({
        user,
        preferences,
        isAuthenticated: true,
      });
    } catch (error) {
      // If getting current user fails, try to refresh token
      try {
        await useAuthStore.getState().refreshToken();
        const { user, preferences } = await authService.getCurrentUser();
        useAuthStore.setState({
          user,
          preferences,
          isAuthenticated: true,
        });
      } catch (refreshError) {
        // Both failed, logout user
        useAuthStore.getState().logout();
      }
    }
  }
};

// Setup auto token refresh
authService.setupAutoRefresh();
