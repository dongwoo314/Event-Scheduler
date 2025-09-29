import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bell, Clock, Mail, Smartphone, MessageSquare, Save, Plus, Trash2 } from 'lucide-react';
import { Event } from '@types/index';
import eventService from '@services/event';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onSettingsUpdated: (event: Event) => void;
}

interface NotificationTime {
  id: string;
  minutes: number;
  label: string;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  event,
  onSettingsUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    notification_times: [15] // 기본값: 15분 전
  });
  
  const [customNotifications, setCustomNotifications] = useState<NotificationTime[]>([]);

  // 미리 정의된 알림 시간 옵션들
  const predefinedTimes = [
    { id: 'none', minutes: 0, label: '시작 시간' },
    { id: '5min', minutes: 5, label: '5분 전' },
    { id: '15min', minutes: 15, label: '15분 전' },
    { id: '30min', minutes: 30, label: '30분 전' },
    { id: '1hour', minutes: 60, label: '1시간 전' },
    { id: '2hour', minutes: 120, label: '2시간 전' },
    { id: '1day', minutes: 1440, label: '1일 전' },
    { id: '1week', minutes: 10080, label: '1주일 전' }
  ];

  useEffect(() => {
    if (event && isOpen) {
      // 이벤트의 기존 알림 설정 로드
      const eventSettings = event.notification_settings || {};
      setSettings({
        email_notifications: eventSettings.email_notifications ?? true,
        push_notifications: eventSettings.push_notifications ?? true,
        sms_notifications: eventSettings.sms_notifications ?? false,
        notification_times: eventSettings.notification_times || [15]
      });

      // 커스텀 알림 시간들 초기화
      const customTimes = (eventSettings.notification_times || [15])
        .filter(minutes => !predefinedTimes.some(p => p.minutes === minutes))
        .map((minutes, index) => ({
          id: `custom-${index}`,
          minutes,
          label: formatCustomTime(minutes)
        }));
      
      setCustomNotifications(customTimes);
    }
  }, [event, isOpen]);

  const formatCustomTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}분 전`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}시간 전`;
      } else {
        return `${hours}시간 ${remainingMinutes}분 전`;
      }
    } else {
      const days = Math.floor(minutes / 1440);
      const remainingHours = Math.floor((minutes % 1440) / 60);
      if (remainingHours === 0) {
        return `${days}일 전`;
      } else {
        return `${days}일 ${remainingHours}시간 전`;
      }
    }
  };

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTimeToggle = (minutes: number) => {
    setSettings(prev => {
      const newTimes = prev.notification_times.includes(minutes)
        ? prev.notification_times.filter(time => time !== minutes)
        : [...prev.notification_times, minutes];
      
      return {
        ...prev,
        notification_times: newTimes.sort((a, b) => a - b)
      };
    });
  };

  const addCustomNotification = () => {
    const customMinutes = prompt('알림 시간을 분 단위로 입력하세요 (예: 45분 전이면 45 입력):');
    if (customMinutes && !isNaN(Number(customMinutes))) {
      const minutes = parseInt(customMinutes);
      if (minutes > 0 && !settings.notification_times.includes(minutes)) {
        const newCustomNotification = {
          id: `custom-${Date.now()}`,
          minutes,
          label: formatCustomTime(minutes)
        };
        
        setCustomNotifications(prev => [...prev, newCustomNotification]);
        handleTimeToggle(minutes);
      }
    }
  };

  const removeCustomNotification = (notification: NotificationTime) => {
    setCustomNotifications(prev => prev.filter(n => n.id !== notification.id));
    handleTimeToggle(notification.minutes); // 선택 해제
  };

  const handleSave = async () => {
    if (!event) return;

    setLoading(true);
    try {
      await eventService.updateEventNotifications(event.id, settings);
      
      // 로컬 이벤트 객체 업데이트
      const updatedEvent = {
        ...event,
        notification_settings: settings,
        updated_at: new Date().toISOString()
      };
      
      onSettingsUpdated(updatedEvent);
      onClose();
      alert('알림 설정이 저장되었습니다!');
    } catch (error) {
      console.error('알림 설정 저장 실패:', error);
      
      // 로컬 업데이트 (임시)
      const updatedEvent = {
        ...event,
        notification_settings: settings,
        updated_at: new Date().toISOString()
      };
      
      onSettingsUpdated(updatedEvent);
      onClose();
      alert('알림 설정이 저장되었습니다! (로컬 저장)');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              알림 설정
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 이벤트 정보 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(event.start_time).toLocaleString('ko-KR')}
            </p>
          </div>

          {/* 알림 채널 설정 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              알림 방법
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">이메일 알림</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">이메일로 알림을 받습니다</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email_notifications}
                    onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">푸시 알림</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">브라우저 푸시 알림을 받습니다</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.push_notifications}
                    onChange={(e) => handleSettingChange('push_notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">SMS 알림</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">문자 메시지로 알림을 받습니다</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sms_notifications}
                    onChange={(e) => handleSettingChange('sms_notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 알림 시간 설정 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                알림 시간
              </h3>
              <button
                onClick={addCustomNotification}
                className="btn btn-sm btn-secondary flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>사용자 정의</span>
              </button>
            </div>
            
            <div className="space-y-2">
              {predefinedTimes.map((timeOption) => (
                <div
                  key={timeOption.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => handleTimeToggle(timeOption.minutes)}
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-gray-100">{timeOption.label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notification_times.includes(timeOption.minutes)}
                    onChange={() => {}} // onClick에서 처리됨
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              ))}

              {/* 커스텀 알림 시간들 */}
              {customNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-900 dark:text-gray-100">{notification.label}</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">(사용자 정의)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.notification_times.includes(notification.minutes)}
                      onChange={() => handleTimeToggle(notification.minutes)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button
                      onClick={() => removeCustomNotification(notification)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {settings.notification_times.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                알림 시간을 하나 이상 선택해주세요.
              </p>
            )}
          </div>

          {/* 알림 미리보기 */}
          {settings.notification_times.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                알림 미리보기
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                다음 시간에 알림을 받게 됩니다:
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {settings.notification_times.sort((a, b) => b - a).map((minutes) => {
                    const notificationTime = new Date(new Date(event.start_time).getTime() - minutes * 60 * 1000);
                    return (
                      <li key={minutes}>
                        {formatCustomTime(minutes)} - {notificationTime.toLocaleString('ko-KR')}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {/* 버튼들 */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary flex items-center space-x-2"
              disabled={loading || settings.notification_times.length === 0}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>저장 중...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>알림 설정 저장</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationSettingsModal;