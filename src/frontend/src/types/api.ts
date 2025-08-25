// API Service Types
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface ApiRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  withCredentials?: boolean;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  code?: string;
  details?: Record<string, any>;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
}

export type ApiResponseType<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API Endpoints
export interface ApiEndpoints {
  // Auth endpoints
  auth: {
    login: string;
    register: string;
    logout: string;
    refresh: string;
    me: string;
    verifyEmail: string;
    forgotPassword: string;
    resetPassword: string;
  };
  
  // User endpoints
  users: {
    profile: string;
    preferences: string;
    dashboard: string;
    search: string;
    changePassword: string;
    deleteAccount: string;
    byId: (id: string) => string;
  };
  
  // Event endpoints
  events: {
    list: string;
    create: string;
    byId: (id: string) => string;
    update: (id: string) => string;
    delete: (id: string) => string;
    participants: (id: string) => string;
    invite: (id: string) => string;
  };
  
  // Group endpoints
  groups: {
    list: string;
    create: string;
    byId: (id: string) => string;
    update: (id: string) => string;
    delete: (id: string) => string;
    members: (id: string) => string;
    invite: (id: string) => string;
    join: (id: string) => string;
    leave: (id: string) => string;
    events: (id: string) => string;
  };
  
  // Notification endpoints
  notifications: {
    list: string;
    unread: string;
    markRead: (id: string) => string;
    markAllRead: string;
    delete: (id: string) => string;
    preferences: string;
  };
}

// Request/Response Types for specific endpoints
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  username?: string;
  phone_number?: string;
  timezone?: string;
  language?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  timezone?: string;
  location?: string;
  location_details?: any;
  event_type: string;
  category: string;
  priority?: string;
  is_all_day?: boolean;
  is_recurring?: boolean;
  recurrence_rule?: any;
  notification_settings?: any;
  visibility?: string;
  max_participants?: number;
  requires_confirmation?: boolean;
  tags?: string[];
  group_id?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  group_type: string;
  privacy_level: string;
  max_members?: number;
  settings?: any;
}

export interface UpdateGroupRequest extends Partial<CreateGroupRequest> {}

export interface InviteToGroupRequest {
  user_ids: string[];
  message?: string;
}

export interface InviteToEventRequest {
  user_ids: string[];
  message?: string;
  role?: string;
}

export interface EventsQueryParams {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  category?: string;
  event_type?: string;
  priority?: string;
  timezone?: string;
}

export interface GroupsQueryParams {
  page?: number;
  limit?: number;
  group_type?: string;
  privacy_level?: string;
  search?: string;
}

export interface NotificationsQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  is_read?: boolean;
  priority?: string;
}

export interface UsersSearchParams {
  q: string;
  page?: number;
  limit?: number;
}

// WebSocket API Types
export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export interface WebSocketEventHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: any) => void;
  onEventUpdate?: (data: any) => void;
  onNotification?: (data: any) => void;
  onGroupUpdate?: (data: any) => void;
  onUserUpdate?: (data: any) => void;
}

// File Upload Types
export interface FileUploadConfig {
  maxSize: number;
  allowedTypes: string[];
  endpoint: string;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Error Types
export interface NetworkError {
  code: string;
  message: string;
  status?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiValidationError {
  success: false;
  message: string;
  errors: ValidationError[];
}
