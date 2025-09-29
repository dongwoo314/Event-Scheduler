import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 테마 타입
export type Theme = 'light' | 'dark' | 'system';

// 토스트 타입
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// 모달 타입
export interface Modal {
  id: string;
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  onClose?: () => void;
}

// UI 상태 인터페이스
interface UiState {
  // 테마
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // 사이드바
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // 로딩
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // 토스트
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => string;
  hideToast: (id: string) => void;
  clearToasts: () => void;

  // 모달
  modals: Modal[];
  showModal: (modal: Omit<Modal, 'id' | 'isOpen'>) => string;
  hideModal: (id: string) => void;
  clearModals: () => void;

  // 검색
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // 페이지 메타데이터
  pageTitle: string;
  setPageTitle: (title: string) => void;
  
  // 브레드크럼
  breadcrumbs: Array<{ label: string; href?: string }>;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => void;

  // 알림
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: Date;
  }>;
  addNotification: (notification: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // 기타 UI 상태
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

// UUID 생성 함수
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const useUiStore = create<UiState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        theme: 'dark' as Theme,
        sidebarOpen: true,
        isLoading: false,
        toasts: [],
        modals: [],
        searchQuery: '',
        pageTitle: 'Event Scheduler',
        breadcrumbs: [],
        notifications: [],
        mobileMenuOpen: false,

        // 테마 설정
        setTheme: (theme: Theme) => {
          set({ theme });
        },

        // 사이드바 제어
        setSidebarOpen: (open: boolean) => {
          set({ sidebarOpen: open });
        },

        toggleSidebar: () => {
          set((state) => ({ sidebarOpen: !state.sidebarOpen }));
        },

        // 로딩 상태
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        // 토스트 관리
        showToast: (toast: Omit<Toast, 'id'>) => {
          const id = generateId();
          const newToast: Toast = {
            id,
            duration: 4000,
            ...toast,
          };

          set((state) => ({
            toasts: [...state.toasts, newToast],
          }));

          // 자동 숨김 타이머
          if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
              get().hideToast(id);
            }, newToast.duration);
          }

          return id;
        },

        hideToast: (id: string) => {
          set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
          }));
        },

        clearToasts: () => {
          set({ toasts: [] });
        },

        // 모달 관리
        showModal: (modal: Omit<Modal, 'id' | 'isOpen'>) => {
          const id = generateId();
          const newModal: Modal = {
            id,
            isOpen: true,
            ...modal,
          };

          set((state) => ({
            modals: [...state.modals, newModal],
          }));

          return id;
        },

        hideModal: (id: string) => {
          set((state) => ({
            modals: state.modals.map((modal) =>
              modal.id === id ? { ...modal, isOpen: false } : modal
            ),
          }));

          // 애니메이션 완료 후 배열에서 제거
          setTimeout(() => {
            set((state) => ({
              modals: state.modals.filter((modal) => modal.id !== id),
            }));
          }, 200);
        },

        clearModals: () => {
          set({ modals: [] });
        },

        // 검색
        setSearchQuery: (query: string) => {
          set({ searchQuery: query });
        },

        clearSearch: () => {
          set({ searchQuery: '' });
        },

        // 페이지 메타데이터
        setPageTitle: (title: string) => {
          set({ pageTitle: title });
          document.title = title;
        },

        // 브레드크럼
        setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => {
          set({ breadcrumbs });
        },

        // 알림 관리
        addNotification: (notification: {
          title: string;
          message: string;
          type: 'info' | 'success' | 'warning' | 'error';
        }) => {
          const newNotification = {
            id: generateId(),
            ...notification,
            read: false,
            createdAt: new Date(),
          };

          set((state) => ({
            notifications: [newNotification, ...state.notifications],
          }));
        },

        markNotificationRead: (id: string) => {
          set((state) => ({
            notifications: state.notifications.map((notification) =>
              notification.id === id ? { ...notification, read: true } : notification
            ),
          }));
        },

        clearNotifications: () => {
          set({ notifications: [] });
        },

        // 모바일 메뉴
        setMobileMenuOpen: (open: boolean) => {
          set({ mobileMenuOpen: open });
        },
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
);

// 컴포넌트 외부에서 사용할 수 있는 액션들
export const uiActions = {
  setTheme: (theme: Theme) => useUiStore.getState().setTheme(theme),
  showToast: (toast: Omit<Toast, 'id'>) => useUiStore.getState().showToast(toast),
  hideToast: (id: string) => useUiStore.getState().hideToast(id),
  showModal: (modal: Omit<Modal, 'id' | 'isOpen'>) => useUiStore.getState().showModal(modal),
  hideModal: (id: string) => useUiStore.getState().hideModal(id),
  setLoading: (loading: boolean) => useUiStore.getState().setLoading(loading),
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => 
    useUiStore.getState().setBreadcrumbs(breadcrumbs),
  setPageTitle: (title: string) => useUiStore.getState().setPageTitle(title),
};

// 선택자들 (성능 최적화를 위해)
export const uiSelectors = {
  theme: () => useUiStore((state) => state.theme),
  isLoading: () => useUiStore((state) => state.isLoading),
  toasts: () => useUiStore((state) => state.toasts),
  modals: () => useUiStore((state) => state.modals),
  sidebarOpen: () => useUiStore((state) => state.sidebarOpen),
  notifications: () => useUiStore((state) => state.notifications),
  unreadNotificationsCount: () => 
    useUiStore((state) => state.notifications.filter((n) => !n.read).length),
};
