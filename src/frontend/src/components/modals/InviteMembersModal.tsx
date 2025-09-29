import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Send } from 'lucide-react';
import { useGroupMemberStore } from '@store/groupMember';

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: any | null;
  onMembersInvited: (emails: string[], message?: string) => void;
}

const InviteMembersModal: React.FC<InviteMembersModalProps> = ({
  isOpen,
  onClose,
  group,
  onMembersInvited
}) => {
  const { inviteMembersToGroup } = useGroupMemberStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [emails, setEmails] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const emailList = emails.split(',').map(email => email.trim()).filter(email => email);
      
      // 멤버 스토어를 통해 초대
      await inviteMembersToGroup(group.id, emailList, message || undefined);
      
      // 기존 콜백도 호출 (호환성)
      await onMembersInvited(emailList, message || undefined);
      
      // 폼 초기화
      setEmails('');
      setMessage('');
      onClose();
      
      alert(`${emailList.length}명에게 초대장을 보냈습니다!`);
    } catch (error) {
      console.error('초대장 발송 실패:', error);
      alert('초대장 발송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!emails.trim()) {
      newErrors.emails = '이메일 주소를 최소 하나 이상 입력해주세요.';
    } else {
      const emailList = emails.split(',').map(email => email.trim());
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      for (const email of emailList) {
        if (email && !emailRegex.test(email)) {
          newErrors.emails = `올바르지 않은 이메일 형식: ${email}`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setEmails(e.target.value);
    if (errors.emails) {
      setErrors(prev => ({ ...prev, emails: '' }));
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMessage(e.target.value);
  };

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              멤버 초대
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <strong>{group.name}</strong> 그룹에 사람들을 초대하세요
            </p>
          </div>

          {/* 이메일 주소 */}
          <div>
            <label htmlFor="emails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이메일 주소 *
            </label>
            <textarea
              id="emails"
              value={emails}
              onChange={handleEmailsChange}
              rows={3}
              className={`input w-full ${errors.emails ? 'border-red-300 dark:border-red-600' : ''}`}
              placeholder="콤마로 구분하여 이메일 주소를 입력하세요&#10;example@domain.com, another@domain.com"
            />
            {errors.emails && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.emails}</p>
            )}
          </div>

          {/* 개인 메시지 */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              개인 메시지 (선택사항)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={handleMessageChange}
              rows={3}
              className="input w-full"
              placeholder="초대장에 포함할 개인 메시지를 입력하세요..."
            />
          </div>

          {/* 버튼들 */}
          <div className="flex justify-end space-x-3 pt-4">
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
                  <span>발송 중...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>초대장 보내기</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default InviteMembersModal;
