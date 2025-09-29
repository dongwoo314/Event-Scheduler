const Joi = require('joi');

// User validation schemas
const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).max(255).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    first_name: Joi.string().min(1).max(50).required().messages({
      'string.min': 'First name is required',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
    last_name: Joi.string().min(1).max(50).required().messages({
      'string.min': 'Last name must be at least 1 character',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),
    username: Joi.string().alphanum().min(3).max(30).optional(),
    phone_number: Joi.string().pattern(/^[+]?[0-9\s\-()]+$/).optional(),
    timezone: Joi.string().default('Asia/Seoul'),
    language: Joi.string().valid('ko', 'en').default('ko')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    first_name: Joi.string().min(1).max(50).optional(),
    last_name: Joi.string().min(1).max(50).optional(),
    username: Joi.string().alphanum().min(3).max(30).optional(),
    phone_number: Joi.string().pattern(/^[+]?[0-9\s\-()]+$/).allow('').optional(),
    timezone: Joi.string().optional(),
    language: Joi.string().valid('ko', 'en').optional()
  }),

  changePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(6).max(255).required()
  })
};

// Event validation schemas
const eventSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(5000).optional().allow(''),
    start_time: Joi.date().iso().greater('now').required().messages({
      'date.greater': 'Start time must be in the future'
    }),
    end_time: Joi.date().iso().greater(Joi.ref('start_time')).optional().messages({
      'date.greater': 'End time must be after start time'
    }),
    location: Joi.string().max(500).optional().allow(''),
    location_type: Joi.string().valid('physical', 'virtual', 'hybrid').default('physical'),
    virtual_link: Joi.string().uri().optional().allow(''),
    timezone: Joi.string().default('Asia/Seoul'),
    visibility: Joi.string().valid('private', 'group', 'public').default('private'),
    event_type: Joi.string().valid('personal', 'group', 'public').default('personal'),
    category: Joi.string().max(50).optional().allow(''),
    max_participants: Joi.number().integer().min(1).max(10000).optional(),
    is_recurring: Joi.boolean().default(false),
    recurring_pattern: Joi.object().optional(),
    notification_settings: Joi.object({
      enable_notifications: Joi.boolean().default(true),
      advance_notifications: Joi.array().items(Joi.number().integer().min(1)).default([15, 60]),
      notification_types: Joi.array().items(Joi.string().valid('push', 'email', 'sms')).default(['push', 'email'])
    }).optional(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    group_id: Joi.string().uuid().optional()
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(5000).optional().allow(''),
    start_time: Joi.date().iso().optional(),
    end_time: Joi.date().iso().optional(),
    location: Joi.string().max(500).optional().allow(''),
    location_type: Joi.string().valid('physical', 'virtual', 'hybrid').optional(),
    virtual_link: Joi.string().uri().optional().allow(''),
    timezone: Joi.string().optional(),
    visibility: Joi.string().valid('private', 'group', 'public').optional(),
    category: Joi.string().max(50).optional().allow(''),
    max_participants: Joi.number().integer().min(1).max(10000).optional(),
    notification_settings: Joi.object().optional(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    status: Joi.string().valid('draft', 'published', 'cancelled', 'completed').optional()
  }).custom((value, helpers) => {
    if (value.start_time && value.end_time) {
      if (new Date(value.end_time) <= new Date(value.start_time)) {
        return helpers.error('custom.endTimeAfterStart');
      }
    }
    return value;
  }).messages({
    'custom.endTimeAfterStart': 'End time must be after start time'
  })
};

// Group validation schemas
const groupSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(5000).optional().allow(''),
    group_type: Joi.string().valid('private', 'public', 'invite_only').default('private'),
    category: Joi.string().max(50).optional().allow(''),
    max_members: Joi.number().integer().min(2).max(1000).optional(),
    settings: Joi.object({
      allow_member_invites: Joi.boolean().default(false),
      require_approval: Joi.boolean().default(true),
      auto_notifications: Joi.boolean().default(true),
      default_event_visibility: Joi.string().valid('private', 'group', 'public').default('group')
    }).optional()
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(5000).optional().allow(''),
    group_type: Joi.string().valid('private', 'public', 'invite_only').optional(),
    category: Joi.string().max(50).optional().allow(''),
    max_members: Joi.number().integer().min(2).max(1000).optional(),
    settings: Joi.object().optional()
  })
};

// Notification validation schemas
const notificationSchemas = {
  acknowledge: Joi.object({
    action: Joi.string().valid('confirmed', 'snooze', 'ready', 'dismissed').required(),
    snooze_minutes: Joi.number().integer().min(1).max(120).when('action', {
      is: 'snooze',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }),

  preferences: Joi.object({
    email_notifications: Joi.boolean().optional(),
    push_notifications: Joi.boolean().optional(),
    sms_notifications: Joi.boolean().optional(),
    advance_notification_times: Joi.array().items(Joi.number().integer().min(1)).optional(),
    quiet_hours: Joi.object({
      enabled: Joi.boolean().required(),
      start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
    }).optional(),
    weekend_notifications: Joi.boolean().optional(),
    notification_sound: Joi.string().optional(),
    vibration: Joi.boolean().optional()
  })
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))
      });
    }

    // Replace req.body with sanitized and validated data
    req.body = value;
    next();
  };
};

// Query parameter validation
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Query validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))
      });
    }

    req.query = value;
    next();
  };
};

// Common query schemas
const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid('ASC', 'DESC').default('DESC')
  }),

  dateRange: Joi.object({
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional(),
    timezone: Joi.string().default('Asia/Seoul')
  }).custom((value, helpers) => {
    if (value.start_date && value.end_date) {
      if (new Date(value.end_date) <= new Date(value.start_date)) {
        return helpers.error('custom.endDateAfterStart');
      }
    }
    return value;
  }).messages({
    'custom.endDateAfterStart': 'End date must be after start date'
  })
};

module.exports = {
  validate,
  validateQuery,
  userSchemas,
  eventSchemas,
  groupSchemas,
  notificationSchemas,
  querySchemas
};
