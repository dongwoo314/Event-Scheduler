const express = require('express');
const { User, UserPreference, Event, Group, GroupMember } = require('../models');
const { authenticate } = require('../middleware/auth');
const { validate, validateQuery, userSchemas, querySchemas } = require('../middleware/validation');
const { Op } = require('sequelize');
const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's full profile
 * @access  Private
 */
router.get('/profile', authenticate, async (req, res) => {
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
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/profile', authenticate, validate(userSchemas.updateProfile), async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // Check username uniqueness if being updated
    if (req.body.username && req.body.username !== user.username) {
      const existingUsername = await User.findOne({
        where: {
          username: req.body.username,
          id: { [Op.ne]: req.userId }
        }
      });

      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: '이미 사용중인 사용자명입니다.'
        });
      }
    }

    // Update user profile
    await user.update(req.body);

    // Get updated user with preferences
    const updatedUser = await User.findByPk(req.userId, {
      include: [
        {
          model: UserPreference,
          as: 'preferences'
        }
      ]
    });

    const userProfile = updatedUser.getPublicProfile();

    res.json({
      success: true,
      message: '프로필이 성공적으로 업데이트되었습니다.',
      data: {
        user: {
          ...userProfile,
          preferences: updatedUser.preferences
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: '프로필 업데이트 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   PUT /api/users/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password', authenticate, validate(userSchemas.changePassword), async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.checkPassword(current_password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다.'
      });
    }

    // Update password
    await user.update({ password: new_password });

    res.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: '비밀번호 변경 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   GET /api/users/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const preferences = await UserPreference.findOne({
      where: { user_id: req.userId }
    });

    if (!preferences) {
      // Create default preferences if they don't exist
      const defaultPreferences = await UserPreference.create({
        user_id: req.userId,
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

      return res.json({
        success: true,
        data: { preferences: defaultPreferences }
      });
    }

    res.json({
      success: true,
      data: { preferences }
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: '설정 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const preferences = await UserPreference.findOne({
      where: { user_id: req.userId }
    });

    if (!preferences) {
      // Create new preferences
      const newPreferences = await UserPreference.create({
        user_id: req.userId,
        ...req.body
      });

      return res.json({
        success: true,
        message: '설정이 성공적으로 저장되었습니다.',
        data: { preferences: newPreferences }
      });
    }

    // Update existing preferences
    await preferences.update(req.body);

    res.json({
      success: true,
      message: '설정이 성공적으로 업데이트되었습니다.',
      data: { preferences }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: '설정 업데이트 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   GET /api/users/dashboard
 * @desc    Get user dashboard data
 * @access  Private
 */
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    const startOfWeek = new Date(startOfDay.getTime() - startOfDay.getDay() * 24 * 60 * 60 * 1000);
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get today's events
    const todayEvents = await Event.findAll({
      where: {
        user_id: req.userId,
        start_time: {
          [Op.gte]: startOfDay,
          [Op.lt]: endOfDay
        },
        status: ['published', 'draft']
      },
      order: [['start_time', 'ASC']],
      limit: 10
    });

    // Get this week's events
    const weekEvents = await Event.findAll({
      where: {
        user_id: req.userId,
        start_time: {
          [Op.gte]: startOfWeek,
          [Op.lt]: endOfWeek
        },
        status: ['published', 'draft']
      },
      order: [['start_time', 'ASC']]
    });

    // Get upcoming events (next 30 days)
    const upcomingEvents = await Event.findAll({
      where: {
        user_id: req.userId,
        start_time: {
          [Op.gte]: now,
          [Op.lt]: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        },
        status: ['published', 'draft']
      },
      order: [['start_time', 'ASC']],
      limit: 5
    });

    // Get user's groups
    const userGroups = await Group.findAll({
      include: [
        {
          model: GroupMember,
          as: 'members',
          where: { user_id: req.userId, status: 'active' },
          attributes: ['role', 'joined_at']
        }
      ],
      limit: 5,
      order: [['created_at', 'DESC']]
    });

    // Get statistics
    const stats = {
      total_events: await Event.count({
        where: { user_id: req.userId }
      }),
      total_groups: userGroups.length,
      events_this_week: weekEvents.length,
      events_today: todayEvents.length
    };

    res.json({
      success: true,
      data: {
        stats,
        today_events: todayEvents,
        upcoming_events: upcomingEvents,
        groups: userGroups,
        week_summary: {
          total_events: weekEvents.length,
          events_by_day: weekEvents.reduce((acc, event) => {
            const day = new Date(event.start_time).getDay();
            acc[day] = (acc[day] || 0) + 1;
            return acc;
          }, {})
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: '대시보드 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   GET /api/users/search
 * @desc    Search users for group invitations
 * @access  Private
 */
router.get('/search', authenticate, validateQuery(querySchemas.pagination), async (req, res) => {
  try {
    const { q, page, limit } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: '검색어는 최소 2자 이상이어야 합니다.'
      });
    }

    const offset = (page - 1) * limit;

    const users = await User.findAndCountAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              {
                first_name: {
                  [Op.iLike]: `%${q}%`
                }
              },
              {
                last_name: {
                  [Op.iLike]: `%${q}%`
                }
              },
              {
                username: {
                  [Op.iLike]: `%${q}%`
                }
              },
              {
                email: {
                  [Op.iLike]: `%${q}%`
                }
              }
            ]
          },
          {
            id: { [Op.ne]: req.userId } // Exclude current user
          },
          {
            is_active: true
          }
        ]
      },
      attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'profile_image_url'],
      limit,
      offset,
      order: [['first_name', 'ASC'], ['last_name', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        users: users.rows,
        pagination: {
          page,
          limit,
          total: users.count,
          pages: Math.ceil(users.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: '사용자 검색 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get public user profile
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'first_name', 'last_name', 'username', 'profile_image_url', 'created_at']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: '사용자 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', authenticate, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: '계정 삭제를 위해 비밀번호를 입력해주세요.'
      });
    }

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // Verify password
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '비밀번호가 올바르지 않습니다.'
      });
    }

    // Soft delete - deactivate account instead of hard delete
    await user.update({
      is_active: false,
      email: `deleted_${Date.now()}_${user.email}`
    });

    res.json({
      success: true,
      message: '계정이 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: '계정 삭제 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
