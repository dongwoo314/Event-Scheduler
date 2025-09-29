import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Calendar, Settings, UserPlus, Edit, Trash2 } from 'lucide-react';
import GroupEventsList from '@components/groups/GroupEventsList';
import GroupEventDetailModal from '@components/modals/GroupEventDetailModal';
import { useEventStore } from '@store/event';
import ManageGroupMembersModal from '@components/modals/ManageGroupMembersModal';

interface Group {
  id: string;
  name: string;
  description: string;
  type: string;
  memberCount: number;
  eventCount: number;
  isOwner: boolean;
  lastActivity: string;
}

interface GroupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  onGroupUpdated: (group: Group) => void;
  onGroupDeleted: (groupId: string) => void;
  onEditGroup: (group: Group) => void;
  onCreateEvent?: (group: Group) => void;
}

const GroupDetailModal: React.FC<GroupDetailModalProps> = ({
  isOpen,
  onClose,
  group,
  onGroupUpdated,
  onGroupDeleted,
  onEditGroup,
  onCreateEvent
}) => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);
  const { events } = useEventStore();
  
  // 그룹의 실제 이벤트 개수 계산
  const actualEventCount = events.filter(event => event.group_id === group?.id).length;

  if (!isOpen || !group) return null;

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowEventDetailModal(true);
  };

  const handleCloseEventDetail = () => {
    setShowEventDetailModal(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('정말로 이 그룹 이벤트를 삭제하시겠습니까?')) {
      try {
        // Event Store에서 이벤트 삭제
        if (typeof window !== 'undefined' && window.__EVENT_STORE__) {
          const eventStore = window.__EVENT_STORE__.getState();
          await eventStore.removeEvent(eventId);
          
          // 이벤트 카운트는 actualEventCount로 실시간 계산되므로 별도 업데이트 불필요
          
          setShowEventDetailModal(false);
          setSelectedEvent(null);
          alert('그룹 이벤트가 삭제되었습니다.');
        }
      } catch (error) {
        console.error('이벤트 삭제 실패:', error);
        alert('이벤트 삭제에 실패했습니다.');
      }
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'work':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'project':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'social':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'work': return '업무';
      case 'project': return '프로젝트';
      case 'social': return '사교';
      default: return '기타';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {group.name}
              </h2>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTypeColor(group.type)}`}>
                {getTypeLabel(group.type)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-6">
          {/* 설명 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">설명</h3>
            <p className="text-gray-600 dark:text-gray-400">{group.description}</p>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{group.memberCount}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">멤버</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{actualEventCount}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">이벤트</p>
            </div>
          </div>

          {/* 마지막 활동 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">활동</h3>
            <p className="text-gray-600 dark:text-gray-400">마지막 활동: {group.lastActivity}</p>
          </div>

          {/* 그룹 이벤트 목록 */}
          <div>
            <GroupEventsList 
              groupId={group.id}
              groupName={group.name}
              onEventClick={handleEventClick}
              maxEvents={3}
            />
          </div>

          {/* 액션 버튼들 */}
          <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-3">
              {onCreateEvent && (
                <button
                  onClick={() => onCreateEvent(group)}
                  className="btn btn-success flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>그룹 이벤트 만들기</span>
                </button>
              )}
              <button
                onClick={() => setShowManageMembersModal(true)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>멤버 관리</span>
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="btn btn-secondary"
              >
                닫기
              </button>
              {group.isOwner && (
                <button
                  onClick={() => onEditGroup(group)}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>그룹 편집</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 그룹 이벤트 상세 모달 */}
      {selectedEvent && (
        <GroupEventDetailModal 
          isOpen={showEventDetailModal}
          onClose={handleCloseEventDetail}
          event={selectedEvent}
          isOwner={group.isOwner}
          onDelete={() => handleDeleteEvent(selectedEvent.id)}
          currentUserId="current-user"
        />
      )}

      {/* 멤버 관리 모달 */}
      <ManageGroupMembersModal 
        isOpen={showManageMembersModal}
        onClose={() => setShowManageMembersModal(false)}
        groupId={group.id}
        groupName={group.name}
        isOwner={group.isOwner}
        currentUserId="current-user"
      />
    </div>
  );
};

export default GroupDetailModal;
