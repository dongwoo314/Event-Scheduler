import { useState, useEffect, useCallback } from 'react';
import eventService from '../services/event';
import { Event } from '../types';

interface UseEventsOptions {
  startDate?: Date;
  endDate?: Date;
  autoFetch?: boolean;
}

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getEventsByDate: (date: Date) => Event[];
  getEventsInRange: (startDate: Date, endDate: Date) => Event[];
}

export const useEvents = (options: UseEventsOptions = {}): UseEventsReturn => {
  const { startDate, endDate, autoFetch = true } = options;
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let fetchedEvents: Event[];

      if (startDate && endDate) {
        // 날짜 범위로 조회
        fetchedEvents = await eventService.getEventsByDateRange(
          startDate.toISOString(),
          endDate.toISOString()
        );
      } else {
        // 전체 이벤트 조회
        const response = await eventService.getEvents({ limit: 1000 });
        fetchedEvents = response.data?.items || [];
      }

      // Date 객체로 변환
      const processedEvents = fetchedEvents.map(event => ({
        ...event,
        start_time: new Date(event.start_time),
        end_time: new Date(event.end_time),
        created_at: new Date(event.created_at),
        updated_at: new Date(event.updated_at)
      }));

      setEvents(processedEvents);
    } catch (err: any) {
      console.error('이벤트 조회 오류:', err);
      setError(err.message || '이벤트를 불러오는데 실패했습니다.');
      
      // 오류 발생 시 빈 배열로 설정
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const getEventsByDate = useCallback((date: Date): Event[] => {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    return events.filter(event => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      
      // 하루 종일 이벤트인 경우
      if (event.all_day) {
        const eventDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
        return eventDate.getTime() === targetDate.getTime();
      }
      
      // 일반 이벤트인 경우 - 해당 날짜에 시작하거나 진행 중인 이벤트
      const eventStartDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
      const eventEndDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
      
      return targetDate >= eventStartDate && targetDate <= eventEndDate;
    });
  }, [events]);

  const getEventsInRange = useCallback((startDate: Date, endDate: Date): Event[] => {
    return events.filter(event => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      
      // 이벤트가 범위와 겹치는지 확인
      return (eventStart <= endDate) && (eventEnd >= startDate);
    });
  }, [events]);

  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [fetchEvents, autoFetch]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    getEventsByDate,
    getEventsInRange
  };
};