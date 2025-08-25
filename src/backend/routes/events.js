const express = require('express');
const { Event, User, Group, EventParticipant, Notification } = require('../models');
const { authenticate } = require('../middleware/auth');
const { validate, validateQuery, eventSchemas, querySchemas } = require('../middleware/validation');
const { Op } = require('sequelize');
const moment = require('moment-timezone');
const router = express.Router();

/**
 * @route   GET /api/events
 * @desc    Get user's events with filtering and pagination
 * @access  Private
 */
router.get('/', authenticate, validateQuery(querySchemas.pagination), async (req, res) => {
  try {
    const {
      page,
      limit,
      start_date,
      end_date,
      status,
      category,
      event_type,
      timezone = 'Asia/Seoul'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { user_id: req.userId };

    // Add filters
    if (start_date && end_date) {
      whereClause.start_time = {
        [Op.between]: [
          moment.tz(start_date, timezone).toDate(),
          moment.tz(end_date, timezone).toDate()
        ]
      };
    } else if (start_date) {
      whereClause.start_time = {
        [Op.gte]: moment.tz(start_date, timezone).toDate()
      };
    } else if (end_date) {
      whereClause.start_time = {
        [Op.lte]: moment.tz(end_date, timezone).toDate()
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (category) {
      whereClause.category = category;
    }

    if (event_type) {
      whereClause.event_type = event_type;
    }

    const events = await Event.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'username']
        },
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name', 'group_type']
        },
        {
          model: EventParticipant,
          as: 'participants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'first_name', 'last_name', 'username', 'profile_image_url']
            }
          ]
        }
      ],
      limit,
      offset,
      order: [['start_time', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        events: events.rows,
        pagination: {
          page,
          limit,
          total: events.count,
          pages: Math.ceil(events.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   POST /api/events
 * @desc    Create new event
 * @access  Private
 */
router.post('/', authenticate, validate(eventSchemas.create), async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      user_id: req.userId
    };

    const event = await Event.create(eventData);

    // Create advance notifications if enabled
    if (eventData.notification_settings?.enable_notifications) {
      const advanceNotifications = eventData.notification_settings.advance_notifications || [15, 60];
      
      for (const minutes of advanceNotifications) {
        await Notification.createAdvanceNotification(event.id, req.userId, minutes);
      }
    }

    res.status(201).json({
      success: true,
      message: '이벤트가 성공적으로 생성되었습니다.',
      data: { event }
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 생성 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get specific event by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'username', 'profile_image_url']
        },
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name', 'group_type', 'description']
        },
        {
          model: EventParticipant,
          as: 'participants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'first_name', 'last_name', 'username', 'profile_image_url']
            }
          ]
        }
      ]
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: '이벤트를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: { event }
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   PUT /api/events/:id
 * @desc    Update event
 * @access  Private
 */
router.put('/:id', authenticate, validate(eventSchemas.update), async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: '이벤트를 찾을 수 없습니다.'
      });
    }

    // Check if user can edit this event
    if (!event.canUserEdit(req.userId)) {
      return res.status(403).json({
        success: false,
        message: '이벤트를 수정할 권한이 없습니다.'
      });
    }

    await event.update(req.body);

    res.json({
      success: true,
      message: '이벤트가 성공적으로 업데이트되었습니다.',
      data: { event }
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 업데이트 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: '이벤트를 찾을 수 없습니다.'
      });
    }

    if (!event.canUserEdit(req.userId)) {
      return res.status(403).json({
        success: false,
        message: '이벤트를 삭제할 권한이 없습니다.'
      });
    }

    await event.destroy();

    res.json({
      success: true,
      message: '이벤트가 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 삭제 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
