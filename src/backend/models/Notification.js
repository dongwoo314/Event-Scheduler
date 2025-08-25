const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // Notification belongs to User
      Notification.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // Notification belongs to Event
      Notification.belongsTo(models.Event, {
        foreignKey: 'event_id',
        as: 'event'
      });
    }

    // Instance method to mark as sent
    markAsSent() {
      this.status = 'sent';
      this.sent_at = new Date();
      return this.save();
    }

    // Instance method to mark as acknowledged
    markAsAcknowledged(action = 'confirmed') {
      this.status = 'acknowledged';
      this.acknowledged_at = new Date();
      this.user_action = action;
      return this.save();
    }

    // Instance method to mark as failed
    markAsFailed(error) {
      this.status = 'failed';
      this.failed_at = new Date();
      this.error_message = error;
      return this.save();
    }

    // Instance method to check if notification should be sent
    shouldBeSent() {
      const now = new Date();
      const scheduledTime = new Date(this.scheduled_time);
      return this.status === 'pending' && scheduledTime <= now;
    }

    // Instance method to check if retry is needed
    shouldRetry() {
      return this.status === 'failed' && this.retry_count < this.max_retries;
    }

    // Static method to get pending notifications
    static async getPendingNotifications() {
      const now = new Date();
      return this.findAll({
        where: {
          status: 'pending',
          scheduled_time: {
            [sequelize.Sequelize.Op.lte]: now
          }
        },
        include: [
          { model: sequelize.models.User, as: 'user' },
          { model: sequelize.models.Event, as: 'event' }
        ],
        order: [['scheduled_time', 'ASC']]
      });
    }

    // Static method to create advance notification
    static async createAdvanceNotification(eventId, userId, minutesBefore) {
      const event = await sequelize.models.Event.findByPk(eventId);
      if (!event) throw new Error('Event not found');

      const scheduledTime = new Date(event.start_time);
      scheduledTime.setMinutes(scheduledTime.getMinutes() - minutesBefore);

      return this.create({
        user_id: userId,
        event_id: eventId,
        type: 'advance_reminder',
        title: `${event.title} 시작 ${minutesBefore}분 전`,
        message: `"${event.title}" 이벤트가 ${minutesBefore}분 후에 시작됩니다. 준비하시겠어요?`,
        scheduled_time: scheduledTime,
        notification_channels: ['push', 'email'],
        metadata: {
          minutes_before: minutesBefore,
          allow_user_actions: true,
          actions: ['confirmed', 'snooze', 'ready']
        }
      });
    }
  }

  Notification.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'events',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(
        'advance_reminder',    // 사전 알림 (15분 전 등)
        'event_start',         // 이벤트 시작 알림
        'event_reminder',      // 일반 리마인더
        'event_invitation',    // 이벤트 초대
        'event_update',        // 이벤트 변경사항
        'event_cancellation',  // 이벤트 취소
        'snooze_reminder',     // 스누즈 후 재알림
        'system_notification'  // 시스템 알림
      ),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    scheduled_time: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    acknowledged_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    failed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'acknowledged', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium'
    },
    notification_channels: {
      type: DataTypes.ARRAY(DataTypes.ENUM('push', 'email', 'sms', 'in_app')),
      allowNull: false,
      defaultValue: ['push']
    },
    user_action: {
      type: DataTypes.ENUM('confirmed', 'snooze', 'ready', 'dismissed'),
      allowNull: true,
      comment: '사용자가 사전 알림에 대해 취한 액션'
    },
    retry_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    },
    max_retries: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      validate: {
        min: 0,
        max: 5
      }
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    delivery_receipt: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: '알림 전송 결과 저장'
    }
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['event_id'] },
      { fields: ['scheduled_time'] },
      { fields: ['status'] },
      { fields: ['type'] },
      { fields: ['priority'] },
      { fields: ['created_at'] },
      {
        name: 'notifications_pending_scheduled',
        fields: ['status', 'scheduled_time'],
        where: {
          status: 'pending'
        }
      },
      {
        name: 'notifications_user_event',
        fields: ['user_id', 'event_id', 'type']
      }
    ]
  });

  return Notification;
};
