import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Notification {
  id: string;
  type: 'event_reminder' | 'event_invitation' | 'group_invitation' | 'system' | 'event_update';
  title: string;
  message: string;
  time: string;
  timestamp: number;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedEventId?: string;
  relatedGroupId?: string;
  actionUrl?: string;
}

interface NotificationState {
  // 상태
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  
  // 액션
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  
  // 이벤트 기반 알림 생성
  createEventReminder: (eventId: string, eventTitle: string, minutesBefore: number) => void;
  createGroupInvitation: (groupId: string, groupName: string, inviterName: string) => void;
  createEventInvitation: (eventId: string, eventTitle: string, groupName: string) => void;
  createEventUpdate: (eventId: string, eventTitle: string, updateType: string) => void;
  createGroupEventNotification: (eventId: string, eventTitle: string, groupName: string) => void;
  
  // 유틸리티
  getUnreadCount: () => number;
  getNotificationsByType: (type: string) => Notification[];
  generateNotificationsFromEvents: () => void;
  clearError: () => void;
}

// 시간 포맷 함수
const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  
  return new Date(timestamp).toLocaleDateString('ko-KR');
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      notifications: [],
      loading: false,
      error: null,

      // 기본 액션
      setNotifications: (notifications) => {
        console.log('🔔 setNotifications 호출됨:', notifications.length, '개');
        set({ notifications });
      },
      
      addNotification: (notificationData) => {
        const newNotification: Notification = {
          ...notificationData,
          id: Date.now().toString(),
          timestamp: Date.now()
        };
        
        console.log('🔔 새 알림 추가됨:', newNotification.title);
        set((state) => ({
          notifications: [newNotification, ...state.notifications]
        }));
      },
      
      markAsRead: (notificationId) => {
        console.log('✅ 알림 읽음 처리:', notificationId);
        set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        }));
      },
      
      markAllAsRead: () => {
        console.log('✅ 모든 알림 읽음 처리');
        set((state) => ({
          notifications: state.notifications.map(notification => ({
            ...notification,
            isRead: true
          }))
        }));
      },
      
      removeNotification: (notificationId) => {
        console.log('🗑️ 알림 삭제:', notificationId);
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== notificationId)
        }));
      },
      
      clearAllNotifications: () => {
        console.log('🗑️ 모든 알림 삭제');
        set({ notifications: [] });
      },

      // 이벤트 기반 알림 생성
      createEventReminder: (eventId, eventTitle, minutesBefore) => {
        const notification = {
          type: 'event_reminder' as const,
          title: '이벤트 알림',
          message: `${minutesBefore}분 후 "${eventTitle}" 이벤트가 시작됩니다.`,
          time: formatTimeAgo(Date.now()),
          isRead: false,
          priority: 'high' as const,
          relatedEventId: eventId,
          actionUrl: '/events'
        };
        
        get().addNotification(notification);
      },
      
      createGroupInvitation: (groupId, groupName, inviterName) => {
        const notification = {
          type: 'group_invitation' as const,
          title: '그룹 초대',
          message: `${inviterName}님이 "${groupName}" 그룹에 초대했습니다.`,
          time: formatTimeAgo(Date.now()),
          isRead: false,
          priority: 'medium' as const,
          relatedGroupId: groupId,
          actionUrl: '/groups'
        };
        
        get().addNotification(notification);
      },
      
      createEventInvitation: (eventId, eventTitle, groupName) => {
        const notification = {
          type: 'event_invitation' as const,
          title: '이벤트 초대',
          message: `"${groupName}" 그룹에서 "${eventTitle}" 이벤트에 초대했습니다.`,
          time: formatTimeAgo(Date.now()),
          isRead: false,
          priority: 'medium' as const,
          relatedEventId: eventId,
          actionUrl: '/events'
        };
        
        get().addNotification(notification);
      },
      
      createEventUpdate: (eventId, eventTitle, updateType) => {
        const updateMessages = {
          created: `새로운 이벤트 "${eventTitle}"가 생성되었습니다.`,
          updated: `이벤트 "${eventTitle}"가 수정되었습니다.`,
          cancelled: `이벤트 "${eventTitle}"가 취소되었습니다.`,
          completed: `이벤트 "${eventTitle}"가 완료되었습니다.`
        };
        
        const notification = {
          type: 'event_update' as const,
          title: '이벤트 업데이트',
          message: updateMessages[updateType as keyof typeof updateMessages] || `이벤트 "${eventTitle}"가 업데이트되었습니다.`,
          time: formatTimeAgo(Date.now()),
          isRead: false,
          priority: 'low' as const,
          relatedEventId: eventId,
          actionUrl: '/events'
        };
        
        get().addNotification(notification);
      },

      createGroupEventNotification: (eventId, eventTitle, groupName) => {
        const notification = {
          type: 'event_invitation' as const,
          title: '그룹 이벤트 생성',
          message: `"${groupName}" 그룹에 새로운 이벤트 "${eventTitle}"가 생성되었습니다.`,
          time: formatTimeAgo(Date.now()),
          isRead: false,
          priority: 'medium' as const,
          relatedEventId: eventId,
          actionUrl: '/events'
        };
        
        get().addNotification(notification);
        console.log('🔔 그룹 이벤트 알림 생성:', eventTitle, 'in', groupName);
      },

      // 이벤트 데이터를 기반으로 알림 자동 생성
      generateNotificationsFromEvents: () => {
        console.log('🔔 이벤트 기반 알림 생성 시작');
        
        // 이벤트 스토어에서 데이터 가져오기
        if (typeof window !== 'undefined' && window.__EVENT_STORE__) {
          const eventStore = window.__EVENT_STORE__.getState();
          const events = eventStore.events;
          
          // 기존 알림들의 이벤트 ID 수집 (중복 방지)
          const existingEventIds = get().notifications
            .filter(n => n.relatedEventId)
            .map(n => n.relatedEventId);
          
          let newNotificationsCount = 0;
          
          // 예정된 이벤트들에 대한 알림 생성
          events.forEach((event: any) => {
            if (event.status === 'upcoming' && !existingEventIds.includes(event.id)) {
              const eventDate = new Date(event.start_time);
              const now = new Date();
              const timeDiff = eventDate.getTime() - now.getTime();
              const hoursDiff = timeDiff / (1000 * 60 * 60);
              
              // 24시간 이내 이벤트에 대해 알림 생성
              if (hoursDiff > 0 && hoursDiff <= 24) {
                const minutesBefore = Math.round(hoursDiff * 60);
                get().createEventReminder(event.id, event.title, minutesBefore);
                newNotificationsCount++;
              }
            }
          });
          
          if (newNotificationsCount > 0) {
            console.log(`🔔 ${newNotificationsCount}개의 새로운 이벤트 알림 생성됨`);
          } else {
            console.log('🔔 생성할 새로운 알림이 없음');
          }
        }
      },

      // 유틸리티 함수
      getUnreadCount: () => {
        return get().notifications.filter(n => !n.isRead).length;
      },
      
      getNotificationsByType: (type) => {
        return get().notifications.filter(n => n.type === type);
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({ 
        notifications: state.notifications.map(n => ({
          ...n,
          time: formatTimeAgo(n.timestamp) // 시간 표시 업데이트
        }))
      })
    }
  )
);

// 글로벌 디버깅을 위한 참조 추가
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.__NOTIFICATION_STORE__ = useNotificationStore;
  console.log('🔧 글로벌 알림 스토어 참조 등록됨');
}

export default useNotificationStore;
