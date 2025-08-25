const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      // Event belongs to User
      Event.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'creator'
      });
      
      // Event belongs to Group (optional)
      Event.belongsTo(models.Group, {
        foreignKey: 'group_id',
        as: 'group'
      });
      
      // Event has many Notifications
      Event.hasMany(models.Notification, {
        foreignKey: 'event_id',
        as: 'notifications'
      });
      
      // Event has many EventParticipants
      Event.hasMany(models.EventParticipant, {
        foreignKey: 'event_id',
        as: 'participants'
      });
      
      // Event belongs to many Users through EventParticipants
      Event.belongsToMany(models.User, {
        through: models.EventParticipant,
        foreignKey: 'event_id',
        otherKey: 'user_id',
        as: 'attendees'
      });
    }

    // Instance method to check if user can edit event
    canUserEdit(userId) {
      return this.user_id === userId;
    }

    // Instance method to check if event is public
    isPublic() {
      return this.visibility === 'public';
    }

    // Instance method to check if event is in the future
    isFuture() {
      return new Date(this.start_time) > new Date();
    }

    // Instance method to get event duration in minutes
    getDurationInMinutes() {
      if (!this.end_time) return null;
      const start = new Date(this.start_time);
      const end = new Date(this.end_time);
      return Math.round((end - start) / (1000 * 60));
    }
  }

  Event.init({
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
    group_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'groups',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfter: {
          args: new Date().toISOString(),
          msg: "Start time must be in the future"
        }
      }
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
        isAfterStartTime(value) {
          if (value && value <= this.start_time) {
            throw new Error('End time must be after start time');
          }
        }
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    location_type: {
      type: DataTypes.ENUM('physical', 'virtual', 'hybrid'),
      allowNull: false,
      defaultValue: 'physical'
    },
    virtual_link: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Asia/Seoul'
    },
    visibility: {
      type: DataTypes.ENUM('private', 'group', 'public'),
      allowNull: false,
      defaultValue: 'private'
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'draft'
    },
    event_type: {
      type: DataTypes.ENUM('personal', 'group', 'public'),
      allowNull: false,
      defaultValue: 'personal'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50]
      }
    },
    max_participants: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 10000
      }
    },
    is_recurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    recurring_pattern: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    notification_settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        enable_notifications: true,
        advance_notifications: [15, 60], // minutes before event
        notification_types: ['push', 'email']
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^#[0-9A-F]{6}$/i
      }
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium'
    }
  }, {
    sequelize,
    modelName: 'Event',
    tableName: 'events',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['group_id'] },
      { fields: ['start_time'] },
      { fields: ['end_time'] },
      { fields: ['status'] },
      { fields: ['visibility'] },
      { fields: ['event_type'] },
      { fields: ['category'] },
      { fields: ['created_at'] },
      { 
        name: 'events_time_range',
        fields: ['start_time', 'end_time']
      },
      {
        name: 'events_user_time',
        fields: ['user_id', 'start_time']
      }
    ]
  });

  return Event;
};
