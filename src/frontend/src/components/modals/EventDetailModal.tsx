import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Calendar, Clock, MapPin, Users, Tag, Star, 
  Edit, Trash2, Copy, Download, Share2, Bell, 
  User, CheckCircle, XCircle, Circle
} from 'lucide-react';
import { Event } from '@types/index';
import eventService from '@services/event';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onEventUpdated: (event: Event) => void;
  onEventDeleted: (eventId: string) => void;
  onEditEvent: (event: Event) => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  event,
  onEventUpdated,
  onEventDeleted,
  onEditEvent
}) => {
  const [loading, setLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    if (event && isOpen) {
      loadEventDetails();
    }
  }, [event, isOpen]);

  const loadEventDetails = async () => {
    if (!event) return;
    
    setLoading(true);
    try {
      // 참가자 정보 로드 (실제 API가 있을 때)
      // const participantsData = await eventService.getEventParticipants(event.id);
      // setParticipants(participantsData);
      
      // 임시 데이터
      setParticipants([
        { id: '1', name: '김동우', email: 'dongwoo@example.com', status: 'accepted', avatar: null },
        { id: '2', name: '홍길동', email: 'hong@example.com', status: 'pending', avatar: null },
      ]);
    } catch (error) {
      console.error('이벤트 상세 정보 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Event['status']) => {
    if (!event) return;
    
    try {
      const updatedEvent = await eventService.updateEventStatus(event.id, newStatus);
      onEventUpdated(updatedEvent);
    } catch (error) {
      alert('상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    
    if (window.confirm('정말로 이 이벤트를 삭제하시겠습니까?')) {
      try {
        await eventService.deleteEvent(event.id);
        onEventDeleted(event.id);
        onClose();
      } catch (error) {
        alert('이벤트 삭제에 실패했습니다.');
      }
    }
  };

  const handleDuplicateEvent = async () => {
    if (!event) return;
    
    try {
      const duplicatedEvent = await eventService.duplicateEvent(event.id);
      onEventUpdated(duplicatedEvent);
      alert('이벤트가 복제되었습니다.');
    } catch (error) {
      alert('이벤트 복제에 실패했습니다.');
    }
  };

  const handleExportEvent = async () => {
    if (!event) return;
    
    try {
      const icalData = await eventService.exportEvent(event.id);
      
      // iCal 파일 다운로드
      const blob = new Blob([icalData], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('이벤트 내보내기에 실패했습니다.');
    }
  };

  const handleShareEvent = async () => {
    if (!event) return;
    
    const shareData = {
      title: event.title,
      text: `${event.title}\n${event.description}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      // 클립보드에 복사
      const shareText = `${event.title}\n${event.description}\n\n시간: ${formatDateTime(event.start_time)} - ${formatDateTime(event.end_time)}${event.location ? `\n위치: ${event.location}` : ''}`;
      await navigator.clipboard.writeText(shareText);
      alert('이벤트 정보가 클립보드에 복사되었습니다.');
    }
  };

  const saveNotes = () => {
    // 실제로는 API 호출
    console.log('메모 저장:', notes);
    setShowNotes(false);
    alert('메모가 저장되었습니다.');
  };

  // 유틸리티 함수들
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short'
    });
  };

  const formatDuration = () => {
    if (!event) return '';
    
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const duration = end.getTime() - start.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else {
      return `${minutes}분`;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      work: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      social: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-green-500',
      medium: 'text-yellow-500',
      high: 'text-red-500'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      ongoing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status as keyof typeof colors] || colors.upcoming;
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              이벤트 상세 정보
            </h2>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
              {event.status === 'upcoming' ? '예정' :
               event.status === 'ongoing' ? '진행중' :
               event.status === 'completed' ? '완료' : '취소'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEditEvent(event)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="편집"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {event.title}
              </h1>
              <span className={`px-2 py-1 text-sm font-medium rounded-full ${getCategoryColor(event.category)}`}>
                {event.category === 'personal' ? '개인' : 
                 event.category === 'work' ? '업무' : 
                 event.category === 'social' ? '사교' : '기타'}
              </span>
              <Star className={`w-5 h-5 ${getPriorityColor(event.priority)}`} />
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {event.description}
            </p>
          </div>

          {/* 시간 정보 */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              일정 정보
            </h3>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="w-16 text-sm font-medium">시작:</span>
                <span>{formatDateTime(event.start_time)}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="w-16 text-sm font-medium">종료:</span>
                <span>{formatDateTime(event.end_time)}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="w-16 text-sm font-medium">기간:</span>
                <span>{formatDuration()}</span>
              </div>
              {event.location && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* 참가자 정보 */}
          {participants.length > 0 && (
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                참가자 ({participants.length}명)
              </h3>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {participant.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {participant.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {participant.status === 'accepted' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : participant.status === 'declined' ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {participant.status === 'accepted' ? '참석' :
                         participant.status === 'declined' ? '불참' : '대기중'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 메모 섹션 */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">메모</h3>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {showNotes ? '취소' : '메모 추가/편집'}
              </button>
            </div>
            
            {showNotes ? (
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={4}
                  placeholder="이벤트에 대한 메모를 작성하세요..."
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowNotes(false)}
                    className="btn btn-secondary text-sm"
                  >
                    취소
                  </button>
                  <button
                    onClick={saveNotes}
                    className="btn btn-primary text-sm"
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                {notes || '메모가 없습니다. 메모를 추가해보세요.'}
              </p>
            )}
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* 상태 변경 버튼들 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">상태 변경:</span>
              {event.status !== 'ongoing' && (
                <button
                  onClick={() => handleStatusChange('ongoing')}
                  className="btn btn-sm bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200"
                >
                  진행중
                </button>
              )}
              {event.status !== 'completed' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="btn btn-sm bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
                >
                  완료
                </button>
              )}
              {event.status !== 'cancelled' && (
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  className="btn btn-sm bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200"
                >
                  취소
                </button>
              )}
            </div>

            {/* 기능 버튼들 */}
            <div className="flex items-center space-x-2 ml-auto">
              <button
                onClick={handleDuplicateEvent}
                className="btn btn-sm btn-secondary flex items-center space-x-1"
                title="복제"
              >
                <Copy className="w-4 h-4" />
                <span>복제</span>
              </button>
              
              <button
                onClick={handleExportEvent}
                className="btn btn-sm btn-secondary flex items-center space-x-1"
                title="내보내기"
              >
                <Download className="w-4 h-4" />
                <span>내보내기</span>
              </button>
              
              <button
                onClick={handleShareEvent}
                className="btn btn-sm btn-secondary flex items-center space-x-1"
                title="공유"
              >
                <Share2 className="w-4 h-4" />
                <span>공유</span>
              </button>
              
              <button
                onClick={() => onEditEvent(event)}
                className="btn btn-sm btn-primary flex items-center space-x-1"
                title="편집"
              >
                <Edit className="w-4 h-4" />
                <span>편집</span>
              </button>
              
              <button
                onClick={handleDeleteEvent}
                className="btn btn-sm bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 flex items-center space-x-1"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
                <span>삭제</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventDetailModal;