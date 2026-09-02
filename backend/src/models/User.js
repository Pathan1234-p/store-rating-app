const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../constants/roles');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  // Maps to password_hash column; only bcrypt hashes are persisted
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password_hash',
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: ROLES.USER,
    validate: { isIn: [Object.values(ROLES)] },
  },
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password && !user.password.startsWith('$2')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password && !user.password.startsWith('$2')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

User.prototype.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = User;
