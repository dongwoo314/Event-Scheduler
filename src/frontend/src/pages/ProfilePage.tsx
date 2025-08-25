import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Edit, Camera } from 'lucide-react';
import { useAuth } from '@hooks/index';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          프로필
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          개인 정보를 확인하고 수정하세요
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                {user?.first_name?.[0]}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {user?.email}
            </p>
            
            <button className="btn btn-primary w-full">
              <Edit className="w-4 h-4 mr-2" />
              프로필 편집
            </button>
          </div>
        </div>

        {/* Profile details */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              개인 정보
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">성</label>
                  <div className="input bg-gray-50 dark:bg-gray-700">
                    {user?.last_name}
                  </div>
                </div>
                <div>
                  <label className="form-label">이름</label>
                  <div className="input bg-gray-50 dark:bg-gray-700">
                    {user?.first_name}
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">이메일</label>
                <div className="input bg-gray-50 dark:bg-gray-700">
                  {user?.email}
                </div>
              </div>

              <div>
                <label className="form-label">사용자명</label>
                <div className="input bg-gray-50 dark:bg-gray-700">
                  {user?.username || '설정되지 않음'}
                </div>
              </div>

              <div>
                <label className="form-label">휴대폰 번호</label>
                <div className="input bg-gray-50 dark:bg-gray-700">
                  {user?.phone_number || '설정되지 않음'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">언어</label>
                  <div className="input bg-gray-50 dark:bg-gray-700">
                    한국어
                  </div>
                </div>
                <div>
                  <label className="form-label">시간대</label>
                  <div className="input bg-gray-50 dark:bg-gray-700">
                    Asia/Seoul (KST)
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <button className="btn btn-primary mr-4">
                  정보 수정
                </button>
                <button className="btn btn-secondary">
                  비밀번호 변경
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
