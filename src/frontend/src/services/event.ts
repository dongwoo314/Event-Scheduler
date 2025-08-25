import apiService from './api';
import { 
  Event, 
  EventFormData,
  EventFilters,
  PaginatedResponse,
  EventsQueryParams,
  CreateEventRequest,
  UpdateEventRequest,
  InviteToEventRequest,
  EventParticipant
} from '@types/index';

class EventService {
  /**
   * 이벤트 목록 조회
   */
  async getEvents(params?: EventsQueryParams): Promise<PaginatedResponse<Event>> {
    const response = await apiService.get<{ events: Event[]; pagination: any }>('/events', {
      params,
    });
    
    if (response.success && response.data) {
      return {
        success: true,
        message: response.message,
        data: {
          items: response.data.events,
          pagination: response.data.pagination,
        },
      };
    }
    
    throw new Error(response.message || '이벤트 목록을 불러올 수 없습니다.');
  }

  /**
   * 특정 이벤트 조회
   */
  async getEvent(id: string): Promise<Event> {
    const response = await apiService.get<{ event: Event }>(`/events/${id}`);
    
    if (response.success && response.data) {
      return response.data.event;
    }
    
    throw new Error(response.message || '이벤트를 불러올 수 없습니다.');
  }

  /**
   * 이벤트 생성
   */
  async createEvent(data: CreateEventRequest): Promise<Event> {
    const response = await apiService.post<{ event: Event }>('/events', data);
    
    if (response.success && response.data) {
      return response.data.event;
    }
    
    throw new Error(response.message || '이벤트 생성에 실패했습니다.');
  }

  /**
   * 이벤트 수정
   */
  async updateEvent(id: string, data: UpdateEventRequest): Promise<Event> {
    const response = await apiService.put<{ event: Event }>(`/events/${id}`, data);
    
    if (response.success && response.data) {
      return response.data.event;
    }
    
    throw new Error(response.message || '이벤트 수정에 실패했습니다.');
  }

  /**
   * 이벤트 삭제
   */
  async deleteEvent(id: string): Promise<void> {
    const response = await apiService.delete(`/events/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || '이벤트 삭제에 실패했습니다.');
    }
  }

  /**
   * 이벤트 참가자 목록 조회
   */
  async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    const response = await apiService.get<{ participants: EventParticipant[] }>(`/events/${eventId}/participants`);
    
    if (response.success && response.data) {
      return response.data.participants;
    }
    
    throw new Error(response.message || '참가자 목록을 불러올 수 없습니다.');
  }

  /**
   * 이벤트에 사용자 초대
   */
  async inviteToEvent(eventId: string, data: InviteToEventRequest): Promise<void> {
    const response = await apiService.post(`/events/${eventId}/invite`, data);
    
    if (!response.success) {
      throw new Error(response.message || '초대 발송에 실패했습니다.');
    }
  }

  /**
   * 이벤트 참가 응답
   */
  async respondToEventInvitation(
    eventId: string, 
    status: 'accepted' | 'declined' | 'tentative',
    notes?: string
  ): Promise<void> {
    const response = await apiService.post(`/events/${eventId}/respond`, {
      status,
      notes,
    });
    
    if (!response.success) {
      throw new Error(response.message || '응답 전송에 실패했습니다.');
    }
  }

  /**
   * 이벤트에서 나가기
   */
  async leaveEvent(eventId: string): Promise<void> {
    const response = await apiService.delete(`/events/${eventId}/leave`);
    
    if (!response.success) {
      throw new Error(response.message || '이벤트 나가기에 실패했습니다.');
    }
  }

  /**
   * 날짜 범위로 이벤트 조회
   */
  async getEventsByDateRange(startDate: string, endDate: string, timezone?: string): Promise<Event[]> {
    const params: EventsQueryParams = {
      start_date: startDate,
      end_date: endDate,
      timezone: timezone || 'Asia/Seoul',
      limit: 1000, // 충분한 수의 이벤트 조회
    };

    const response = await this.getEvents(params);
    return response.data?.items || [];
  }

  /**
   * 오늘의 이벤트 조회
   */
  async getTodayEvents(timezone?: string): Promise<Event[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    return this.getEventsByDateRange(
      startOfDay.toISOString(),
      endOfDay.toISOString(),
      timezone
    );
  }

  /**
   * 다가오는 이벤트 조회
   */
  async getUpcomingEvents(days: number = 7, timezone?: string): Promise<Event[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return this.getEventsByDateRange(
      now.toISOString(),
      futureDate.toISOString(),
      timezone
    );
  }

  /**
   * 이벤트 검색
   */
  async searchEvents(query: string, filters?: Partial<EventFilters>): Promise<Event[]> {
    const params: EventsQueryParams = {
      page: 1,
      limit: 50,
      ...filters,
    };

    // 검색어를 여러 필드에서 검색할 수 있도록 백엔드에서 처리
    const response = await apiService.get<{ events: Event[] }>('/events/search', {
      params: {
        q: query,
        ...params,
      },
    });
    
    if (response.success && response.data) {
      return response.data.events;
    }
    
    return [];
  }

  /**
   * 이벤트 복제
   */
  async duplicateEvent(eventId: string, newStartTime?: string): Promise<Event> {
    const originalEvent = await this.getEvent(eventId);
    
    // 원본 이벤트에서 필요한 데이터 추출
    const duplicateData: CreateEventRequest = {
      title: `${originalEvent.title} (복사본)`,
      description: originalEvent.description,
      start_time: newStartTime || originalEvent.start_time,
      end_time: originalEvent.end_time,
      timezone: originalEvent.timezone,
      location: originalEvent.location,
      location_details: originalEvent.location_details,
      event_type: originalEvent.event_type,
      category: originalEvent.category,
      priority: originalEvent.priority,
      is_all_day: originalEvent.is_all_day,
      visibility: originalEvent.visibility,
      max_participants: originalEvent.max_participants,
      requires_confirmation: originalEvent.requires_confirmation,
      tags: originalEvent.tags,
      notification_settings: originalEvent.notification_settings,
    };

    return this.createEvent(duplicateData);
  }

  /**
   * 이벤트 내보내기 (iCal 형식)
   */
  async exportEvent(eventId: string): Promise<string> {
    const response = await apiService.get<{ icalData: string }>(`/events/${eventId}/export`);
    
    if (response.success && response.data) {
      return response.data.icalData;
    }
    
    throw new Error(response.message || '이벤트 내보내기에 실패했습니다.');
  }

  /**
   * 여러 이벤트 내보내기
   */
  async exportEvents(eventIds: string[]): Promise<string> {
    const response = await apiService.post<{ icalData: string }>('/events/export', {
      event_ids: eventIds,
    });
    
    if (response.success && response.data) {
      return response.data.icalData;
    }
    
    throw new Error(response.message || '이벤트 내보내기에 실패했습니다.');
  }

  /**
   * 이벤트 가져오기 (iCal 파일)
   */
  async importEvents(file: File): Promise<Event[]> {
    const response = await apiService.uploadFile('/events/import', file);
    
    if (response.success && response.data) {
      return response.data.events;
    }
    
    throw new Error(response.message || '이벤트 가져오기에 실패했습니다.');
  }

  /**
   * 이벤트 알림 설정 업데이트
   */
  async updateEventNotifications(
    eventId: string, 
    notificationSettings: any
  ): Promise<void> {
    const response = await apiService.patch(`/events/${eventId}/notifications`, {
      notification_settings: notificationSettings,
    });
    
    if (!response.success) {
      throw new Error(response.message || '알림 설정 업데이트에 실패했습니다.');
    }
  }

  /**
   * 이벤트 상태 변경
   */
  async updateEventStatus(
    eventId: string, 
    status: 'draft' | 'published' | 'cancelled' | 'completed'
  ): Promise<Event> {
    const response = await apiService.patch<{ event: Event }>(`/events/${eventId}/status`, {
      status,
    });
    
    if (response.success && response.data) {
      return response.data.event;
    }
    
    throw new Error(response.message || '이벤트 상태 변경에 실패했습니다.');
  }

  /**
   * 반복 이벤트의 특정 인스턴스 수정
   */
  async updateRecurringEventInstance(
    eventId: string,
    instanceDate: string,
    data: UpdateEventRequest,
    updateType: 'single' | 'following' | 'all' = 'single'
  ): Promise<Event> {
    const response = await apiService.put<{ event: Event }>(`/events/${eventId}/instances`, {
      instance_date: instanceDate,
      update_type: updateType,
      ...data,
    });
    
    if (response.success && response.data) {
      return response.data.event;
    }
    
    throw new Error(response.message || '반복 이벤트 수정에 실패했습니다.');
  }
}

// 싱글톤 인스턴스 생성
const eventService = new EventService();

export default eventService;
export { EventService };
