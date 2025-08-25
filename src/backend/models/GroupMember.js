const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GroupMember extends Model {
    static associate(models) {
      // GroupMember belongs to User
      GroupMember.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // GroupMember belongs to Group
      GroupMember.belongsTo(models.Group, {
        foreignKey: 'group_id',
        as: 'group'
      });
    }

    // Instance method to check if user can invite others
    canInvite() {
      return ['admin', 'owner'].includes(this.role);
    }

    // Instance method to check if user can manage events
    canManageEvents() {
      return ['admin', 'owner', 'moderator'].includes(this.role);
    }

    // Instance method to promote member
    async promote(newRole) {
      if (!['member', 'moderator', 'admin'].includes(newRole)) {
        throw new Error('Invalid role');
      }
      this.role = newRole;
      return this.save();
    }
  }

  GroupMember.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    group_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'groups',
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
    role: {
      type: DataTypes.ENUM('owner', 'admin', 'moderator', 'member'),
      allowNull: false,
      defaultValue: 'member'
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'inactive', 'banned'),
      allowNull: false,
      defaultValue: 'pending'
    },
    joined_at: {
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
    permissions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        can_create_events: false,
        can_invite_members: false,
        can_moderate: false
      }
    }
  }, {
    sequelize,
    modelName: 'GroupMember',
    tableName: 'group_members',
    indexes: [
      { fields: ['group_id'] },
      { fields: ['user_id'] },
      { fields: ['role'] },
      { fields: ['status'] },
      { fields: ['joined_at'] },
      {
        name: 'group_members_unique',
        unique: true,
        fields: ['group_id', 'user_id']
      }
    ]
  });

  return GroupMember;
};
