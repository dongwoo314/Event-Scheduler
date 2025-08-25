import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Filter } from 'lucide-react';

const GroupsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              그룹
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              그룹을 만들고 함께 일정을 관리하세요
            </p>
          </div>
          <button className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            새 그룹
          </button>
        </div>
      </motion.div>

      <div className="card p-6">
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            그룹이 없습니다
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            첫 번째 그룹을 만들어보세요.
          </p>
          <button className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            그룹 만들기
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
