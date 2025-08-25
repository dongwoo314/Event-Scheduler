const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      // Group belongs to User (creator)
      Group.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });
      
      // Group has many Events
      Group.hasMany(models.Event, {
        foreignKey: 'group_id',
        as: 'events'
      });
      
      // Group has many GroupMembers
      Group.hasMany(models.GroupMember, {
        foreignKey: 'group_id',
        as: 'members'
      });
      
      // Group belongs to many Users through GroupMembers
      Group.belongsToMany(models.User, {
        through: models.GroupMember,
        foreignKey: 'group_id',
        otherKey: 'user_id',
        as: 'users'
      });
    }

    // Instance method to check if user is admin
    async isUserAdmin(userId) {
      const membership = await sequelize.models.GroupMember.findOne({
        where: {
          group_id: this.id,
          user_id: userId,
          role: ['admin', 'owner']
        }
      });
      return !!membership;
    }

    // Instance method to check if user is member
    async isUserMember(userId) {
      const membership = await sequelize.models.GroupMember.findOne({
        where: {
          group_id: this.id,
          user_id: userId
        }
      });
      return !!membership;
    }

    // Instance method to get member count
    async getMemberCount() {
      return sequelize.models.GroupMember.count({
        where: {
          group_id: this.id,
          status: 'active'
        }
      });
    }

    // Instance method to check if group is full
    async isFull() {
      if (!this.max_members) return false;
      const currentCount = await this.getMemberCount();
      return currentCount >= this.max_members;
    }
  }

  Group.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    group_type: {
      type: DataTypes.ENUM('private', 'public', 'invite_only'),
      allowNull: false,
      defaultValue: 'private'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50]
      }
    },
    max_members: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 2,
        max: 1000
      }
    },
    invite_code: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        len: [6, 20]
      }
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        allow_member_invites: false,
        require_approval: true,
        auto_notifications: true,
        default_event_visibility: 'group'
      }
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'Group',
    tableName: 'groups',
    indexes: [
      { fields: ['created_by'] },
      { fields: ['group_type'] },
      { fields: ['category'] },
      { fields: ['invite_code'] },
      { fields: ['is_active'] },
      { fields: ['created_at'] }
    ]
  });

  return Group;
};
