import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Settings, Globe, Lock, Save } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (groupData: any) => void;
}

interface FormData {
  name: string;
  description: string;
  type: 'work' | 'project' | 'social' | 'other';
  is_public: boolean;
  max_members: number;
  allow_member_invite: boolean;
  require_approval: boolean;
  allow_event_creation: 'admin' | 'member' | 'all';
  default_event_privacy: 'public' | 'private';
  new_events_notification: boolean;
  event_changes_notification: boolean;
  new_members_notification: boolean;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupCreated
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: 'work',
    is_public: false,
    max_members: 50,
    allow_member_invite: true,
    require_approval: false,
    allow_event_creation: 'member',
    default_event_privacy: 'private',
    new_events_notification: true,
    event_changes_notification: true,
    new_members_notification: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 사용자가 입력 시작하면 오류 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '그룹 이름을 입력해주세요.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '그룹 설명을 입력해주세요.';
    }

    if (formData.max_members < 2) {
      newErrors.max_members = '최소 2명 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // 전역 스토어를 통해 그룹 생성
      await onGroupCreated(formData);
      
      // 폼 초기화
      setFormData({
        name: '',
        description: '',
        type: 'work',
        is_public: false,
        max_members: 50,
        allow_member_invite: true,
        require_approval: false,
        allow_event_creation: 'member',
        default_event_privacy: 'private',
        new_events_notification: true,
        event_changes_notification: true,
        new_members_notification: true
      });
      
      onClose();
    } catch (error: any) {
      console.error('그룹 생성 오류:', error);
      alert('그룹 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              새 그룹 만들기
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">기본 정보</h3>
            
            {/* 그룹 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                그룹 이름 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input w-full ${errors.name ? 'border-red-300 dark:border-red-600' : ''}`}
                placeholder="예: 개발팀, 프로젝트 알파, 등산 모임"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* 그룹 설명 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                그룹 설명 *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`input w-full ${errors.description ? 'border-red-300 dark:border-red-600' : ''}`}
                placeholder="그룹의 목적과 활동에 대해 설명해주세요..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
            </div>

            {/* 그룹 타입과 설정 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  그룹 타입
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="work">업무</option>
                  <option value="project">프로젝트</option>
                  <option value="social">사교</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div>
                <label htmlFor="max_members" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  최대 멤버 수
                </label>
                <input
                  type="number"
                  id="max_members"
                  name="max_members"
                  value={formData.max_members}
                  onChange={handleChange}
                  min="2"
                  max="1000"
                  className={`input w-full ${errors.max_members ? 'border-red-300 dark:border-red-600' : ''}`}
                />
                {errors.max_members && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.max_members}</p>
                )}
              </div>
            </div>
          </div>

          {/* 공개 설정 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              공개 설정
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {formData.is_public ? (
                    <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {formData.is_public ? '공개 그룹' : '비공개 그룹'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.is_public ? '누구나 검색하고 가입할 수 있습니다' : '초대받은 사람만 가입할 수 있습니다'}
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 권한 설정 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">권한 설정</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">멤버 초대 허용</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">일반 멤버도 다른 사용자를 초대할 수 있습니다</div>
                </div>
                <input
                  type="checkbox"
                  name="allow_member_invite"
                  checked={formData.allow_member_invite}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">가입 승인 필요</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">관리자가 가입 요청을 승인해야 합니다</div>
                </div>
                <input
                  type="checkbox"
                  name="require_approval"
                  checked={formData.require_approval}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  일정 생성 권한
                </label>
                <select
                  name="allow_event_creation"
                  value={formData.allow_event_creation}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="admin">관리자만</option>
                  <option value="member">멤버</option>
                  <option value="all">모든 사용자</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  기본 일정 공개 설정
                </label>
                <select
                  name="default_event_privacy"
                  value={formData.default_event_privacy}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="private">비공개</option>
                  <option value="public">공개</option>
                </select>
              </div>
            </div>
          </div>

          {/* 알림 설정 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">알림 설정</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">새 일정 알림</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">그룹에 새 일정이 생성될 때 알림을 받습니다</div>
                </div>
                <input
                  type="checkbox"
                  name="new_events_notification"
                  checked={formData.new_events_notification}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">일정 변경 알림</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">일정이 수정되거나 취소될 때 알림을 받습니다</div>
                </div>
                <input
                  type="checkbox"
                  name="event_changes_notification"
                  checked={formData.event_changes_notification}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">새 멤버 알림</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">새로운 멤버가 가입할 때 알림을 받습니다</div>
                </div>
                <input
                  type="checkbox"
                  name="new_members_notification"
                  checked={formData.new_members_notification}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* 버튼들 */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>생성 중...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>그룹 생성</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateGroupModal;
