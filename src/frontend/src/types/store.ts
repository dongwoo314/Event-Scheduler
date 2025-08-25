import { User, UserPreferences, Event, Group, Notification, DashboardData } from './index';

// Store State Types
export interface AuthState {
  user: User | null;
  preferences: UserPreferences | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
}

export interface EventsState {
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  filters: EventFilters;
  pagination: PaginationState;
}

export interface GroupsState {
  groups: Group[];
  selectedGroup: Group | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationState;
}

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationState;
}

export interface UiState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  modalStack: ModalState[];
  toast: ToastState | null;
  isOnline: boolean;
  currentPage: string;
  breadcrumbs: BreadcrumbItem[];
}

export interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Filter Types
export interface EventFilters {
  startDate?: Date;
  endDate?: Date;
  status?: string[];
  categories?: string[];
  priorities?: string[];
  types?: string[];
  groupIds?: string[];
  tags?: string[];
  searchQuery?: string;
}

export interface GroupFilters {
  types?: string[];
  privacy?: string[];
  searchQuery?: string;
}

export interface NotificationFilters {
  types?: string[];
  isRead?: boolean;
  priorities?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Pagination State
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Modal State
export interface ModalState {
  id: string;
  type: ModalType;
  isOpen: boolean;
  data?: any;
  onClose?: () => void;
  onConfirm?: (data?: any) => void;
}

export type ModalType = 
  | 'create-event'
  | 'edit-event'
  | 'delete-event'
  | 'event-details'
  | 'create-group'
  | 'edit-group'
  | 'delete-group'
  | 'group-details'
  | 'invite-users'
  | 'user-profile'
  | 'settings'
  | 'confirm-dialog'
  | 'image-viewer';

// Toast State
export interface ToastState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: ToastAction[];
}

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// Breadcrumb
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
  isActive?: boolean;
}

// Calendar State
export interface CalendarState {
  currentView: CalendarView;
  selectedDate: Date;
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

export interface CalendarView {
  type: 'month' | 'week' | 'day' | 'agenda';
  startDate: Date;
  endDate: Date;
}

// Form State
export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// WebSocket State
export interface WebSocketState {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: any;
  error: string | null;
  reconnectAttempts: number;
}

// Search State
export interface SearchState {
  query: string;
  results: SearchResults;
  isLoading: boolean;
  error: string | null;
  recentSearches: string[];
  suggestions: string[];
}

export interface SearchResults {
  events: Event[];
  groups: Group[];
  users: User[];
  total: number;
}

// Settings State
export interface SettingsState {
  appearance: AppearanceSettings;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  account: AccountSettings;
  isLoading: boolean;
  error: string | null;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12' | '24';
  firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
}

export interface NotificationPreferences {
  email: {
    eventReminders: boolean;
    eventInvitations: boolean;
    eventUpdates: boolean;
    groupInvitations: boolean;
    weeklyDigest: boolean;
  };
  push: {
    eventReminders: boolean;
    eventInvitations: boolean;
    eventUpdates: boolean;
    groupInvitations: boolean;
    mentions: boolean;
  };
  inApp: {
    all: boolean;
    sound: boolean;
    desktop: boolean;
  };
  advanceNotifications: number[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'contacts';
  allowGroupInvites: boolean;
  showOnlineStatus: boolean;
  allowEventSharing: boolean;
  dataRetention: {
    deleteAfterInactive: boolean;
    months: number;
  };
}

export interface AccountSettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  dataExport: {
    lastExport?: string;
    autoExport: boolean;
    frequency: 'monthly' | 'quarterly' | 'yearly';
  };
  accountDeletion: {
    scheduled?: string;
    reason?: string;
  };
}

// Action Types for Zustand stores
export interface AuthActions {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePreferences: (data: Partial<UserPreferences>) => Promise<void>;
  clearError: () => void;
}

export interface EventsActions {
  fetchEvents: (filters?: EventFilters) => Promise<void>;
  createEvent: (data: any) => Promise<Event>;
  updateEvent: (id: string, data: any) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  selectEvent: (event: Event | null) => void;
  setFilters: (filters: Partial<EventFilters>) => void;
  clearError: () => void;
}

export interface GroupsActions {
  fetchGroups: () => Promise<void>;
  createGroup: (data: any) => Promise<Group>;
  updateGroup: (id: string, data: any) => Promise<Group>;
  deleteGroup: (id: string) => Promise<void>;
  joinGroup: (id: string) => Promise<void>;
  leaveGroup: (id: string) => Promise<void>;
  selectGroup: (group: Group | null) => void;
  clearError: () => void;
}

export interface NotificationsActions {
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearError: () => void;
}

export interface UiActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modal: Omit<ModalState, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  showToast: (toast: Omit<ToastState, 'id'>) => string;
  hideToast: (id: string) => void;
  setCurrentPage: (page: string) => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  setOnlineStatus: (isOnline: boolean) => void;
}

// Store Types
export interface RootStore {
  auth: AuthState & AuthActions;
  events: EventsState & EventsActions;
  groups: GroupsState & GroupsActions;
  notifications: NotificationsState & NotificationsActions;
  ui: UiState & UiActions;
  dashboard: DashboardState;
  calendar: CalendarState;
  search: SearchState;
  settings: SettingsState;
  webSocket: WebSocketState;
}

// Selector Types
export type StoreSelector<T> = (state: RootStore) => T;
export type AuthSelector<T> = (state: AuthState & AuthActions) => T;
export type EventsSelector<T> = (state: EventsState & EventsActions) => T;
export type UiSelector<T> = (state: UiState & UiActions) => T;
