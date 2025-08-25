// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<{ items: T[]; pagination: PaginationMeta }> {}

// User Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  phone_number?: string;
  profile_image_url?: string;
  timezone: string;
  language: string;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  notification_settings: NotificationSettings;
  privacy_settings: PrivacySettings;
  theme_settings: ThemeSettings;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  advance_notification_times: number[];
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
  };
  weekend_notifications: boolean;
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'friends';
  allow_group_invites: boolean;
  show_online_status: boolean;
}

export interface ThemeSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  username?: string;
  phone_number?: string;
  timezone?: string;
  language?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  preferences?: UserPreferences;
}

// Event Types
export interface Event {
  id: string;
  user_id: string;
  group_id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  timezone: string;
  location?: string;
  location_details?: LocationDetails;
  event_type: EventType;
  category: EventCategory;
  priority: EventPriority;
  status: EventStatus;
  is_all_day: boolean;
  is_recurring: boolean;
  recurrence_rule?: RecurrenceRule;
  notification_settings?: EventNotificationSettings;
  visibility: EventVisibility;
  max_participants?: number;
  requires_confirmation: boolean;
  tags?: string[];
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
  creator?: User;
  group?: Group;
  participants?: EventParticipant[];
}

export interface LocationDetails {
  address?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  place_name?: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  days_of_week?: number[];
  day_of_month?: number;
  week_of_month?: number;
  month_of_year?: number;
  end_date?: string;
  occurrences?: number;
}

export interface EventNotificationSettings {
  enable_notifications: boolean;
  advance_notifications: number[];
  notification_methods: ('email' | 'push' | 'sms')[];
}

export type EventType = 'meeting' | 'reminder' | 'task' | 'appointment' | 'social' | 'other';
export type EventCategory = 'work' | 'personal' | 'health' | 'education' | 'travel' | 'family' | 'other';
export type EventPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type EventVisibility = 'public' | 'private' | 'group';

// Event Participant Types
export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: ParticipantStatus;
  role: ParticipantRole;
  response_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export type ParticipantStatus = 'pending' | 'accepted' | 'declined' | 'tentative';
export type ParticipantRole = 'organizer' | 'required' | 'optional' | 'resource';

// Group Types
export interface Group {
  id: string;
  name: string;
  description?: string;
  group_type: GroupType;
  privacy_level: GroupPrivacy;
  max_members?: number;
  settings: GroupSettings;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: User;
  members?: GroupMember[];
  member_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
  status: GroupMemberStatus;
  joined_at: string;
  invited_at?: string;
  invited_by?: string;
  permissions?: GroupPermissions;
  user?: User;
}

export interface GroupSettings {
  allow_member_invites: boolean;
  require_approval_for_events: boolean;
  default_event_visibility: EventVisibility;
  notification_preferences: {
    new_events: boolean;
    event_updates: boolean;
    member_activities: boolean;
  };
}

export interface GroupPermissions {
  can_create_events: boolean;
  can_edit_events: boolean;
  can_delete_events: boolean;
  can_invite_members: boolean;
  can_remove_members: boolean;
  can_edit_group: boolean;
}

export type GroupType = 'family' | 'work' | 'friends' | 'organization' | 'project' | 'other';
export type GroupPrivacy = 'public' | 'private' | 'invite_only';
export type GroupRole = 'owner' | 'admin' | 'moderator' | 'member';
export type GroupMemberStatus = 'active' | 'pending' | 'inactive' | 'banned';

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  priority: NotificationPriority;
  delivery_methods: NotificationMethod[];
  scheduled_at?: string;
  sent_at?: string;
  read_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export type NotificationType = 
  | 'event_reminder'
  | 'event_invitation'
  | 'event_update'
  | 'event_cancellation'
  | 'group_invitation'
  | 'group_update'
  | 'system_announcement'
  | 'user_mention';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationMethod = 'in_app' | 'email' | 'push' | 'sms';

// Dashboard Types
export interface DashboardStats {
  total_events: number;
  total_groups: number;
  events_this_week: number;
  events_today: number;
}

export interface WeekSummary {
  total_events: number;
  events_by_day: Record<number, number>;
}

export interface DashboardData {
  stats: DashboardStats;
  today_events: Event[];
  upcoming_events: Event[];
  groups: Group[];
  week_summary: WeekSummary;
}

// Form Types
export interface EventFormData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  timezone: string;
  location?: string;
  location_details?: LocationDetails;
  event_type: EventType;
  category: EventCategory;
  priority: EventPriority;
  is_all_day: boolean;
  is_recurring: boolean;
  recurrence_rule?: RecurrenceRule;
  notification_settings?: EventNotificationSettings;
  visibility: EventVisibility;
  max_participants?: number;
  requires_confirmation: boolean;
  tags?: string[];
  group_id?: string;
}

export interface GroupFormData {
  name: string;
  description?: string;
  group_type: GroupType;
  privacy_level: GroupPrivacy;
  max_members?: number;
  settings: GroupSettings;
}

export interface UserProfileFormData {
  first_name: string;
  last_name: string;
  username?: string;
  phone_number?: string;
  timezone: string;
  language: string;
}

export interface PasswordChangeFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Calendar Types
export interface CalendarView {
  view: 'month' | 'week' | 'day' | 'agenda';
  date: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource?: any;
  color?: string;
  textColor?: string;
  borderColor?: string;
  backgroundColor?: string;
}

// Search and Filter Types
export interface EventFilters {
  start_date?: string;
  end_date?: string;
  status?: EventStatus;
  category?: EventCategory;
  event_type?: EventType;
  priority?: EventPriority;
  tags?: string[];
  group_id?: string;
}

export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'ko' | 'en';
export type Timezone = string;

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  user_id?: string;
}

export interface EventUpdateMessage extends WebSocketMessage {
  type: 'event_update';
  payload: {
    event_id: string;
    action: 'created' | 'updated' | 'deleted';
    event?: Event;
  };
}

export interface NotificationMessage extends WebSocketMessage {
  type: 'notification';
  payload: Notification;
}

// Export all types
export * from './api';
export * from './store';
