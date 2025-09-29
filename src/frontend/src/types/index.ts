// ============== 사용자 관련 타입 ==============

export interface User {
  id: string;
  email: string;
  username?: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  profile_image?: string;
  phone_number?: string;
  timezone: string;
  language: string;
  is_active: boolean;
  is_email_verified: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  notification_settings: {
    email_notifications: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
    advance_notification_times: number[]; // minutes before event
    quiet_hours: {
      enabled: boolean;
      start_time: string; // "22:00"
      end_time: string;   // "07:00"
    };
    weekend_notifications: boolean;
  };
  privacy_settings: {
    profile_visibility: 'public' | 'private' | 'friends';
    allow_group_invites: boolean;
    show_online_status: boolean;
  };
  theme_settings: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
  };
  created_at: Date;
  updated_at: Date;
}

// ============== 인증 관련 타입 ==============

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

export interface AuthResponse {
  user: User;
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: string;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// ============== 이벤트 관련 타입 ==============

export interface Event {
  id: string;
  user_id?: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  timezone?: string;
  location?: string | null;
  location_details?: string | null;
  event_type?: 'single' | 'recurring';
  category: 'personal' | 'work' | 'social' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  is_all_day: boolean;
  visibility?: 'public' | 'private' | 'friends';
  max_participants?: number | null;
  requires_confirmation?: boolean;
  tags?: string[];
  notification_settings?: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    sms_notifications?: boolean;
    notification_times?: number[];
  };
  participants?: EventParticipant[];
  attachments?: EventAttachment[];
  notes?: any;
  created_at: string;
  updated_at: string;
}

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type EventPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EventCategory = 'work' | 'personal' | 'meeting' | 'appointment' | 'reminder' | 'other';

export interface EventRecurrence {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every N days/weeks/months/years
  days_of_week?: number[]; // 0=Sunday, 1=Monday, etc.
  end_date?: Date;
  max_occurrences?: number;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  user?: User;
  status: ParticipantStatus;
  role: ParticipantRole;
  responded_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export type ParticipantStatus = 'pending' | 'accepted' | 'declined' | 'maybe';
export type ParticipantRole = 'organizer' | 'admin' | 'participant' | 'viewer';

export interface EventAttachment {
  id: string;
  event_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: Date;
}

// ============== 그룹 관련 타입 ==============

export interface Group {
  id: string;
  name: string;
  description?: string;
  type: 'work' | 'project' | 'social' | 'other';
  color?: string;
  avatar_url?: string;
  is_public: boolean;
  max_members?: number;
  creator_id?: string;
  creator?: User;
  settings?: GroupSettings;
  member_count?: number;
  members?: GroupMember[];
  events?: Event[];
  created_at: string;
  updated_at: string;
}

export interface GroupSettings {
  allow_member_invite: boolean;
  require_approval: boolean;
  allow_event_creation: 'admin' | 'member' | 'all';
  default_event_privacy: 'public' | 'private';
  notification_settings: {
    new_events: boolean;
    event_changes: boolean;
    new_members: boolean;
  };
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  user?: User;
  role: GroupRole;
  status: GroupMemberStatus;
  joined_at: Date;
  invited_by?: string;
  invited_at?: Date;
}

export type GroupRole = 'owner' | 'admin' | 'moderator' | 'member';
export type GroupMemberStatus = 'active' | 'invited' | 'banned' | 'left';

// ============== 알림 관련 타입 ==============

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>; // Additional notification data
  channels: NotificationChannel[];
  status: NotificationStatus;
  scheduled_at?: Date;
  sent_at?: Date;
  read_at?: Date;
  clicked_at?: Date;
  event_id?: string;
  group_id?: string;
  created_at: Date;
  updated_at: Date;
}

export type NotificationType = 
  | 'event_reminder'
  | 'event_invitation'
  | 'event_update'
  | 'event_cancellation'
  | 'group_invitation'
  | 'group_update'
  | 'system'
  | 'announcement';

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

// ============== API 관련 타입 ==============

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data?: {
    items: T[];
    pagination: {
      current_page: number;
      per_page: number;
      total_items: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}

export interface SearchParams extends PaginationParams {
  query: string;
  filters?: Record<string, any>;
}

// ============== 양식 관련 타입 ==============

export interface CreateEventForm {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  color?: string;
  category: EventCategory;
  priority: EventPriority;
  is_private: boolean;
  group_id?: string;
  recurrence?: Partial<EventRecurrence>;
  participants?: string[]; // user IDs
  max_participants?: number;
}

export interface UpdateEventForm extends Partial<CreateEventForm> {
  id: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  type: 'work' | 'project' | 'social' | 'other';
  is_public?: boolean;
  max_members?: number;
  settings?: {
    allow_member_invite?: boolean;
    require_approval?: boolean;
    allow_event_creation?: 'admin' | 'member' | 'all';
    default_event_privacy?: 'public' | 'private';
    notification_settings?: {
      new_events?: boolean;
      event_changes?: boolean;
      new_members?: boolean;
    };
  };
}

export interface UpdateGroupRequest extends Partial<CreateGroupRequest> {
  id?: string;
}

export interface InviteToGroupRequest {
  user_ids?: string[];
  emails?: string[];
  message?: string;
  role?: GroupRole;
}

export interface GroupsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'work' | 'project' | 'social' | 'other';
  is_public?: boolean;
  member_status?: 'active' | 'invited' | 'all';
}

export interface CreateGroupForm {
  name: string;
  description?: string;
  color?: string;
  is_public: boolean;
  max_members?: number;
  settings: Partial<GroupSettings>;
}

export interface UpdateGroupForm extends Partial<CreateGroupForm> {
  id: string;
}

export interface UpdateProfileForm {
  first_name?: string;
  last_name?: string;
  username?: string;
  phone_number?: string;
  timezone?: string;
  language?: string;
}

export interface UpdatePreferencesForm {
  notification_settings?: Partial<UserPreferences['notification_settings']>;
  privacy_settings?: Partial<UserPreferences['privacy_settings']>;
  theme_settings?: Partial<UserPreferences['theme_settings']>;
}

// ============== 캘린더 관련 타입 ==============

export interface CalendarEvent extends Event {
  // 캘린더 뷰에서 사용하는 추가 속성들
  className?: string;
  editable?: boolean;
  startEditable?: boolean;
  durationEditable?: boolean;
}

export interface CalendarView {
  type: 'month' | 'week' | 'day' | 'agenda';
  start: Date;
  end: Date;
  current: Date;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  event?: Event;
}

// ============== 통계 관련 타입 ==============

export interface DashboardStats {
  total_events: number;
  upcoming_events: number;
  completed_events: number;
  groups_count: number;
  notifications_count: number;
  events_this_week: number;
  events_this_month: number;
}

export interface EventStats {
  by_category: Record<EventCategory, number>;
  by_status: Record<EventStatus, number>;
  by_priority: Record<EventPriority, number>;
  by_month: Array<{ month: string; count: number }>;
  participation_rate: number;
  completion_rate: number;
}

// ============== WebSocket 관련 타입 ==============

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
  timestamp: Date;
}

export type WebSocketMessageType = 
  | 'event_created'
  | 'event_updated'
  | 'event_deleted'
  | 'notification_received'
  | 'group_updated'
  | 'member_joined'
  | 'member_left';

// ============== 오류 관련 타입 ==============

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ============== 파일 업로드 관련 타입 ==============

export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

export interface UploadResult {
  id: string;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
}

// ============== 이벤트 생성 및 수정 요청 타입 ==============

export interface CreateEventRequest {
  title: string;
  description?: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  timezone?: string;
  location?: string | null;
  location_details?: string | null;
  event_type?: 'single' | 'recurring';
  category?: EventCategory;
  priority?: EventPriority;
  is_all_day?: boolean;
  visibility?: 'public' | 'private' | 'friends';
  max_participants?: number | null;
  requires_confirmation?: boolean;
  tags?: string[];
  notification_settings?: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    sms_notifications?: boolean;
    notification_times?: number[]; // minutes before event
  };
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id?: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface EventsQueryParams {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  category?: EventCategory;
  status?: EventStatus;
  priority?: EventPriority;
  timezone?: string;
  search?: string;
}

export interface EventFilters {
  category?: EventCategory;
  status?: EventStatus;
  priority?: EventPriority;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface InviteToEventRequest {
  user_ids: string[];
  message?: string;
  role?: ParticipantRole;
}

export * from './ui';
export * from './auth';
