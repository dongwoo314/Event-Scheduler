import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Clock, AlertCircle, Info, Users, Calendar, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@store/notification';
import { useEventStore } from '@store/event';
import { useUiStore } from '@store/ui';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { setPageTitle, setBreadcrumbs } = useUiStore();
  
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadCount,
    generateNotificationsFromEvents,
    clearError
  } = useNotificationStore();

  // 페이지 설정
  useEffect(() => {
    setPageTitle('알림 - Event Scheduler');
    setBreadcrumbs([
      { label: '알림' }
    ]);
  }, [setPageTitle, setBreadcrumbs]);

  // 컴포넌트 마운트 시 알림 생성
  useEffect(() => {
    console.log('🔔 NotificationsPage 마운트됨');
    generateNotificationsFromEvents();
  }, [generateNotificationsFromEvents]);

  // 오류 처리
  useEffect(() => {
    if (error) {
      console.error('알림 오류:', error);
      clearError();
    }
  }, [error, clearError]);

  const handleNotificationClick = (notification: any) => {
    // 읽음 처리
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // 관련 페이지로 이동
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleDeleteNotification = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    removeNotification(notificationId);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'event_reminder':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'event_invitation':
        return <Calendar className="w-5 h-5 text-green-500" />;
      case 'group_invitation':
        return <Users className="w-5 h-5 text-purple-500" />;
      case 'event_update':
        return <Bell className="w-5 h-5 text-orange-500" />;
      case 'system':
        return <Info className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const unreadCount = getUnreadCount();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            알림
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {unreadCount > 0 
              ? `${unreadCount}개의 읽지 않은 알림이 있습니다` 
              : '모든 알림을 확인했습니다'
            }
          </p>
        </div>
        <div className="flex space-x-3">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>모두 읽음</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              onClick={() => {
                if (window.confirm('모든 알림을 삭제하시겠습니까?')) {
                  clearAllNotifications();
                }
              }}
              className="btn btn-outline-red flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>전체 삭제</span>
            </button>
          )}
        </div>
      </motion.div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`card p-6 cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 ${
                getPriorityColor(notification.priority)
              } ${
                !notification.isRead 
                  ? 'bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium mb-1 ${
                        !notification.isRead 
                          ? 'text-gray-900 dark:text-gray-100' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {notification.title}
                      </h3>
                      <p className={`text-sm ${
                        !notification.isRead 
                          ? 'text-gray-700 dark:text-gray-300' 
                          : 'text-gray-500 dark:text-gray-500'
                      }`}>
                        {notification.message}
                      </p>
                      
                      {/* 액션 버튼 */}
                      {notification.actionUrl && (
                        <div className="mt-3">
                          <span className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                            {notification.type === 'event_reminder' && '이벤트 보기 →'}
                            {notification.type === 'event_invitation' && '이벤트 확인 →'}
                            {notification.type === 'group_invitation' && '그룹 보기 →'}
                            {notification.type === 'event_update' && '이벤트 확인 →'}
                            {!['event_reminder', 'event_invitation', 'group_invitation', 'event_update'].includes(notification.type) && '자세히 보기 →'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <div className="text-right">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">
                          {notification.time}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-auto"></div>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="알림 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-12"
          >
            <div className="text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                알림이 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                예정된 이벤트가 있거나 새로운 그룹 초대가 있으면 여기에 알림이 표시됩니다.
              </p>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => navigate('/events')}
                  className="btn btn-secondary"
                >
                  이벤트 보기
                </button>
                <button 
                  onClick={() => navigate('/groups')}
                  className="btn btn-secondary"
                >
                  그룹 보기
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 개발 상태 알림 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
              🔔 실시간 알림 시스템 활성화!
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              이제 알림이 실제 이벤트 데이터와 연동됩니다. 24시간 이내 예정된 이벤트에 대한 알림이 자동으로 생성되고, 읽음 상태가 지속적으로 저장됩니다.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationsPage;