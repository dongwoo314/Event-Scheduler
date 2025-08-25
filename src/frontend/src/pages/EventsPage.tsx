import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Filter, Search } from 'lucide-react';

const EventsPage: React.FC = () => {
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
              이벤트
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              모든 이벤트를 관리하고 계획하세요
            </p>
          </div>
          <button className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            새 이벤트
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="이벤트 검색..."
                className="input pl-10 w-64"
              />
            </div>
            <button className="btn btn-secondary">
              <Filter className="w-4 h-4 mr-2" />
              필터
            </button>
          </div>
        </div>
      </div>

      {/* Events list */}
      <div className="card p-6">
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            이벤트가 없습니다
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            첫 번째 이벤트를 만들어보세요.
          </p>
          <button className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            이벤트 만들기
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
