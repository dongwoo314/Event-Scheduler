import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Users, Tag, Star, Save } from 'lucide-react';
import eventService from '@services/event';
import { Event, UpdateEventRequest } from '@types/index';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onEventUpdated: (event: Event) => void;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ 
  isOpen, 
  onClose, 
  event,
  onEventUpdated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    isAllDay: false,
    category: 'personal',
    priority: 'medium',
    status: 'upcoming'
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 이벤트 데이터로 폼 초기화
  useEffect(() => {
    if (event && isOpen) {
      setFormData({
        title: event.title,
        description: event.description,
        startDate: new Date(event.start_time).toISOString().slice(0, 16),
        endDate: new Date(event.end_time).toISOString().slice(0, 16),
        location: event.location || '',
        isAllDay: event.is_all_day,
        category: event.category,
        priority: event.priority,
        status: event.status
      });
      setErrors({});
    }
  }, [event, isOpen]);

  // 폼 데이터 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
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
      newErrors.title = '이벤트 제목을 입력해주세요.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '이벤트 설명을 입력해주세요.';
    }

    if (!formData.startDate) {
      newErrors.startDate = '시작 날짜를 선택해주세요.';
    }

    if (!formData.endDate) {
      newErrors.endDate = '종료 날짜를 선택해주세요.';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end < start) {
        newErrors.endDate = '종료 시간은 시작 시간보다 늦어야 합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event || !validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // API 형식에 맞게 데이터 변환
      const updateData: UpdateEventRequest = {
        title: formData.title,
        description: formData.description,
        start_time: new Date(formData.startDate).toISOString(),
        end_time: new Date(formData.endDate).toISOString(),
        location: formData.location || null,
        category: formData.category,
        priority: formData.priority,
        is_all_day: formData.isAllDay,
        status: formData.status as Event['status']
      };
      
      const updatedEvent = await eventService.updateEvent(event.id, updateData);
      onEventUpdated(updatedEvent);
      
      onClose();
      alert('이벤트가 성공적으로 수정되었습니다!');
    } catch (error: any) {
      console.error('이벤트 수정 에러:', error);
      
      // 로컬 업데이트 (임시)
      const localUpdatedEvent: Event = {
        ...event,
        title: formData.title,
        description: formData.description,
        start_time: new Date(formData.startDate).toISOString(),
        end_time: new Date(formData.endDate).toISOString(),
        location: formData.location || null,
        category: formData.category,
        priority: formData.priority,
        is_all_day: formData.isAllDay,
        status: formData.status as Event['status'],
        updated_at: new Date().toISOString()
      };
      
      onEventUpdated(localUpdatedEvent);
      onClose();
      alert('이벤트가 수정되었습니다! (로컬 업데이트)');
    } finally {
      setLoading(false);
    }
  };

  // 1시간 후 시간을 기본 종료 시간으로 설정
  const getEndDateTime = (startDate: string) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    start.setHours(start.getHours() + 1);
    return start.toISOString().slice(0, 16);
  };

  if (!isOpen || !event) return null;

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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            이벤트 편집
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이벤트 제목 *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`input w-full ${errors.title ? 'border-red-300 dark:border-red-600' : ''}`}
              placeholder="예: 팀 미팅, 생일파티, 프로젝트 마감"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          {/* 설명 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              설명 *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`input w-full ${errors.description ? 'border-red-300 dark:border-red-600' : ''}`}
              placeholder="이벤트에 대한 상세한 설명을 입력해주세요..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>

          {/* 날짜 및 시간 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                시작 날짜/시간 *
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={(e) => {
                  handleChange(e);
                  // 시작 시간이 변경되고 종료 시간이 시작 시간보다 이전이면 자동 조정
                  if (e.target.value && formData.endDate) {
                    const start = new Date(e.target.value);
                    const end = new Date(formData.endDate);
                    if (end <= start) {
                      setFormData(prev => ({
                        ...prev,
                        endDate: getEndDateTime(e.target.value)
                      }));
                    }
                  }
                }}
                className={`input w-full ${errors.startDate ? 'border-red-300 dark:border-red-600' : ''}`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                종료 날짜/시간 *
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
                className={`input w-full ${errors.endDate ? 'border-red-300 dark:border-red-600' : ''}`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* 하루 종일 체크박스 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAllDay"
              name="isAllDay"
              checked={formData.isAllDay}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isAllDay" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              하루 종일
            </label>
          </div>

          {/* 위치 */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              위치 (선택)
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input w-full"
              placeholder="예: 회의실 A, 강남구 레스토랑, 온라인 미팅"
            />
          </div>

          {/* 카테고리, 우선순위, 상태 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="inline w-4 h-4 mr-1" />
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
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Star className="inline w-4 h-4 mr-1" />
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

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                상태
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="upcoming">예정</option>
                <option value="ongoing">진행중</option>
                <option value="completed">완료</option>
                <option value="cancelled">취소</option>
              </select>
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
                  <span>저장 중...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>변경사항 저장</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditEventModal;