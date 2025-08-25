const express = require('express');
const { Notification, User, Event } = require('../models');
const { authenticate } = require('../middleware/auth');
const { validate, validateQuery, notificationSchemas, querySchemas } = require('../middleware/validation');
const { Op } = require('sequelize');
const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications with pagination
 * @access  Private
 */
router.get('/', authenticate, validateQuery(querySchemas.pagination), async (req, res) => {
  try {
    const {
      page,
      limit,
      type,
      status,
      priority,
      unread_only = false
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { user_id: req.userId };

    // Add filters
    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (unread_only === 'true') {
      whereClause.status = 'pending';
    }

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'start_time', 'location'],
          required: false
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        notifications: notifications.rows,
        pagination: {
          page,
          limit,
          total: notifications.count,
          pages: Math.ceil(notifications.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: '알림 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Private
 */
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const unreadCount = await Notification.count({
      where: {
        user_id: req.userId,
        status: 'pending'
      }
    });

    res.json({
      success: true,
      data: { unread_count: unreadCount }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: '읽지 않은 알림 수 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        user_id: req.userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: '알림을 찾을 수 없습니다.'
      });
    }

    if (notification.status === 'pending') {
      await notification.update({
        status: 'acknowledged',
        acknowledged_at: new Date()
      });
    }

    res.json({
      success: true,
      message: '알림을 읽음 처리했습니다.',
      data: { notification }
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: '알림 읽음 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const [updatedCount] = await Notification.update(
      {
        status: 'acknowledged',
        acknowledged_at: new Date()
      },
      {
        where: {
          user_id: req.userId,
          status: 'pending'
        }
      }
    );

    res.json({
      success: true,
      message: `${updatedCount}개의 알림을 모두 읽음 처리했습니다.`,
      data: { updated_count: updatedCount }
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: '알림 읽음 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        user_id: req.userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: '알림을 찾을 수 없습니다.'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: '알림이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: '알림 삭제 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
