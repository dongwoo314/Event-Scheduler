const { User, UserPreference } = require('./models');

async function createTestUser() {
  try {
    console.log('🔄 Creating test user...');
    
    // 기존 테스트 계정 삭제
    await User.destroy({ where: { email: 'test@test.com' } });
    
    // 테스트 계정 생성
    const user = await User.create({
      email: 'test@test.com',
      password: 'password123',
      first_name: '테스트',
      last_name: '사용자',
      timezone: 'Asia/Seoul',
      language: 'ko'
    });
    
    console.log('✅ Test user created:', user.id);
    
    // 기본 설정 생성
    await UserPreference.create({
      user_id: user.id,
      notification_settings: {
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        advance_notification_times: [15, 60],
        quiet_hours: {
          enabled: false,
          start_time: '22:00',
          end_time: '07:00'
        },
        weekend_notifications: true
      },
      privacy_settings: {
        profile_visibility: 'private',
        allow_group_invites: true,
        show_online_status: false
      },
      theme_settings: {
        theme: 'dark',
        language: 'ko',
        timezone: 'Asia/Seoul'
      }
    });
    
    console.log('✅ User preferences created');
    console.log('');
    console.log('📧 Email: test@test.com');
    console.log('🔑 Password: password123');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create test user:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

createTestUser();
