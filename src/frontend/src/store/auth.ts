import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import authService from '@services/auth';
import { User, UserPreferences, LoginRequest, RegisterRequest } from '@types/index';

interface AuthState {
  // 상태
  user: User | null;
  preferences: UserPreferences | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 액션
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  loadCurrentUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        user: null,
        preferences: null,
        isAuthenticated: authService.isAuthenticated(),
        isLoading: false,
        error: null,

        // 로그인
        login: async (credentials: LoginRequest) => {
          console.log('[Auth Store] 로그인 시작:', credentials.email);
          set({ isLoading: true, error: null });
          
          try {
            console.log('[Auth Store] authService.login 호출 중...');
            const response = await authService.login(credentials);
            console.log('[Auth Store] authService.login 응답:', response);
            
            console.log('[Auth Store] 상태 업데이트 중...');
            set({
              user: response.user,
              preferences: response.user.preferences || null,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            console.log('[Auth Store] 로그인 완료! isAuthenticated:', true);
          } catch (error) {
            console.error('[Auth Store] 로그인 에러:', error);
            set({
              user: null,
              preferences: null,
              isAuthenticated: false,
              isLoading: false,
              error: error instanceof Error ? error.message : '로그인에 실패했습니다.',
            });
            throw error;
          }
        },

        // 로그아웃
        logout: async () => {
          set({ isLoading: true });
          
          try {
            await authService.logout();
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            set({
              user: null,
              preferences: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        // 회원가입
        register: async (userData: RegisterRequest) => {
          set({ isLoading: true, error: null });
          
          try {
            // 회원가입만 수행하고, 토큰은 저장하지만 자동 로그인 하지 않음
            const response = await authService.register(userData);
            
            // 토큰 제거 (로그인 페이지에서 다시 로그인하도록)
            authService.clearTokens();
            
            set({
              user: null,
              preferences: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            set({
              user: null,
              preferences: null,
              isAuthenticated: false,
              isLoading: false,
              error: error instanceof Error ? error.message : '회원가입에 실패했습니다.',
            });
            throw error;
          }
        },

        // 프로필 업데이트
        updateProfile: async (data: Partial<User>) => {
          const currentUser = get().user;
          if (!currentUser) throw new Error('로그인이 필요합니다.');

          set({ isLoading: true, error: null });
          
          try {
            // TODO: API 구현 후 실제 업데이트 호출
            // const response = await userService.updateProfile(data);
            
            // 임시로 로컬 상태만 업데이트
            set({
              user: { ...currentUser, ...data },
              isLoading: false,
              error: null,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다.',
            });
            throw error;
          }
        },

        // 사용자 설정 업데이트
        updatePreferences: async (newPreferences: Partial<UserPreferences>) => {
          const currentPreferences = get().preferences;
          if (!currentPreferences) throw new Error('사용자 설정을 찾을 수 없습니다.');

          set({ isLoading: true, error: null });
          
          try {
            // TODO: API 구현 후 실제 업데이트 호출
            // const response = await userService.updatePreferences(newPreferences);
            
            // 임시로 로컬 상태만 업데이트
            set({
              preferences: { ...currentPreferences, ...newPreferences },
              isLoading: false,
              error: null,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : '설정 업데이트에 실패했습니다.',
            });
            throw error;
          }
        },

        // 현재 사용자 정보 로드
        loadCurrentUser: async () => {
          if (!authService.isAuthenticated()) {
            console.log('토큰이 없어서 인증 상태 초기화');
            set({
              user: null,
              preferences: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          set({ isLoading: true, error: null });
          
          try {
            // 임시로 토큰에서 사용자 정보 추출 (백엔드 API가 준비되면 수정)
            const token = authService.getAccessToken();
            if (token) {
              try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log('토큰에서 사용자 정보 추출:', payload);
                
                const user = {
                  id: payload.userId || 1,
                  email: payload.email || 'demo@snu.ac.kr',
                  username: 'demo_user',
                  first_name: '데모',
                  last_name: '사용자',
                  phone: null,
                  date_of_birth: null,
                  profile_image_url: null,
                  is_active: true,
                  is_verified: true,
                  last_login_at: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  preferences: null
                } as User;
                
                const preferences = {
                  id: 1,
                  user_id: user.id,
                  timezone: 'Asia/Seoul',
                  language: 'ko',
                  theme: 'dark',
                  email_notifications: true,
                  push_notifications: true,
                  sms_notifications: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                } as UserPreferences;
                
                console.log('사용자 정보 로드 성공:', user);
                
                set({
                  user,
                  preferences,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                });
                
                return;
              } catch (tokenError) {
                console.error('토큰 파싱 오류:', tokenError);
              }
            }
            
            // 토큰 파싱 실패 시 API 호출 시도 (현재는 없지만 추후 구현)
            throw new Error('사용자 정보를 불러올 수 없습니다.');
            
          } catch (error) {
            console.error('사용자 정보 로드 실패:', error);
            
            // 토큰이 유효하지 않은 경우 로그아웃 처리
            authService.clearTokens();
            
            set({
              user: null,
              preferences: null,
              isAuthenticated: false,
              isLoading: false,
              error: error instanceof Error ? error.message : '사용자 정보를 불러올 수 없습니다.',
            });
          }
        },

        // 에러 클리어
        clearError: () => {
          set({ error: null });
        },

        // 사용자 정보 새로고침
        refreshUser: async () => {
          await get().loadCurrentUser();
        },

        // 사용자 정보 직접 업데이트 (로컬 상태만)
        updateUser: (userData: Partial<User>) => {
          const currentUser = get().user;
          if (currentUser) {
            set({ user: { ...currentUser, ...userData } });
          }
        },

        // 로딩 상태 설정
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          preferences: state.preferences,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // 스토리지에서 복원된 후 실제 토큰 상태와 동기화
            const hasToken = authService.isAuthenticated();
            if (!hasToken && state.isAuthenticated) {
              // 토큰은 없는데 인증 상태가 true인 경우 -> false로 수정
              state.isAuthenticated = false;
              state.user = null;
              state.preferences = null;
            } else if (hasToken && state.isAuthenticated && state.user) {
              // 토큰이 있고 사용자 정보도 있는 경우 -> 사용자 정보 갱신
              state.loadCurrentUser?.();
            }
          }
        },
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// 컴포넌트 외부에서 사용할 수 있는 액션들
export const authActions = {
  login: (credentials: LoginRequest) => useAuthStore.getState().login(credentials),
  logout: () => useAuthStore.getState().logout(),
  register: (userData: RegisterRequest) => useAuthStore.getState().register(userData),
  loadCurrentUser: () => useAuthStore.getState().loadCurrentUser(),
  clearError: () => useAuthStore.getState().clearError(),
};

// 선택자들 (성능 최적화를 위해)
export const authSelectors = {
  user: () => useAuthStore((state) => state.user),
  preferences: () => useAuthStore((state) => state.preferences),
  isAuthenticated: () => useAuthStore((state) => state.isAuthenticated),
  isLoading: () => useAuthStore((state) => state.isLoading),
  error: () => useAuthStore((state) => state.error),
};
