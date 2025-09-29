import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Grid, 
  List,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useEventStore } from '@store/event';
import { Event } from '@types/index';
import CreateEventModal from '@components/modals/CreateEventModal';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 전역 이벤트 스토어 사용
  const {
    events,
    loading,
    error,
    loadEvents,
    createEvent,
    clearError
  } = useEventStore();

  // 컴포넌트 마운트 시 이벤트 로드 - 데이터가 없을 때만 로드
  useEffect(() => {
    console.log('📅 CalendarPage 마운트됨, 현재 이벤트 수:', events.length);
    if (events.length === 0) {
      console.log('📅 이벤트가 없어서 로드 시도');
      loadEvents();
    }
  }, [loadEvents, events.length]);
  
  // 이벤트 변경 감지
  useEffect(() => {
    console.log('📅 Calendar 이벤트 상태 변경:', events.length, '개');
  }, [events]);
  
  // 날짜별 이벤트 가져오기 함수
  const getEventsByDate = (date: Date) => {
    const targetDate = date.toDateString();
    return events.filter(event => {
      const eventStart = new Date(event.start_time);
      return eventStart.toDateString() === targetDate;
    });
  };
  
  // 다시 로드 함수
  const refetch = () => {
    loadEvents();
  };

  // 필터링된 이벤트
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
      const matchesSearch = !searchQuery || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [events, categoryFilter, searchQuery]);

  console.log('📅 Calendar 렌더링 - 이벤트 수:', events.length);
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDay.getDay();
    
    const days = [];
    
    // 이전 달의 빈 날짜들
    for (let i = 0; i < firstDayWeekday; i++) {
      const prevDate = new Date(year, month, -firstDayWeekday + i + 1);
      days.push(prevDate);
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    // 다음 달의 빈 날짜들 (42개까지 채우기)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day));
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getEventColor = (category: string) => {
    const colors = {
      work: 'bg-blue-500',
      personal: 'bg-green-500',
      social: 'bg-purple-500',
      other: 'bg-gray-500'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCreateEvent = () => {
    setShowCreateModal(true);
  };

  const handleEventCreated = async (eventData: any) => {
    try {
      await createEvent(eventData);
      setShowCreateModal(false);
      alert('이벤트가 성공적으로 생성되었습니다!');
    } catch (error: any) {
      console.error('이벤트 생성 오류:', error);
      alert('이벤트 생성에 실패했습니다.');
    }
  };

  const renderEventItem = (event: Event, isSmall: boolean = false) => {
    const startTime = format(new Date(event.start_time), 'HH:mm');
    
    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`
          ${getEventColor(event.category || 'other')} 
          text-white rounded px-2 py-1 mb-1 text-xs cursor-pointer
          hover:opacity-80 transition-opacity
          ${isSmall ? 'truncate' : ''}
        `}
        title={`${event.title} (${startTime})`}
      >
        <div className="flex items-center gap-1">
          {!event.is_all_day && (
            <Clock className="w-3 h-3 flex-shrink-0" />
          )}
          <span className={isSmall ? 'truncate' : ''}>{event.title}</span>
        </div>
      </motion.div>
    );
  };

  const categories: Array<{ value: string; label: string; color: string }> = [
    { value: 'all', label: '전체', color: 'gray' },
    { value: 'work', label: '업무', color: 'blue' },
    { value: 'personal', label: '개인', color: 'green' },
    { value: 'social', label: '사교', color: 'purple' },
    { value: 'other', label: '기타', color: 'gray' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              캘린더
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              월별 일정을 한눈에 확인하고 관리하세요
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={refetch}
              disabled={loading}
              className="btn btn-secondary p-2"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button 
              onClick={handleCreateEvent}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 이벤트
            </button>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* 카테고리 필터 */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input input-sm border-gray-300 dark:border-gray-600"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* 검색 */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="이벤트 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-sm pl-10 border-gray-300 dark:border-gray-600 w-64"
            />
          </div>

          {/* 이벤트 카운트 */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            총 {filteredEvents.length}개 이벤트
          </div>
        </div>
      </motion.div>

      {/* 오류 표시 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
            <button 
              onClick={refetch}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      <div className="card p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {format(currentDate, 'yyyy년 MM월', { locale: ko })}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="btn btn-sm btn-secondary"
            >
              오늘
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">이벤트를 불러오는 중...</span>
          </div>
        )}

        {/* Month View */}
        {!loading && (
          <div className="grid grid-cols-7 gap-1">
            {/* Week Days Header */}
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <div
                key={day}
                className={`p-3 text-center text-sm font-medium ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {getDaysInMonth().map((date, index) => {
              const dayEvents = getEventsByDate(date).filter(event => {
                const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
                const matchesSearch = !searchQuery || 
                  event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
                
                return matchesCategory && matchesSearch;
              });
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`
                    min-h-[120px] p-2 border border-gray-100 dark:border-gray-700 cursor-pointer
                    hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                    ${isToday(date) ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700' : ''}
                    ${!isCurrentMonth(date) ? 'opacity-50' : ''}
                  `}
                >
                  <div className="flex flex-col h-full">
                    {/* 날짜 */}
                    <div className="flex items-start justify-between mb-2">
                      <div className={`text-sm font-medium ${
                        isToday(date) 
                          ? 'text-blue-700 dark:text-blue-300' 
                          : isCurrentMonth(date) 
                          ? 'text-gray-900 dark:text-gray-100' 
                          : 'text-gray-400'
                      }`}>
                        {date.getDate()}
                      </div>
                    </div>
                    
                    {/* Events */}
                    <div className="space-y-1 flex-1">
                      {dayEvents.slice(0, 3).map((event) => renderEventItem(event, true))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                          +{dayEvents.length - 3}개 더
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 이벤트가 없을 때 */}
        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery || categoryFilter !== 'all' 
                ? '조건에 맞는 이벤트가 없습니다' 
                : '이번 달에 등록된 이벤트가 없습니다'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              새로운 이벤트를 만들어 일정을 관리해보세요.
            </p>
            <button 
              onClick={handleCreateEvent}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              첫 번째 이벤트 만들기
            </button>
          </div>
        )}
      </div>
      
      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default CalendarPage;