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

module.exports = router;
