import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2, Lock } from 'lucide-react';
import { useAuth, useToast } from '@hooks/index';
import { useNavigate } from 'react-router-dom';
import apiService from '@services/api';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmation !== 'DELETE') {
      showError('확인 필요', '삭제를 확인하려면 "DELETE"를 입력해주세요.');
      return;
    }

    if (!password) {
      showError('비밀번호 필요', '비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.delete('/users/account', {
        data: { password }
      });

      if (response.success) {
        showSuccess('계정 삭제', '계정이 성공적으로 삭제되었습니다.');
        await logout();
        navigate('/login');
      }
    } catch (error: any) {
      showError('계정 삭제 실패', error.response?.data?.message || '계정 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmation('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="card w-full max-w-lg p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                계정 삭제
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Warning */}
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800 dark:text-red-300">
                <p className="font-semibold mb-2">경고: 이 작업은 되돌릴 수 없습니다!</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>모든 개인 이벤트가 영구적으로 삭제됩니다.</li>
                  <li>그룹 멤버십이 모두 제거됩니다.</li>
                  <li>프로필 정보가 영구적으로 삭제됩니다.</li>
                  <li>이 작업은 취소할 수 없습니다.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                비밀번호 확인 *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>
            </div>

            {/* Confirmation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                삭제 확인 *
              </label>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className="input"
                placeholder='삭제를 확인하려면 "DELETE"를 입력하세요'
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                계속하려면 위에 DELETE를 정확히 입력하세요.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-6">
            <button
              onClick={handleClose}
              className="btn btn-secondary flex-1"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              onClick={handleDeleteAccount}
              className="btn btn-error flex-1"
              disabled={isLoading || confirmation !== 'DELETE'}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  삭제 중...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Trash2 className="w-4 h-4 mr-2" />
                  계정 삭제
                </span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeleteAccountModal;
