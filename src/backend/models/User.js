const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has many Events (as creator)
      User.hasMany(models.Event, {
        foreignKey: 'user_id',
        as: 'createdEvents'
      });
      
      // User has many Notifications
      User.hasMany(models.Notification, {
        foreignKey: 'user_id',
        as: 'notifications'
      });
      
      // User belongs to many Groups through GroupMembers
      User.belongsToMany(models.Group, {
        through: models.GroupMember,
        foreignKey: 'user_id',
        otherKey: 'group_id',
        as: 'groups'
      });
      
      // User has many GroupMembers
      User.hasMany(models.GroupMember, {
        foreignKey: 'user_id',
        as: 'groupMemberships'
      });
      
      // User has one UserPreference
      User.hasOne(models.UserPreference, {
        foreignKey: 'user_id',
        as: 'preferences'
      });
    }

    // Instance method to check password
    async checkPassword(password) {
      return bcrypt.compare(password, this.password);
    }

    // Instance method to get public profile
    getPublicProfile() {
      const { password, email_verified_token, password_reset_token, ...publicData } = this.dataValues;
      return publicData;
    }

    // Static method to find user by email
    static async findByEmail(email) {
      return this.findOne({
        where: { email: email.toLowerCase() }
      });
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      },
      set(value) {
        this.setDataValue('email', value.toLowerCase());
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255]
      }
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 50]
      }
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 50]
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        len: [3, 30],
        isAlphanumeric: true
      }
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[+]?[0-9\s\-()]+$/
      }
    },
    profile_image_url: {
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
    language: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'ko'
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_phone_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    email_verified_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password_reset_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    },
    indexes: [
      { fields: ['email'] },
      { fields: ['username'] },
      { fields: ['is_active'] },
      { fields: ['created_at'] }
    ]
  });

  return User;
};
