const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventParticipant extends Model {
    static associate(models) {
      // EventParticipant belongs to User
      EventParticipant.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // EventParticipant belongs to Event
      EventParticipant.belongsTo(models.Event, {
        foreignKey: 'event_id',
        as: 'event'
      });
    }

    // Instance method to check if user can modify participation
    canModify() {
      return ['pending', 'attending', 'maybe'].includes(this.status);
    }

    // Instance method to update RSVP
    async updateRSVP(newStatus, notes = null) {
      if (!['attending', 'not_attending', 'maybe'].includes(newStatus)) {
        throw new Error('Invalid RSVP status');
      }
      
      this.status = newStatus;
      this.responded_at = new Date();
      if (notes) this.notes = notes;
      
      return this.save();
    }
  }

  EventParticipant.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'attending', 'not_attending', 'maybe', 'waitlisted'),
      allowNull: false,
      defaultValue: 'pending'
    },
    role: {
      type: DataTypes.ENUM('participant', 'organizer', 'speaker', 'moderator'),
      allowNull: false,
      defaultValue: 'participant'
    },
    invited_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    responded_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    invited_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    check_in_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notification_preferences: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        email_reminders: true,
        push_notifications: true,
        sms_reminders: false
      }
    }
  }, {
    sequelize,
    modelName: 'EventParticipant',
    tableName: 'event_participants',
    indexes: [
      { fields: ['event_id'] },
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['role'] },
      { fields: ['invited_at'] },
      { fields: ['responded_at'] },
      {
        name: 'event_participants_unique',
        unique: true,
        fields: ['event_id', 'user_id']
      }
    ]
  });

  return EventParticipant;
};
