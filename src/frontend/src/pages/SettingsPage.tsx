import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Palette, User, Save, Moon, Sun, Monitor, Download } from 'lucide-react';
import { useAuth, useToast } from '@hooks/index';
import { useUiStore } from '@store/ui';
import EditProfileModal from '@components/modals/EditProfileModal';
import ChangePasswordModal from '@components/modals/ChangePasswordModal';
import DeleteAccountModal from '@components/modals/DeleteAccountModal';
import apiService from '@services/api';

const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useUiStore();
  const { showSuccess, showError } = useToast();
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    profilePublic: false,
    allowGroupInvites: true,
    showOnlineStatus: true,
  });

  // Load user preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoadingPreferences(true);
      const response = await apiService.get('/users/preferences');
      
      if (response.success && response.data.preferences) {
        const prefs = response.data.preferences;
        
        // Map API preferences to local state
        setSettings({
          emailNotifications: prefs.notification_settings?.email_notifications ?? true,
          pushNotifications: prefs.notification_settings?.push_notifications ?? true,
          smsNotifications: prefs.notification_settings?.sms_notifications ?? false,
          profilePublic: prefs.privacy_settings?.profile_visibility === 'public',
          allowGroupInvites: prefs.privacy_settings?.allow_group_invites ?? true,
          showOnlineStatus: prefs.privacy_settings?.show_online_status ?? true,
        });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const savePreferences = async (newSettings: typeof settings) => {
    try {
      setIsSavingPreferences(true);
      
      const response = await apiService.put('/users/preferences', {
        notification_settings: {
          email_notifications: newSettings.emailNotifications,
          push_notifications: newSettings.pushNotifications,
          sms_notifications: newSettings.smsNotifications,
        },
        privacy_settings: {
          profile_visibility: newSettings.profilePublic ? 'public' : 'private',
          allow_group_invites: newSettings.allowGroupInvites,
          show_online_status: newSettings.showOnlineStatus,
        },
      });

      if (response.success) {
        showSuccess('설정 저장', '설정이 성공적으로 저장되었습니다.');
      }
    } catch (error: any) {
      showError('설정 저장 실패', error.response?.data?.message || '설정 저장에 실패했습니다.');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleSettingChange = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    savePreferences(newSettings);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    showSuccess('테마 변경', `${getThemeLabel(newTheme)} 테마로 변경되었습니다.`);
  };

  const getThemeLabel = (theme: string) => {
    switch (theme) {
      case 'light': return '라이트';
      case 'dark': return '다크';
      case 'system': return '시스템';
      default: return '시스템';
    }
  };

  const getThemeIcon = (themeType: string) => {
    switch (themeType) {
      case 'light': return <Sun className="w-5 h-5" />;
      case 'dark': return <Moon className="w-5 h-5" />;
      case 'system': return <Monitor className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const handleExportData = async () => {
    try {
      showSuccess('데이터 내보내기', '데이터 내보내기를 준비하고 있습니다...');
      
      // Fetch all user data
      const eventsResponse = await apiService.get('/events');
      const groupsResponse = await apiService.get('/groups/my-groups');
      const profileResponse = await apiService.get('/users/profile');
      
      const exportData = {
        profile: profileResponse.data,
        events: eventsResponse.data,
        groups: groupsResponse.data,
        exportedAt: new Date().toISOString(),
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `schedule-app-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess('데이터 내보내기 완료', '데이터가 성공적으로 다운로드되었습니다.');
    } catch (error: any) {
      showError('데이터 내보내기 실패', error.response?.data?.message || '데이터 내보내기에 실패했습니다.');
    }
  };

  const handleProfileUpdateSuccess = () => {
    refreshUser();
  };

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
        {/* 프로필 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              프로필 정보
            </h3>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user?.first_name?.[0]}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {user?.first_name} {user?.last_name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                @{user?.username}
              </p>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button 
              onClick={() => setIsEditProfileOpen(true)}
              className="btn btn-secondary"
            >
              프로필 수정
            </button>
            <button 
              onClick={() => setIsChangePasswordOpen(true)}
              className="btn btn-secondary"
            >
              비밀번호 변경
            </button>
          </div>
        </motion.div>

        {/* 알림 설정 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              알림 설정
            </h3>
          </div>
          
          {isLoadingPreferences ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">이메일 알림</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">이벤트 알림을 이메일로 받기</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    disabled={isSavingPreferences}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">푸시 알림</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">브라우저 푸시 알림 받기</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    disabled={isSavingPreferences}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">SMS 알림</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">중요한 알림을 SMS로 받기</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.smsNotifications}
                    onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                    disabled={isSavingPreferences}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          )}
        </motion.div>

        {/* 테마 설정 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center mb-4">
            <Palette className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              테마 설정
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'light', label: '라이트', preview: 'bg-white border' },
              { value: 'dark', label: '다크', preview: 'bg-gray-900' },
              { value: 'system', label: '시스템', preview: 'bg-gradient-to-r from-white to-gray-900' }
            ].map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => handleThemeChange(themeOption.value as any)}
                className={`p-4 rounded-xl border-2 transition-all hover:shadow-medium ${
                  theme === themeOption.value
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className={`w-full h-16 rounded-lg mb-3 ${themeOption.preview}`}></div>
                <div className="flex items-center justify-center space-x-2">
                  {getThemeIcon(themeOption.value)}
                  <p className="text-sm font-medium">{themeOption.label}</p>
                </div>
                {theme === themeOption.value && (
                  <div className="mt-2">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mx-auto"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 개인정보 보호 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              개인정보 보호
            </h3>
          </div>
          
          {isLoadingPreferences ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">프로필 공개</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">다른 사용자가 내 프로필을 볼 수 있도록 허용</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.profilePublic}
                    onChange={(e) => handleSettingChange('profilePublic', e.target.checked)}
                    disabled={isSavingPreferences}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">그룹 초대 허용</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">다른 사용자가 나를 그룹에 초대할 수 있도록 허용</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.allowGroupInvites}
                    onChange={(e) => handleSettingChange('allowGroupInvites', e.target.checked)}
                    disabled={isSavingPreferences}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">온라인 상태 표시</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">다른 사용자에게 온라인 상태를 표시</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.showOnlineStatus}
                    onChange={(e) => handleSettingChange('showOnlineStatus', e.target.checked)}
                    disabled={isSavingPreferences}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          )}
        </motion.div>

        {/* 위험 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6 border-red-200 dark:border-red-800"
        >
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
            위험 영역
          </h3>
          <div className="space-y-3">
            <button 
              onClick={handleExportData}
              className="btn btn-secondary w-full text-left justify-start"
            >
              <Download className="w-5 h-5 mr-2" />
              모든 데이터 내보내기
            </button>
            <button 
              onClick={() => setIsDeleteAccountOpen(true)}
              className="btn btn-error w-full text-left justify-start"
            >
              계정 삭제
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
        </motion.div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSuccess={handleProfileUpdateSuccess}
      />
      
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
      
      <DeleteAccountModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;
