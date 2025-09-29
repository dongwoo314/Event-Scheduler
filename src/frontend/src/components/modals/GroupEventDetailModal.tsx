import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, AlertCircle, Edit, Trash2, X, Check, XCircle, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useEventStore } from '@store/event';

interface GroupEventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
  currentUserId?: string;
}

const GroupEventDetailModal: React.FC<GroupEventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete,
  isOwner = false,
  currentUserId = 'current-user' // 실제 환경에서는 auth store에서 가져옴
}) => {
  const { respondToEvent, getParticipantStatus, getParticipantCounts } = useEventStore();
  const [participantStatus, setParticipantStatus] = useState<'accepted' | 'declined' | 'pending' | null>(null);
  const [participantCounts, setParticipantCounts] = useState({ accepted: 0, declined: 0, pending: 0 });
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (event && event.id) {
      const status = getParticipantStatus(event.id, currentUserId);
      setParticipantStatus(status);
      
      const counts = getParticipantCounts(event.id);
      setParticipantCounts(counts);
    }
  }, [event, currentUserId, getParticipantStatus, getParticipantCounts]);

  if (!isOpen || !event) return null;

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
      return format(new Date(dateString), 'PPP p', { locale: ko });
    } catch {
      return dateString;
    }
  };

  const handleRespond = async (status: 'accepted' | 'declined') => {
    setResponding(true);
    try {
      await respondToEvent(event.id, currentUserId, status);
      setParticipantStatus(status);
      
      // 카운트 업데이트
      const counts = getParticipantCounts(event.id);
      setParticipantCounts(counts);
      
      alert(status === 'accepted' ? '이벤트 참석으로 응답했습니다.' : '이벤트 불참석으로 응답했습니다.');
    } catch (error) {
      console.error('응답 실패:', error);
      alert('응답 처리에 실패했습니다.');
    } finally {
      setResponding(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 그룹 이벤트를 삭제하시겠습니까?')) {
      onDelete?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 콘텐츠 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {event.title}
                </h2>
                {event.group_name && (
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {event.group_name}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 상태 및 우선순위 */}
          <div className="flex gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[event.status as keyof typeof statusColors]}`}>
              {event.status === 'upcoming' && '예정'}
              {event.status === 'ongoing' && '진행중'}
              {event.status === 'completed' && '완료'}
              {event.status === 'cancelled' && '취소됨'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[event.priority as keyof typeof priorityColors]}`}>
              {event.priority === 'low' && '낮음'}
              {event.priority === 'medium' && '보통'}
              {event.priority === 'high' && '높음'}
            </span>
            {event.is_all_day && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                종일
              </span>
            )}
            {participantStatus && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                participantStatus === 'accepted' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : participantStatus === 'declined'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
              }`}>
                {participantStatus === 'accepted' && '참석'}
                {participantStatus === 'declined' && '불참석'}
                {participantStatus === 'pending' && '대기중'}
              </span>
            )}
          </div>

          {/* 설명 */}
          {event.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                설명
              </h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* 시간 정보 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  시작
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDateTime(event.start_time)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  종료
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDateTime(event.end_time)}
                </p>
              </div>
            </div>
          </div>

          {/* 장소 */}
          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  장소
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {event.location}
                </p>
              </div>
            </div>
          )}

          {/* 참석자 현황 */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              참석 현황
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {participantCounts.accepted}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">참석</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {participantCounts.declined}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">불참석</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {participantCounts.pending}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">대기중</div>
              </div>
            </div>
          </div>

          {/* 그룹 정보 안내 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  그룹 이벤트
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  이 이벤트는 '{event.group_name}' 그룹의 모든 멤버와 공유됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* 관리자 액션 */}
            {isOwner && (
              <div className="flex gap-3">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    수정
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </button>
                )}
              </div>
            )}

            {/* 그룹원 참석 응답 */}
            {!isOwner && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  이벤트 참석 여부를 선택해주세요
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleRespond('accepted')}
                    disabled={responding || participantStatus === 'accepted'}
                    className={`flex-1 px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      participantStatus === 'accepted'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-500'
                        : 'bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 border border-green-300 dark:border-green-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {participantStatus === 'accepted' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <UserCheck className="w-5 h-5" />
                    )}
                    <span className="font-medium">참석</span>
                  </button>
                  <button
                    onClick={() => handleRespond('declined')}
                    disabled={responding || participantStatus === 'declined'}
                    className={`flex-1 px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      participantStatus === 'declined'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-2 border-red-500'
                        : 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-300 dark:border-red-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {participantStatus === 'declined' ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <UserX className="w-5 h-5" />
                    )}
                    <span className="font-medium">불참석</span>
                  </button>
                </div>
                {participantStatus && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    응답을 변경하려면 다른 버튼을 클릭하세요
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GroupEventDetailModal;
