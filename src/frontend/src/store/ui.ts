import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UiState, UiActions, ModalState, ToastState, BreadcrumbItem } from '@types/store';

interface UiStore extends UiState, UiActions {}

export const useUiStore = create<UiStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        theme: 'system',
        sidebarOpen: true,
        modalStack: [],
        toast: null,
        isOnline: navigator.onLine,
        currentPage: '',
        breadcrumbs: [],

        // Actions
        setTheme: (theme) => {
          set({ theme });
          
          // Apply theme to document
          const root = document.documentElement;
          if (theme === 'dark') {
            root.classList.add('dark');
          } else if (theme === 'light') {
            root.classList.remove('dark');
          } else {
            // System theme
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDark) {
              root.classList.add('dark');
            } else {
              root.classList.remove('dark');
            }
          }
        },

        toggleSidebar: () => {
          set((state) => ({ sidebarOpen: !state.sidebarOpen }));
        },

        setSidebarOpen: (open) => {
          set({ sidebarOpen: open });
        },

        openModal: (modal) => {
          const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newModal: ModalState = {
            id,
            ...modal,
            isOpen: true,
          };
          
          set((state) => ({
            modalStack: [...state.modalStack, newModal],
          }));
          
          return id;
        },

        closeModal: (id) => {
          set((state) => ({
            modalStack: state.modalStack.filter((modal) => modal.id !== id),
          }));
        },

        closeAllModals: () => {
          set({ modalStack: [] });
        },

        showToast: (toast) => {
          const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newToast: ToastState = {
            id,
            duration: 5000,
            ...toast,
          };
          
          set({ toast: newToast });
          
          // Auto hide toast after duration
          if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
              get().hideToast(id);
            }, newToast.duration);
          }
          
          return id;
        },

        hideToast: (id) => {
          set((state) => ({
            toast: state.toast?.id === id ? null : state.toast,
          }));
        },

        setCurrentPage: (page) => {
          set({ currentPage: page });
        },

        setBreadcrumbs: (breadcrumbs) => {
          set({ breadcrumbs });
        },

        setOnlineStatus: (isOnline) => {
          set({ isOnline });
        },
      }),
      {
        name: 'ui-store',
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

// Initialize theme on app start
const initializeTheme = () => {
  const { theme, setTheme } = useUiStore.getState();
  setTheme(theme);
};

// Listen for system theme changes
const watchSystemTheme = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleThemeChange = () => {
    const { theme, setTheme } = useUiStore.getState();
    if (theme === 'system') {
      setTheme('system'); // Trigger theme update
    }
  };
  
  mediaQuery.addEventListener('change', handleThemeChange);
  
  return () => {
    mediaQuery.removeEventListener('change', handleThemeChange);
  };
};

// Listen for online/offline status
const watchOnlineStatus = () => {
  const handleOnline = () => useUiStore.getState().setOnlineStatus(true);
  const handleOffline = () => useUiStore.getState().setOnlineStatus(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Initialize UI watchers
export const initializeUi = () => {
  initializeTheme();
  watchSystemTheme();
  watchOnlineStatus();
};

// Utility hooks
export const useCurrentModal = () => {
  return useUiStore((state) => 
    state.modalStack[state.modalStack.length - 1] || null
  );
};

export const useModalById = (id: string) => {
  return useUiStore((state) => 
    state.modalStack.find((modal) => modal.id === id) || null
  );
};

export const useIsModalOpen = (type?: string) => {
  return useUiStore((state) => 
    type 
      ? state.modalStack.some((modal) => modal.type === type)
      : state.modalStack.length > 0
  );
};

// Toast utilities
export const showSuccessToast = (title: string, message?: string) => {
  return useUiStore.getState().showToast({
    type: 'success',
    title,
    message,
  });
};

export const showErrorToast = (title: string, message?: string) => {
  return useUiStore.getState().showToast({
    type: 'error',
    title,
    message,
  });
};

export const showWarningToast = (title: string, message?: string) => {
  return useUiStore.getState().showToast({
    type: 'warning',
    title,
    message,
  });
};

export const showInfoToast = (title: string, message?: string) => {
  return useUiStore.getState().showToast({
    type: 'info',
    title,
    message,
  });
};

// Modal utilities
export const openCreateEventModal = (data?: any) => {
  return useUiStore.getState().openModal({
    type: 'create-event',
    data,
  });
};

export const openEditEventModal = (event: any) => {
  return useUiStore.getState().openModal({
    type: 'edit-event',
    data: { event },
  });
};

export const openEventDetailsModal = (event: any) => {
  return useUiStore.getState().openModal({
    type: 'event-details',
    data: { event },
  });
};

export const openCreateGroupModal = (data?: any) => {
  return useUiStore.getState().openModal({
    type: 'create-group',
    data,
  });
};

export const openConfirmDialog = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  return useUiStore.getState().openModal({
    type: 'confirm-dialog',
    data: {
      title,
      message,
    },
    onConfirm,
    onClose: onCancel,
  });
};

// Breadcrumb utilities
export const updateBreadcrumbs = (items: BreadcrumbItem[]) => {
  useUiStore.getState().setBreadcrumbs(items);
};

export const addBreadcrumb = (item: BreadcrumbItem) => {
  const { breadcrumbs, setBreadcrumbs } = useUiStore.getState();
  setBreadcrumbs([...breadcrumbs, item]);
};

export const navigateBack = () => {
  const { breadcrumbs, setBreadcrumbs } = useUiStore.getState();
  if (breadcrumbs.length > 1) {
    setBreadcrumbs(breadcrumbs.slice(0, -1));
  }
};

// Theme utilities
export const getCurrentTheme = () => {
  const { theme } = useUiStore.getState();
  
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  return theme;
};

export const isDarkMode = () => {
  return getCurrentTheme() === 'dark';
};
