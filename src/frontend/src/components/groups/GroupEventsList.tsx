import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, AlertCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useEventStore } from '@store/event';

interface GroupEventsListProps {
  groupId: string;
  groupName: string;
  onEventClick?: (event: any) => void;
  maxEvents?: number;
}

const GroupEventsList: React.FC<GroupEventsListProps> = ({
  groupId,
  groupName,
  onEventClick,
  maxEvents = 5
}) => {
  const { events } = useEventStore();

  // 해당 그룹의 이벤트만 필터링
  const groupEvents = useMemo(() => {
    return events
      .filter(event => event.group_id === groupId)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, maxEvents);
  }, [events, groupId, maxEvents]);

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    ongoing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'M월 d일 (E) HH:mm', { locale: ko });
    } catch {
      return dateString;
    }
  };

  if (groupEvents.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
          <Calendar className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          아직 그룹 이벤트가 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          그룹 이벤트 ({groupEvents.length})
        </h3>
      </div>

      {groupEvents.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onEventClick?.(event)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                {event.title}
              </h4>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[event.status as keyof typeof statusColors]}`}>
                  {event.status === 'upcoming' && '예정'}
                  {event.status === 'ongoing' && '진행중'}
                  {event.status === 'completed' && '완료'}
                  {event.status === 'cancelled' && '취소'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[event.priority as keyof typeof priorityColors]}`}>
                  {event.priority === 'low' && '낮음'}
                  {event.priority === 'medium' && '보통'}
                  {event.priority === 'high' && '높음'}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEventClick?.(event);
              }}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {event.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatDateTime(event.start_time)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {events.filter(e => e.group_id === groupId).length > maxEvents && (
        <div className="text-center pt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {events.filter(e => e.group_id === groupId).length - maxEvents}개 이벤트 더 보기
          </p>
        </div>
      )}
    </div>
  );
};

export default GroupEventsList;
