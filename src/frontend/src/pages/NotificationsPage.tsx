import React from 'react';
import { motion } from 'framer-motion';
import { Bell, MarkAsRead } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              알림
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              모든 알림을 확인하고 관리하세요
            </p>
          </div>
          <button className="btn btn-secondary">
            <MarkAsRead className="w-4 h-4 mr-2" />
            모두 읽음
          </button>
        </div>
      </motion.div>

      <div className="card p-6">
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            새로운 알림이 없습니다
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            모든 알림을 확인했습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
