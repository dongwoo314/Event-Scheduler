import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Eye, Shield, Palette } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          설정
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          앱 설정을 관리하고 개인화하세요
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* 알림 설정 */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              알림 설정
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">이메일 알림</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">이벤트 알림을 이메일로 받기</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">푸시 알림</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">브라우저 푸시 알림 받기</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 테마 설정 */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Palette className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              테마 설정
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border-2 border-primary-600 rounded-xl cursor-pointer">
              <div className="w-full h-16 bg-white border rounded-lg mb-3"></div>
              <p className="text-sm font-medium text-center">라이트</p>
            </div>
            <div className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer">
              <div className="w-full h-16 bg-gray-900 rounded-lg mb-3"></div>
              <p className="text-sm font-medium text-center">다크</p>
            </div>
            <div className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer">
              <div className="w-full h-16 bg-gradient-to-r from-white to-gray-900 rounded-lg mb-3"></div>
              <p className="text-sm font-medium text-center">시스템</p>
            </div>
          </div>
        </div>

        {/* 개인정보 보호 */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              개인정보 보호
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">프로필 공개</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">다른 사용자가 내 프로필을 볼 수 있도록 허용</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">그룹 초대 허용</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">다른 사용자가 나를 그룹에 초대할 수 있도록 허용</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 계정 관리 */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              계정 관리
            </h3>
          </div>
          <div className="space-y-4">
            <button className="btn btn-secondary w-full text-left justify-start">
              비밀번호 변경
            </button>
            <button className="btn btn-secondary w-full text-left justify-start">
              계정 정보 수정
            </button>
            <button className="btn btn-error w-full text-left justify-start">
              계정 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
