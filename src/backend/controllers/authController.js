const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 메모리 기반 사용자 저장소 (DB 없이 사용)
const memoryUsers = new Map();
const memoryPreferences = new Map();

// 기본 테스트 계정 추가
const initDefaultUsers = () => {
  const defaultPassword = bcrypt.hashSync('password123', 10);
  
  const defaultUsers = [
    {
      id: 1,
      email: 'demo@snu.ac.kr',
      password: defaultPassword,
      first_name: '데모',
      last_name: '사용자',
      username: 'demo',
      phone_number: '010-1234-5678',
      timezone: 'Asia/Seoul',
      language: 'ko',
      is_active: true,
      created_at: new Date(),
      last_login_at: null
    },
    {
      id: 2,
      email: 'test@example.com',
      password: defaultPassword,
      first_name: '테스트',
      last_name: '유저',
      username: 'testuser',
      phone_number: '010-9876-5432',
      timezone: 'Asia/Seoul',
      language: 'ko',
      is_active: true,
      created_at: new Date(),
      last_login_at: null
    }
  ];

  defaultUsers.forEach(user => {
    memoryUsers.set(user.email, user);
    
    // 기본 설정 추가
    memoryPreferences.set(user.id, {
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
  });

  console.log('✅ Default test users initialized:');
  console.log('   - demo@snu.ac.kr / password123');
  console.log('   - test@example.com / password123');
};

// 서버 시작 시 기본 사용자 초기화
initDefaultUsers();

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );
};

/**
 * Get public user profile (without sensitive data)
 */
const getPublicProfile = (user) => {
  const { password, ...publicData } = user;
  return publicData;
};

/**
 * Register new user
 */
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      username,
      phone_number,
      timezone,
      language
    } = req.body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: '필수 정보를 모두 입력해주세요.'
      });
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    if (memoryUsers.has(normalizedEmail)) {
      return res.status(409).json({
        success: false,
        message: '이미 등록된 이메일입니다.'
      });
    }

    // Check username uniqueness if provided
    if (username) {
      const existingUsername = Array.from(memoryUsers.values()).find(
        u => u.username === username
      );
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: '이미 사용중인 사용자명입니다.'
        });
      }
    }

    // Generate new user ID
    const userId = memoryUsers.size + 1;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: userId,
      email: normalizedEmail,
      password: hashedPassword,
      first_name,
      last_name,
      username: username || null,
      phone_number: phone_number || null,
      timezone: timezone || 'Asia/Seoul',
      language: language || 'ko',
      is_active: true,
      created_at: new Date(),
      last_login_at: null
    };

    memoryUsers.set(normalizedEmail, newUser);

    // Create default user preferences
    const preferences = {
      user_id: userId,
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
        language: language || 'ko',
        timezone: timezone || 'Asia/Seoul'
      }
    };

    memoryPreferences.set(userId, preferences);

    // Generate tokens
    const accessToken = generateToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // Get user profile without sensitive data
    const userProfile = getPublicProfile(newUser);

    console.log(`✅ New user registered: ${normalizedEmail}`);

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        user: userProfile,
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: process.env.JWT_EXPIRES_IN || '7d'
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: '회원가입 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 입력해주세요.'
      });
    }

    const normalizedEmail = email.toLowerCase();

    // Find user
    const user = memoryUsers.get(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: '비활성화된 계정입니다. 관리자에게 문의하세요.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // Update last login time
    user.last_login_at = new Date();
    memoryUsers.set(normalizedEmail, user);

    // Get user preferences
    const preferences = memoryPreferences.get(user.id);

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Get user profile without sensitive data
    const userProfile = getPublicProfile(user);

    console.log(`✅ User logged in: ${normalizedEmail}`);

    res.json({
      success: true,
      message: '로그인 되었습니다.',
      data: {
        user: {
          ...userProfile,
          preferences
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: process.env.JWT_EXPIRES_IN || '7d'
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '로그인 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key'
    );

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Find user by ID
    const user = Array.from(memoryUsers.values()).find(u => u.id === decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const accessToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      data: {
        tokens: {
          access_token: accessToken,
          refresh_token: newRefreshToken,
          expires_in: process.env.JWT_EXPIRES_IN || '7d'
        }
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    // Find user by ID from authenticated request
    const user = Array.from(memoryUsers.values()).find(u => u.id === req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // Get user preferences
    const preferences = memoryPreferences.get(user.id);

    const userProfile = getPublicProfile(user);

    res.json({
      success: true,
      data: {
        user: {
          ...userProfile,
          preferences
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: '프로필 조회 중 오류가 발생했습니다.'
    });
  }
};

/**
 * Get all users (for debugging - should be removed in production)
 */
const getAllUsers = (req, res) => {
  const users = Array.from(memoryUsers.values()).map(user => getPublicProfile(user));
  res.json({
    success: true,
    data: {
      users,
      count: users.length
    }
  });
};

module.exports = {
  register,
  login,
  refreshToken,
  getProfile,
  getAllUsers
};
