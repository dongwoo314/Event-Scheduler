import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location?: string;
  category: 'personal' | 'work' | 'social' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  is_all_day: boolean;
  group_id?: string;
  group_name?: string;
  participants?: EventParticipant[];
  created_at: string;
  updated_at: string;
}

interface EventParticipant {
  user_id: string;
  status: 'accepted' | 'declined' | 'pending';
  responded_at?: string;
}

interface EventState {
  // 상태
  events: Event[];
  selectedEvent: Event | null;
  loading: boolean;
  error: string | null;
  
  // 필터 상태
  filters: {
    category?: string;
    status?: string;
    priority?: string;
    group_id?: string;
    date_range?: {
      start: string;
      end: string;
    };
  };
  
  // 액션
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (updatedEvent: Event) => void;
  deleteEvent: (eventId: string) => void;
  setSelectedEvent: (event: Event | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: any) => void;
  
  // 비동기 액션
  loadEvents: () => Promise<void>;
  createEvent: (eventData: any) => Promise<Event>;
  createGroupEvent: (eventData: any, groupId: string, groupName: string) => Promise<Event>;
  editEvent: (eventId: string, eventData: any) => Promise<Event>;
  removeEvent: (eventId: string) => Promise<void>;
  respondToEvent: (eventId: string, userId: string, status: 'accepted' | 'declined') => Promise<void>;
  
  // 유틸리티
  getEventById: (eventId: string) => Event | undefined;
  getEventsByGroup: (groupId: string) => Event[];
  getEventsByDateRange: (start: string, end: string) => Event[];
  getUpcomingEvents: () => Event[];
  getTodayEvents: () => Event[];
  searchEvents: (query: string) => Event[];
  getFilteredEvents: () => Event[];
  getParticipantStatus: (eventId: string, userId: string) => 'accepted' | 'declined' | 'pending' | null;
  getParticipantCounts: (eventId: string) => { accepted: number; declined: number; pending: number };
  clearError: () => void;
  reset: () => void;
}

// 초기 목 데이터
const createInitialEvents = (): Event[] => [
  {
    id: '1',
    title: '개발팀 회의',
    description: '주간 개발 진행 상황 공유 및 계획 수립',
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 내일
    end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 내일 + 2시간
    location: '회의실 A',
    category: 'work',
    priority: 'high',
    status: 'upcoming',
    is_all_day: false,
    group_id: '1',
    group_name: '개발팀',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: '프로젝트 알파 킥오프',
    description: '새로운 프로젝트 시작을 위한 킥오프 미팅',
    start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 후
    end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3일 후 + 3시간
    location: '온라인',
    category: 'personal',
    priority: 'high',
    status: 'upcoming',
    is_all_day: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: '등산 모임',
    description: '관악산 등산 및 뒤풀이',
    start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 일주일 후
    end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(), // 일주일 후 + 8시간
    location: '관악산',
    category: 'social',
    priority: 'medium',
    status: 'upcoming',
    is_all_day: true,
    group_id: '3',
    group_name: '취미 클럽',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    title: '개인 업무',
    description: '개인 작업 시간',
    start_time: new Date().toISOString(), // 오늘
    end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 오늘 + 4시간
    category: 'personal',
    priority: 'medium',
    status: 'ongoing',
    is_all_day: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    title: '9월 30일 테스트 이벤트',
    description: '9월 30일 삭제 테스트용 이벤트',
    start_time: new Date('2024-09-30T10:00:00').toISOString(),
    end_time: new Date('2024-09-30T11:00:00').toISOString(),
    category: 'other',
    priority: 'low',
    status: 'upcoming',
    is_all_day: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// localStorage에서 초기 이벤트 로드 (마이그레이션 포함)
const loadInitialEvents = (): Event[] => {
  try {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents);
      
      // 마이그레이션: "프로젝트 알파" 그룹 삭제 이후 관련 이벤트 정리
      const migratedEvents = parsedEvents.map((event: Event) => {
        if (event.group_id === '2' && event.group_name === '프로젝트 알파') {
          console.log('🔄 마이그레이션: 프로젝트 알파 이벤트를 개인 카테고리로 변경:', event.title);
          return {
            ...event,
            group_id: undefined,
            group_name: undefined,
            category: 'personal'
          };
        }
        return event;
      });
      
      console.log('📦 초기화: localStorage에서 이벤트 로드 (마이그레이션 완료):', migratedEvents.length, '개');
      
      // 마이그레이션된 데이터 저장
      localStorage.setItem('events', JSON.stringify(migratedEvents));
      return migratedEvents;
    }
  } catch (error) {
    console.warn('📦 초기화: localStorage 파싱 오류, 초기 데이터 생성');
  }
  
  const freshEvents = createInitialEvents();
  localStorage.setItem('events', JSON.stringify(freshEvents));
  console.log('📦 초기화: 새로운 이벤트 데이터 생성:', freshEvents.length, '개');
  return freshEvents;
};

export const useEventStore = create<EventState>()(
  subscribeWithSelector(
    (set, get) => ({
      // 초기 상태 - localStorage에서 로드하거나 새로 생성
      events: loadInitialEvents(),
      selectedEvent: null,
      loading: false,
      error: null,
      filters: {},

      // 기본 액션
      setEvents: (events) => {
        console.log('🔄 setEvents 호출됨:', events.length, '개 이벤트');
        set({ events });
      },
      
      addEvent: (event) => {
        console.log('➕ addEvent 호출됨:', event.title);
        set((state) => {
          const newEvents = [event, ...state.events];
          console.log('📝 이벤트 추가 완료. 총 이벤트 수:', newEvents.length);
          // localStorage에 저장
          localStorage.setItem('events', JSON.stringify(newEvents));
          return { events: newEvents };
        });
      },
      
      updateEvent: (updatedEvent) => {
        console.log('✏️ updateEvent 호출됨:', updatedEvent.title);
        set((state) => {
          const newEvents = state.events.map(event => 
            event.id === updatedEvent.id ? { ...event, ...updatedEvent } : event
          );
          console.log('📝 이벤트 수정 완료. 총 이벤트 수:', newEvents.length);
          // localStorage에 저장
          localStorage.setItem('events', JSON.stringify(newEvents));
          return {
            events: newEvents,
            selectedEvent: state.selectedEvent?.id === updatedEvent.id 
              ? { ...state.selectedEvent, ...updatedEvent } 
              : state.selectedEvent
          };
        });
      },
      
      deleteEvent: (eventId) => {
        console.log('🗑️ deleteEvent 호출됨:', eventId);
        set((state) => {
          const eventToDelete = state.events.find(e => e.id === eventId);
          const newEvents = state.events.filter(event => event.id !== eventId);
          console.log('📝 이벤트 삭제 완료:', eventToDelete?.title, '총 이벤트 수:', newEvents.length);
          // localStorage에 저장
          localStorage.setItem('events', JSON.stringify(newEvents));
          return {
            events: newEvents,
            selectedEvent: state.selectedEvent?.id === eventId ? null : state.selectedEvent
          };
        });
      },
      
      setSelectedEvent: (event) => set({ selectedEvent: event }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setFilters: (filters) => set((state) => ({ 
        filters: { ...state.filters, ...filters } 
      })),

      // 비동기 액션
      loadEvents: async () => {
        console.log('🔄 loadEvents 호출됨');
        set({ loading: true, error: null });
        try {
          // 기존 이벤트가 있는지 확인
          const currentEvents = get().events;
          if (currentEvents.length > 0) {
            console.log('📦 기존 이벤트 데이터 유지:', currentEvents.length, '개');
            set({ loading: false });
            return;
          }
          
          // localStorage에서 이벤트 확인
          const savedEvents = localStorage.getItem('events');
          if (savedEvents) {
            try {
              const parsedEvents = JSON.parse(savedEvents);
              console.log('📦 localStorage에서 이벤트 로드됨:', parsedEvents.length, '개');
              set({ events: parsedEvents, loading: false });
              return;
            } catch (parseError) {
              console.warn('localStorage 파싱 오류, 초기 데이터 생성');
            }
          }
          
          // 초기 데이터 생성 (최초 실행시에만)
          const freshEvents = createInitialEvents();
          console.log('📦 새로운 이벤트 데이터 생성됨:', freshEvents.length, '개');
          localStorage.setItem('events', JSON.stringify(freshEvents));
          set({ events: freshEvents, loading: false });
        } catch (error: any) {
          console.error('❌ 이벤트 로드 실패:', error);
          set({ error: error.message || '이벤트 로드에 실패했습니다.', loading: false });
        }
      },

      createEvent: async (eventData) => {
        console.log('🚀 createEvent 호출됨:', eventData.title);
        set({ loading: true, error: null });
        try {
          const newEvent: Event = {
            id: Date.now().toString(),
            title: eventData.title,
            description: eventData.description || '',
            start_time: eventData.start_time,
            end_time: eventData.end_time,
            location: eventData.location,
            category: eventData.category || 'other',
            priority: eventData.priority || 'medium',
            status: 'upcoming',
            is_all_day: eventData.is_all_day || false,
            group_id: eventData.group_id,
            group_name: eventData.group_name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // 즉시 상태 업데이트
          get().addEvent(newEvent);
          
          // 알림 생성
          if (typeof window !== 'undefined' && window.__NOTIFICATION_STORE__) {
            const notificationStore = window.__NOTIFICATION_STORE__.getState();
            notificationStore.createEventUpdate(newEvent.id, newEvent.title, 'created');
          }
          
          set({ loading: false });
          console.log('✅ 이벤트 생성 완료:', newEvent.title);
          return newEvent;
        } catch (error: any) {
          console.error('❌ 이벤트 생성 실패:', error);
          set({ error: error.message || '이벤트 생성에 실패했습니다.', loading: false });
          throw error;
        }
      },

      createGroupEvent: async (eventData, groupId, groupName) => {
        console.log('🚀 createGroupEvent 호출됨:', eventData.title, 'for group:', groupName);
        set({ loading: true, error: null });
        try {
          const newEvent: Event = {
            id: Date.now().toString(),
            title: eventData.title,
            description: eventData.description || '',
            start_time: eventData.start_time,
            end_time: eventData.end_time,
            location: eventData.location,
            category: 'work', // 그룹 이벤트는 work 카테고리
            priority: eventData.priority || 'medium',
            status: 'upcoming',
            is_all_day: eventData.is_all_day || false,
            group_id: groupId,
            group_name: groupName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // 즉시 상태 업데이트
          get().addEvent(newEvent);
          
          // 이벤트 카운트는 실시간 계산되므로 그룹 스토어 업데이트 불필요
          
          // 그룹 멤버들에게 알림 생성 (알림 활성화된 경우)
          if (eventData.notify_members && typeof window !== 'undefined' && window.__NOTIFICATION_STORE__) {
            const notificationStore = window.__NOTIFICATION_STORE__.getState();
            notificationStore.createGroupEventNotification(newEvent.id, newEvent.title, groupName);
          }
          
          set({ loading: false });
          console.log('✅ 그룹 이벤트 생성 완료:', newEvent.title);
          return newEvent;
        } catch (error: any) {
          console.error('❌ 그룹 이벤트 생성 실패:', error);
          set({ error: error.message || '그룹 이벤트 생성에 실패했습니다.', loading: false });
          throw error;
        }
      },

      editEvent: async (eventId, eventData) => {
        console.log('🛠️ editEvent 호출됨:', eventId, eventData);
        set({ loading: true, error: null });
        try {
          const existingEvent = get().events.find(e => e.id === eventId);
          if (!existingEvent) {
            throw new Error('이벤트를 찾을 수 없습니다.');
          }
          
          const updatedEvent = {
            ...existingEvent,
            ...eventData,
            updated_at: new Date().toISOString()
          } as Event;
          
          // 즉시 상태 업데이트
          get().updateEvent(updatedEvent);
          set({ loading: false });
          
          console.log('✅ 이벤트 수정 완료:', updatedEvent.title);
          return updatedEvent;
        } catch (error: any) {
          console.error('❌ 이벤트 수정 실패:', error);
          set({ error: error.message || '이벤트 수정에 실패했습니다.', loading: false });
          throw error;
        }
      },

      removeEvent: async (eventId) => {
        console.log('🗑️ removeEvent 호출됨:', eventId);
        set({ loading: true, error: null });
        try {
          const eventToDelete = get().events.find(e => e.id === eventId);
          if (!eventToDelete) {
            throw new Error('삭제할 이벤트를 찾을 수 없습니다.');
          }
          
          // 즉시 상태 업데이트
          get().deleteEvent(eventId);
          set({ loading: false });
          
          console.log('✅ 이벤트 삭제 완료:', eventToDelete.title);
        } catch (error: any) {
          console.error('❌ 이벤트 삭제 실패:', error);
          set({ error: error.message || '이벤트 삭제에 실패했습니다.', loading: false });
          throw error;
        }
      },

      respondToEvent: async (eventId, userId, status) => {
        console.log('📝 respondToEvent 호출됨:', eventId, userId, status);
        set({ loading: true, error: null });
        try {
          const event = get().events.find(e => e.id === eventId);
          if (!event) {
            throw new Error('이벤트를 찾을 수 없습니다.');
          }

          // 참석자 목록 초기화
          const participants = event.participants || [];
          
          // 기존 참석자 확인
          const existingParticipantIndex = participants.findIndex(p => p.user_id === userId);
          
          if (existingParticipantIndex >= 0) {
            // 기존 참석자 상태 업데이트
            participants[existingParticipantIndex] = {
              ...participants[existingParticipantIndex],
              status,
              responded_at: new Date().toISOString()
            };
          } else {
            // 새 참석자 추가
            participants.push({
              user_id: userId,
              status,
              responded_at: new Date().toISOString()
            });
          }

          // 이벤트 업데이트
          const updatedEvent = {
            ...event,
            participants,
            updated_at: new Date().toISOString()
          };
          
          get().updateEvent(updatedEvent);
          set({ loading: false });
          
          console.log('✅ 이벤트 응답 완료:', status);
        } catch (error: any) {
          console.error('❌ 이벤트 응답 실패:', error);
          set({ error: error.message || '이벤트 응답에 실패했습니다.', loading: false });
          throw error;
        }
      },

      // 유틸리티 함수
      getEventById: (eventId) => {
        return get().events.find(event => event.id === eventId);
      },

      getEventsByGroup: (groupId) => {
        return get().events.filter(event => event.group_id === groupId);
      },

      getEventsByDateRange: (start, end) => {
        return get().events.filter(event => {
          const eventDate = new Date(event.start_time);
          const startDate = new Date(start);
          const endDate = new Date(end);
          return eventDate >= startDate && eventDate <= endDate;
        });
      },

      getUpcomingEvents: () => {
        const now = new Date();
        return get().events
          .filter(event => new Date(event.start_time) > now && event.status === 'upcoming')
          .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      },

      getTodayEvents: () => {
        const today = new Date().toDateString();
        return get().events.filter(event => 
          new Date(event.start_time).toDateString() === today
        );
      },

      searchEvents: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().events.filter(event =>
          event.title.toLowerCase().includes(lowerQuery) ||
          event.description.toLowerCase().includes(lowerQuery) ||
          event.location?.toLowerCase().includes(lowerQuery)
        );
      },

      getFilteredEvents: () => {
        const { events, filters } = get();
        let filteredEvents = [...events];

        if (filters.category) {
          filteredEvents = filteredEvents.filter(event => event.category === filters.category);
        }

        if (filters.status) {
          filteredEvents = filteredEvents.filter(event => event.status === filters.status);
        }

        if (filters.priority) {
          filteredEvents = filteredEvents.filter(event => event.priority === filters.priority);
        }

        if (filters.group_id) {
          filteredEvents = filteredEvents.filter(event => event.group_id === filters.group_id);
        }

        if (filters.date_range) {
          const startDate = new Date(filters.date_range.start);
          const endDate = new Date(filters.date_range.end);
          filteredEvents = filteredEvents.filter(event => {
            const eventDate = new Date(event.start_time);
            return eventDate >= startDate && eventDate <= endDate;
          });
        }

        return filteredEvents;
      },

      getParticipantStatus: (eventId, userId) => {
        const event = get().events.find(e => e.id === eventId);
        if (!event || !event.participants) return null;
        
        const participant = event.participants.find(p => p.user_id === userId);
        return participant ? participant.status : null;
      },

      getParticipantCounts: (eventId) => {
        const event = get().events.find(e => e.id === eventId);
        if (!event || !event.participants) {
          return { accepted: 0, declined: 0, pending: 0 };
        }
        
        return event.participants.reduce(
          (acc, participant) => {
            acc[participant.status]++;
            return acc;
          },
          { accepted: 0, declined: 0, pending: 0 }
        );
      },

      clearError: () => set({ error: null }),
      
      reset: () => {
        console.log('🔄 스토어 리셋');
        const freshEvents = createInitialEvents();
        // localStorage도 초기화
        localStorage.setItem('events', JSON.stringify(freshEvents));
        set({
          events: freshEvents,
          selectedEvent: null,
          loading: false,
          error: null,
          filters: {}
        });
      }
    })
  )
);

// 구독을 통한 로깅 (디버깅용)
useEventStore.subscribe(
  (state) => state.events,
  (events, previousEvents) => {
    console.log('🔔 이벤트 상태 변경됨:', {
      이전: previousEvents?.length || 0,
      현재: events.length,
      변화: events.length - (previousEvents?.length || 0)
    });
  }
);

// 글로벌 디버깅을 위한 참조 추가
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.__EVENT_STORE__ = useEventStore;
  console.log('🔧 글로벌 이벤트 스토어 참조 등록됨');
}

export default useEventStore;