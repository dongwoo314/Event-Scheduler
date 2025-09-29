import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

// Store hooks
import { useAuth } from '@hooks/index';
import { useUiStore } from '@store/ui';
import { initializeStores } from '@store/index';

// Debug utilities
import '@utils/debugStorage';
import '@utils/migrateData';

// Layout components
import DashboardLayout from '@components/layout/DashboardLayout';
import AuthLayout from '@components/layout/AuthLayout';

// Page components (lazy loaded)
const LoginPage = React.lazy(() => import('@pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('@pages/auth/RegisterPage'));
const DashboardPage = React.lazy(() => import('@pages/DashboardPage'));
const CalendarPage = React.lazy(() => import('@pages/CalendarPage'));
const EventsPage = React.lazy(() => import('@pages/EventsPage'));
const GroupsPage = React.lazy(() => import('@pages/GroupsPage'));
const ProfilePage = React.lazy(() => import('@pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('@pages/SettingsPage'));
const NotificationsPage = React.lazy(() => import('@pages/NotificationsPage'));
const ReportsPage = React.lazy(() => import('@pages/ReportsPage'));

// Loading component
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="spinner w-8 h-8"></div>
    <span className="ml-3 text-gray-600 dark:text-gray-400">로딩 중...</span>
  </div>
);

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { theme } = useUiStore();
  const { loadCurrentUser, isLoading: authLoading } = useAuth();

  // 애플리케이션 시작 시 인증 상태 확인 및 스토어 초기화
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('애플리케이션 시작 - 인증 상태 확인 중...');
        
        // localStorage에 토큰이 있는지 확인
        const token = localStorage.getItem('access_token');
        if (token) {
          console.log('저장된 토큰 발견, 사용자 정보 로드 시도...');
          await loadCurrentUser();
        } else {
          console.log('저장된 토큰 없음');
        }
        
        // 스토어 초기화 (인증 여부와 관계없이 실행) - 한 번만 실행
        console.log('전역 스토어 초기화 중...');
        await initializeStores();
        console.log('전역 스토어 초기화 완료 - 이제 페이지에서 데이터 유지됨');
      } catch (error) {
        console.error('애플리케이션 초기화 오류:', error);
      }
    };
    
    initializeAuth();
  }, [loadCurrentUser]);

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  return (
    <>
      <Helmet>
        <title>Event Scheduler - 스마트한 일정 관리</title>
        <meta name="description" content="효율적인 일정 관리와 그룹 협업을 위한 스마트 스케줄러" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <AuthLayout>
                  <LoginPage />
                </AuthLayout>
              </PublicRoute>
            } />
            
            <Route path="/register" element={
              <PublicRoute>
                <AuthLayout>
                  <RegisterPage />
                </AuthLayout>
              </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/calendar" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CalendarPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/events" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EventsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/groups" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <GroupsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <NotificationsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ReportsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 fallback */}
            <Route path="*" element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    404
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    페이지를 찾을 수 없습니다.
                  </p>
                  <button
                    onClick={() => window.history.back()}
                    className="btn btn-primary"
                  >
                    돌아가기
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
              border: '1px solid var(--toast-border)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </div>
    </>
  );
};

export default App;
