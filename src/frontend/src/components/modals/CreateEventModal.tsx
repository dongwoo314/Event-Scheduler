import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Users, Tag, Star, Save } from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (eventData: any) => void;
  groups?: any[];
}

interface FormData {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  is_all_day: boolean;
  category: 'personal' | 'work' | 'social' | 'other';
  priority: 'low' | 'medium' | 'high';
  group_id?: string;
  group_name?: string;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ 
  isOpen, 
  onClose, 
  onEventCreated,
  groups = []
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    is_all_day: false,
    category: 'personal',
    priority: 'medium'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 폼 데이터 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // 그룹 선택 시 그룹 이름도 설정
      if (name === 'group_id') {
        const selectedGroup = groups.find(group => group.id === value);
        newData.group_name = selectedGroup ? selectedGroup.name : '';
      }
      
      return newData;
    });
    
    // 에러 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }

    if (!formData.start_time) {
      newErrors.start_time = '시작 시간을 선택해주세요.';
    }

    if (!formData.end_time) {
      newErrors.end_time = '종료 시간을 선택해주세요.';
    }

    if (formData.start_time && formData.end_time) {
      const startDate = new Date(formData.start_time);
      const endDate = new Date(formData.end_time);
      
      if (endDate <= startDate) {
        newErrors.end_time = '종료 시간은 시작 시간보다 늦어야 합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // 전역 스토어를 통해 이벤트 생성
      await onEventCreated(formData);
      
      // 폼 초기화
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        is_all_day: false,
        category: 'personal',
        priority: 'medium'
      });
      
      onClose();
    } catch (error: any) {
      console.error('이벤트 생성 오류:', error);
      alert('이벤트 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 현재 날짜/시간을 기본값으로 설정
  const getDefaultDateTime = (addHours: number = 0): string => {
    const now = new Date();
    now.setHours(now.getHours() + addHours);
    now.setMinutes(0, 0, 0); // 분, 초, 밀리초를 0으로 설정
    return now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm" 형식
  };

  // 모달이 열릴 때 기본값 설정
  React.useEffect(() => {
    if (isOpen && !formData.start_time) {
      setFormData(prev => ({
        ...prev,
        start_time: getDefaultDateTime(1), // 1시간 후
        end_time: getDefaultDateTime(2)    // 2시간 후
      }));
    }
  }, [isOpen]);

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
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              새 일정 만들기
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
            
            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                일정 제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`input w-full ${errors.title ? 'border-red-300 dark:border-red-600' : ''}`}
                placeholder="일정 제목을 입력하세요"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
              )}
            </div>

            {/* 설명 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                설명
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="input w-full"
                placeholder="일정에 대한 자세한 설명을 입력하세요..."
              />
            </div>
          </div>

          {/* 시간 설정 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              시간 설정
            </h3>
            
            {/* 종일 일정 토글 */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_all_day"
                name="is_all_day"
                checked={formData.is_all_day}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="is_all_day" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                종일 일정
              </label>
            </div>

            {/* 시작/종료 시간 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  시작 시간 *
                </label>
                <input
                  type={formData.is_all_day ? 'date' : 'datetime-local'}
                  id="start_time"
                  name="start_time"
                  value={formData.is_all_day ? formData.start_time.split('T')[0] : formData.start_time}
                  onChange={handleChange}
                  className={`input w-full ${errors.start_time ? 'border-red-300 dark:border-red-600' : ''}`}
                />
                {errors.start_time && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.start_time}</p>
                )}
              </div>

              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  종료 시간 *
                </label>
                <input
                  type={formData.is_all_day ? 'date' : 'datetime-local'}
                  id="end_time"
                  name="end_time"
                  value={formData.is_all_day ? formData.end_time.split('T')[0] : formData.end_time}
                  onChange={handleChange}
                  className={`input w-full ${errors.end_time ? 'border-red-300 dark:border-red-600' : ''}`}
                />
                {errors.end_time && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.end_time}</p>
                )}
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">추가 정보</h3>
            
            {/* 장소 */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                장소
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input w-full"
                placeholder="일정이 진행될 장소를 입력하세요"
              />
            </div>

            {/* 카테고리와 우선순위 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  카테고리
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="personal">개인</option>
                  <option value="work">업무</option>
                  <option value="social">사교</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  우선순위
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
              </div>
            </div>

            {/* 그룹 선택 */}
            {groups.length > 0 && (
              <div>
                <label htmlFor="group_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  그룹 (선택사항)
                </label>
                <select
                  id="group_id"
                  name="group_id"
                  value={formData.group_id || ''}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="">개인 일정</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  그룹을 선택하면 해당 그룹의 멤버들이 이 일정을 볼 수 있습니다.
                </p>
              </div>
            )}
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
                  <span>일정 생성</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateEventModal;
