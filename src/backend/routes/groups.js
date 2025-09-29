const express = require('express');
const { Group, User, GroupMember, Event } = require('../models');
const { authenticate } = require('../middleware/auth');
const { validate, validateQuery, groupSchemas, querySchemas } = require('../middleware/validation');
const { Op } = require('sequelize');
const crypto = require('crypto');
const router = express.Router();

/**
 * @route   GET /api/groups
 * @desc    Get user's groups
 * @access  Private
 */
router.get('/', authenticate, validateQuery(querySchemas.pagination), async (req, res) => {
  try {
    const { page, limit, group_type, category } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (group_type) {
      whereClause.group_type = group_type;
    }
    if (category) {
      whereClause.category = category;
    }

    const groups = await Group.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'username']
        },
        {
          model: GroupMember,
          as: 'members',
          where: { user_id: req.userId, status: 'active' },
          attributes: ['role', 'joined_at', 'status'],
          required: true
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        groups: groups.rows,
        pagination: {
          page,
          limit,
          total: groups.count,
          pages: Math.ceil(groups.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      success: false,
      message: '그룹 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   POST /api/groups
 * @desc    Create new group
 * @access  Private
 */
router.post('/', authenticate, validate(groupSchemas.create), async (req, res) => {
  try {
    const groupData = {
      ...req.body,
      created_by: req.userId
    };

    // Generate invite code for invite_only groups
    if (groupData.group_type === 'invite_only') {
      groupData.invite_code = crypto.randomBytes(4).toString('hex').toUpperCase();
    }

    const group = await Group.create(groupData);

    // Add creator as owner
    await GroupMember.create({
      group_id: group.id,
      user_id: req.userId,
      role: 'owner',
      status: 'active',
      joined_at: new Date()
    });

    res.status(201).json({
      success: true,
      message: '그룹이 성공적으로 생성되었습니다.',
      data: { group }
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: '그룹 생성 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   GET /api/groups/:id
 * @desc    Get specific group by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'username', 'profile_image_url']
        },
        {
          model: GroupMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'first_name', 'last_name', 'username', 'profile_image_url']
            }
          ],
          where: { status: 'active' }
        }
      ]
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: '그룹을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: { group }
    });

  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      success: false,
      message: '그룹 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   PUT /api/groups/:id
 * @desc    Update group
 * @access  Private
 */
router.put('/:id', authenticate, validate(groupSchemas.update), async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: '그룹을 찾을 수 없습니다.'
      });
    }

    // Check if user is admin
    const isAdmin = await group.isUserAdmin(req.userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: '그룹을 수정할 권한이 없습니다.'
      });
    }

    await group.update(req.body);

    res.json({
      success: true,
      message: '그룹이 성공적으로 업데이트되었습니다.',
      data: { group }
    });

  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({
      success: false,
      message: '그룹 업데이트 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   DELETE /api/groups/:id
 * @desc    Delete group
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: '그룹을 찾을 수 없습니다.'
      });
    }

    // Only owner can delete group
    if (group.created_by !== req.userId) {
      return res.status(403).json({
        success: false,
        message: '그룹을 삭제할 권한이 없습니다.'
      });
    }

    await group.destroy();

    res.json({
      success: true,
      message: '그룹이 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({
      success: false,
      message: '그룹 삭제 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   POST /api/groups/:id/members
 * @desc    Invite members to group
 * @access  Private
 */
router.post('/:id/members', authenticate, async (req, res) => {
  try {
    const { user_ids } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '초대할 사용자를 선택해주세요.'
      });
    }

    const group = await Group.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: '그룹을 찾을 수 없습니다.'
      });
    }

    // Check if user is admin
    const isAdmin = await group.isUserAdmin(req.userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: '멤버를 초대할 권한이 없습니다.'
      });
    }

    const results = [];
    for (const userId of user_ids) {
      try {
        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
          results.push({
            user_id: userId,
            success: false,
            message: '사용자를 찾을 수 없습니다.'
          });
          continue;
        }

        // Check if user is already a member
        const existingMember = await GroupMember.findOne({
          where: {
            group_id: group.id,
            user_id: userId
          }
        });

        if (existingMember) {
          results.push({
            user_id: userId,
            success: false,
            message: '이미 그룹의 멤버입니다.'
          });
          continue;
        }

        // Create group member with pending status
        await GroupMember.create({
          group_id: group.id,
          user_id: userId,
          role: 'member',
          status: 'pending',
          invited_by: req.userId,
          invited_at: new Date()
        });

        // Send invitation notification
        notificationScheduler.sendGroupInvitationNotification(
          userId,
          req.userId,
          group.id
        ).catch(error => {
          console.error('Failed to send invitation notification:', error);
        });

        results.push({
          user_id: userId,
          success: true,
          message: '초대가 성공적으로 전송되었습니다.'
        });
      } catch (error) {
        console.error('Error inviting user:', userId, error);
        results.push({
          user_id: userId,
          success: false,
          message: '초대 중 오류가 발생했습니다.'
        });
      }
    }

    res.json({
      success: true,
      message: '초대가 전송되었습니다.',
      data: { results }
    });

  } catch (error) {
    console.error('Invite members error:', error);
    res.status(500).json({
      success: false,
      message: '멤버 초대 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   POST /api/groups/:id/accept-invitation
 * @desc    Accept group invitation
 * @access  Private
 */
router.post('/:id/accept-invitation', authenticate, async (req, res) => {
  try {
    const member = await GroupMember.findOne({
      where: {
        group_id: req.params.id,
        user_id: req.userId,
        status: 'pending'
      }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: '초대를 찾을 수 없습니다.'
      });
    }

    await member.update({
      status: 'active',
      joined_at: new Date()
    });

    res.json({
      success: true,
      message: '그룹 초대를 수락했습니다.'
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({
      success: false,
      message: '초대 수락 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   DELETE /api/groups/:id/members/:userId
 * @desc    Remove member from group or decline invitation
 * @access  Private
 */
router.delete('/:id/members/:userId', authenticate, async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: '그룹을 찾을 수 없습니다.'
      });
    }

    const targetUserId = parseInt(req.params.userId);
    const isAdmin = await group.isUserAdmin(req.userId);
    const isSelf = targetUserId === req.userId;

    // User can remove themselves or admin can remove others
    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: '멤버를 제거할 권한이 없습니다.'
      });
    }

    const member = await GroupMember.findOne({
      where: {
        group_id: req.params.id,
        user_id: targetUserId
      }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: '멤버를 찾을 수 없습니다.'
      });
    }

    // Cannot remove owner
    if (member.role === 'owner') {
      return res.status(403).json({
        success: false,
        message: '그룹 소유자는 제거할 수 없습니다.'
      });
    }

    await member.destroy();

    res.json({
      success: true,
      message: isSelf ? '그룹에서 나갔습니다.' : '멤버가 제거되었습니다.'
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: '멤버 제거 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
