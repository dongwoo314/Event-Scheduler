import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Bell, TrendingUp, Plus, UserPlus, BarChart3, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '@store/ui';
import { useEventStore } from '@store/event';
import { useGroupStore } from '@store/group';
import CreateEventModal from '@components/modals/CreateEventModal';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { setPageTitle, setBreadcrumbs } = useUiStore();
  
  // 전역 스토어 사용
  const {
    events,
    loading: eventsLoading,
    loadEvents,
    createEvent,
    getTodayEvents,
    getUpcomingEvents
  } = useEventStore();
  
  const {
    groups,
    loading: groupsLoading,
    loadGroups,
    getMyGroups
  } = useGroupStore();
  
  // 모달 상태
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);

  useEffect(() => {
    console.log('📊 DashboardPage 마운트됨');
    setPageTitle('대시보드 - Event Scheduler');
    setBreadcrumbs([
      { label: '대시보드' }
    ]);
    
    // 데이터 로드 - 데이터가 없을 때만
    if (events.length === 0) {
      console.log('📊 이벤트가 없어서 로드 시도');
      loadEvents();
    }
    if (groups.length === 0) {
      console.log('📊 그룹이 없어서 로드 시도');
      loadGroups();
    }
  }, [setPageTitle, setBreadcrumbs, loadEvents, loadGroups, events.length, groups.length]);
  
  // 이벤트 변경 감지
  useEffect(() => {
    console.log('📊 Dashboard 이벤트 상태 변경:', events.length, '개');
  }, [events]);

  // 통계 계산
  console.log('📊 Dashboard 렌더링 - 이벤트 수:', events.length);
  const todayEvents = getTodayEvents();
  const upcomingEvents = getUpcomingEvents().slice(0, 5); // 최대 5개
  const myGroups = getMyGroups();
  
  // 이번 달 이벤트 수 계산
  const thisMonthEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    const now = new Date();
    return eventDate.getMonth() === now.getMonth() && 
           eventDate.getFullYear() === now.getFullYear();
  });

  // 완료율 계산
  const completedEvents = events.filter(event => event.status === 'completed');
  const completionRate = events.length > 0 ? Math.round((completedEvents.length / events.length) * 100) : 0;

  // 통계 데이터
  const stats = [
    {
      title: '오늘의 일정',
      value: todayEvents.length,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      change: '+2.5%',
      changeType: 'increase' as const
    },
    {
      title: '이번 달 일정',
      value: thisMonthEvents.length,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      change: '+12%',
      changeType: 'increase' as const
    },
    {
      title: '참여 그룹',
      value: groups.length,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      change: '+5%',
      changeType: 'increase' as const
    },
    {
      title: '완료율',
      value: `${completionRate}%`,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900',
      change: '+8%',
      changeType: 'increase' as const
    }
  ];

  // 이벤트 생성 핸들러
  const handleEventCreated = async (eventData: any): Promise<void> => {
    try {
      await createEvent(eventData);
      setIsCreateEventModalOpen(false);
      alert('일정이 성공적으로 생성되었습니다!');
    } catch (error) {
      console.error('일정 생성 오류:', error);
      alert('일정 생성에 실패했습니다.');
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '내일';
    } else {
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // 시간 포맷 함수
  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 카테고리 색상
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'work': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'personal': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'social': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // 카테고리 라벨
  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'work': return '업무';
      case 'personal': return '개인';
      case 'social': return '사교';
      default: return '기타';
    }
  };

  if (eventsLoading || groupsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            대시보드
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            오늘의 일정과 활동을 한눈에 확인하세요
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/groups')}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>그룹 관리</span>
          </button>
          <button
            onClick={() => setIsCreateEventModalOpen(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>새 일정</span>
          </button>
        </div>
      </motion.div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    지난 달 대비
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 오늘의 일정 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              오늘의 일정
            </h2>
            <button
              onClick={() => navigate('/calendar')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              전체 보기
            </button>
          </div>
          
          {todayEvents.length > 0 ? (
            <div className="space-y-4">
              {todayEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {event.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(event.start_time)} - {formatTime(event.end_time)}
                      </span>
                      {event.group_name && (
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                          {event.group_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(event.category)}`}>
                      {getCategoryLabel(event.category)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">오늘 예정된 일정이 없습니다.</p>
              <button
                onClick={() => setIsCreateEventModalOpen(true)}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                새 일정 만들기
              </button>
            </div>
          )}
        </motion.div>

        {/* 다가오는 일정 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              다가오는 일정
            </h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {event.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(event.start_time)}
                    </span>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(event.category)}`}>
                      {getCategoryLabel(event.category)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                다가오는 일정이 없습니다.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* 내 그룹 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            내 그룹
          </h2>
          <button
            onClick={() => navigate('/groups')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            전체 보기
          </button>
        </div>
        
        {myGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myGroups.slice(0, 3).map((group) => (
              <div key={group.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {group.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {group.memberCount}명
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        •
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {group.eventCount}개 일정
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              아직 참여한 그룹이 없습니다.
            </p>
            <button
              onClick={() => navigate('/groups')}
              className="btn btn-primary"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              그룹 만들기
            </button>
          </div>
        )}
      </motion.div>

      {/* 일정 생성 모달 */}
      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default DashboardPage;
