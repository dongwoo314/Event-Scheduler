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
 * @route   POST /api/notifications/:id/acknowledge
 * @desc    핵심 혁신 기능: 사전 알림에 대한 사용자 응답 처리
 * @access  Private
 */
router.post('/:id/acknowledge', authenticate, validate(notificationSchemas.acknowledge), async (req, res) => {
  try {
    const { action, snooze_minutes } = req.body;
    const notificationId = req.params.id;

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        user_id: req.userId
      },
      include: [
        {
          model: Event,
          as: 'event'
        }
      ]
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: '알림을 찾을 수 없습니다.'
      });
    }

    const notificationService = require('../services/notificationService');
    
    // 핵심 기능: 사용자 액션에 따른 스마트 처리
    await notificationService.handleNotificationAck({
      notificationId,
      action,
      snoozeMinutes: snooze_minutes
    });

    res.json({
      success: true,
      message: getActionMessage(action, notification.event?.title),
      data: {
        action,
        event_title: notification.event?.title,
        processed_at: new Date()
      }
    });

  } catch (error) {
    console.error('Acknowledge notification error:', error);
    res.status(500).json({
      success: false,
      message: '알림 응답 처리 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 헬퍼 함수: 사용자 액션에 따른 메시지
function getActionMessage(action, eventTitle) {
  const messages = {
    confirmed: `"${eventTitle}" 정시 알림을 유지합니다. ⏰`,
    snooze: `"${eventTitle}" 잠시 후 다시 알려드리겠습니다. 😴`,
    ready: `"${eventTitle}" 준비 완료! 정시 알림을 취소했습니다. 🎯`,
    dismissed: `"${eventTitle}" 알림을 확인했습니다. ✅`
  };
  return messages[action] || '알림을 처리했습니다.';
}

/**
 * @route   POST /api/notifications/acknowledge
 * @desc    Socket.IO 대신 HTTP로 알림 응답 처리 (호환성)
 * @access  Private
 */
router.post('/acknowledge', authenticate, async (req, res) => {
  try {
    const { notification_id, action, user_id } = req.body;
    
    // user_id 검증 (보안)
    if (user_id && user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: '권한이 없습니다.'
      });
    }

    const notificationService = require('../services/notificationService');
    await notificationService.handleNotificationAck({
      notificationId: notification_id,
      action
    });

    res.json({
      success: true,
      message: '알림 응답이 처리되었습니다.',
      data: { action, processed_at: new Date() }
    });

  } catch (error) {
    console.error('HTTP acknowledge notification error:', error);
    res.status(500).json({
      success: false,
      message: '알림 응답 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   GET /api/notifications/stats
 * @desc    알림 통계 조회
 * @access  Private
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const notificationService = require('../services/notificationService');
    const stats = await notificationService.getNotificationStats(req.userId, parseInt(days));

    res.json({
      success: true,
      data: { stats, period_days: days }
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: '알림 통계 조회 중 오류가 발생했습니다.'
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
