const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, UserPreference } = require('../models');
const { authenticate } = require('../middleware/auth');
const { validate, userSchemas } = require('../middleware/validation');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Refresh token generation
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(userSchemas.register), async (req, res) => {
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
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(userSchemas.login), async (req, res) => {
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
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', async (req, res) => {
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
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    // In a production environment, you might want to blacklist the token
    // For now, we'll just return success as token removal happens client-side
    
    res.json({
      success: true,
      message: '로그아웃 되었습니다.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: '로그아웃 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, async (req, res) => {
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
});

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
    }

    // Find user by verification token
    const user = await User.findOne({
      where: { email_verified_token: token }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 인증 토큰입니다.'
      });
    }

    // Update user verification status
    await user.update({
      is_email_verified: true,
      email_verified_token: null
    });

    res.json({
      success: true,
      message: '이메일 인증이 완료되었습니다.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: '이메일 인증 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: '이메일이 필요합니다.'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({
        success: true,
        message: '비밀번호 재설정 링크를 이메일로 발송했습니다.'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save reset token and expiry
    await user.update({
      password_reset_token: resetToken,
      password_reset_expires: new Date(Date.now() + 3600000) // 1 hour
    });

    // TODO: Send email with reset link
    // await emailService.sendPasswordResetEmail(user.email, resetToken);

    res.json({
      success: true,
      message: '비밀번호 재설정 링크를 이메일로 발송했습니다.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: '비밀번호 재설정 요청 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        success: false,
        message: '토큰과 새 비밀번호가 필요합니다.'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '비밀번호는 최소 6자 이상이어야 합니다.'
      });
    }

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 재설정 토큰입니다.'
      });
    }

    // Find user and check token
    const user = await User.findOne({
      where: {
        id: decoded.userId,
        password_reset_token: token,
        password_reset_expires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않거나 만료된 재설정 토큰입니다.'
      });
    }

    // Update password
    await user.update({
      password: new_password,
      password_reset_token: null,
      password_reset_expires: null
    });

    res.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: '비밀번호 재설정 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
