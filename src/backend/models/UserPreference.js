const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserPreference extends Model {
    static associate(models) {
      // UserPreference belongs to User
      UserPreference.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }

    // Instance method to update notification preferences
    async updateNotificationPreferences(preferences) {
      this.notification_preferences = {
        ...this.notification_preferences,
        ...preferences
      };
      return this.save();
    }

    // Instance method to add custom notification time
    async addCustomNotificationTime(minutes) {
      const times = this.notification_preferences.advance_notification_times || [];
      if (!times.includes(minutes)) {
        times.push(minutes);
        times.sort((a, b) => a - b);
        this.notification_preferences.advance_notification_times = times;
        return this.save();
      }
      return this;
    }
  }

  UserPreference.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    notification_preferences: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        advance_notification_times: [15, 60], // minutes before event
        quiet_hours: {
          enabled: false,
          start_time: '22:00',
          end_time: '08:00'
        },
        weekend_notifications: true,
        notification_sound: 'default',
        vibration: true
      }
    },
    privacy_preferences: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        profile_visibility: 'public',
        show_email: false,
        show_phone: false,
        allow_friend_requests: true,
        allow_group_invites: true,
        show_online_status: true
      }
    },
    calendar_preferences: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        default_view: 'week',
        work_hours_start: '09:00',
        work_hours_end: '18:00',
        weekend_visible: true,
        default_event_duration: 60,
        default_event_color: '#3B82F6',
        time_format: '24h',
        first_day_of_week: 1 // Monday
      }
    },
    theme_preferences: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        theme: 'dark',
        color_scheme: 'blue',
        compact_mode: false,
        animations_enabled: true,
        high_contrast: false
      }
    },
    ai_preferences: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        enable_smart_suggestions: true,
        enable_auto_scheduling: false,
        enable_conflict_detection: true,
        enable_travel_time_calculation: true,
        learning_enabled: true
      }
    },
    integration_preferences: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        google_calendar_sync: false,
        outlook_calendar_sync: false,
        apple_calendar_sync: false,
        slack_integration: false,
        zoom_integration: false
      }
    }
  }, {
    sequelize,
    modelName: 'UserPreference',
    tableName: 'user_preferences',
    indexes: [
      { fields: ['user_id'] }
    ]
  });

  return UserPreference;
};
