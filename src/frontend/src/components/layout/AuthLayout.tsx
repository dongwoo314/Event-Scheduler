import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="w-full max-w-md">
        {/* 로고 섹션 */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-4">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-1 0H9m-4 8h14l-5-5m0 0l-5 5" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Event Scheduler
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            스마트한 일정 관리 솔루션
          </p>
        </div>

        {/* 메인 콘텐츠 */}
        <main>
          {children}
        </main>

        {/* 푸터 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 Event Scheduler. 졸업작품 프로젝트
          </p>
          <div className="mt-2 flex justify-center space-x-4 text-xs">
            <a 
              href="#" 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              개인정보처리방침
            </a>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <a 
              href="#" 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              이용약관
            </a>
          </div>
        </div>
      </div>

      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-green-400 to-blue-600 opacity-10 blur-3xl"></div>
      </div>
    </div>
  );
};

export default AuthLayout;
