const { User, UserPreference } = require('./models');
const bcrypt = require('bcryptjs');

async function createDemoUser() {
  try {
    console.log('🔄 Creating demo user...');
    
    // 기존 데모 사용자 확인
    const existingUser = await User.findOne({
      where: { email: 'demo@snu.ac.kr' }
    });

    if (existingUser) {
      console.log('ℹ️ Demo user already exists');
      return;
    }

    // 데모 사용자 생성
    const demoUser = await User.create({
      email: 'demo@snu.ac.kr',
      password: 'password123', // 모델에서 자동으로 해시됨
      first_name: '데모',
      last_name: '사용자',
      username: 'demo_user',
      timezone: 'Asia/Seoul',
      language: 'ko',
      is_active: true,
      is_email_verified: true
    });

    // 데모 사용자 설정 생성
    await UserPreference.create({
      user_id: demoUser.id,
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

    console.log('✅ Demo user created successfully!');
    console.log('📧 Email: demo@snu.ac.kr');
    console.log('🔑 Password: password123');
    
  } catch (error) {
    console.error('❌ Failed to create demo user:', error);
  }
}

createDemoUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
