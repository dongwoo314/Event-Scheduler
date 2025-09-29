import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, UserPlus, Settings, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { useUiStore } from '@store/ui';
import { useGroupStore } from '@store/group';
import CreateGroupModal from '@components/modals/CreateGroupModal';
import GroupDetailModal from '@components/modals/GroupDetailModal';
import EditGroupModal from '@components/modals/EditGroupModal';
import InviteMembersModal from '@components/modals/InviteMembersModal';
import CreateGroupEventModal from '@components/modals/CreateGroupEventModal';
import { useEventStore } from '@store/event';

const GroupsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // 모달 상태 관리
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState<boolean>(false);
  
  // 전역 상태 사용
  const {
    groups,
    selectedGroup,
    loading,
    error,
    loadGroups,
    createGroup,
    editGroup,
    removeGroup,
    joinGroup,
    inviteMembers,
    setSelectedGroup,
    searchGroups,
    clearError
  } = useGroupStore();
  
  const { setPageTitle, setBreadcrumbs } = useUiStore();
  const { createGroupEvent, events } = useEventStore();

  // 그룹별 실제 이벤트 개수 계산 함수
  const getActualEventCount = (groupId: string) => {
    return events.filter(event => event.group_id === groupId).length;
  };

  // 페이지 설정
  useEffect(() => {
    setPageTitle('그룹 - Event Scheduler');
    setBreadcrumbs([
      { label: '그룹' }
    ]);
  }, [setPageTitle, setBreadcrumbs]);

  // 그룹 데이터 로드
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // 오류 처리
  useEffect(() => {
    if (error) {
      alert(error);
      clearError();
    }
  }, [error, clearError]);

  // 그룹 생성
  const handleGroupCreated = async (groupData: any): Promise<void> => {
    try {
      await createGroup(groupData);
      setShowCreateModal(false);
      alert('그룹이 성공적으로 생성되었습니다!');
    } catch (error) {
      console.error('그룹 생성 오류:', error);
    }
  };

  // 그룹 편집
  const handleGroupUpdated = async (groupData: any): Promise<void> => {
    if (!selectedGroup) return;
    
    try {
      await editGroup(selectedGroup.id, groupData);
      setShowEditModal(false);
      alert('그룹이 성공적으로 수정되었습니다!');
    } catch (error) {
      console.error('그룹 수정 오류:', error);
    }
  };

  // 그룹 삭제
  const handleGroupDeleted = async (groupToDelete?: any): Promise<void> => {
    const targetGroup = groupToDelete || selectedGroup;
    if (!targetGroup) return;
    
    if (window.confirm('정말로 이 그룹을 삭제하시겠습니까?')) {
      try {
        await removeGroup(targetGroup.id);
        setShowDetailModal(false);
        alert('그룹이 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('그룹 삭제 오류:', error);
      }
    }
  };

  // 그룹 상세보기
  const handleViewGroup = (group: any): void => {
    setSelectedGroup(group);
    setShowDetailModal(true);
  };

  // 그룹 편집 모달 열기
  const handleEditGroup = (group: any): void => {
    setSelectedGroup(group);
    setShowEditModal(true);
  };

  // 멤버 초대
  const handleInviteMembers = (group: any): void => {
    setSelectedGroup(group);
    setShowInviteModal(true);
  };

  // 그룹 가입
  const handleJoinGroup = async (group: any): Promise<void> => {
    try {
      await joinGroup(group.id);
      alert('그룹에 성공적으로 가입했습니다!');
    } catch (error) {
      console.error('그룹 가입 오류:', error);
    }
  };

  // 멤버 초대 완료
  const handleMembersInvited = async (emails: string[], message?: string): Promise<void> => {
    if (!selectedGroup) return;
    
    try {
      await inviteMembers(selectedGroup.id, emails, message);
      setShowInviteModal(false);
      alert(`${emails.length}명에게 초대장을 보냈습니다!`);
    } catch (error) {
      console.error('멤버 초대 오류:', error);
    }
  };

  // 그룹 이벤트 생성
  const handleCreateGroupEvent = (group: any): void => {
    setSelectedGroup(group);
    setShowDetailModal(false);
    setShowCreateEventModal(true);
  };

  // 그룹 이벤트 생성 완료
  const handleGroupEventCreated = async (eventData: any): Promise<void> => {
    if (!selectedGroup) return;
    
    try {
      await createGroupEvent(eventData, selectedGroup.id, selectedGroup.name);
      setShowCreateEventModal(false);
      alert('그룹 이벤트가 성공적으로 생성되었습니다!');
    } catch (error) {
      console.error('그룹 이벤트 생성 오류:', error);
    }
  };

  // 모든 모달 닫기
  const closeAllModals = (): void => {
    setShowDetailModal(false);
    setShowEditModal(false);
    setShowInviteModal(false);
    setShowCreateModal(false);
    setShowCreateEventModal(false);
    setSelectedGroup(null);
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

  // 검색 결과 필터링
  const filteredGroups = searchTerm 
    ? searchGroups(searchTerm)
    : groups;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            그룹
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            이벤트 협업을 위한 그룹을 생성하고 관리하세요
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>새 그룹</span>
        </button>
      </motion.div>

      {/* 검색 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="그룹 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </motion.div>

      {/* 그룹 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {group.name}
                    </h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTypeColor(group.type)}`}>
                      {getTypeLabel(group.type)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewGroup(group);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="자세히 보기"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {group.isOwner ? (
                    <>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditGroup(group);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="편집"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInviteMembers(group);
                        }}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        title="멤버 초대"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupDeleted(group);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditGroup(group);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="설정"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {group.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{group.memberCount}명</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{getActualEventCount(group.id)}개 이벤트</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-400">
                  마지막 활동: {group.lastActivity}
                </span>
                <div className="flex items-center space-x-2">
                  {!group.isOwner && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(group);
                      }}
                      className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-lg transition-colors"
                    >
                      가입
                    </button>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewGroup(group);
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    입장
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm ? '그룹을 찾을 수 없습니다' : '아직 그룹이 없습니다'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? '다른 검색어를 사용해 보세요.' : '첫 번째 그룹을 만들어 시작하세요.'}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                그룹 만들기
              </button>
            )}
          </div>
        )}
      </div>

      {/* 그룹 생성 모달 */}
      <CreateGroupModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={handleGroupCreated}
      />

      {/* 그룹 상세 모달 */}
      <GroupDetailModal 
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        onGroupUpdated={handleGroupUpdated}
        onGroupDeleted={handleGroupDeleted}
        onEditGroup={(group) => {
          setShowDetailModal(false);
          handleEditGroup(group);
        }}
        onCreateEvent={handleCreateGroupEvent}
      />

      {/* 그룹 편집 모달 */}
      <EditGroupModal 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        onGroupUpdated={handleGroupUpdated}
      />

      {/* 멤버 초대 모달 */}
      <InviteMembersModal 
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        onMembersInvited={handleMembersInvited}
      />

      {/* 그룹 이벤트 생성 모달 */}
      {selectedGroup && (
        <CreateGroupEventModal 
          isOpen={showCreateEventModal}
          onClose={() => {
            setShowCreateEventModal(false);
            setSelectedGroup(null);
          }}
          onSubmit={handleGroupEventCreated}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
        />
      )}
    </div>
  );
};

export default GroupsPage;
