import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Crown, Shield, User, Mail, Trash2, UserPlus, UserMinus, AlertCircle } from 'lucide-react';
import { useGroupMemberStore } from '@store/groupMember';

interface ManageGroupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  isOwner: boolean;
  currentUserId?: string;
}

const ManageGroupMembersModal: React.FC<ManageGroupMembersModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  isOwner,
  currentUserId = 'current-user'
}) => {
  const {
    members,
    loading,
    getMembersByGroup,
    removeMemberFromGroup,
    updateMemberRole,
    isGroupAdmin
  } = useGroupMemberStore();

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const groupMembers = getMembersByGroup(groupId);
  const isAdmin = isGroupAdmin(groupId, currentUserId);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return '소유자';
      case 'admin':
        return '관리자';
      default:
        return '멤버';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">활성</span>;
      case 'invited':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">초대됨</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">대기중</span>;
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (window.confirm(`${memberName}님을 그룹에서 제거하시겠습니까?`)) {
      try {
        await removeMemberFromGroup(groupId, memberId);
        alert('멤버가 제거되었습니다.');
      } catch (error) {
        console.error('멤버 제거 실패:', error);
        alert('멤버 제거에 실패했습니다.');
      }
    }
  };

  const handleChangeRole = async (memberId: string, currentRole: string, memberName: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    const confirm = window.confirm(
      `${memberName}님의 역할을 ${getRoleLabel(newRole)}로 변경하시겠습니까?`
    );

    if (confirm) {
      try {
        await updateMemberRole(memberId, newRole);
        alert('역할이 변경되었습니다.');
      } catch (error) {
        console.error('역할 변경 실패:', error);
        alert('역할 변경에 실패했습니다.');
      }
    }
  };

  if (!isOpen) return null;

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
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  멤버 관리
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {groupName}
                </p>
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
        <div className="p-6">
          {/* 멤버 통계 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">총 멤버</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {groupMembers.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">활성 멤버</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {groupMembers.filter(m => m.status === 'active').length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">초대 대기</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {groupMembers.filter(m => m.status === 'invited').length}
                </p>
              </div>
            </div>
          </div>

          {/* 멤버 목록 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              멤버 목록
            </h3>

            {groupMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  아직 멤버가 없습니다
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {groupMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* 아바타 */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {member.user_name.charAt(0).toUpperCase()}
                        </div>

                        {/* 정보 */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {member.user_name}
                            </p>
                            {getStatusBadge(member.status)}
                            {member.user_id === currentUserId && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                나
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {member.user_email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {getRoleIcon(member.role)}
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {getRoleLabel(member.role)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 액션 버튼 (소유자/관리자만) */}
                      {isAdmin && member.role !== 'owner' && member.user_id !== currentUserId && (
                        <div className="flex items-center gap-2">
                          {/* 관리자도 역할 변경 가능 */}
                          {member.role !== 'owner' && (
                            <button
                              onClick={() => handleChangeRole(member.id, member.role, member.user_name)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title={member.role === 'admin' ? '관리자 권한 제거' : '관리자로 승격'}
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveMember(member.id, member.user_name)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="멤버 제거"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* 안내 메시지 */}
          {!isAdmin && (
            <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    멤버 관리 권한 없음
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    멤버를 관리하려면 그룹 소유자 또는 관리자 권한이 필요합니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageGroupMembersModal;
