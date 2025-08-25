import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { EventsState, EventsActions, EventFilters } from '@types/store';
import eventService from '@services/event';
import type { Event } from '@types/index';

interface EventsStore extends EventsState, EventsActions {}

export const useEventsStore = create<EventsStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      events: [],
      selectedEvent: null,
      isLoading: false,
      error: null,
      filters: {
        startDate: undefined,
        endDate: undefined,
        status: [],
        categories: [],
        priorities: [],
        types: [],
        groupIds: [],
        tags: [],
        searchQuery: '',
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },

      // Actions
      fetchEvents: async (filters) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentFilters = filters || get().filters;
          
          // Convert filters to API format
          const queryParams = {
            page: get().pagination.page,
            limit: get().pagination.limit,
            start_date: currentFilters.startDate?.toISOString(),
            end_date: currentFilters.endDate?.toISOString(),
            status: currentFilters.status?.join(','),
            category: currentFilters.categories?.join(','),
            event_type: currentFilters.types?.join(','),
            priority: currentFilters.priorities?.join(','),
          };

          const response = await eventService.getEvents(queryParams);
          
          set({
            events: response.data?.items || [],
            pagination: {
              page: response.data?.pagination.page || 1,
              limit: response.data?.pagination.limit || 20,
              total: response.data?.pagination.total || 0,
              hasNextPage: response.data?.pagination.page < response.data?.pagination.pages,
              hasPreviousPage: response.data?.pagination.page > 1,
            },
            isLoading: false,
          });

          if (filters) {
            set({ filters: currentFilters });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '이벤트를 불러올 수 없습니다.',
            isLoading: false,
          });
        }
      },

      createEvent: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const newEvent = await eventService.createEvent(data);
          
          set((state) => ({
            events: [newEvent, ...state.events],
            isLoading: false,
          }));
          
          return newEvent;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '이벤트 생성에 실패했습니다.',
            isLoading: false,
          });
          throw error;
        }
      },

      updateEvent: async (id, data) => {
        set({ isLoading: true, error: null });
        
        try {
          const updatedEvent = await eventService.updateEvent(id, data);
          
          set((state) => ({
            events: state.events.map((event) =>
              event.id === id ? updatedEvent : event
            ),
            selectedEvent: state.selectedEvent?.id === id ? updatedEvent : state.selectedEvent,
            isLoading: false,
          }));
          
          return updatedEvent;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '이벤트 수정에 실패했습니다.',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteEvent: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          await eventService.deleteEvent(id);
          
          set((state) => ({
            events: state.events.filter((event) => event.id !== id),
            selectedEvent: state.selectedEvent?.id === id ? null : state.selectedEvent,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '이벤트 삭제에 실패했습니다.',
            isLoading: false,
          });
          throw error;
        }
      },

      selectEvent: (event) => {
        set({ selectedEvent: event });
      },

      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
          pagination: { ...state.pagination, page: 1 }, // Reset to first page
        }));
        
        // Automatically fetch events with new filters
        get().fetchEvents();
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'events-store',
    }
  )
);

// Utility functions
export const useEventById = (id: string) => {
  return useEventsStore((state) => 
    state.events.find((event) => event.id === id)
  );
};

export const useEventsByDate = (date: Date) => {
  return useEventsStore((state) => 
    state.events.filter((event) => {
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    })
  );
};

export const useUpcomingEvents = (days: number = 7) => {
  return useEventsStore((state) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return state.events.filter((event) => {
      const eventDate = new Date(event.start_time);
      return eventDate >= now && eventDate <= futureDate;
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  });
};

export const useEventsByCategory = (category: string) => {
  return useEventsStore((state) => 
    state.events.filter((event) => event.category === category)
  );
};

export const useEventsByPriority = (priority: string) => {
  return useEventsStore((state) => 
    state.events.filter((event) => event.priority === priority)
  );
};
