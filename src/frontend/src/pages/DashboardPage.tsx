import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Plus,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Star,
  BarChart3,
  Activity
} from 'lucide-react';

import { useAuth, useToast } from '@hooks/index';
import { formatSmartDate, formatTime } from '@utils/date';
import { cn } from '@utils/index';

// 임시 데이터
const mockDashboardData = {
  stats: {
    total_events: 24,
    total_groups: 3,
    events_this_week: 8,
    events_today: 2,
  },
  today_events: [
    {
      id: '1',
      title: '팀 미팅',
      start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      category: 'work',
      priority: 'high',
      location: '회의실 A',
    },
    {
      id: '2',
      title: '점심 약속',
      start_time: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      category: 'personal',
      priority: 'medium',
      location: '강남역',
    },
  ],
  upcoming_events: [
    {
      id: '3',
      title: '프로젝트 발표',
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      category: 'work',
      priority: 'urgent',
    },
    {
      id: '4',
      title: '의사 진료',
      start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'health',
      priority: 'high',
    },
  ],
  groups: [
    { id: '1', name: '개발팀', member_count: 8, group_type: 'work' },
    { id: '2', name: '가족', member_count: 4, group_type: 'family' },
  ],
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const [dashboardData, setDashboardData] = useState(mockDashboardData);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후에요';
    return '좋은 저녁이에요';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-error-500" />;
      case 'high':
        return <Star className="w-4 h-4 text-warning-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-success-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      work: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      personal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      health: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      family: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {greeting()}, {user?.first_name}님! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          오늘 일정을 확인하고 효율적으로 하루를 계획해보세요.
        </p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <div className="card p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">오늘 일정</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {dashboardData.stats.events_today}
              </p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-xl">
              <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">이번 주</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {dashboardData.stats.events_this_week}
              </p>
            </div>
            <div className="p-3 bg-success-100 dark:bg-success-900 rounded-xl">
              <Calendar className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
          </div>
        </div>

        <div className="card p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">전체 이벤트</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {dashboardData.stats.total_events}
              </p>
            </div>
            <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-xl">
              <TrendingUp className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
          </div>
        </div>

        <div className="card p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">참여 그룹</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {dashboardData.stats.total_groups}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                오늘의 일정
              </h3>
              <button className="btn btn-sm btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                새 이벤트
              </button>
            </div>

            <div className="space-y-4">
              {dashboardData.today_events.length > 0 ? (
                dashboardData.today_events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <div className="flex-shrink-0 mr-4">
                      {getPriorityIcon(event.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {event.title}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTime(event.start_time)} - {formatTime(event.end_time)}
                        </span>
                        {event.location && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            📍 {event.location}
                          </span>
                        )}
                        <span className={cn('badge', getCategoryColor(event.category))}>
                          {event.category}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    오늘 일정이 없습니다
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    새로운 이벤트를 만들어 하루를 계획해보세요.
                  </p>
                  <button className="btn btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    첫 번째 이벤트 만들기
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar content */}
        <div className="space-y-6">
          {/* Upcoming events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                다가오는 일정
              </h3>
              <div className="space-y-3">
                {dashboardData.upcoming_events.map((event, index) => (
                  <motion.div 
                    key={event.id} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center space-x-3"
                  >
                    <div className="flex-shrink-0">
                      {getPriorityIcon(event.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {event.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatSmartDate(event.start_time)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">
                전체 보기 →
              </button>
            </div>
          </motion.div>

          {/* Groups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                내 그룹
              </h3>
              <div className="space-y-3">
                {dashboardData.groups.map((group, index) => (
                  <motion.div 
                    key={group.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {group.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {group.member_count}명
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </motion.div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">
                그룹 관리 →
              </button>
            </div>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                빠른 작업
              </h3>
              <div className="space-y-3">
                <button className="w-full btn btn-secondary text-left justify-start">
                  <Plus className="w-4 h-4 mr-3" />
                  새 이벤트 만들기
                </button>
                <button className="w-full btn btn-secondary text-left justify-start">
                  <Users className="w-4 h-4 mr-3" />
                  새 그룹 만들기
                </button>
                <button className="w-full btn btn-secondary text-left justify-start">
                  <Calendar className="w-4 h-4 mr-3" />
                  캘린더 보기
                </button>
                <button className="w-full btn btn-secondary text-left justify-start">
                  <BarChart3 className="w-4 h-4 mr-3" />
                  통계 보기
                </button>
              </div>
            </div>
          </motion.div>

          {/* Recent activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                최근 활동
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      '팀 미팅' 이벤트가 생성되었습니다
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2시간 전</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      '개발팀' 그룹에 참가했습니다
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">1일 전</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      알림 설정을 변경했습니다
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">3일 전</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
