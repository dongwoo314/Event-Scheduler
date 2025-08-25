const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, UserPreference } = require('../models');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
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

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '이미 등록된 이메일입니다.'
      });
    }

    // Check username uniqueness if provided
    if (username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: '이미 사용중인 사용자명입니다.'
        });
      }
    }

    // Create user
    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      username,
      phone_number,
      timezone: timezone || 'Asia/Seoul',
      language: language || 'ko'
    });

    // Create default user preferences
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
        language: language || 'ko',
        timezone: timezone || 'Asia/Seoul'
      }
    });

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Get user profile without sensitive data
    const userProfile = user.getPublicProfile();

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

    // Find user with preferences
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: [
        {
          model: UserPreference,
          as: 'preferences'
        }
      ]
    });

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
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // Update last login time
    await user.update({ last_login_at: new Date() });

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Get user profile without sensitive data
    const userProfile = user.getPublicProfile();

    res.json({
      success: true,
      message: '로그인 되었습니다.',
      data: {
        user: {
          ...userProfile,
          preferences: user.preferences
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
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Find user
    const user = await User.findByPk(decoded.userId);
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
    const user = await User.findByPk(req.userId, {
      include: [
        {
          model: UserPreference,
          as: 'preferences'
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    const userProfile = user.getPublicProfile();

    res.json({
      success: true,
      data: {
        user: {
          ...userProfile,
          preferences: user.preferences
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

module.exports = {
  register,
  login,
  refreshToken,
  getProfile
};
